<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Config;
use Illuminate\Http\Request;
use App\Http\Requests\Account\InquiryRequest;
use App\Models\Post;
use App\Services\InquiryService;

class InquiryController extends Controller
{
    protected $genders;
    protected $professions;
    protected $inquiryService;

    public function __construct(InquiryService $inquiryService)
    {
        $this->genders = config('const.gender');
        $this->professions = config('const.profession');
        $this->inquiryService = $inquiryService;
    }

    public function apiIndex(Request $request)
    {
        $inquiries = $this->inquiryService->index($request);
        $statusOptions = Config::get('const.status');

        foreach ($inquiries as $inquiry) {
            $inquiry->statusText = $statusOptions[$inquiry->status] ?? $inquiry->status;
        }

        return response()->json([
            'inquiries' => $inquiries,
            'statusOptions' => $statusOptions
        ]);
    }

    public function apiDashboardInquiries(Request $request)
    {
        $unresolvedInquiries = $this->inquiryService->unresolvedInquiries($request);
        $unresolvedInquiryCount = $this->inquiryService->unresolvedInquiryCount();
        $statusOptions = Config::get('const.status');

        foreach ($unresolvedInquiries as $inquiry) {
            $inquiry->statusText = $statusOptions[$inquiry->status] ?? $inquiry->status;
        }

        return response()->json([
            'unresolvedInquiries' => $unresolvedInquiries,
            'unresolvedInquiryCount' => $unresolvedInquiryCount,
            'statusOptions' => $statusOptions
        ]);
    }

    public function apiShow(Post $inquiry)
    {
        $statusOptions = Config::get('const.status');
        $inquiry->statusText = $statusOptions[$inquiry->status] ?? $inquiry->status;
        $inquiry->gender = config('const.gender.' . $inquiry->gender);
        $inquiry->profession = config('const.profession.' . $inquiry->profession);

        return response()->json([
            'inquiry' => $inquiry,
            'statusOptions' => $statusOptions
        ]);
    }

    public function apiUpdate(InquiryRequest $request, Post $inquiry)
    {
        $inquiry->update($request->only(['status', 'comment']));

        return response()->json(['message' => 'お問い合わせ情報が更新されました。']);
    }

    public function apiFormData()
    {
        return response()->json([
            'genders' => $this->genders,
            'professions' => $this->professions
        ]);
    }
}
