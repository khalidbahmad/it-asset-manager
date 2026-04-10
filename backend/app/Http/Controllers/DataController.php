<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Ville;

class DataController extends Controller
{
    public function getData()
    {
        $data = [
            'brand_category' => \DB::table('brand_category')->get(),
            'brands' => \App\Models\Brand::with('category')->get(),
            'categories'  => \App\Models\Category::all(),
            'assets'      => \App\Models\Asset::with(['category', 'brand', 'location', 'status'])->get(),
            'locations'   => \App\Models\Location::all(),
            'departments' => \App\Models\Department::all(),
            'seats'       => \App\Models\Seat::all(),
            'statuses'    => \App\Models\Status::all(),
            'employees'   => \App\Models\Employee::all(),
            'auditLogs'   => \App\Models\AuditLog::all(),
            'movements'   => \App\Models\Movement::all(),
            'agences' => \App\Models\Agence::with('info')->get(), 
            'villes' => \App\Models\Ville::all(),

            // ← assignments actifs avec toutes les cibles résolues
            'assignments' => \App\Models\Assignment::with(['employee', 'department', 'seat'])->get(),
        ];

        if (auth()->user()->role === 'admin') {
            $data['users'] = \App\Models\User::all();
        }

        return response()->json($data);
    }

    public function addCategory(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:categories,name',
        ]);

        $category = \App\Models\Category::create(['name' => $request->name]);

        return response()->json($category, 201);
    }

    public function deleteCategory($id)
    {
        $category = \App\Models\Category::findOrFail($id);
        $category->delete();

        return response()->json(['message' => 'Category deleted']);
    }

    public function addBrand(Request $request)
    {
        $request->validate([
            'name'          => 'required|string',
            'category_name' => 'required|string',
        ]);

        // Vérifie doublon
        $exists = \DB::table('brand_category')
            ->where('brand', $request->name)
            ->where('category', $request->category_name)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Cette combinaison existe déjà'], 422);
        }

        $id = \DB::table('brand_category')->insertGetId([
            'brand'    => $request->name,
            'category' => $request->category_name,
        ]);

        return response()->json(['id' => $id, 'brand' => $request->name, 'category' => $request->category_name], 201);
    }

    public function deleteBrand($id)
    {
        $brand = \App\Models\Brand::findOrFail($id);
        $brand->delete();

        return response()->json(['message' => 'Brand deleted']);
    }

    public function addLocation(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:locations,name',
        ]);

        $location = \App\Models\Location::create(['name' => $request->name]);

        return response()->json($location, 201);
    }

    public function deleteLocation($id)
    {
        $location = \App\Models\Location::findOrFail($id);
        $location->delete();

        return response()->json(['message' => 'Location deleted']);
    }

    public function addVille(Request $request)
    {
        $validated = $request->validate([
            'nom_ville' => 'required|string|max:120|unique:villes,nom_ville',
        ]);

        $ville = Ville::create($validated);

        return response()->json([
            'success' => true,
            'data' => $ville
        ], 201);
    }
}