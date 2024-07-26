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
        $users = $this->accountService->accountList();

        return response()->json($users);
    }

    public function apiUpdate(AccountRequest $request, Account $user)
    {
        $updatedUser = $this->accountService->update($user, $request->all());
        return response()->json([
            'message' => 'ユーザーが正常に更新されました。',
            'user' => $updatedUser
        ]);
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

    public function index(Request $request)
    {
        $notificationData = $this->notificationService->getNotificationsForDashboard();
        $unresolvedInquiryCount = $this->inquiryService->unresolvedInquiryCount();
        $unresolvedInquiries = $this->inquiryService->unresolvedInquiries();

        return view('admin.Dashboard', compact('notificationData', 'unresolvedInquiryCount', 'unresolvedInquiries'));
    }

    public function registerForm(Request $request)
    {
        $user = new Account;
        $prefectures = $this->prefectures;
        $adminLevels = $this->adminLevels;

        return view('admin.Register', compact('user', 'prefectures', 'adminLevels'));
    }

    public function register(AccountRequest $request)
    {
        $user = $this->accountService->register($request->all());

        if ($user) {
            session()->flash('registered_message', 'アカウントが正常に登録されました。');
            session()->flash('registered_email', $user->email);
            return redirect()->route('admin.list');
        } else {
            return redirect()->route('admin.list')->with('error', 'ユーザーの登録に失敗しました。');
        }
    }

    public function accountList()
    {
        $users = $this->accountService->accountList();

        foreach ($users as $user) {
            $user->prefecture = config('const.prefecture.' . $user->prefecture);
            $user->admin_level = $user->admin_level == 1 ? '管理者' : ($user->admin_level == 2 ? '社員' : '');
        }

        return view('admin.AccountList', compact('users'));
    }

    public function update(AccountRequest $request, Account $user)
    {
        $this->accountService->update($user, $request->all());

        return redirect()->route('admin.list')->with('success', 'ユーザーが正常に更新されました。');
    }

    public function edit(Account $user)
    {
        $prefectures = $this->prefectures;
        $adminLevels = $this->adminLevels;

        return view('admin.Register', compact('user', 'prefectures', 'adminLevels'));
    }

    public function destroy(Account $user)
    {
        $this->accountService->destroy($user);

        return redirect()->route('admin.list')->with('success', 'ユーザーが正常に削除されました。');
    }
}
