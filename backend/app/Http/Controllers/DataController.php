<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DataController extends Controller
{
    public function getData()
    {
        $data = [
            'brands'      => \App\Models\Brand::all(),
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
            'name' => 'required|string|unique:brands,name',
        ]);

        $brand = \App\Models\Brand::create(['name' => $request->name]);

        return response()->json($brand, 201);
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
}