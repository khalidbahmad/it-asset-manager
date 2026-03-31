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
            'asset_id'      => 'required|exists:assets,id',
            'type'          => 'required|in:employee,department,seat',
            'employee_id'   => 'required_if:type,employee|exists:employees,id|nullable',
            'department_id' => 'required_if:type,department|exists:departments,id|nullable',
            'seat_id'       => 'required_if:type,seat|exists:seats,id|nullable',
            'agence_id'     => 'required_if:type,agence|exists:agences,id|nullable'
        ]);

        $asset = Asset::findOrFail($request->asset_id);

        // ── Récupérer les statuts par nom ─────────────────────────
        $statusDisponible = Status::where('name', 'Disponible')->first();  // id = 2
        $statusAffecte    = Status::where('name', 'Affecté')->first();     // id = 1

        if (!$statusDisponible || !$statusAffecte) {
            // ← Debug : afficher ce qui existe en base
            $allStatuses = Status::all()->pluck('name', 'id');
            return response()->json([
                'error'    => 'Statuts non configurés en base',
                'statuses' => $allStatuses,  // ← pour voir les noms exacts
            ], 500);
        }

        // ── Vérifier que l'asset est disponible et assignable ─────
        // if (!$asset->is_assignable || $asset->status_id !== $statusDisponible->id) {
        //     return response()->json([
        //         'error' => 'Asset non assignable ou déjà affecté'
        //     ], 400);
        // }

        // ── Résoudre la cible ─────────────────────────────────────
        $employeeId   = null;
        $departmentId = null;
        $seatId       = null;

        switch ($request->type) {
            case 'employee':
                $employeeId = $request->employee_id;
                break;
            case 'department':
                $departmentId = $request->department_id;
                break;
            case 'seat':
                $seatId = $request->seat_id;
                break;
            case 'agence':
                $agenceId = $request->agence_id;
                break;
        }

        // ── Créer l'assignment ────────────────────────────────────
        $assignment = Assignment::create([
            'asset_id'      => $asset->id,
            'employee_id'   => $employeeId,
            'department_id' => $departmentId,
            'seat_id'       => $seatId,
            'agence_id'     => $agenceId,
            'assigned_at'   => Carbon::now(),
            'assigned_by'   => auth()->id(),
            'status'        => 'assigned',   // ← colonne string, pas status_id
        ]);

        // ── Mettre à jour le statut de l'asset → Affecté ─────────
        $asset->status_id = $statusAffecte->id;  // ← ID réel, pas +1
        $asset->save();

        AuditService::log('create', 'assignments', $assignment->id, null, $assignment->toArray());

        return response()->json(
            
            $assignment->load(['asset.status', 'employee', 'department', 'seat']),
            201
        );
    }

    public function return(Assignment $assignment)
    {
       
        $statusDisponible = Status::where('name', 'Disponible')->first();  // id = 2
        $assignment->asset->update(['status_id' => $statusDisponible->id]);
        
         // ← compare la colonne string 'status'
        if ($assignment->status !== '"assigned"') {
            return response()->json(['error' => 'Asset déjà retourné'], 400);
        }

        $oldData = $assignment->toArray();

        $assignment->update([
            'returned_at' => Carbon::now(),
            'status'      => '"Retourné"',
        ]);

        // ── Remettre l'asset en Disponible ────────────────────────
        $statusDisponible = Status::whereRaw('LOWER(name) LIKE ?', ['%disponible%'])->first();
        if ($statusDisponible) {
            $assignment->asset->update(['status_id' => $statusDisponible->id]);
        }

        AuditService::log('return', 'assignments', $assignment->id, $oldData, $assignment->fresh()->toArray());

        return response()->json(
            $assignment->load(['asset.status', 'employee', 'department', 'seat'])
        );
    }
}