<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = auth()->user();

        // Sécurité : si pas d'utilisateur authentifié
        if (!$user) {
            return response()->json([
                'message' => 'Token manquant'
            ], 401);
        }

        // Cas 3 : token valide mais rôle non autorisé
        if (!in_array($user->role, $roles)) {
            return response()->json([
                'message' => 'Accès refusé'
            ], 403);
        }

        return $next($request);
    }
}
