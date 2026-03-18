<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Employee;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    // Login API
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Génère un token unique
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    // Liste des utilisateurs
    public function index()
    {
        return User::all();
    }

        public function store(Request $request)
    {
        $data = $request->validate([
            'first_name' => 'required|string',
            'last_name'  => 'nullable|string',
            'email'      => 'required|email|unique:users,email',
            'password'   => 'required|string|min:6',
            'role'       => 'required|in:admin,it,technician,employee',
            'phone'      => 'nullable|string|max:20',
            'department' => 'nullable|string|max:100',
        ]);

        // Créer le user
        $user = User::create([
            'name'     => $data['first_name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'role'     => $data['role'],
        ]);

        // Si le rôle est employee → insérer dans la table employees
        if ($data['role'] === 'employee') {
            Employee::firstOrCreate(
                ['email' => $data['email']],
                [
                    'first_name' => $data['first_name'],
                    'last_name'  => $data['last_name'],
                    'phone'      => $data['phone'] ?? null,
                    'department' => $data['department'] ?? null,
                ]
            );
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token
        ], 201);
    }

    // Détail utilisateur
    public function show(User $user)
    {
        return $user;
    }

    // Mettre à jour utilisateur
    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name'=>'sometimes|string',
            'email'=>'sometimes|email|unique:users,email,'.$user->id,
            'password'=>'sometimes|string|min:6',
            'role'=>'sometimes|in:admin,it,technician,employee',
        ]);

        if(isset($data['password'])){
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);
        

        return response()->json($user);
    }

    // Supprimer utilisateur
    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(['message'=>'User deleted']);
    }
}