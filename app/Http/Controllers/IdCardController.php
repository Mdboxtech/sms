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

        $logoPath = Setting::getValue('school_logo');
        $schoolLogoUrl = $logoPath ? asset('storage/' . $logoPath) : null;

        return Inertia::render('Admin/IdCard/Index', [
            'idCardSettings' => $settings,
            'classrooms' => Classroom::all(),
            'schoolLogoUrl' => $schoolLogoUrl,
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
            // Staff/Teachers
            $query->whereDoesntHave('student');
        }

        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $users = $query->paginate(20);
        
        // Transform data to include passport_photo at top level for easier access
        $users->getCollection()->transform(function ($user) {
            $user->passport_photo = $user->student?->passport_photo 
                ? asset('storage/' . $user->student->passport_photo) 
                : null;
            $user->admission_number = $user->student?->admission_number;
            $user->classroom = $user->student?->classroom;
            return $user;
        });

        return response()->json($users);
    }

    public function uploadPhoto(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $student = Student::findOrFail($request->student_id);

        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($student->passport_photo && \Storage::disk('public')->exists($student->passport_photo)) {
                \Storage::disk('public')->delete($student->passport_photo);
            }

            // Store new photo
            $path = $request->file('photo')->store('passport_photos', 'public');
            $student->passport_photo = $path;
            $student->save();
        }

        return response()->json([
            'success' => true,
            'photo_url' => asset('storage/' . $student->passport_photo),
        ]);
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
            // Back side settings
            'show_back' => true,
            'back_title' => 'Terms & Conditions',
            'back_content' => "1. This card is non-transferable.\n2. Report if lost or found.\n3. Must be worn at all times on campus.",
            'back_contact' => config('app.school_phone', '+1 234 567 890'),
            'back_address' => config('app.school_address', 'School Address'),
        ];
    }
}
