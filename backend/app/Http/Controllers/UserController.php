<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        // Ensure only admin can access
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return User::latest()->paginate(20);
    }

    public function store(Request $request)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $fields = $request->validate([
            'name' => 'required|string',
            'email' => 'required|string|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,farmer,buyer',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
        ]);

        $user = User::create([
            'name' => $fields['name'],
            'email' => $fields['email'],
            'password' => Hash::make($fields['password']),
            'role' => $fields['role'],
            'phone' => $fields['phone'],
            'address' => $fields['address'],
        ]);

        return response()->json($user, 201);
    }

    public function show(string $id)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return User::findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::findOrFail($id);

        $fields = $request->validate([
            'name' => 'required|string',
            'email' => 'required|string|unique:users,email,' . $user->id,
            'role' => 'required|in:admin,farmer,buyer',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'password' => 'nullable|string|min:6'
        ]);

        $user->name = $fields['name'];
        $user->email = $fields['email'];
        $user->role = $fields['role'];
        $user->phone = $fields['phone'];
        $user->address = $fields['address'];

        if (!empty($fields['password'])) {
            $user->password = Hash::make($fields['password']);
        }

        $user->save();

        return response()->json($user);
    }

    public function destroy(string $id)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    public function updateSelf(Request $request)
    {
        $user = auth()->user();

        $fields = $request->validate([
            'name' => 'required|string',
            'email' => 'required|string|unique:users,email,' . $user->id,
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'password' => 'nullable|string|min:6',
            'bio' => 'nullable|string',
            'profile_picture' => 'nullable|string',
        ]);

        $user->name = $fields['name'];
        $user->email = $fields['email'];
        $user->phone = $fields['phone'];
        $user->address = $fields['address'];

        if (array_key_exists('bio', $fields)) {
            $user->bio = $fields['bio'];
        }
        if (array_key_exists('profile_picture', $fields)) {
            $user->profile_picture = $fields['profile_picture'];
        }

        if (!empty($fields['password'])) {
            $user->password = Hash::make($fields['password']);
        }

        $user->save();

        return response()->json($user);
    }
}
