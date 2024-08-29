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

    protected $inquiryService;

    public function __construct(InquiryService $inquiryService)
    {
        $this->inquiryService = $inquiryService;
    }

    public function apiIndex(Request $request)
    {
        $inquiries = $this->inquiryService->index($request);
        $statusOptions = Config::get('const.status');

        foreach ($inquiries as $inquiry) {
            $inquiry->statusText = $statusOptions[$inquiry->status] ?? $inquiry->status;
        }

        $unresolvedInquiryCount = $this->inquiryService->unresolvedInquiryCount();
        $unresolvedInquiries = $this->inquiryService->unresolvedInquiries();

        return response()->json([
            'inquiries' => $inquiries,
            'unresolvedInquiryCount' => $unresolvedInquiryCount,
            'unresolvedInquiries' => $unresolvedInquiries,
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

    public function index()
    {
        $inquiries = $this->inquiryService->index();

        foreach ($inquiries as $inquiry) {
            $inquiry->status = config('const.status')[$inquiry->status] ?? $inquiry->status;
        }

        return view('admin.InquiryList', compact('inquiries'));
    }

    public function edit(Post $inquiry)
    {
        $statusOptions = Config::get('const.status');
        $inquiryStatus = $statusOptions[$inquiry->status] ?? $inquiry->status;
        $inquiry->gender = config('const.gender.' . $inquiry->gender);
        $inquiry->profession = config('const.profession.' . $inquiry->profession);

        return view('admin.InquiryEdit', compact('inquiry', 'statusOptions', 'inquiryStatus'));
    }


    public function update(InquiryRequest $request, Post $inquiry)
    {
        $inquiry->update($request->only(['status', 'comment']));

        return redirect()->route('inquiry.list')->with('success', 'お問い合わせ情報が更新されました。');
    }
}
