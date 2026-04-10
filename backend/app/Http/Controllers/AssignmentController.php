<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Assignment;
use App\Models\Asset;
use App\Models\Status;
use App\Models\Employee;
use App\Models\Department;
use App\Models\Seat;
use App\Services\AuditService;
use Carbon\Carbon;

class AssignmentController extends Controller
{
    public function index()
    {
        return Assignment::with(['asset', 'employee', 'department', 'seat'])->get();
    }

    public function show(Assignment $assignment)
    {
        return $assignment->load(['asset', 'employee', 'department', 'seat']);
    }

public function store(Request $request)
{
    $request->validate([
        'asset_id'    => 'required|exists:assets,id',
        'type'        => 'required|in:employee,department,seat,agence', // ← agence ajouté
        'employee_id' => 'required_if:type,employee|exists:employees,id|nullable',
        'agence_id'   => 'required_if:type,agence|exists:agences,id|nullable',
    ]);

    $asset = Asset::findOrFail($request->asset_id);

    $statusDisponible = Status::where('name', 'Disponible')->first();
    $statusAffecte    = Status::where('name', 'Affecté')->first();

    if (!$statusDisponible || !$statusAffecte) {
        return response()->json([
            'error'    => 'Statuts non configurés en base',
            'statuses' => Status::all()->pluck('name', 'id'),
        ], 500);
    }

    // ── Initialiser toutes les cibles à null ──────────────────────
    $employeeId   = null;
    $departmentId = null;
    $seatId       = null;
    $agenceId     = null;
    $assignedTo   = $request->assigned_to ?? null;

    switch ($request->type) {
        case 'employee':
            $employeeId = $request->employee_id;
            break;
        case 'agence':
            $agenceId   = $request->agence_id;
            $assignedTo = $assignedTo ?? \App\Models\Agence::find($agenceId)?->Agence;
            break;
    }

    // ── Créer l'assignment ────────────────────────────────────────
    $assignment = Assignment::create([
        'asset_id'      => $asset->id,
        'employee_id'   => $employeeId,
        'department_id' => $departmentId,
        'seat_id'       => $seatId,
        'agence_id'     => $agenceId,
        'assigned_at'   => Carbon::now(),
        'assigned_by'   => auth()->id(),
        'assigned_to'   => $assignedTo,
        'status'        => 'assigned',
    ]);

    // ── Mettre à jour le statut de l'asset → Affecté ─────────────
    $asset->update(['status_id' => $statusAffecte->id]);

    AuditService::log('create', 'assignments', $assignment->id, null, $assignment->toArray());

    return response()->json(
        $assignment->load(['asset.status', 'employee', 'department', 'seat']),
        201
    );
}

public function return($assetId)
{
    // ── Trouver l'asset ───────────────────────────────────────────
    $asset = Asset::where('id', $assetId)->first();

    // ── Vérifier que l'asset est bien Affecté ─────────────────────
    $statusAffecte = Status::where('name', 'Affecté')->first();

    if (!$statusAffecte || $asset->status_id !== $statusAffecte->id) {
        return response()->json([
            'error'          => 'Asset non affecté, retour impossible',
            'current_status' => $asset->status?->name,
        ], 400);
    }

    // ── Trouver l'assignment actif ────────────────────────────────
    $assignment = Assignment::where('asset_id', $assetId)->first();


    if (!$assignment) {
        return response()->json([
            'error' => 'Aucune affectation active trouvée pour cet asset',
            'asset_id' => $assetId
        ], 404);
    }

    // // ── Trouver le status Disponible ──────────────────────────────


    $oldData = $assignment->toArray();

    // ── Mettre à jour l'assignment ────────────────────────────────
    $assignment->update([
        'returned_at' => Carbon::now(),
        'status'      => 'returned',
    ]);

    // ── Remettre l'asset en Disponible ────────────────────────────
    $asset->update(['status_id' => 4]); // ← ID réel du statut Retraité

    AuditService::log('return', 'assignments', $assignment->id, $oldData, $assignment->fresh()->toArray());

    return response()->json([

            'message' => 'Asset retourné au stock et mis à jour en Disponible',
    ]);
}
}