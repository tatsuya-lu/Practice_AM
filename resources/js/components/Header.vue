<template>
    <header>
        <div class="header-content-left">
            <img class="logo" src="/img/testlogo.png" alt="ロゴ画像">
            <nav>
                <ul>
                    <li><a href="/account/list"><button><span class="fa-solid fa-envelopes-bulk"></span>アカウント一覧</button></a></li>
                    <li><a href="/inquiry/list"><button><span class="fa-solid fa-envelopes-bulk"></span>お問い合わせ一覧</button></a></li>
                </ul>
            </nav>
        </div>

        <div class="header-content-right">
            <div class="notification-aria">
                <nav>
                    <button v-on:click="toggleDropdown">
                        <span class="far fa-bell"></span>
                        <span v-if="notifications.total > 0" class="notification-count-badge">{{ notifications.total }}</span>
                    </button>
                    <ul class="notification-list" v-show="showDropdown">
                        <li v-for="item in notifications.data" :key="item.id">
                            <a :href="item.url">
                                <span>{{ item.title }}</span>
                                <span class="notification-date">{{ item.date }}</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
            <ul class="user-control-aria">
                <li class="logged-in-user-text">
                    ログイン中： {{ loggedInUserName }}
                    <img :src="profileImageUrl" alt="プロフィール画像">
                </li>
                <li><a href="/logout"><button class="logout-btn">ログアウト</button></a></li>
            </ul>
        </div>
    </header>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            notifications: {},
            showDropdown: false,
            loggedInUserName: '',
            profileImageUrl: ''
        }
    },
    methods: {
        toggleDropdown() {
            this.showDropdown = !this.showDropdown;
        },
        async fetchNotifications() {
            try {
                const url = '/api/notification/list';
                const response = await axios.get(url);
                this.notifications = response.data;
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        },
        updateNotificationStatus(notificationId) {
            if (this.notifications.data) {
                const notification = this.notifications.data.find(n => n.id === notificationId);
                if (notification && !notification.read) {
                    notification.read = true;
                    this.notifications.total = Math.max(0, this.notifications.total - 1);
                }
            }
        },
        async fetchUserInfo() {
            try {
                const response = await axios.get('/api/user');
                this.loggedInUserName = response.data.name;
                this.profileImageUrl = response.data.profile_image ? `/img/profile/${response.data.profile_image}` : '/img/noimage.png';
            } catch (error) {
                console.error('Error fetching user info:', error);
            }
        }
    },
    async mounted() {
        // axiosのデフォルトヘッダーに保存した認証トークンを設定
        const token = localStorage.getItem('auth_token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        try {
            const [userResponse, notificationsResponse] = await Promise.all([
                axios.get('/api/user'),
                axios.get('/api/notifications')
            ]);
            this.user = userResponse.data;
            this.notifications = notificationsResponse.data;
        } catch (error) {
            console.error('Error fetching data:', error);
        }

        console.log('Header component mounted');
        await this.fetchNotifications();
        await this.fetchUserInfo();

        window.addEventListener('pageshow', async (event) => {
            if (event.persisted || (window.performance && window.performance.navigation.type === 2)) {
                await this.fetchNotifications();
            }
        });

        window.addEventListener('popstate', async () => {
            await this.fetchNotifications();
        });
    }
}
</script>
