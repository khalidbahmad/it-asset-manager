<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;  
use Symfony\Component\HttpFoundation\Response;
use Laravel\Sanctum\PersonalAccessToken;


class AuthToken
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        // Cas 1 : pas de token du tout
        if (!$token) {
            return response()->json([
                'message' => 'Token manquant'
            ], 401);
        }

        // Cas 2 : recherche dans la table Sanctum
        $accessToken = PersonalAccessToken::findToken($token);

        if (!$accessToken || !$accessToken->tokenable) {
            return response()->json([
                'message' => 'Token invalide'
            ], 401);
        }

        // Injecte l'utilisateur
        auth()->setUser($accessToken->tokenable);

        return $next($request);
    }
}
