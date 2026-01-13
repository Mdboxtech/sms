<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Setting;
use App\Models\User;
use App\Models\Student;
use App\Models\Classroom;

class IdCardController extends Controller
{
    public function index()
    {
        // Fetch ID Card Settings
        $settings = [
            'student_template' => Setting::getValue('id_card_student_template', $this->getDefaultTemplate('student')),
            'teacher_template' => Setting::getValue('id_card_teacher_template', $this->getDefaultTemplate('teacher')),
        ];

        return Inertia::render('Admin/IdCard/Index', [
            'idCardSettings' => $settings,
            'classrooms' => Classroom::all(),
        ]);
    }

    public function saveTemplate(Request $request)
    {
        $request->validate([
            'type' => 'required|in:student,teacher',
            'template' => 'required|array',
        ]);

        $key = 'id_card_' . $request->type . '_template';
        
        Setting::setValue($key, json_encode($request->template), 'json');
        Setting::clearCache();

        return redirect()->back()->with('success', ucfirst($request->type) . ' ID card template saved successfully.');
    }

    public function getUsers(Request $request)
    {
        $type = $request->input('type', 'student');
        $query = User::query();

        if ($type === 'student') {
            $query->whereHas('student');
            if ($request->classroom_id) {
                $query->whereHas('student', function($q) use ($request) {
                    $q->where('classroom_id', $request->classroom_id);
                });
            }
            $query->with('student.classroom');
        } else {
            // Assuming teachers have a 'teacher' role or similar. 
            // For now, let's assume all users who are NOT students are potentially staff/teachers
            // Or specifically check for a role if your system has spatie/laravel-permission
            // Adjust this logic based on your specific User/Role model
             $query->whereDoesntHave('student');
        }

        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        return response()->json($query->paginate(20));
    }

    private function getDefaultTemplate($type)
    {
        return [
            'layout' => 'portrait', // portrait, landscape
            'theme_color' => '#2563eb',
            'show_photo' => true,
            'show_name' => true,
            'show_id' => true,
            'show_role' => true,
            'show_expiry' => false,
            'header_text' => config('app.school_name', 'School Name'),
            'sub_header_text' => $type === 'student' ? 'Student Identity Card' : 'Staff Identity Card',
            'expiry_date' => '',
            'background_image' => null,
        ];
    }
}
