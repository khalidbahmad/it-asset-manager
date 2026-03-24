<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Agence;
use App\Models\AgenceInfo;
use App\Models\Assignment;

class AgencesController extends Controller
{
    // Méthodes pour gérer les agences (CRUD)
    public function index()
    {
        return \App\Models\Agence::with('info', 'assignments')->get();
    }

    public function show($id)
    {
        return \App\Models\Agence::with('info', 'assignments')->where('IDAgence', $id)->firstOrFail();
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            // ───── AGENCE ─────
            'IDAgence' => 'required|integer|unique:agences,IDAgence',
            'Adresse'  => 'required|string|max:500',
            'Telephone'=> 'required|string',
            'Agence'   => 'required|string|max:500',

            // ───── AGENCE INFO ─────
            'point_de_vente'     => 'nullable|string|max:50',
            'emetteur'           => 'nullable|string|max:50',
            'nom_ville'          => 'nullable|string|max:120',
            'ville_id'           => 'nullable|integer',
            'ip_agence'          => 'nullable|string|max:45|unique:agences_info,ip_agence',
            'type_agence'        => 'nullable|string|max:50',
            'telephone_affiche'  => 'nullable|string|max:50',
            'etat_agence'        => 'nullable|string|max:50',
            'anydesk'            => 'nullable|string|max:50',
            'Anydesk_2'          => 'nullable|string|max:10',
            'Anydesk_3'          => 'nullable|string|max:10',
            'autres'             => 'nullable|string|max:500',
            'type_agence_code'   => 'nullable|integer',
            'etat_agence_code'   => 'nullable|integer',

            // ───── ASSIGNMENT (optionnel) ─────
            'asset_id' => 'nullable|exists:assets,id',
        ]);

        DB::beginTransaction();

        try {
            // 1️⃣ AGENCE
            $agence = Agence::create([
                'IDAgence' => $validated['IDAgence'],
                'Adresse'  => $validated['Adresse'],
                'Telephone'=> $validated['Telephone'],
                'Agence'   => $validated['Agence'],
            ]);

            // 2️⃣ AGENCE INFO (TOUS LES CHAMPS)
            $agenceInfo = AgenceInfo::create([
                'IDAgence'           => $agence->IDAgence,
                'point_de_vente'     => $request->point_de_vente,
                'emetteur'           => $request->emetteur,
                'nom_ville'          => $request->nom_ville,
                'ville_id'           => $request->ville_id,
                'ip_agence'          => $request->ip_agence,
                'type_agence'        => $request->type_agence,
                'telephone_affiche'  => $request->telephone_affiche,
                'etat_agence'        => $request->etat_agence,
                'anydesk'            => $request->anydesk,
                'Anydesk_2'          => $request->Anydesk_2,
                'Anydesk_3'          => $request->Anydesk_3,
                'autres'             => $request->autres,
                'type_agence_code'   => $request->type_agence_code,
                'etat_agence_code'   => $request->etat_agence_code,
            ]);

            // 3️⃣ ASSIGNMENT (optionnel)
            if ($request->asset_id) {
                Assignment::create([
                    'asset_id'    => $request->asset_id,
                    'agence_id'   => $agence->IDAgence,
                    'assigned_at' => now(),
                    'status'      => 'assigned',
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => '✅ Agence + Info créées avec succès',
                'agence'  => $agence,
                'info'    => $agenceInfo
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

}
