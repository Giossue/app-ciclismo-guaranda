<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAgentToolToken
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $configuredToken = config('guaranda.agent.tool_token');

        if (! is_string($configuredToken) || $configuredToken === '') {
            abort(401, 'Agent tools are not configured.');
        }

        $providedToken = $request->bearerToken() ?: $request->header('X-Agent-Token');

        if (! is_string($providedToken) || ! hash_equals($configuredToken, $providedToken)) {
            abort(401, 'Invalid agent tool token.');
        }

        return $next($request);
    }
}
