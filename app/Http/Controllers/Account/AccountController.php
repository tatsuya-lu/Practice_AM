<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\RegistersUsers;
use Illuminate\Http\Request;
use App\Http\Requests\Account\AccountRequest;
use App\Models\Account;
use App\Services\AccountService;
use App\Services\InquiryService;
use App\Services\NotificationService;

class AccountController extends Controller
{
    use RegistersUsers;

    protected $prefectures;
    protected $adminLevels;
    protected $accountService;
    protected $inquiryService;
    protected $notificationService;

    public function __construct(AccountService $accountService, InquiryService $inquiryService, NotificationService $notificationService)
    {
        $this->prefectures = config('const.prefecture');
        $this->adminLevels = config('const.admin_level');
        $this->accountService = $accountService;
        $this->inquiryService = $inquiryService;
        $this->notificationService = $notificationService;
    }

    public function apiDashboard(Request $request)
    {
        $notificationData = $this->notificationService->getNotificationsForDashboard();
        $unresolvedInquiryCount = $this->inquiryService->unresolvedInquiryCount();
        $unresolvedInquiries = $this->inquiryService->unresolvedInquiries();

        return response()->json([
            'notificationData' => $notificationData,
            'unresolvedInquiryCount' => $unresolvedInquiryCount,
            'unresolvedInquiries' => $unresolvedInquiries
        ]);
    }

    public function apiRegister(AccountRequest $request)
    {
        $user = $this->accountService->register($request->all());

        if ($user) {
            return response()->json([
                'message' => 'アカウントが正常に登録されました。',
                'user' => $user
            ], 201);
        } else {
            return response()->json(['error' => 'ユーザーの登録に失敗しました。'], 400);
        }
    }

    public function apiAccountList(Request $request)
    {
        $perPage = $request->input('per_page', 20);
        $users = $this->accountService->accountList($request->all(), $perPage);

        return response()->json($users);
    }

    public function apiUpdate(AccountRequest $request, Account $user)
    {
        $updatedUser = $this->accountService->update($user, $request->all());
        if ($updatedUser) {
            return response()->json([
                'success' => true,
                'message' => 'ユーザーが正常に更新されました。',
                'user' => $updatedUser
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'ユーザーの更新に失敗しました。'
            ], 400);
        }
    }

    public function apiFormData()
    {
        return response()->json([
            'prefectures' => config('const.prefecture'),
            'adminLevels' => config('const.admin_level')
        ]);
    }

    public function apiShow(Account $user)
    {
        return response()->json($user);
    }

    public function apiDestroy(Account $user)
    {
        $this->accountService->destroy($user);
        return response()->json(['message' => 'ユーザーが正常に削除されました。']);
    }
}
