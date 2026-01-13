<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Fee;
use App\Models\AcademicSession;
use App\Models\Term;
use App\Models\Classroom;
use Carbon\Carbon;

class FeeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $currentSession = AcademicSession::where('is_current', true)->first();
        $currentTerm = Term::where('is_current', true)->first();
        
        if (!$currentSession || !$currentTerm) {
            $this->command->warn('No current academic session or term found. Skipping fee seeding.');
            return;
        }

        $classrooms = Classroom::all();
        
        if ($classrooms->isEmpty()) {
            $this->command->warn('No classrooms found. Skipping fee seeding.');
            return;
        }

        // Common fees for all classes
        $commonFees = [
            [
                'name' => 'Tuition Fee',
                'description' => 'Regular tuition fee for academic instruction',
                'amount' => 50000.00,
                'fee_type' => 'tuition',
                'payment_frequency' => 'termly',
                'is_mandatory' => true,
                'due_date' => Carbon::now()->addDays(30),
                'late_fee_amount' => 5000.00,
                'grace_period_days' => 7,
            ],
            [
                'name' => 'Development Levy',
                'description' => 'School development and infrastructure maintenance',
                'amount' => 15000.00,
                'fee_type' => 'development',
                'payment_frequency' => 'termly',
                'is_mandatory' => true,
                'due_date' => Carbon::now()->addDays(30),
                'late_fee_amount' => 1500.00,
                'grace_period_days' => 7,
            ],
            [
                'name' => 'Sports Fee',
                'description' => 'Sports activities and equipment',
                'amount' => 5000.00,
                'fee_type' => 'sports',
                'payment_frequency' => 'termly',
                'is_mandatory' => false,
                'due_date' => Carbon::now()->addDays(45),
                'late_fee_amount' => 500.00,
                'grace_period_days' => 10,
            ],
            [
                'name' => 'Library Fee',
                'description' => 'Library maintenance and book acquisition',
                'amount' => 3000.00,
                'fee_type' => 'library',
                'payment_frequency' => 'termly',
                'is_mandatory' => true,
                'due_date' => Carbon::now()->addDays(30),
                'late_fee_amount' => 300.00,
                'grace_period_days' => 7,
            ],
        ];

        // Class-specific fees
        $classSpecificFees = [
            'JSS 1' => [
                [
                    'name' => 'Laboratory Fee',
                    'description' => 'Basic science laboratory usage',
                    'amount' => 8000.00,
                    'fee_type' => 'laboratory',
                    'payment_frequency' => 'termly',
                    'is_mandatory' => true,
                    'due_date' => Carbon::now()->addDays(30),
                ],
            ],
            'JSS 2' => [
                [
                    'name' => 'Laboratory Fee',
                    'description' => 'Intermediate science laboratory usage',
                    'amount' => 10000.00,
                    'fee_type' => 'laboratory',
                    'payment_frequency' => 'termly',
                    'is_mandatory' => true,
                    'due_date' => Carbon::now()->addDays(30),
                ],
            ],
            'JSS 3' => [
                [
                    'name' => 'Laboratory Fee',
                    'description' => 'Advanced science laboratory usage',
                    'amount' => 12000.00,
                    'fee_type' => 'laboratory',
                    'payment_frequency' => 'termly',
                    'is_mandatory' => true,
                    'due_date' => Carbon::now()->addDays(30),
                ],
                [
                    'name' => 'Examination Fee',
                    'description' => 'BECE registration and preparation',
                    'amount' => 15000.00,
                    'fee_type' => 'examination',
                    'payment_frequency' => 'yearly',
                    'is_mandatory' => true,
                    'due_date' => Carbon::now()->addDays(60),
                ],
            ],
            'SS 1' => [
                [
                    'name' => 'Laboratory Fee',
                    'description' => 'Senior science laboratory usage',
                    'amount' => 15000.00,
                    'fee_type' => 'laboratory',
                    'payment_frequency' => 'termly',
                    'is_mandatory' => true,
                    'due_date' => Carbon::now()->addDays(30),
                ],
            ],
            'SS 2' => [
                [
                    'name' => 'Laboratory Fee',
                    'description' => 'Advanced senior science laboratory usage',
                    'amount' => 18000.00,
                    'fee_type' => 'laboratory',
                    'payment_frequency' => 'termly',
                    'is_mandatory' => true,
                    'due_date' => Carbon::now()->addDays(30),
                ],
            ],
            'SS 3' => [
                [
                    'name' => 'Laboratory Fee',
                    'description' => 'Final year science laboratory usage',
                    'amount' => 20000.00,
                    'fee_type' => 'laboratory',
                    'payment_frequency' => 'termly',
                    'is_mandatory' => true,
                    'due_date' => Carbon::now()->addDays(30),
                ],
                [
                    'name' => 'WAEC Registration Fee',
                    'description' => 'WAEC examination registration',
                    'amount' => 25000.00,
                    'fee_type' => 'examination',
                    'payment_frequency' => 'yearly',
                    'is_mandatory' => true,
                    'due_date' => Carbon::now()->addDays(90),
                ],
            ],
        ];

        // Create common fees for all classes
        foreach ($commonFees as $feeData) {
            Fee::create(array_merge($feeData, [
                'classroom_id' => null, // Applies to all classes
                'academic_session_id' => $currentSession->id,
                'term_id' => $currentTerm->id,
                'is_active' => true,
            ]));
        }

        // Create class-specific fees
        foreach ($classrooms as $classroom) {
            if (isset($classSpecificFees[$classroom->name])) {
                foreach ($classSpecificFees[$classroom->name] as $feeData) {
                    Fee::create(array_merge($feeData, [
                        'classroom_id' => $classroom->id,
                        'academic_session_id' => $currentSession->id,
                        'term_id' => $currentTerm->id,
                        'is_active' => true,
                        'is_mandatory' => $feeData['is_mandatory'] ?? true,
                        'late_fee_amount' => $feeData['late_fee_amount'] ?? ($feeData['amount'] * 0.1),
                        'grace_period_days' => $feeData['grace_period_days'] ?? 7,
                    ]));
                }
            }
        }

        $this->command->info('Fee structure seeded successfully!');
    }
}
