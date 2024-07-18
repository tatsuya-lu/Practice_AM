<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\Account\LoginRequest;
use Illuminate\Support\Facades\Auth;
use App\Providers\RouteServiceProvider;

class LoginController extends Controller
{

    public function __construct()
    {
        $this->middleware('guest:admin')->except(['logout', 'apiLogout']);
    }

    public function apiLogin(LoginRequest $request)
    {
        $credentials = $request->validated();

        if (Auth::guard('admin')->attempt($credentials)) {
            $user = Auth::guard('admin')->user();
            $token = $user->createToken('auth-token')->plainTextToken;
            return response()->json([
                'token' => $token,
                'user' => $user
            ]);
        }

        return response()->json(['error' => '入力された内容が一致しませんでした。'], 401);
    }

    public function apiLogout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'ログアウトしました。']);
    }

    public function show()
    {
        return view('admin.login');
    }

    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();

        if (Auth::guard('admin')->attempt($credentials)) {
            $request->session()->regenerate();

            return redirect()->intended(RouteServiceProvider::ADMIN_HOME);
        }

        return back()->withErrors([
            'error' => '入力された内容が一致しませんでした。'
        ]);
    }

    public function logout(Request $request)
    {
        Auth::guard('admin')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
