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
        // 1. Optimize Orders table
        Schema::table('orders', function (Blueprint $table) {
            $table->index('status');
            $table->index('payment_method');
            $table->index('created_at');
        });

        // 2. Optimize Transactions table
        Schema::table('transactions', function (Blueprint $table) {
            $table->index('status');
            $table->index('reference_number');
        });

        // 3. Optimize Saved Items (Add unique constraint)
        Schema::table('saved_items', function (Blueprint $table) {
            $table->unique(['user_id', 'product_id']);
        });

        // 4. Optimize Feedback table
        Schema::table('feedback', function (Blueprint $table) {
            $table->index('created_at');
        });

        // 5. Optimize Products table additional fields
        Schema::table('products', function (Blueprint $table) {
            $table->index('price');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['payment_method']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['reference_number']);
        });

        Schema::table('saved_items', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'product_id']);
        });

        Schema::table('feedback', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['price']);
            $table->dropIndex(['created_at']);
        });
    }
};
