<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>@yield('title')</title>

    <script src="https://code.jquery.com/jquery-3.7.1.js" integrity="sha256-eKhayi8LEQwp4NKxN+CfCh+3qOVUtJn3QNZ0TciWLP4="
        crossorigin="anonymous"></script>
    <script src="https://kit.fontawesome.com/d8cd936af6.js" crossorigin="anonymous"></script>
    <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
    <script src="https://unpkg.com/vue@3.0.0-beta.5/dist/vue.global.prod.js"></script>

    <!-- reset.css ress -->
    <link rel="stylesheet" href="https://unpkg.com/ress/dist/ress.min.css" />
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
</head>

<body>
    <header>
        <div class="header-content-left">
            <img class="logo" src="{{ asset('img/testlogo.png') }}" alt="ロゴ画像">
            <nav>
                <ul>


                    <li><a href="{{ route('dashboard') }}"><button><span
                                    class="fa-solid fa-house"></span>HOME</button></a></li>


                    <li><a href="{{ route('account.list') }}"><button><span
                                    class="fa-solid fa-envelopes-bulk"></span>アカウント一覧</button></a></li>


                    <li><a href="{{ route('inquiry.list') }}"><button><span
                                    class="fa-solid fa-envelopes-bulk"></span>お問い合わせ一覧</button></a></li>
                </ul>
            </nav>
        </div>

        <div class="header-content-right">
            <div class="notification-aria" id="app">
                <nav>
                    <button v-on:click="toggleDropdown">
                        <span class="far fa-bell"></span>
                        <span v-if="notifications.total > 0"
                            class="notification-count-badge">@{{ notifications.total }}</span>
                    </button>
                    <!-- お知らせメニュー -->
                    <ul class="notification-list" v-show="showDropdown">
                        <li v-for="item in notifications.data" :key="item.id">
                            <a :href="item.url">
                                <span>@{{ item.title }}</span>
                                <span class="notification-date">@{{ item.date }}</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
            <ul class="user-control-aria">
                <li class="logged-in-user-text">
                    ログイン中： {{ Auth::guard('admin')->user()->name }}
                    <img src="{{ Auth::guard('admin')->user()->profile_image ? asset('img/profile/' . Auth::guard('admin')->user()->profile_image) : asset('img/noimage.png') }}"
                        alt="プロフィール画像">
                </li>
                <li><a href="{{ route('logout') }}"><button class="logout-btn">ログアウト</button></a></li>
            </ul>
        </div>
    </header>
    <main>
        @yield('content')
    </main>



    <script>
        const app = Vue.createApp({
            data() {
                return {
                    notifications: {},
                    showDropdown: false
                }
            },
            methods: {
                toggleDropdown() {
                    this.showDropdown = !this.showDropdown;
                },
                fetchNotifications() {
                    const url = '{{ route('notification.list') }}';
                    axios.get(url)
                        .then(response => {
                            this.notifications = response.data;
                        })
                        .catch(error => {
                            console.error('Error fetching notifications:', error);
                        });
                },
                updateNotificationStatus(notificationId) {
                    if (this.notifications.data) {
                        const notification = this.notifications.data.find(n => n.id === notificationId);
                        if (notification && !notification.read) {
                            notification.read = true;
                            this.notifications.total = Math.max(0, this.notifications.total - 1);
                        }
                    }
                }
            },
            mounted() {
                this.fetchNotifications();

                // ブラウザの「戻る」ボタンでページに戻ってきた時の処理
                window.addEventListener('pageshow', (event) => {
                    if (event.persisted || (window.performance && window.performance.navigation.type ===
                        2)) {
                        this.fetchNotifications();
                    }
                });

                // 履歴の状態変更時の処理
                window.addEventListener('popstate', (event) => {
                    this.fetchNotifications();
                });
            }
        });

        window.app = app.mount('#app');
    </script>
</body>

</html>
