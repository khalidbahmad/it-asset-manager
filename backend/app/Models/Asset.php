<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Asset extends Model
{
    protected $fillable = [
        'category_id',
        'brand_id',
        'location_id',
        'status_id',
        'asset_tag',
        'serial_number',
        'model',
        'description',
        'purchase_date',
        'warranty_end_date',
        'is_assignable',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function status()
    {
        return $this->belongsTo(Status::class);
    }

    public function assignments()
    {
        return $this->hasMany(Assignment::class);
    }

    public function movements()
    {
        return $this->hasMany(Movement::class);
    }
}