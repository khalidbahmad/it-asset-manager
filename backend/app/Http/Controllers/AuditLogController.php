<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;

class AuditLogController extends Controller
{
    // Tous les logs
    public function index()
    {
        return AuditLog::with('user')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    // Logs par table (assets, assignments, movements...)
    public function byTable(string $table)
    {
        return AuditLog::with('user')
            ->where('table_name', $table)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    // Logs par record spécifique
    public function byRecord(string $table, int $id)
    {
        return AuditLog::with('user')
            ->where('table_name', $table)
            ->where('record_id', $id)
            ->orderBy('created_at', 'desc')
            ->get();
    }
}