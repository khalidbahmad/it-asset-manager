<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Brand extends Model
{
    protected $fillable = ['name', 'category_id'];

    public function assets()
    {
        return $this->hasMany(Asset::class);
    }

    // Brand.php
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

}