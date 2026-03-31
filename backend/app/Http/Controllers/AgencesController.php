<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Agence;
use App\Models\AgenceInfo;
use App\Models\Assignment;
use App\Services\AuditService;

class AgencesController extends Controller
{
    // Méthodes pour gérer les agences (CRUD)
    public function index()
    {
        return \App\Models\Agence::with('info', 'assignments')->get();
    }

    public function store(Request $request)
{
    $validated = $request->validate([
        // ───── AGENCE ─────
        'Adresse'   => 'required|string|max:500',
        'Telephone' => 'required|string',
        'Agence'    => 'required|string|max:500',
        'latitude'  => 'nullable|numeric|between:-90,90',
        'longitude' => 'nullable|numeric|between:-180,180',

        // ───── AGENCE INFO ─────
        'point_de_vente'    => 'nullable|string|max:50',
        'emetteur'          => 'nullable|string|max:50',
        'nom_ville'         => 'nullable|string|max:120',
        'ip_agence'         => 'nullable|string|max:45|unique:agences_info,ip_agence',
        'type_agence'       => 'nullable|string|max:50',
        'telephone_affiche' => 'nullable|string|max:50',
        'etat_agence'       => 'nullable|string|max:50',
        'anydesk'           => 'nullable|string|max:50',
        'Anydesk_2'         => 'nullable|string|max:50',
        'Anydesk_3'         => 'nullable|string|max:50',
        'autres'            => 'nullable|string|max:500',
        'type_agence_code'  => 'nullable|integer',
        'etat_agence_code'  => 'nullable|integer',

        // ───── ASSIGNMENT (optionnel) ─────
        'asset_id'  => 'nullable|exists:assets,id',
    ]);

    DB::beginTransaction();

    try {
        // ── 1. Résoudre la ville ──────────────────────────────────
        $villeId = null;

        if (!empty($request->nom_ville)) {
            // Chercher la ville par nom (insensible à la casse)
            $ville = \App\Models\Ville::whereRaw('LOWER(nom_ville) = ?', [
                strtolower(trim($request->nom_ville))
            ])->first();

            if (!$ville) {
                // ← Créer la ville si elle n'existe pas
                $ville = \App\Models\Ville::create([
                    'nom_ville' => trim($request->nom_ville),
                ]);
            }

            $villeId = $ville->id;
        }

        // ── 2. Créer l'Agence ─────────────────────────────────────
        $agence = \App\Models\Agence::create([
            'IDAgence'    => null,
            'Adresse'   => $validated['Adresse'],
            'Telephone' => $validated['Telephone'],
            'Agence'    => $validated['Agence'],
            'latitude'  => $request->latitude,
            'longitude' => $request->longitude,


        ]);

        // ── 3. Créer AgenceInfo ───────────────────────────────────
        $agenceInfo = \App\Models\AgenceInfo::create([
            'IDAgence'          => $agence->id,
            'point_de_vente'    => $request->point_de_vente,
            'emetteur'          => $request->emetteur,
            'nom_ville'         => $request->nom_ville   ? trim($request->nom_ville) : null,
            'ville_id'          => $villeId,              // ← ID résolu ou créé
            'ip_agence'         => $request->ip_agence,
            'type_agence'       => $request->type_agence,
            'telephone_affiche' => $request->telephone_affiche,
            'etat_agence'       => $request->etat_agence,
            'anydesk'           => $request->anydesk,
            'Anydesk_2'         => $request->Anydesk_2,
            'Anydesk_3'         => $request->Anydesk_3,
            'autres'            => $request->autres,
            'type_agence_code'  => $request->type_agence_code,
            'etat_agence_code'  => $request->etat_agence_code,
        ]);

        // ── 4. Assignment optionnel ───────────────────────────────
        if ($request->asset_id) {
            \App\Models\Assignment::create([
                'asset_id'    => $request->asset_id,
                'agence_id'   => $agence->IDAgence,
                'assigned_at' => now(),
                'status'      => 'assigned',
            ]);
        }

        DB::commit();
        AuditService::log('create', 'Agence', $agence->id, null, $agence->toArray());

        return response()->json([
            'message'      => 'Agence créée avec succès',
            'agence'       => $agence,
            'info'         => $agenceInfo,
            'ville_id'     => $villeId,
            'ville_created' => isset($ville) && $ville->wasRecentlyCreated,
        ], 201);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json(['error' => $e->getMessage()], 500);
    }
}

    // public function show($id)
    // {
    //     $agenceInfo = \App\Models\AgenceInfo::where('IDAgence', $id)->first();

    //     if (!$agenceInfo) {
    //         return response()->json(['error' => 'Aucune information trouvée pour cette agence'], 404);
    //     }

    //     return $agenceInfo;
    // }

    public function show($id)
{
    // ── 1. Agence + Info ──────────────────────────────────────────
    $agence = \App\Models\Agence::find($id);

    if (!$agence) {
        return response()->json(['error' => 'Agence introuvable'], 404);
    }

    $agenceInfo = \App\Models\AgenceInfo::where('IDAgence', $id)->first();

    // ── 2. Ville ──────────────────────────────────────────────────
    $ville = null;
    if ($agenceInfo?->ville_id) {
        $ville = \App\Models\Ville::find($agenceInfo->ville_id);
    }

    // ── 3. Assets affectés à cette agence ────────────────────────
    $assignments = \App\Models\Assignment::where('agence_id', $id)
        ->with(['asset.category', 'asset.brand', 'asset.location', 'asset.status'])
        ->orderBy('assigned_at', 'desc')
        ->get();

    $activeAssets = $assignments
        ->where('status', 'assigned')
        ->map(fn($a) => [
            'assignment_id' => $a->id,
            'assigned_at'   => $a->assigned_at,
            'assigned_by'   => $a->assigned_by,
            'asset'         => $a->asset,
        ])->values();

    // ── 4. Historique complet (assigned + returned) ───────────────
    $historique = $assignments->map(fn($a) => [
        'assignment_id' => $a->id,
        'asset_tag'     => $a->asset?->asset_tag,
        'asset_model'   => $a->asset?->model,
        'asset_category'=> $a->asset?->category?->name,
        'status'        => $a->status,
        'assigned_at'   => $a->assigned_at,
        'returned_at'   => $a->returned_at,
        'assigned_by'   => $a->assigned_by,
    ])->values();

    // ── 5. Stats ──────────────────────────────────────────────────
    $allAssets = $assignments->pluck('asset')->filter();
    $stats = [
        'total_assignments' => $assignments->count(),
        'active_assets'     => $assignments->where('status', 'assigned')->count(),
        'returned_assets'   => $assignments->where('status', 'returned')->count(),
        'by_status'         => [
            'Disponible'    => $allAssets->filter(fn($a) => $a?->status?->name === 'Disponible')->count(),
            'Affecté'       => $allAssets->filter(fn($a) => $a?->status?->name === 'Affecté')->count(),
            'En réparation' => $allAssets->filter(fn($a) => $a?->status?->name === 'En réparation')->count(),
            'Retraité'      => $allAssets->filter(fn($a) => $a?->status?->name === 'Retraité')->count(),
        ],
        'by_category' => $allAssets
            ->groupBy(fn($a) => $a?->category?->name ?? 'Autre')
            ->map(fn($g) => $g->count()),
    ];

    // ── 6. Audit logs de cette agence ─────────────────────────────
    $auditLogs = \App\Models\AuditLog::where('table_name', 'Agence')
        ->where('record_id', $id)
        ->orderBy('created_at', 'desc')
        ->get();

    return response()->json([
        'agence'        => $agence,
        'info'          => $agenceInfo,
        'ville'         => $ville,
        'active_assets' => $activeAssets,
        'historique'    => $historique,
        'stats'         => $stats,
        'audit_logs'    => $auditLogs,
    ]);
}

     public function destroy($id)
    {
        $agence = \App\Models\Agence::findOrFail($id);
        $agence->delete();
        AuditService::log('delete', 'Agence', $id, null, null);
        return response()->json(['message' => 'Agence supprimée avec succès']);
    }
}
