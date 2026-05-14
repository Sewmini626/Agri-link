<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $fields = $request->validate([
            'name' => 'required|string',
            'email' => 'required|string|unique:users,email',
            'password' => 'required|string',
            'role' => 'required|in:admin,farmer,buyer', // simplified
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
        ]);

        $user = \App\Models\User::create([
            'name' => $fields['name'],
            'email' => $fields['email'],
            'password' => \Illuminate\Support\Facades\Hash::make($fields['password']),
            'role' => $fields['role'],
            'phone' => $fields['phone'],
            'address' => $fields['address'],
        ]);

        $token = $user->createToken('myapptoken')->plainTextToken;

        return response([
            'user' => $user,
            'token' => $token
        ], 201);
    }

    public function login(Request $request)
    {
        $fields = $request->validate([
            'email' => 'required|string',
            'password' => 'required|string'
        ]);

        // Check email
        $user = \App\Models\User::where('email', $fields['email'])->first();

        // Check password
        if (!$user || !\Illuminate\Support\Facades\Hash::check($fields['password'], $user->password)) {
            return response([
                'message' => 'Bad creds'
            ], 401);
        }

        $token = $user->createToken('myapptoken')->plainTextToken;

        return response([
            'user' => $user,
            'token' => $token
        ], 201);
    }

    public function logout(Request $request)
    {
        auth()->user()->tokens()->delete();
        return [
            'message' => 'Logged out'
        ];
    }
}
