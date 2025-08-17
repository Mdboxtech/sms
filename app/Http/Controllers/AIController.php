<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AIController extends Controller
{
    public function analyzePerformance(Request $request)
    {
        $request->validate([
            'student_name' => 'required|string',
            'results' => 'required|array',
            'comment_type' => 'required|in:teacher,principal'
        ]);

        $totalScore = 0;
        $subjectBreakdown = [];
        $failedSubjects = [];
        $excellentSubjects = [];

        foreach ($request->results as $result) {
            $totalScore += $result['total_score'];
            $subjectBreakdown[] = "{$result['subject']['name']}: {$result['total_score']}%";
            
            if ($result['total_score'] < 40) {
                $failedSubjects[] = $result['subject']['name'];
            }
            if ($result['total_score'] >= 70) {
                $excellentSubjects[] = $result['subject']['name'];
            }
        }

        $averageScore = $totalScore / count($request->results);

        // Build the prompt based on the type of comment needed
        $prompt = "Generate a " . ($request->comment_type === 'teacher' ? "detailed teacher's" : "concise principal's");
        $prompt .= " comment for {$request->student_name}'s academic performance.\n\n";
        $prompt .= "Performance Details:\n";
        $prompt .= "- Overall Average: {$averageScore}%\n";
        
        if (!empty($excellentSubjects)) {
            $prompt .= "- Excellent Performance in: " . implode(", ", $excellentSubjects) . "\n";
        }
        if (!empty($failedSubjects)) {
            $prompt .= "- Needs Improvement in: " . implode(", ", $failedSubjects) . "\n";
        }
        
        $prompt .= "\nSubject Scores:\n" . implode("\n", $subjectBreakdown);
        
        if ($request->comment_type === 'teacher') {
            $prompt .= "\n\nPlease provide a detailed comment focusing on academic performance, areas of strength, and specific suggestions for improvement. Keep the tone constructive and encouraging.";
        } else {
            $prompt .= "\n\nPlease provide a brief but impactful comment focusing on overall performance, character, and general recommendations. The tone should be formal and motivational.";
        }

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . config('services.openai.api_key'),
            'Content-Type' => 'application/json',
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => 'gpt-3.5-turbo',
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'You are an experienced educator providing constructive feedback on student performance.'
                ],
                [
                    'role' => 'user',
                    'content' => $prompt
                ]
            ],
            'max_tokens' => 250,
            'temperature' => 0.7,
        ]);

        if ($response->successful()) {
            return response()->json([
                'comment' => trim($response->json()['choices'][0]['message']['content'])
            ]);
        }

        return response()->json(['error' => 'Failed to generate comment'], 500);
    }

    public function remark(Request $request)
    {
        $request->validate([
            'student' => 'required|string',
            'subjects' => 'required|array',
            'subjects.*.name' => 'required|string',
            'subjects.*.score' => 'required|numeric',
        ]);

        $student = $request->input('student');
        $subjects = $request->input('subjects');

        $subjectScores = collect($subjects)
            ->map(fn($s) => $s['name'] . ' (' . $s['score'] . ')')
            ->implode(', ');

        $prompt = "Generate a short academic comment for $student who scored $subjectScores.";

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . config('services.openai.api_key'),
            'Content-Type' => 'application/json',
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => 'gpt-3.5-turbo',
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'You are a helpful teacher writing a constructive remark for a student\'s result.'
                ],
                [
                    'role' => 'user',
                    'content' => $prompt
                ]
            ],
            'max_tokens' => 100,
            'temperature' => 0.7,
        ]);

        if ($response->successful()) {
            return response()->json([
                'remark' => $response->json()['choices'][0]['message']['content']
            ]);
        }

        return response()->json([
            'remark' => 'Keep up the good work!'
        ], 200);
    }
}