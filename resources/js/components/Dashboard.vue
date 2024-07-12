<template>
    <p class="page-title">HOME</p>

    <div v-if="successMessage" class="success">
        {{ successMessage }}
    </div>

    <div class="main-content-aria dashboard">
        <div class="dashboard-content-left">
            <div class="notification-list-aria">
                <p class="sub-title">お知らせ一覧</p>
                <template v-if="notifications && notifications.length > 0">
                    <ul v-for="notification in notifications" :key="notification.id" :data-notification-id="notification.id">
                        <li class="notification-title">{{ notification.title }}
                            <div class="notification-status" :data-status="getNotificationStatusClass(notification.id)">
                                {{ getNotificationStatus(notification.id) }}
                            </div>
                        </li>
                        <li class="notification-title-date">
                            {{ formatDate(notification.created_at) }}
                        </li>
                        <a :href="'/notification/' + notification.id" class="notification-link" @click.prevent="updateNotificationStatus(notification.id)">
                            <li class="notification-content">{{ notification.description }}</li>
                        </a>
                    </ul>
                </template>
                <p v-else>お知らせはありません。</p>
                <!-- ページネーションコンポーネントを追加する必要があります -->
            </div>

            <div class="unresolved-inquiry-list-aria">
                <p class="sub-title">未対応のお問い合わせが「 {{ unresolvedInquiryCount }} 」件あります。</p>
                <ul>
                    <li v-for="inquiry in unresolvedInquiries" :key="inquiry.id">
                        <div class="notification-title">{{ inquiry.company }} {{ inquiry.email }}</div>
                        <div class="notification-title-date">
                            {{ formatDate(inquiry.created_at) }}
                        </div>
                        <a :href="'/inquiry/' + inquiry.id">
                            <div class="notification-content">{{ inquiry.body }}</div>
                        </a>
                    </li>
                </ul>
                <!-- ページネーションコンポーネントを追加する必要があります -->
            </div>
        </div>

        <div class="dashboard-content-right">
            <div class="button-aria">
                <a href="/account/register"><button><span class="fa-solid fa-circle-plus"></span>新規アカウント登録</button></a>
                <a href="/account/list"><button><span class="fa-solid fa-envelopes-bulk"></span>アカウント一覧</button></a>
                <a href="/notification/create"><button><span class="fa-solid fa-circle-plus"></span>新規お知らせ登録</button></a>
                <a href="/inquiry/list"><button><span class="fa-solid fa-circle-exclamation"></span>お問い合わせ一覧</button></a>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            successMessage: '',
            notifications: [],
            unresolvedInquiries: [],
            unresolvedInquiryCount: 0
        };
    },
    methods: {
        async fetchData() {
            try {
                const token = localStorage.getItem('auth_token');
                if (token) {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                }
                const [notificationsResponse, inquiriesResponse] = await Promise.all([
                    axios.get('/api/notification/list'),
                    axios.get('/api/inquiries/unresolved')
                ]);

                this.notifications = notificationsResponse.data.data;
                this.unresolvedInquiries = inquiriesResponse.data.data;
                this.unresolvedInquiryCount = inquiriesResponse.data.total;
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        },
        formatDate(date) {
            const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
            return new Date(date).toLocaleDateString('ja-JP', options);
        },
        getNotificationStatus(notificationId) {
            const notification = this.notifications.find(n => n.id === notificationId);
            return notification && notification.read ? '既読' : '未読';
        },
        getNotificationStatusClass(notificationId) {
            const notification = this.notifications.find(n => n.id === notificationId);
            return notification && notification.read ? 'read' : 'unread';
        },
        async updateNotificationStatus(notificationId) {
            const markUrl = `/api/notification/show/${notificationId}`;
            try {
                await axios.post(markUrl);
                this.notifications = this.notifications.map(notification => {
                    if (notification.id === notificationId) {
                        notification.read = true;
                    }
                    return notification;
                });
            } catch (error) {
                console.error('Error marking notification as read:', error);
            }
        }
    },
    async mounted() {
        await this.fetchData();
    }
};
</script>
