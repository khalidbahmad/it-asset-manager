<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        api: __DIR__.'/../routes/api.php', 
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Enregistrement des alias de middlewares (remplace $routeMiddleware)
        $middleware->alias([
            'auth.token'  => \App\Http\Middleware\AuthToken::class,
            'auth.json'   => \App\Http\Middleware\AuthenticateJson::class,
            'role'        => \App\Http\Middleware\RoleMiddleware::class,
        ]);

        // Groupe API (remplace $middlewareGroups['api'])
        $middleware->group('api', [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
            'throttle:api',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    ->booting(function () {
        // ✅ Nom complet du namespace — les "use" du fichier ne sont pas disponibles ici
        RateLimiter::for('api', function ($request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(60)->by(
                optional($request->user())->id ?: $request->ip()
            );
        });
    })
    ->create();
