<?php

namespace App\Http\Controllers\Contact;

use App\Http\Controllers\Controller;
use App\Http\Requests\Contact\ContactRequest;
use App\Services\ContactService;

class ContactsController extends Controller
{
    protected $genders;
    protected $professions;
    protected $contactService;

    public function __construct(ContactService $contactService)
    {
        $this->genders = config('const.gender');
        $this->professions = config('const.profession');
        $this->contactService = $contactService;
    }

    public function getFormData()
    {
        return response()->json([
            'genders' => $this->genders,
            'professions' => $this->professions
        ]);
    }

    public function confirm(ContactRequest $request)
    {
        $validatedData = $request->validated();

        return response()->json([
            'message' => 'Validation successful',
            'data' => $validatedData
        ]);
    }

    public function send(ContactRequest $request)
    {
        try {
            $inputs = $request->validated();
            $post = $this->contactService->store($inputs);

            return response()->json([
                'message' => 'Form submitted successfully',
                'post' => $post
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error submitting form',
                'errors' => $e->getMessage()
            ], 422);
        }
    }
}
