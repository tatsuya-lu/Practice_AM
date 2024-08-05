<template>
    <div>
        <p class="page-title">HOME</p>

        <div v-if="successMessage" class="success">
            {{ successMessage }}
        </div>

        <div v-if="!dashboardStore.isLoaded" class="loading">
            データを読み込んでいます...
        </div>
        <div v-else class="main-content-aria dashboard">
            <div class="dashboard-content-left">
                <div class="notification-list-aria">
                    <p class="sub-title">お知らせ一覧</p>
                    <template v-if="dashboardStore.validNotifications.length > 0">
                        <ul>
                            <template v-for="notification in dashboardStore.validNotifications" :key="notification.id">
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
                        </ul>
                    </template>
                    <p v-else>お知らせはありません。</p>
                </div>

                <div class="unresolved-inquiry-list-aria">
                    <p class="sub-title">
                        未対応のお問い合わせが「
                        {{ dashboardStore.unresolvedInquiryCount }} 」件あります。
                    </p>
                    <ul v-if="dashboardStore.unresolvedInquiries.length > 0">
                        <li v-for="inquiry in dashboardStore.unresolvedInquiries" :key="inquiry.id">
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
                    <p v-else>未対応のお問い合わせはありません。</p>
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
import { ref, onMounted } from "vue";
import { useDashboardStore } from "../store/dashboard";

export default {
    setup() {
        const dashboardStore = useDashboardStore();
        const successMessage = ref("");

        const getNotificationStatus = (notificationId) => {
            return dashboardStore.notificationReadStatuses[notificationId] ? "既読済み" : "未読";
        };

        const getNotificationStatusClass = (notificationId) => {
            return dashboardStore.notificationReadStatuses[notificationId] ? "read" : "unread";
        };

        const formatDate = (dateString) => {
            if (!dateString) return "";
            return new Date(dateString).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        };

        const updateNotificationStatus = (notificationId) => {
            dashboardStore.updateNotificationStatus(notificationId);
        };

        onMounted(async () => {
            console.log("Component mounted");
            try {
                await Promise.all([
                    dashboardStore.fetchDashboardData(),
                    dashboardStore.fetchNotificationReadStatuses(),
                ]);
                console.log("All data fetched successfully");
            } catch (error) {
                console.error("Error initializing dashboard:", error);
            }
        });

        return {
            dashboardStore,
            successMessage,
            getNotificationStatus,
            getNotificationStatusClass,
            formatDate,
            updateNotificationStatus,
        };
    },
};
</script>