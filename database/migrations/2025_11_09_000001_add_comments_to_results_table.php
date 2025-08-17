<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('results', function (Blueprint $table) {
            $table->text('teacher_comment')->nullable()->after('remark');
            $table->text('principal_comment')->nullable()->after('teacher_comment');
            $table->foreignId('principal_id')->nullable()->constrained('users')->after('teacher_id');
        });
    }

    public function down()
    {
        Schema::table('results', function (Blueprint $table) {
            $table->dropColumn(['teacher_comment', 'principal_comment']);
            $table->dropConstrainedForeignId('principal_id');
        });
    }
};
