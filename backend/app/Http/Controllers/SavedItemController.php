<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\SavedItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SavedItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Use a more efficient query to get products directly via a subquery
        $products = Product::whereIn('id', function ($query) {
            $query->select('product_id')
                ->from('saved_items')
                ->where('user_id', Auth::id());
        })
        ->select(['id', 'name', 'price', 'quantity', 'category', 'user_id', 'images', 'created_at'])
        ->with('user:id,name')
        ->latest()
        ->paginate(12);

        return response()->json($products);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $item = SavedItem::firstOrCreate([
            'user_id' => Auth::id(),
            'product_id' => $request->product_id,
        ]);

        return response()->json(['message' => 'Item saved successfully', 'item' => $item]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($productId)
    {
        // We accept product_id for convenience in toggling
        $deleted = SavedItem::where('user_id', Auth::id())
            ->where('product_id', $productId)
            ->delete();

        if ($deleted) {
            return response()->json(['message' => 'Item removed from saved']);
        }

        return response()->json(['message' => 'Item not found'], 404);
    }
}
