<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('sender_id');
            $table->string('sender_type'); // 'admin', 'teacher', etc.
            $table->unsignedBigInteger('receiver_id');
            $table->string('receiver_type'); // 'student', 'staff', etc.
            $table->string('subject');
            $table->text('body')->nullable();
            $table->string('attachment_path')->nullable();
            $table->string('attachment_type')->nullable(); // 'file', 'video', etc.
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }
    public function down() {
        Schema::dropIfExists('messages');
    }
};
