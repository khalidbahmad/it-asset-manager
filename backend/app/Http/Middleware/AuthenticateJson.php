<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;

class AuthenticateJson extends Middleware
{
    protected function unauthenticated($request, array $guards)
    {
        return response()->json([
            'message' => 'Non authentifié'
        ], 401);
    }
}