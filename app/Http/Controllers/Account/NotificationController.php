<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\Account\NotificationRequest;
use App\Models\Notification;
use App\Models\NotificationRead;
use App\Services\NotificationService;

class NotificationController extends Controller
{

    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function apiList(Request $request)
    {
        $notifications = Notification::orderBy('created_at', 'desc')
            ->paginate(5);

        return response()->json([
            'notifications' => $notifications
        ]);
    }

    public function apiDashboardNotifications(Request $request)
    {
        $user = $request->user();
        $notificationData = $this->notificationService->getNotificationsForDashboard();

        return response()->json([
            'notifications' => $notificationData['notifications'],
            'readNotificationIds' => $notificationData['readNotificationIds']
        ]);
    }

    public function show(Request $request, Notification $notification)
    {
        $notificationData = $this->notificationService->show($notification);

        if ($notificationData === null) {
            abort(403, '権限がないためこの操作を実行できません。');
        }

        if ($request->ajax()) {
            return response()->json(['success' => true]);
        }

        return view('admin.Notification', compact('notification'));
    }

    public function list(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            abort(403, '権限がないためこの操作を実行できません。');
        }

        return Notification::whereHas('reads', function ($query) use ($user) {
            $query->where('user_id', $user->id)
                ->where('read', false);
        })
            ->orderBy('id', 'desc')
            ->paginate(7);
    }

    public function getReadStatus(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([], 403);
        }

        $readNotifications = NotificationRead::where('user_id', $user->id)
            ->where('read', true)
            ->pluck('notification_id');

        return response()->json($readNotifications);
    }

    public function create()
    {
        return view('admin.NotificationRegister');
    }

    public function store(NotificationRequest $request)
    {
        $notification = $this->notificationService->store(
            $request->title,
            $request->description
        );

        return redirect()->route('dashboard')->with('success', '新しくお知らせが作成されました。');
    }
}
