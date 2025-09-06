<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Event;
use App\Models\User;
use Carbon\Carbon;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::whereHas('role', function($query) {
            $query->where('name', 'admin');
        })->first();

        if (!$admin) {
            $this->command->warn('No admin user found. Please create an admin user first.');
            return;
        }

        $events = [
            [
                'title' => 'School Resumption',
                'description' => 'First day of the new academic term',
                'event_date' => Carbon::now()->startOfMonth(),
                'event_time' => '08:00:00',
                'type' => 'school_event',
                'all_day' => false,
                'color' => '#10b981',
                'created_by' => $admin->id,
            ],
            [
                'title' => 'Mid-Term Break',
                'description' => 'One week break in the middle of the term',
                'event_date' => Carbon::now()->addDays(30),
                'event_time' => null,
                'type' => 'holiday',
                'all_day' => true,
                'color' => '#10b981',
                'created_by' => $admin->id,
            ],
            [
                'title' => 'First Term Examinations Begin',
                'description' => 'Commencement of first term examinations',
                'event_date' => Carbon::now()->addDays(45),
                'event_time' => '09:00:00',
                'type' => 'exam',
                'all_day' => false,
                'color' => '#ef4444',
                'created_by' => $admin->id,
            ],
            [
                'title' => 'Parent-Teacher Conference',
                'description' => 'Meeting between parents and teachers to discuss student progress',
                'event_date' => Carbon::now()->addDays(60),
                'event_time' => '14:00:00',
                'type' => 'meeting',
                'all_day' => false,
                'color' => '#f59e0b',
                'created_by' => $admin->id,
            ],
            [
                'title' => 'Sports Day',
                'description' => 'Annual inter-house sports competition',
                'event_date' => Carbon::now()->addDays(35),
                'event_time' => '09:00:00',
                'type' => 'school_event',
                'all_day' => false,
                'color' => '#3b82f6',
                'created_by' => $admin->id,
            ],
            [
                'title' => 'Science Fair',
                'description' => 'Students showcase their science projects',
                'event_date' => Carbon::now()->addDays(20),
                'event_time' => '10:00:00',
                'type' => 'school_event',
                'all_day' => false,
                'color' => '#8b5cf6',
                'created_by' => $admin->id,
            ],
            [
                'title' => 'End of Term',
                'description' => 'Last day of the current term',
                'event_date' => Carbon::now()->addDays(75),
                'event_time' => '15:00:00',
                'type' => 'school_event',
                'all_day' => false,
                'color' => '#dc2626',
                'created_by' => $admin->id,
            ],
            [
                'title' => 'Teacher Training Workshop',
                'description' => 'Professional development session for teachers',
                'event_date' => Carbon::now()->addDays(15),
                'event_time' => '09:00:00',
                'type' => 'meeting',
                'all_day' => false,
                'color' => '#f59e0b',
                'created_by' => $admin->id,
            ],
        ];

        foreach ($events as $eventData) {
            Event::create($eventData);
        }

        $this->command->info('Sample calendar events created successfully!');
    }
}
