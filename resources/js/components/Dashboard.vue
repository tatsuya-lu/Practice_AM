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
                            <template v-for="notification in dashboardStore.notifications" :key="notification.id">
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
                                <a href="#" class="notification-link"
                                    @click.prevent="openNotificationModal(notification)">
                                    <li class="notification-content">
                                        {{ notification.description }}
                                    </li>
                                </a>
                            </template>
                        </ul>
                        <div v-if="dashboardStore.totalPages > 1" class="pagination">
                            <button @click="changePage(1)" :disabled="dashboardStore.currentPage === 1"
                                class="pagination-button">
                                &laquo;
                            </button>
                            <button @click="changePage(dashboardStore.currentPage - 1)"
                                :disabled="dashboardStore.currentPage === 1" class="pagination-button">
                                &lsaquo;
                            </button>
                            <template
                                v-for="page in displayedPages(dashboardStore.currentPage, dashboardStore.totalPages)"
                                :key="page">
                                <button v-if="page !== '...'" @click="changePage(page)"
                                    :class="['pagination-button', { 'active': page === dashboardStore.currentPage }]">
                                    {{ page }}
                                </button>
                                <span v-else class="pagination-ellipsis">{{ page }}</span>
                            </template>
                            <button @click="changePage(dashboardStore.currentPage + 1)"
                                :disabled="dashboardStore.currentPage === dashboardStore.totalPages"
                                class="pagination-button">
                                &rsaquo;
                            </button>
                            <button @click="changePage(dashboardStore.totalPages)"
                                :disabled="dashboardStore.currentPage === dashboardStore.totalPages"
                                class="pagination-button">
                                &raquo;
                            </button>
                        </div>
                    </template>
                    <p v-else>お知らせはありません。</p>
                </div>

                <div class="unresolved-inquiry-list-aria">
                    <p class="sub-title">
                        未対応のお問い合わせが「{{ dashboardStore.unresolvedInquiryCount }} 」件あります。
                    </p>
                    <ul v-if="dashboardStore.unresolvedInquiries.length > 0">
                        <li v-for="inquiry in dashboardStore.unresolvedInquiries" :key="inquiry.id">
                            <div class="notification-title">
                                {{ inquiry.company }} {{ inquiry.email }}
                            </div>
                            <div class="notification-title-date">
                                {{ formatDate(inquiry.created_at) }}
                            </div>
                            <router-link :to="{ name: 'inquiry.edit', params: { id: inquiry.id } }" custom
                                v-slot="{ navigate }">
                                <a @click="navigate" @keypress.enter="navigate" role="link">
                                    <div class="notification-content">
                                        {{ inquiry.body }}
                                    </div>
                                </a>
                            </router-link>
                        </li>
                    </ul>
                    <p v-else>未対応のお問い合わせはありません。</p>
                    <div v-if="dashboardStore.inquiryTotalPages > 1" class="pagination">
                        <button @click="changeInquiryPage(1)" :disabled="dashboardStore.inquiryCurrentPage === 1"
                            class="pagination-button">
                            &laquo;
                        </button>
                        <button @click="changeInquiryPage(dashboardStore.inquiryCurrentPage - 1)"
                            :disabled="dashboardStore.inquiryCurrentPage === 1" class="pagination-button">
                            &lsaquo;
                        </button>
                        <template
                            v-for="page in displayedPages(dashboardStore.inquiryCurrentPage, dashboardStore.inquiryTotalPages)"
                            :key="page">
                            <button v-if="page !== '...'" @click="changeInquiryPage(page)"
                                :class="['pagination-button', { 'active': page === dashboardStore.inquiryCurrentPage }]">
                                {{ page }}
                            </button>
                            <span v-else class="pagination-ellipsis">{{ page }}</span>
                        </template>
                        <button @click="changeInquiryPage(dashboardStore.inquiryCurrentPage + 1)"
                            :disabled="dashboardStore.inquiryCurrentPage === dashboardStore.inquiryTotalPages"
                            class="pagination-button">
                            &rsaquo;
                        </button>
                        <button @click="changeInquiryPage(dashboardStore.inquiryTotalPages)"
                            :disabled="dashboardStore.inquiryCurrentPage === dashboardStore.inquiryTotalPages"
                            class="pagination-button">
                            &raquo;
                        </button>
                    </div>
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
                    <a href="/contact" @click.prevent="goToContactForm"><button>
                            <span class="fa-solid fa-up-right-from-square"></span>お問い合わせの登録へ
                        </button></a>
                </div>
            </div>
        </div>
        <NotificationModal :show="showNotificationModal" :notification="selectedNotification"
            @close="closeNotificationModal" />
    </div>
</template>

<script>
import { ref, onMounted, watch, } from "vue";
import { useRoute } from 'vue-router';
import { useDashboardStore } from "../store/dashboard";
import { useInquiryStore } from "../store/inquiry";
import { useNotificationStore } from "../store/notification";
import { useContactStore } from "../store/contact/contact";
import NotificationModal from "./NotificationModal.vue";

export default {
    components: {
        NotificationModal,
    },
    setup() {
        const dashboardStore = useDashboardStore();
        const inquiryStore = useInquiryStore();
        const notificationStore = useNotificationStore();
        const contactStore = useContactStore();
        const successMessage = ref("");
        const route = useRoute();

        const showNotificationModal = ref(false);
        const selectedNotification = ref(null);

        const prevPage = () => {
            dashboardStore.prevPage();
        };

        const nextPage = () => {
            dashboardStore.nextPage();
        };

        const changePage = async (page) => {
            if (page >= 1 && page <= dashboardStore.totalPages) {
                await dashboardStore.changePage(page);
            }
        };

        const displayedPages = (currentPage, totalPages) => {
            const delta = 2;
            let range = [];
            for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
                range.push(i);
            }
            if (currentPage - delta > 2) range.unshift("...");
            if (currentPage + delta < totalPages - 1) range.push("...");
            range.unshift(1);
            if (totalPages > 1) range.push(totalPages);
            return range;
        };

        const changeInquiryPage = async (page) => {
            await dashboardStore.changeInquiryPage(page);
        };

        const getNotificationStatus = (notificationId) => {
            return dashboardStore.notificationReadStatuses[notificationId] || notificationStore.globalReadStatus[notificationId] ? "既読済み" : "未読";
        };

        const getNotificationStatusClass = (notificationId) => {
            return dashboardStore.notificationReadStatuses[notificationId] || notificationStore.globalReadStatus[notificationId] ? "read" : "unread";
        };

        const updateNotificationStatus = async (notificationId) => {
            await dashboardStore.updateNotificationStatus(notificationId);
        };

        const openNotificationModal = (notification) => {
            selectedNotification.value = notification;
            showNotificationModal.value = true;
            updateNotificationStatus(notification.id);
        };

        const closeNotificationModal = () => {
            showNotificationModal.value = false;
        };

        const formatDate = (dateString) => {
            if (!dateString) return "";
            return new Date(dateString).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        };

        const goToContactForm = async () => {
            await contactStore.prefetchFormData();
            window.location.href = '/contact';
        };

        onMounted(async () => {
            console.log("Component mounted");
            try {
                await Promise.all([
                    dashboardStore.fetchDashboardData(),
                    dashboardStore.fetchNotificationReadStatuses(),
                    inquiryStore.fetchInquiries(),
                ]);
                console.log("All data fetched successfully");
            } catch (error) {
                console.error("Error initializing dashboard:", error);
            }
        });

        const fetchData = async () => {
            if (!dashboardStore.isLoaded) {
                await dashboardStore.fetchDashboardData(true);
            } else {
                await dashboardStore.fetchUnresolvedInquiries();
            }
        };

        onMounted(fetchData);

        watch(() => route.fullPath, fetchData);

        return {
            dashboardStore,
            successMessage,
            getNotificationStatus,
            getNotificationStatusClass,
            formatDate,
            prevPage,
            nextPage,
            changePage,
            displayedPages,
            changeInquiryPage,
            notificationStore,
            updateNotificationStatus,
            showNotificationModal,
            selectedNotification,
            openNotificationModal,
            closeNotificationModal,
            goToContactForm,
        };
    },
};
</script>