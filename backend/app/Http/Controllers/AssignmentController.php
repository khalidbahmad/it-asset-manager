<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Assignment;
use App\Models\Asset;
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
        ]);

        $asset = Asset::findOrFail($request->asset_id);

        $statusDisponible = \App\Models\Status::where('name', 'like', '%disponible%')->first();

        if (!$asset->is_assignable || $asset->status_id !== $statusDisponible->id) {
            return response()->json(['error' => 'Asset cannot be assigned'], 400);
        }

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
        }

        $assignment = Assignment::create([
            'asset_id'      => $request->asset_id,
            'employee_id'   => $employeeId,
            'department_id' => $departmentId,
            'seat_id'       => $seatId,
            'assigned_at'   => Carbon::now(),
            'status'        => 'assigned',
        ]);

        $asset->status_id = $statusDisponible->id + 1;
        $asset->save();

        AuditService::log('create', 'assignments', $assignment->id, null, $assignment->toArray());

        return response()->json(
            $assignment->load(['asset', 'employee', 'department', 'seat']),
            201
        );
    }

    public function return(Assignment $assignment)
    {
        if ($assignment->status != 'assigned') {
            return response()->json(['error' => 'Asset already returned'], 400);
        }

        $oldData = $assignment->toArray();

        $assignment->update([
            'returned_at' => Carbon::now(),
            'status'      => 'returned',
        ]);

        $assignment->asset->update(['status_id' => 1]);

        AuditService::log('return', 'assignments', $assignment->id, $oldData, $assignment->fresh()->toArray());

        return response()->json($assignment->load(['asset', 'employee', 'department', 'seat']));
    }
}