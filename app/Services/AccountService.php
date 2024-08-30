<?php

namespace App\Services;

use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use App\Models\Account;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;

class AccountService
{
    private $imageManager;

    public function __construct(private Request $request)
    {
        $this->imageManager = new ImageManager(new GdDriver());
    }

    public function accountList($params, $perPage = 20)
    {
        $query = Account::query();

        if (isset($params['search_name'])) {
            $query->where('name', 'like', '%' . $params['search_name'] . '%');
        }

        if (isset($params['search_admin_level'])) {
            $query->where('admin_level', $params['search_admin_level']);
        }

        if (isset($params['search_email'])) {
            $query->where('email', 'like', '%' . $params['search_email'] . '%');
        }

        if (isset($params['sort'])) {
            $query->orderBy('created_at', $params['sort'] === 'newest' ? 'desc' : 'asc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        return $query->paginate($perPage);
    }


    public function register(array $data)
    {
        $user = Account::create([
            'name' => $data['name'],
            'sub_name' => $data['sub_name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'tel' => $data['tel'],
            'post_code' => $data['post_code'],
            'prefecture' => $data['prefecture'],
            'city' => $data['city'],
            'street' => $data['street'],
            'comment' => $data['comment'] ?? '',
            'admin_level' => intval($data['admin_level']),
        ]);

        if (isset($data['profile_image'])) {
            $this->processProfileImage($data['profile_image'], $user);
        }

        return $user;
    }

    public function update(Account $user, array $data)
    {
        $user->name = $data['name'];
        $user->sub_name = $data['sub_name'];
        $user->email = $data['email'];
        $user->tel = $data['tel'];
        $user->prefecture = $data['prefecture'];
        $user->post_code = $data['post_code'];
        $user->city = $data['city'];
        $user->street = $data['street'];
        $user->comment = $data['comment'] ?? '';
        $user->admin_level = intval($data['admin_level']);

        if (isset($data['password']) && !empty($data['password'])) {
            $user->password = bcrypt($data['password']);
        }

        if (isset($data['profile_image']) && $data['profile_image'] instanceof \Illuminate\Http\UploadedFile) {
            $this->processProfileImage($data['profile_image'], $user);
        }

        $user->save();

        return $user;
    }

    public function destroy(Account $user)
    {
        if ($user->profile_image && file_exists(public_path('/img/profile/' . $user->profile_image))) {
            unlink(public_path('/img/profile/' . $user->profile_image));
        }
        $user->delete();
    }

    private function processProfileImage($image, Account $user)
    {
        $filename = time() . '.' . $image->getClientOriginalExtension();
        $path = public_path('/img/profile/' . $filename);

        $img = $this->imageManager->read($image->getRealPath());
        $img->cover(200, 200);
        $img->save($path);

        if ($user->profile_image && file_exists(public_path('/img/profile/' . $user->profile_image))) {
            unlink(public_path('/img/profile/' . $user->profile_image));
        }

        $user->profile_image = $filename;
    }
}
