<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Account\AccountController;
use App\Http\Controllers\Account\LoginController;
use App\Http\Controllers\Account\InquiryController;
use App\Http\Controllers\Account\NotificationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/login', [LoginController::class, 'apiLogin']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [LoginController::class, 'apiLogout']);
    Route::get('/dashboard', [AccountController::class, 'apiDashboard']);
    Route::get('/account/list', [AccountController::class, 'apiAccountList']);
    Route::post('/account/register', [AccountController::class, 'apiRegister']);
    Route::get('/form-data', [AccountController::class, 'apiFormData']);
    Route::get('/account/{user}', [AccountController::class, 'apiShow']);
    Route::match(['post', 'put'], '/account/{user}', [AccountController::class, 'apiUpdate']);
    Route::delete('/account/{user}', [AccountController::class, 'apiDestroy']);
    // Route::get('/inquiries', [InquiryController::class, 'apiIndex']);
    // Route::get('/inquiries/{inquiry}', [InquiryController::class, 'apiShow']);
    // Route::put('/inquiries/{inquiry}', [InquiryController::class, 'apiUpdate']);
});