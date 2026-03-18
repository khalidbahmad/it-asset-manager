<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Assignment extends Model
{
    protected $fillable = [
        'asset_id',
        'employee_id',
        'department_id',
        'seat_id',
        'assigned_at',
        'returned_at',
        'status',
    ];

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function seat()
    {
        return $this->belongsTo(Seat::class);
    }
}