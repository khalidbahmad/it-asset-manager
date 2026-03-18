<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    protected $fillable = ['name', 'address'];

    public function assets()
    {
        return $this->hasMany(Asset::class);
    }

    public function movementsFrom()
    {
        return $this->hasMany(Movement::class, 'from_location_id');
    }

    public function movementsTo()
    {
        return $this->hasMany(Movement::class, 'to_location_id');
    }
}