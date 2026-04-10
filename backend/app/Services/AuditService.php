<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

class AuditService
{
    public static function log(
        string $action,
        string $tableName,
        int $recordId,
        array $oldData = null,
        array $newData = null,
        string $assetTag = null,
        string $serialNumber = null
    ) {
        AuditLog::create([
            'user_id'    => Auth::id(),
            'action'     => $action,
            'table_name' => $tableName,
            'record_id'  => $recordId,
            'old_data'   => $oldData,
            'new_data'   => $newData,
            'asset_tag'  => $assetTag,
            'serial_number' => $serialNumber,

        ]);
    }

    public static function getLogsForModel(string $tableName, int $recordId)
    {
        return AuditLog::where('table_name', $tableName)
            ->where('record_id', $recordId)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();
    }
}