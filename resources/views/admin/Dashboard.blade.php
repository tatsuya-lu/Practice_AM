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

            <div id="notification-app" class="notification-list-aria">
                <p class="sub-title">お知らせ一覧</p>
                <template v-if="notifications && notifications.length > 0">
                    <ul v-for="notification in notifications" :key="notification.id" :data-notification-id="notification.id">
                        <li class="notification-title">@{{ notification.title }}
                            <div class="notification-status" :data-status="getNotificationStatusClass(notification.id)">
                                @{{ getNotificationStatus(notification.id) }}
                            </div>
                        </li>
                        <li class="notification-title-date">
                            @{{ formatDate(notification.created_at) }}
                        </li>
                        <a :href="'{{ route('notification.show', '') }}/' + notification.id" class="notification-link"
                            @click="updateNotificationStatus(notification.id)">
                            <li class="notification-content">@{{ notification.description }}</li>
                        </a>
                    </ul>
                </template>
                <p v-else>お知らせはありません。</p>
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
        const notificationApp = Vue.createApp({
            data() {
                return {
                    notifications: @json($notificationData['notifications']->items()),
                    notificationReadStatuses: @json($notificationData['readNotificationIds'])
                }
            },
            methods: {
                async fetchNotificationReadStatuses() {
                    try {
                        const response = await fetch('{{ route('notification.read-status') }}');
                        const readNotifications = await response.json();
                        this.notificationReadStatuses = readNotifications.reduce((acc, id) => {
                            acc[id] = true;
                            return acc;
                        }, {});
                    } catch (error) {
                        console.error('Error fetching read statuses:', error);
                    }
                },
                updateNotificationStatus(notificationId) {
                    this.$set(this.notificationReadStatuses, notificationId, true);
                },
                getNotificationStatus(notificationId) {
                    return this.notificationReadStatuses[notificationId] ? '既読済み' : '未読';
                },
                getNotificationStatusClass(notificationId) {
                    return this.notificationReadStatuses[notificationId] ? 'read' : 'unread';
                },
                formatDate(dateString) {
                    return new Date(dateString).toLocaleDateString('ja-JP', {
                        month: 'long',
                        day: 'numeric'
                    });
                }
            },
            async mounted() {
                await this.fetchNotificationReadStatuses();

                window.addEventListener('pageshow', async (event) => {
                    if (event.persisted || (window.performance && window.performance.navigation
                            .type === 2)) {
                        await this.fetchNotificationReadStatuses();
                    }
                });

                window.addEventListener('popstate', async () => {
                    await this.fetchNotificationReadStatuses();
                });
            }
        });

        notificationApp.mount('#notification-app');
    </script>
@endsection
