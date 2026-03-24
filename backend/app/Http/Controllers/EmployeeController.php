<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Employee;
use App\Services\AuditService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class EmployeeController extends Controller
{
    public function index()
    {
        return response()->json(Employee::all());
    }

    public function createEmployee(Request $request)
    {
        $data = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name'  => 'nullable|string|max:100',
            'email'      => 'required|email|unique:users,email|unique:employees,email',
            'password'   => 'nullable|string|min:6',
            'phone'      => 'nullable|string|max:20',
            'department' => 'nullable|string|max:100',
        ]);

        DB::beginTransaction();
        try {
            $password = $data['password'] ?? 'test1234';

            $user = User::create([
                'name'     => $data['first_name'] . ' ' . ($data['last_name'] ?? ''),
                'email'    => $data['email'],
                'password' => Hash::make($password),
                'role'     => 'employee',
            ]);

            $employee = Employee::create([
                'first_name' => $data['first_name'],
                'last_name'  => $data['last_name']  ?? '',
                'email'      => $data['email'],
                'phone'      => $data['phone']      ?? null,
                'department' => $data['department'] ?? null,
                'user_id'    => $user->id,
            ]);

            AuditService::log('create', 'employees', $employee->id, null, $employee->toArray());

            DB::commit();

            return response()->json([
                'user'             => $user,
                'employee'         => $employee,
                'default_password' => !isset($data['password']),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}