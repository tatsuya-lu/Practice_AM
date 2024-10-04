<?php

use App\Http\Controllers\Account\NotificationController;
use Illuminate\Support\Facades\Route;

Route::get('/{any}', function () {
    return view('layouts.app');
})->where('any', '^(?!contact).*$');

Route::get('/contact{any}', function () {
    return view('layouts.contact');
})->where('any', '.*');


Route::prefix('account')->middleware(['auth:admin'])->group(function () {

    //この四つのルートを削除するとお知らせ機能がうまく動作しなくなる。
    Route::get('/notification/list', [NotificationController::class, 'list'])->name('notification.list');

    Route::get('/notification/{notification}', [NotificationController::class, 'show'])->name('notification.show');

    Route::post('/notifications', [NotificationController::class, 'store'])->name('notification.store');
    Route::get('/notifications/read-status', [NotificationController::class, 'getReadStatus'])->name('notification.read-status');
});
