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
                        <ul>
                            <template v-for="notification in notifications" :key="notification?.id">
                                <template v-if="notification && notification.id">
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
                                    <a :href="`/notifications/${notification.id}`" class="notification-link"
                                        @click="updateNotificationStatus(notification.id)">
                                        <li class="notification-content">
                                            {{ notification.description }}
                                        </li>
                                    </a>
                                </template>
                            </template>
                        </ul>
                    </template>
                    <p v-else>お知らせはありません。</p>
                    <!-- ページネーションコンポーネントをここに追加 -->
                </div>

                <div class="unresolved-inquiry-list-aria">
                    <p class="sub-title">
                        未対応のお問い合わせが「
                        {{ unresolvedInquiryCount }} 」件あります。
                    </p>
                    <ul>
                        <li v-for="inquiry in unresolvedInquiries" :key="inquiry.id">
                            <div class="notification-title">
                                {{ inquiry.company }} {{ inquiry.email }}
                            </div>
                            <div class="notification-title-date">
                                {{ formatDate(inquiry.created_at) }}
                            </div>
                            <a :href="'/inquiry/' + inquiry.id + '/edit'">
                                <div class="notification-content">
                                    {{ inquiry.body }}
                                </div>
                            </a>
                        </li>
                    </ul>
                    <!-- ページネーションコンポーネントをここに追加 -->
                </div>
            </div>

            <div class="dashboard-content-right">
                <div class="button-aria">
                    <router-link to="/account/register"><button>
                            <span class="fa-solid fa-circle-plus"></span>新規アカウント登録
                        </button></router-link>
                    <router-link to="/account/list"><button>
                            <span class="fa-solid fa-envelopes-bulk"></span>アカウント一覧
                        </button></router-link>
                    <router-link to="/notifications/create"><button>
                            <span class="fa-solid fa-circle-plus"></span>新規お知らせの作成
                        </button></router-link>
                    <router-link to="/inquiry/list"><button>
                            <span class="fa-solid fa-envelopes-bulk"></span>お問い合わせ一覧
                        </button></router-link>
                    <a href="/contact"><button>
                            <span class="fa-solid fa-up-right-from-square"></span>お問い合わせの登録へ
                        </button></a>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { useNotificationStore } from "../store/notification";
import axios from "axios";

export default {
    setup() {
        const notificationStore = useNotificationStore();
        const notifications = computed(() => notificationStore.notifications);
        const notificationReadStatuses = ref({});
        const unresolvedInquiryCount = ref(0);
        const unresolvedInquiries = ref([]);
        const successMessage = ref("");

        // 有効な通知のみをフィルタリングする計算プロパティ
        const validNotifications = computed(() => 
            notifications.value.filter(notification => notification && notification.id)
        );

        const fetchDashboardData = async () => {
            try {
                const [dashboardResponse] = await Promise.all([
                    axios.get("/api/dashboard", {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }),
                    notificationStore.fetchNotifications(),
                ]);

                console.log("Dashboard response:", dashboardResponse.data);
                console.log("Notifications:", notificationStore.notifications);

                unresolvedInquiryCount.value = dashboardResponse.data.unresolvedInquiryCount;
                unresolvedInquiries.value = dashboardResponse.data.unresolvedInquiries;

                notificationReadStatuses.value = (dashboardResponse.data.readNotificationIds || []).reduce((acc, id) => {
                    acc[id] = true;
                    return acc;
                }, {});
                console.log("Notification read statuses:", notificationReadStatuses.value);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
        };

        const fetchNotificationReadStatuses = async () => {
            try {
                const response = await axios.get(
                    "/api/notifications/read-status",
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                if (response.data && Array.isArray(response.data)) {
                    notificationReadStatuses.value = response.data.reduce(
                        (acc, id) => {
                            acc[id] = true;
                            return acc;
                        },
                        {}
                    );
                } else {
                    console.error("Unexpected response format:", response.data);
                }
            } catch (error) {
                console.error("Error fetching read statuses:", error);
                if (error.response) {
                    console.error("Response data:", error.response.data);
                    console.error("Response status:", error.response.status);
                }
            }
        };

        const fetchUnresolvedInquiries = async () => {
            try {
                const response = await axios.get("/api/inquiries", {
                    params: {
                        dashboard: true,
                        limit: 5,
                    },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                unresolvedInquiryCount.value = response.data.unresolvedInquiryCount;
                unresolvedInquiries.value = response.data.inquiries.data;
            } catch (error) {
                console.error("Error fetching unresolved inquiries:", error);
            }
        };

        const updateNotificationStatus = (notificationId) => {
            notificationReadStatuses.value[notificationId] = true;
        };

        const getNotificationStatus = (notificationId) => {
            if (notificationId == null || !notificationReadStatuses.value) return "未読";
            return notificationReadStatuses.value[notificationId] ? "既読済み" : "未読";
        };

        const getNotificationStatusClass = (notificationId) => {
            if (notificationId == null || !notificationReadStatuses.value) return "unread";
            return notificationReadStatuses.value[notificationId] ? "read" : "unread";
        };

        const formatDate = (dateString) => {
            return new Date(dateString).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        };

        onMounted(async () => {
            console.log("Component mounted");
            try {
                await Promise.all([
                    fetchDashboardData(),
                    fetchNotificationReadStatuses(),
                    fetchUnresolvedInquiries(),
                ]);
                console.log("All data fetched successfully");
            } catch (error) {
                console.error("Error initializing dashboard:", error);
            }
        });

        return {
            notifications: validNotifications,  // validNotificationsを使用
            notificationReadStatuses,
            unresolvedInquiryCount,
            unresolvedInquiries,
            successMessage,
            updateNotificationStatus,
            getNotificationStatus,
            getNotificationStatusClass,
            formatDate,
        };
    },
};
</script>

<style scoped>
/* 必要に応じてスタイルを追加 */
</style>