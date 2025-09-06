<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('body')->nullable();
            $table->unsignedBigInteger('sender_id');
            $table->string('sender_type'); // 'admin', 'teacher', etc.
            $table->unsignedBigInteger('target_id')->nullable(); // null = broadcast
            $table->string('target_type')->nullable(); // 'student', 'classroom', 'staff', null = all
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }
    public function down() {
        Schema::dropIfExists('notifications');
    }
};
