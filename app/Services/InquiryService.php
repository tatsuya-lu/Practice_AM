<?php

namespace App\Services;

use App\Models\Post;
use Illuminate\Http\Request;

class InquiryService
{

    public function __construct(private Request $request) {}

    public function index(Request $request)
    {
        $sort = $request->input('sort', 'newest');
        $limit = $request->input('limit', 20);
        $isDashboard = $request->input('dashboard', false);

        $query = Post::query();

        if ($isDashboard) {
            $query->where('status', 'default');
        } elseif ($searchStatus = $request->input('search_status')) {
            $statusValue = null;

            switch ($searchStatus) {
                case '未対応':
                    $statusValue = 'default';
                    break;
                case '対応中':
                    $statusValue = 'checking';
                    break;
                case '対応済み':
                    $statusValue = 'checked';
                    break;
                case 'default':
                case 'checking':
                case 'checked':
                    $statusValue = $searchStatus;
                    break;
            }

            if ($statusValue !== null) {
                $query->where('status', $statusValue);
            }
        }

        if ($searchCompany = $request->input('search_company')) {
            $query->where('company', 'LIKE', "%{$searchCompany}%");
        }

        if ($searchTel = $request->input('search_tel')) {
            $query->where('tel', 'LIKE', "%{$searchTel}%");
        }

        switch ($sort) {
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        $inquiries = $query->paginate($limit);
        return $inquiries;
    }

    public function unresolvedInquiryCount()
    {
        return Post::where('status', 'default')->count();
    }

    public function unresolvedInquiries(Request $request)
    {
        $limit = $request->input('limit', 10);
        $sort = $request->input('sort', 'newest');

        $query = Post::where('status', 'default');

        switch ($sort) {
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        return $query->paginate($limit);
    }
}
