<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Update existing orders table
        Schema::table('orders', function (Blueprint $table) {
            // Drop foreign key first, then columns
            $table->dropForeign(['product_id']);
            $table->dropColumn(['product_id', 'quantity']); 

            // Add new columns for enhanced order details
            $table->string('payment_method')->default('cod');
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('city')->nullable();
            $table->string('zip')->nullable();

            // Use text for longer addresses
            $table->text('shipping_address')->change();
        });

        // 2. Create order_items table
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            // Standard cascade: if order is deleted, items are deleted
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            
            /**
             * FIX: Added ->nullable() 
             * This is required because nullOnDelete() tells MySQL to set this column to NULL
             * if the product is deleted. A column cannot be NULL if it isn't marked nullable!
             */
            $table->foreignId('product_id')
                  ->nullable() 
                  ->constrained()
                  ->nullOnDelete(); 

            $table->integer('quantity');
            $table->decimal('price', 10, 2); // Price at time of purchase
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['payment_method', 'first_name', 'last_name', 'email', 'phone', 'city', 'zip']);
            $table->string('shipping_address')->change();
            
            // Revert to original state
            $table->foreignId('product_id')->nullable()->constrained();
            $table->integer('quantity')->nullable();
        });
    }
};