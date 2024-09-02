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
        $page = $request->input('page', 1);
        $perPage = $request->input('per_page', 10);

        $notifications = Notification::orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        $readNotificationIds = NotificationRead::where('user_id', $user->id)
            ->where('read', true)
            ->pluck('notification_id');

        return response()->json([
            'notifications' => $notifications,
            'readNotificationIds' => $readNotificationIds
        ]);
    }

    public function apiReadStatus(Request $request)
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

    public function apiUnreadNotifications(Request $request)
    {
        $user = $request->user();
        $notifications = Notification::whereDoesntHave('reads', function ($query) use ($user) {
            $query->where('user_id', $user->id)->where('read', true);
        })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'notifications' => $notifications
        ]);
    }

    public function show(Request $request, Notification $notification)
    {
        $notificationData = $this->notificationService->show($notification);

        if ($notificationData === null) {
            return response()->json(['error' => '権限がないためこの操作を実行できません。'], 403);
        }

        if ($request->ajax() || $request->wantsJson()) {
            return response()->json($notificationData);
        }

        return view('admin.Notification', compact('notification'));
    }

    public function markAsRead(Request $request, Notification $notification)
    {
        $user = $request->user();
        $notificationRead = NotificationRead::firstOrCreate(
            ['user_id' => $user->id, 'notification_id' => $notification->id],
            ['read' => true]
        );

        if (!$notificationRead->read) {
            $notificationRead->read = true;
            $notificationRead->save();
        }

        return response()->json(['success' => true]);
    }

    public function store(NotificationRequest $request)
    {
        $notification = $this->notificationService->store(
            $request->title,
            $request->description
        );

        return response()->json([
            'success' => true,
            'message' => '新しくお知らせが作成されました。',
            'notification' => $notification
        ], 201);
    }
}
