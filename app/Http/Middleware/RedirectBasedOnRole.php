<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RedirectBasedOnRole
{
    public function handle(Request $request, Closure $next)
    {

        if (!$request->user()) {
            return redirect()->route('login');
        }

        $intendedUrl = $request->session()->get('url.intended');
        
        if ($intendedUrl) {
            return $next($request);
        }

        if ($request->user()->isAdmin() && !str_starts_with($request->path(), 'admin')) {
            return redirect()->route('admin.dashboard');
        }

        if ($request->user()->isTeacher() && !str_starts_with($request->path(), 'teacher')) {
            return redirect()->route('teacher.dashboard');
        }

        if ($request->user()->isStudent() && !str_starts_with($request->path(), 'student')) {
            return redirect()->route('student.dashboard');
        }

        return $next($request);
    }
}
