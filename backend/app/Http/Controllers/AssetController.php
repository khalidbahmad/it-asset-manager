<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Asset;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Location;
use App\Models\Status;
use App\Services\AuditService;
use Illuminate\Support\Facades\DB;
use App\Models\Assignment;
use App\Models\Employee;
use App\Models\Department;
use App\Models\Seat;
use Carbon\Carbon;

class AssetController extends Controller
{
    public function index()
    {
        return Asset::with(['category', 'brand', 'location', 'status'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'category'          => 'required|string',
            'brand'             => 'required|string',
            'location'          => 'required|string',
            'status'            => 'required|string',
            'asset_tag'         => 'required|unique:assets,asset_tag',
            'serial_number'     => 'required|unique:assets,serial_number',
            'model'             => 'nullable|string',
            'description'       => 'nullable|string',
            'purchase_date'     => 'nullable|date',
            'warranty_end_date' => 'nullable|date',
            'is_assignable'     => 'required|boolean',
        ]);

        $category = Category::firstOrCreate(['name' => $request->category]);
        $brand    = Brand::firstOrCreate(['name' => $request->brand]);
        $location = Location::firstOrCreate(['name' => $request->location]);
        $status   = Status::firstOrCreate(['name' => $request->status]);

        $asset = Asset::create([
            'category_id'       => $category->id,
            'brand_id'          => $brand->id,
            'location_id'       => $location->id,
            'status_id'         => $status->id,
            'asset_tag'         => $request->asset_tag,
            'serial_number'     => $request->serial_number,
            'model'             => $request->model,
            'description'       => $request->description,
            'purchase_date'     => $request->purchase_date,
            'warranty_end_date' => $request->warranty_end_date,
            'is_assignable'     => $request->is_assignable,
        ]);

        AuditService::log('create', 'assets', $asset->id, null, $asset->toArray());

        return response()->json($asset->load(['category', 'brand', 'location', 'status']), 201);
    }

    // AssetController.php
    public function createAndAssign(Request $request)
{
    $request->validate([
        // ── Asset ──────────────────────────────────────────────────
        'category'           => 'required|string',
        'brand'              => 'required|string',
        'location'           => 'required|string',
        'status'             => 'required|string',
        'asset_tag'          => 'required|unique:assets,asset_tag',
        'serial_number'      => 'required|unique:assets,serial_number',
        'model'              => 'nullable|string',
        'description'        => 'nullable|string',
        'purchase_date'      => 'nullable|date',
        'warranty_end_date'  => 'nullable|date',
        'is_assignable'      => 'required|boolean',
        // ── Affectation (obligatoire si statut = Affecté) ──────────
        'assign_type'        => 'required_if:status,Affecté|nullable|in:employee,department,agence,seat',
        'assign_target_id'   => 'nullable|integer',
        'assign_target_name' => 'nullable|string',
        'assigned_by'        => 'nullable|integer|exists:users,id',
        'assigned_to'        => 'nullable|string',
    ]);

    // ── Si Affecté, target obligatoire ────────────────────────────
    if ($request->status === 'Affecté') {
        if (empty($request->assign_type)) {
            return response()->json([
                'message' => 'Le type d\'affectation est obligatoire.',
                'errors'  => ['assign_type' => ['Veuillez choisir un type d\'affectation.']]
            ], 422);
        }
        if (empty($request->assign_target_id) && empty($request->assign_target_name)) {
            return response()->json([
                'message' => 'La cible d\'affectation est obligatoire.',
                'errors'  => ['assign_target' => ['Veuillez choisir ou créer une cible d\'affectation.']]
            ], 422);
        }
    }

    DB::beginTransaction();
    try {
        // ── Résoudre ou créer les relations ───────────────────────
        $category = Category::firstOrCreate(['name' => $request->category]);
        $brand    = Brand::firstOrCreate(['name'    => $request->brand]);
        $location = Location::firstOrCreate(['name' => $request->location]);
        $status   = Status::firstOrCreate(['name'   => $request->status]);

        // ── Créer l'asset ─────────────────────────────────────────
        $asset = Asset::create([
            'category_id'      => $category->id,
            'brand_id'         => $brand->id,
            'location_id'      => $location->id,
            'status_id'        => $status->id,
            'asset_tag'        => $request->asset_tag,
            'serial_number'    => $request->serial_number,
            'model'            => $request->model,
            'description'      => $request->description,
            'purchase_date'    => $request->purchase_date,
            'warranty_end_date'=> $request->warranty_end_date,
            'is_assignable'    => $request->is_assignable,
        ]);

        AuditService::log('create', 'assets', $asset->id, null, $asset->toArray());

        // ── Affectation ───────────────────────────────────────────
        $assignment = null;

        if ($request->assign_type && $status->name === 'Affecté') {

            $employeeId   = null;
            $departmentId = null;
            $seatId       = null;
            $agenceId     = null;
            $assignedTo   = $request->assigned_to;

            switch ($request->assign_type) {
                case 'employee':
                    $emp = $request->assign_target_id
                        ? Employee::findOrFail($request->assign_target_id)
                        : Employee::firstOrCreate(
                            ['email' => $request->assign_target_name],
                            ['name'  => $request->assign_target_name]
                          );
                    $employeeId = $emp->id;
                    $assignedTo = $assignedTo ?? ($emp->first_name . ' ' . $emp->last_name);
                    break;

                case 'department':
                    $dep = $request->assign_target_id
                        ? Department::findOrFail($request->assign_target_id)
                        : Department::firstOrCreate(['name' => $request->assign_target_name]);
                    $departmentId = $dep->id;
                    $assignedTo   = $assignedTo ?? $dep->name;
                    break;

                case 'seat':
                    $seat = $request->assign_target_id
                        ? Seat::findOrFail($request->assign_target_id)
                        : Seat::firstOrCreate(['name' => $request->assign_target_name]);
                    $seatId     = $seat->id;
                    $assignedTo = $assignedTo ?? $seat->name;
                    break;
                case 'agence':
                    $agence = $request->assign_target_id
                        ? \App\Models\Agence::findOrFail($request->assign_target_id)
                        : \App\Models\Agence::firstOrCreate(['nom_agence' => $request->assign_target_name]);
                    $agenceId   = $agence->id;
                    $assignedTo = $assignedTo ?? $agence->nom_agence;
                    break;
            }

            $assignment = Assignment::create([
                'asset_id'      => $asset->id,
                'employee_id'   => $employeeId,
                'department_id' => $departmentId,
                'seat_id'       => $seatId  ,
                'agence_id'     => $agenceId,
                'assigned_at'   => Carbon::now(),
                'assigned_by'   => auth()->id(),   // ← toujours l'user connecté
                'assigned_to'   => $assignedTo,
                'status'        => 'assigned',
            ]);

            AuditService::log('create', 'assignments', $assignment->id, null, $assignment->toArray());
        }

        DB::commit();

        return response()->json([
            'asset'      => $asset->load(['category', 'brand', 'location', 'status']),
            'assignment' => $assignment?->load(['employee', 'department', 'seat', 'assignedBy']),
        ], 201);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json(['error' => $e->getMessage()], 500);
    }
}

    public function show(Asset $asset)
    {
        return $asset->load(['category', 'brand', 'location', 'status']);
    }

    public function update(Request $request, Asset $asset)
    {
        $request->validate([
            'category'          => 'sometimes|string',
            'brand'             => 'sometimes|string',
            'location'          => 'sometimes|string',
            'status'            => 'sometimes|string',
            'asset_tag'         => 'sometimes|unique:assets,asset_tag,' . $asset->id,
            'serial_number'     => 'sometimes|unique:assets,serial_number,' . $asset->id,
            'model'             => 'nullable|string',
            'description'       => 'nullable|string',
            'purchase_date'     => 'nullable|date',
            'warranty_end_date' => 'nullable|date',
            'is_assignable'     => 'sometimes|boolean',
        ]);

        $oldData = $asset->toArray();

        if ($request->has('category')) {
            $asset->category_id = Category::firstOrCreate(['name' => $request->category])->id;
        }
        if ($request->has('brand')) {
            $asset->brand_id = Brand::firstOrCreate(['name' => $request->brand])->id;
        }
        if ($request->has('location')) {
            $asset->location_id = Location::firstOrCreate(['name' => $request->location])->id;
        }
        if ($request->has('status')) {
            $asset->status_id = Status::firstOrCreate(['name' => $request->status])->id;
        }

        $asset->fill($request->only([
            'asset_tag', 'serial_number', 'model',
            'description', 'purchase_date', 'warranty_end_date', 'is_assignable'
        ]));

        $asset->save();

        AuditService::log('update', 'assets', $asset->id, $oldData, $asset->fresh()->toArray());

        return response()->json($asset->load(['category', 'brand', 'location', 'status']));
    }

    public function destroy(Asset $asset)
    {
        AuditService::log('delete', 'assets', $asset->id, $asset->toArray(), null);

        $asset->delete();

        return response()->json(['message' => 'Asset deleted']);
    }
}