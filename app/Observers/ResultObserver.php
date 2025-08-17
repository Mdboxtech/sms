<?php

namespace App\Observers;

use App\Models\Result;

class ResultObserver
{
    public function saving(Result $result)
    {
        // Calculate total score
        $result->total_score = $result->ca_score + $result->exam_score;
    }

    public function saved(Result $result)
    {
        // Recalculate positions for all students in this subject and term
        $results = Result::where('subject_id', $result->subject_id)
            ->where('term_id', $result->term_id)
            ->orderByDesc('total_score')
            ->get();

        $position = 1;
        $lastScore = null;
        $lastPosition = null;

        foreach ($results as $r) {
            // If current score equals previous score, use the same position
            if ($lastScore === $r->total_score) {
                $r->position = $lastPosition;
            } else {
                $r->position = $position;
                $lastPosition = $position;
            }

            $lastScore = $r->total_score;
            $position++;

            $r->saveQuietly(); // Prevent infinite loop
        }
    }
}
