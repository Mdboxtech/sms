<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->enum('status', ['pending', 'sent', 'delivered', 'failed'])->default('pending')->after('read_at');
            $table->timestamp('sent_at')->nullable()->after('status');
            $table->timestamp('delivered_at')->nullable()->after('sent_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn(['status', 'sent_at', 'delivered_at']);
        });
    }
};
