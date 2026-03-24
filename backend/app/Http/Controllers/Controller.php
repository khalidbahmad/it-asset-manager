<?php

namespace App\Http\Controllers;

abstract class Controller
{
    public function addVille(Request $request)
    {
        $request->validate([
            'nom_ville' => 'required|string|unique:villes,nom_ville',
        ]);

        $ville = Ville::create([
            'nom_ville' => $request->nom_ville,
        ]);

        return response()->json($ville, 201);
    }
}
