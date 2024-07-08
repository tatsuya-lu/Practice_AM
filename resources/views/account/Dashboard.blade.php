@extends('layouts.app')

@section('title')
    ダッシュボード
@endsection

@section('content')
    <p class="page-title">HOME</p>

    @if (session('success'))
        <div class="success">
            {{ session('success') }}
        </div>
    @endif

    <div class="main-content-aria dashboard">
        <div class="dashboard-content-left">

            <div class="notification-list-aria">
                <p class="sub-title">お知らせ一覧</p>
                @foreach ($notificationData['notifications'] as $notification)
                    <ul data-notification-id="{{ $notification->id }}">
                        <li class="notification-title">{{ $notification->title }}
                            <div class="notification-status"
                                data-status="{{ in_array($notification->id, $notificationData['readNotificationIds']) ? 'read' : 'unread' }}">
                                {{ in_array($notification->id, $notificationData['readNotificationIds']) ? '既読済み' : '未読' }}
                            </div>
                        </li>
                        <li class="notification-title-date">
                            {{ \Carbon\Carbon::parse($notification->created_at)->format('m月d日') }}
                        </li>
                        <a href="{{ route('notification.show', ['notification' => $notification->id]) }}"
                            class="notification-link">
                            <li class="notification-content">{{ $notification->description }}</li>
                        </a>
                    </ul>
                @endforeach
                <div class="pagenation">
                    {{ $notificationData['notifications']->appends(Request::except('notifications'))->links('') }}
                </div>
            </div>

            <div class="unresolved-inquiry-list-aria">
                <p class="sub-title">未対応のお問い合わせが「 {{ $unresolvedInquiryCount }} 」件あります。</p>
                <ul>
                    @foreach ($unresolvedInquiries as $inquiry)
                        <li class="notification-title">{{ $inquiry->company }} {{ $inquiry->email }} </li>
                        <li class="notification-title-date">
                            {{ \Carbon\Carbon::parse($inquiry->created_at)->format('m月d日') }}</li>
                        <a href="{{ route('inquiry.edit', $inquiry->id) }}">
                            <li class="notification-content">{{ $inquiry->body }}</li>
                        </a>
                    @endforeach
                </ul>
                <div class="pagenation">
                    {{ $unresolvedInquiries->appends(Request::except('page'))->links() }}</div>
            </div>
        </div>

        <div class="dashboard-content-right">
            <div class="button-aria">
                <a href="{{ route('account.register.form') }}"><button><span
                            class="fa-solid fa-circle-plus"></span>新規アカウント登録</button></a>
                <a href="{{ route('account.list') }}"><button><span
                            class="fa-solid fa-envelopes-bulk"></span>アカウント一覧</button></a>
                <a href="{{ route('notification.create') }}"><button><span
                            class="fa-solid fa-circle-plus"></span>新規お知らせの作成</button></a>
                <a href="{{ route('inquiry.list') }}"><button><span
                            class="fa-solid fa-envelopes-bulk"></span>お問い合わせ一覧</button></a>
                <a href="{{ route('contact.index') }}"><button><span
                            class="fa-solid fa-up-right-from-square"></span>お問い合わせの登録へ</button></a>
            </div>

        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            function updateNotificationStatuses() {
                fetch('{{ route('notification.read-status') }}')
                    .then(response => response.json())
                    .then(readNotifications => {
                        document.querySelectorAll('[data-notification-id]').forEach(el => {
                            const notificationId = parseInt(el.dataset.notificationId);
                            const statusElement = el.querySelector('.notification-status');
                            if (readNotifications.includes(notificationId)) {
                                statusElement.textContent = '既読済み';
                                statusElement.dataset.status = 'read';
                            } else {
                                statusElement.textContent = '未読';
                                statusElement.dataset.status = 'unread';
                            }
                        });
                    })
                    .catch(error => console.error('Error fetching read statuses:', error));
            }

            // ページロード時に既読状態を更新
            updateNotificationStatuses();

            // ブラウザの「戻る」ボタンでページに戻ってきた時の処理
            window.addEventListener('pageshow', function(event) {
                if (event.persisted || (window.performance && window.performance.navigation.type === 2)) {
                    updateNotificationStatuses();
                }
            });

            // 履歴の状態変更時の処理
            window.addEventListener('popstate', function(event) {
                updateNotificationStatuses();
            });

            window.addEventListener('appNotificationRead', function(event) {
                const notificationId = event.detail.notificationId;
                const notificationElement = document.querySelector(
                    `ul[data-notification-id="${notificationId}"]`);
                if (notificationElement) {
                    const statusElement = notificationElement.querySelector('.notification-status');
                    statusElement.textContent = '既読済み';
                    statusElement.dataset.status = 'read';
                }
            });
        });
    </script>
@endsection
