<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgenceInfo extends Model
{
    protected $table = 'agences_info';

    // La table n'a pas created_at / updated_at
    public $timestamps = false;

    protected $fillable = [
        'IDAgence',
        'point_de_vente',
        'emetteur',
        'nom_ville',
        'ville_id',
        'ip_agence',
        'type_agence',
        'telephone_affiche',
        'etat_agence',
        'anydesk',
        'Anydesk_2',
        'Anydesk_3',
        'autres',
        'type_agence_code',
        'etat_agence_code',
    ];

    public function agence()
    {
        return $this->belongsTo(Agence::class, 'IDAgence', 'id');
    }
}