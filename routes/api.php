<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Account\AccountController;
use App\Http\Controllers\Account\LoginController;
use App\Http\Controllers\Account\InquiryController;
use App\Http\Controllers\Account\NotificationController;
use App\Http\Controllers\Contact\ContactsController;

Route::prefix('contact')->group(function () {
    Route::get('/form-data', [ContactsController::class, 'getFormData']);
    Route::post('/confirm', [ContactsController::class, 'confirm']);
    Route::post('/send', [ContactsController::class, 'send']);
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/login', [LoginController::class, 'apiLogin']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [LoginController::class, 'apiLogout']);

    // Dashboard routes
    Route::get('/dashboard', [AccountController::class, 'apiDashboard']);
    Route::get('/dashboard/notifications', [NotificationController::class, 'apiDashboardNotifications']);

    // Notification routes
    Route::get('/notifications/read-status', [NotificationController::class, 'apiReadStatus']);
    Route::get('/notifications', [NotificationController::class, 'apiUnreadNotifications']);
    Route::get('/notifications/{notification}', [NotificationController::class, 'show']);
    Route::post('/notifications', [NotificationController::class, 'store']);
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);

    // Account routes
    Route::get('/account/list', [AccountController::class, 'apiAccountList']);
    Route::post('/account/register', [AccountController::class, 'apiRegister']);
    Route::get('/form-data', [AccountController::class, 'apiFormData']);
    Route::get('/account/{user}', [AccountController::class, 'apiShow']);
    Route::match(['post', 'put'], '/account/{user}', [AccountController::class, 'apiUpdate']);
    Route::delete('/account/{user}', [AccountController::class, 'apiDestroy']);

    // Inquiry routes
    Route::get('/inquiries', [InquiryController::class, 'apiIndex']);
    Route::get('/inquiries/{inquiry}', [InquiryController::class, 'apiShow']);
    Route::put('/inquiries/{inquiry}', [InquiryController::class, 'apiUpdate']);
});
