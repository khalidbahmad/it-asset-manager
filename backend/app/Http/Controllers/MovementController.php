<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Movement;
use App\Models\Asset;
use App\Services\AuditService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class MovementController extends Controller
{
    public function index()
    {
        return Movement::with(['asset', 'fromLocation', 'toLocation', 'movedBy'])->get();
    }

    public function show(Movement $movement)
    {
        return $movement->load(['asset', 'fromLocation', 'toLocation', 'movedBy']);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'asset_id'         => 'required|exists:assets,id',
            'from_location_id' => 'required|exists:locations,id',
            'to_location_id'   => 'required|exists:locations,id',
            'movement_type'    => 'required|in:transfer,return,other',
            'reason'           => 'nullable|string',
        ]);

        $movement = Movement::create([
            'asset_id'         => $data['asset_id'],
            'from_location_id' => $data['from_location_id'],
            'to_location_id'   => $data['to_location_id'],
            'movement_type'    => $data['movement_type'],
            'moved_at'         => Carbon::now(),
            'moved_by'         => Auth::id(),
            'reason'           => $data['reason'] ?? null,
        ]);

        Asset::find($data['asset_id'])->update(['location_id' => $data['to_location_id']]);

        AuditService::log('create', 'movements', $movement->id, null, $movement->toArray());

        return response()->json($movement->load(['asset', 'fromLocation', 'toLocation', 'movedBy']), 201);
    }

    public function update(Request $request, Movement $movement)
    {
        $data = $request->validate([
            'asset_id'         => 'sometimes|exists:assets,id',
            'from_location_id' => 'sometimes|exists:locations,id',
            'to_location_id'   => 'sometimes|exists:locations,id',
            'movement_type'    => 'sometimes|in:transfer,return,other',
            'reason'           => 'nullable|string',
        ]);

        $oldData = $movement->toArray();

        $movement->update($data);

        if (isset($data['to_location_id'])) {
            $movement->asset->update(['location_id' => $data['to_location_id']]);
        }

        AuditService::log('update', 'movements', $movement->id, $oldData, $movement->fresh()->toArray());

        return response()->json($movement->load(['asset', 'fromLocation', 'toLocation', 'movedBy']));
    }

    public function destroy(Movement $movement)
    {
        AuditService::log('delete', 'movements', $movement->id, $movement->toArray(), null);

        $movement->asset->update(['location_id' => $movement->from_location_id]);
        $movement->delete();

        return response()->json(['message' => 'Movement deleted']);
    }
}