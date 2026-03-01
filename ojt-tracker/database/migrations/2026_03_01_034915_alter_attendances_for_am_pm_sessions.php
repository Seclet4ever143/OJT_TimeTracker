<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            // Drop old single-session columns
            $table->dropColumn(['time_in', 'time_out', 'total_hours']);
        });

        Schema::table('attendances', function (Blueprint $table) {
            // AM session
            $table->timestamp('am_time_in')->nullable()->after('date');
            $table->timestamp('am_time_out')->nullable()->after('am_time_in');
            $table->decimal('am_total_hours', 5, 2)->nullable()->after('am_time_out');

            // PM session
            $table->timestamp('pm_time_in')->nullable()->after('am_total_hours');
            $table->timestamp('pm_time_out')->nullable()->after('pm_time_in');
            $table->decimal('pm_total_hours', 5, 2)->nullable()->after('pm_time_out');

            // Combined total
            $table->decimal('total_hours', 5, 2)->nullable()->after('pm_total_hours');

            // Flag for manual / redo entries
            $table->boolean('is_manual')->default(false)->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropColumn([
                'am_time_in', 'am_time_out', 'am_total_hours',
                'pm_time_in', 'pm_time_out', 'pm_total_hours',
                'total_hours', 'is_manual',
            ]);
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->timestamp('time_in')->nullable()->after('date');
            $table->timestamp('time_out')->nullable()->after('time_in');
            $table->decimal('total_hours', 5, 2)->nullable()->after('time_out');
        });
    }
};
