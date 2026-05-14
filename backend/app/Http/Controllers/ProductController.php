<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Product::select(['id', 'name', 'price', 'quantity', 'category', 'user_id', 'images', 'created_at'])
            ->with('user:id,name')
            ->latest()
            ->paginate(12);
    }

    /**
     * Get products for the authenticated seller.
     */
    public function myProducts()
    {
        return Product::where('user_id', auth()->id())->latest()->simplePaginate(10);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'description' => 'required',
            'price' => 'required|numeric',
            'quantity' => 'required|integer',
            'category' => 'required',
            'images' => 'nullable|array|max:5',
            'images.*' => 'url'
        ]);

        return auth()->user()->products()->create($request->all());
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $product = Product::with('user')->find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json($product);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        \Illuminate\Support\Facades\Log::info('Update check', [
            'product_user_id' => $product->user_id,
            'auth_id' => auth()->id(),
            'user' => auth()->user()
        ]);

        // Check ownership - Ensure types match for comparison
       if ((string) $product->user_id !== (string) auth()->id() && auth()->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Product user_id mismatch',
                'debug' => [
                    'product_owner' => $product->user_id,
                    'current_user' => auth()->id()
                ]
            ], 403);
        }

        $product->update($request->all());
        return $product;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        // Check ownership
        if ((string) $product->user_id !== (string) auth()->id() && auth()->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized',
                'debug' => [
                    'product_owner' => $product->user_id,
                    'current_user' => auth()->id()
                ]
            ], 403);
        }

        return $product->delete();
    }

    /**
     * Search for a name
     *
     * @param  str  $name
     */
    public function search($name)
    {
        return Product::select(['id', 'name', 'price', 'quantity', 'category', 'user_id', 'images', 'created_at'])
            ->where('name', 'like', '%' . $name . '%')
            ->orWhere('category', 'like', '%' . $name . '%')
            ->with('user:id,name')
            ->paginate(12);
    }
}
