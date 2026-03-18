<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Asset;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Location;
use App\Models\Status;
use App\Services\AuditService;

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