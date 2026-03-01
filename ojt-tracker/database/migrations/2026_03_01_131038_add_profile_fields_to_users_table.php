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
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 20)->nullable()->after('email');
            $table->date('birthday')->nullable()->after('phone');
            $table->string('company')->nullable()->after('birthday');
            $table->string('department')->nullable()->after('company');
            $table->string('position')->nullable()->after('department');
            $table->string('supervisor')->nullable()->after('position');
            $table->string('address')->nullable()->after('supervisor');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'birthday', 'company', 'department', 'position', 'supervisor', 'address']);
        });
    }
};
