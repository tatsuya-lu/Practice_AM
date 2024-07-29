<template>
    <div>
        <p class="page-title">HOME</p>

        <div v-if="successMessage" class="success">
            {{ successMessage }}
        </div>

        <div class="main-content-aria dashboard">
            <div class="dashboard-content-left">
                <div class="notification-list-aria">
                    <p class="sub-title">お知らせ一覧</p>
                    <template v-if="notifications && notifications.length > 0">
                        <ul v-for="notification in notifications" :key="notification.id"
                            :data-notification-id="notification.id">
                            <li class="notification-title">
                                {{ notification.title }}
                                <div class="notification-status"
                                    :data-status="getNotificationStatusClass(notification.id)">
                                    {{ getNotificationStatus(notification.id) }}
                                </div>
                            </li>
                            <li class="notification-title-date">
                                {{ formatDate(notification.created_at) }}
                            </li>
                            <a :href="'/notifications/' + notification.id" class="notification-link"
                                @click="updateNotificationStatus(notification.id)">
                                <li class="notification-content">{{ notification.description }}</li>
                            </a>
                        </ul>
                    </template>
                    <p v-else>お知らせはありません。</p>
                    <!-- ページネーションコンポーネントをここに追加 -->
                </div>

                <div class="unresolved-inquiry-list-aria">
                    <p class="sub-title">未対応のお問い合わせが「 {{ unresolvedInquiryCount }} 」件あります。</p>
                    <ul>
                        <li v-for="inquiry in unresolvedInquiries" :key="inquiry.id">
                            <div class="notification-title">{{ inquiry.company }} {{ inquiry.email }}</div>
                            <div class="notification-title-date">
                                {{ formatDate(inquiry.created_at) }}
                            </div>
                            <a :href="'/inquiry/' + inquiry.id + '/edit'">
                                <div class="notification-content">{{ inquiry.body }}</div>
                            </a>
                        </li>
                    </ul>
                    <!-- ページネーションコンポーネントをここに追加 -->
                </div>
            </div>

            <div class="dashboard-content-right">
                <div class="button-aria">
                    <router-link to="/account/register"><button><span
                                class="fa-solid fa-circle-plus"></span>新規アカウント登録</button></router-link>
                    <router-link to="/account/list"><button><span
                                class="fa-solid fa-envelopes-bulk"></span>アカウント一覧</button></router-link>
                    <router-link to="/notification/create"><button><span
                                class="fa-solid fa-circle-plus"></span>新規お知らせの作成</button></router-link>
                    <router-link to="/inquiry/list"><button><span
                                class="fa-solid fa-envelopes-bulk"></span>お問い合わせ一覧</button></router-link>
                    <a href="/contact"><button><span
                                class="fa-solid fa-up-right-from-square"></span>お問い合わせの登録へ</button></a>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';

export default {
    setup() {
        const notifications = ref([]);
        const notificationReadStatuses = ref({});
        const unresolvedInquiryCount = ref(0);
        const unresolvedInquiries = ref([]);
        const successMessage = ref('');

        const fetchDashboardData = async () => {
            try {
                const [dashboardResponse, notificationsResponse] = await Promise.all([
                    axios.get('/api/dashboard', {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    }),
                    axios.get('/api/dashboard/notifications', {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    })
                ]);

                unresolvedInquiryCount.value = dashboardResponse.data.unresolvedInquiryCount;
                unresolvedInquiries.value = dashboardResponse.data.unresolvedInquiries;

                notifications.value = notificationsResponse.data.notifications.data;
                notificationReadStatuses.value = notificationsResponse.data.readNotificationIds.reduce((acc, id) => {
                    acc[id] = true;
                    return acc;
                }, {});
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        const fetchNotificationReadStatuses = async () => {
            try {
                const response = await axios.get('/api/notifications/read-status', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                notificationReadStatuses.value = response.data.reduce((acc, id) => {
                    acc[id] = true;
                    return acc;
                }, {});
            } catch (error) {
                console.error('Error fetching read statuses:', error);
            }
        };

        const fetchUnresolvedInquiries = async () => {
            try {
                const response = await axios.get('/api/inquiries', {
                    params: {
                        dashboard: true,
                        limit: 5
                    },
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                unresolvedInquiryCount.value = response.data.unresolvedInquiryCount;
                unresolvedInquiries.value = response.data.inquiries.data;
            } catch (error) {
                console.error('Error fetching unresolved inquiries:', error);
            }
        };

        const updateNotificationStatus = (notificationId) => {
            notificationReadStatuses.value[notificationId] = true;
        };

        const getNotificationStatus = (notificationId) => {
            return notificationReadStatuses.value[notificationId] ? '既読済み' : '未読';
        };

        const getNotificationStatusClass = (notificationId) => {
            return notificationReadStatuses.value[notificationId] ? 'read' : 'unread';
        };

        const formatDate = (dateString) => {
            return new Date(dateString).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        };

        onMounted(async () => {
            await fetchDashboardData();
            await fetchNotificationReadStatuses();
            await fetchUnresolvedInquiries();
        });

        return {
            notifications,
            notificationReadStatuses,
            unresolvedInquiryCount,
            unresolvedInquiries,
            successMessage,
            updateNotificationStatus,
            getNotificationStatus,
            getNotificationStatusClass,
            formatDate
        };
    }
}
</script>

<style scoped>
/* 必要に応じてスタイルを追加 */
</style>