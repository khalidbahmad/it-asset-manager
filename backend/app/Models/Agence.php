<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Agence extends Model
{
    protected $table = 'agences';

    protected $fillable = [
        'Adresse',
        'Telephone',
        'Agence',
        'latitude',
        'longitude',
    ];

    // Relation avec agences_info
    public function info()
    {
        return $this->hasOne(AgenceInfo::class, 'IDAgence', 'id');
    }

    // Relation avec les assignments
    public function assignments()
    {
        return $this->hasMany(Assignment::class, 'agence_id', 'IDAgence');
    }
}
