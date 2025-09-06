<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NotificationController;

Route::middleware('auth')->group(function () {
    Route::get('/notifications/unread', [NotificationController::class, 'getUnreadCount']);
});
