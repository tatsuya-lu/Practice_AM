import { defineStore } from "pinia";
import axios from "axios";

export const useDashboardStore = defineStore("dashboard", {
    state: () => ({
        notifications: [],
        notificationReadStatuses: {},
        unresolvedInquiryCount: 0,
        unresolvedInquiries: [],
        isNotificationsLoaded: false,
        isInquiriesLoaded: false,
        isReadStatusesLoaded: false,
        lastFetchTime: null,
        currentPage: 1,
        perPage: 10,
        totalNotifications: 0,
        lastPage: 1,
        inquiryCurrentPage: 1,
        inquiryPerPage: 10,
        inquiryTotalPages: 1,
    }),

    getters: {
        isLoaded: (state) =>
            state.isNotificationsLoaded &&
            state.isInquiriesLoaded &&
            state.isReadStatusesLoaded,

        validNotifications: (state) =>
            state.notifications.filter(
                (notification) => notification && notification.id
            ),
        paginatedNotifications: (state) => {
            const start = (state.currentPage - 1) * state.perPage;
            const end = start + state.perPage;
            return state.validNotifications.slice(start, end);
        },
        totalPages() {
            return this.lastPage;
        },
    },

    actions: {
        async addNewNotification(notification) {
            this.notifications.unshift(notification);
            this.notificationReadStatuses[notification.id] = false;
        },

        async fetchDashboardData(force = false) {
            const now = Date.now();
            const timeSinceLastFetch = now - (this.lastFetchTime || 0);

            if (
                !force &&
                this.isLoaded &&
                timeSinceLastFetch < 15 * 60 * 1000
            ) {
                return;
            }

            try {
                const [
                    dashboardResponse,
                    notificationsResponse,
                    inquiriesResponse,
                    readStatusesResponse,
                ] = await Promise.all([
                    axios.get("/api/dashboard", {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "token"
                            )}`,
                        },
                    }),
                    axios.get("/api/dashboard/notifications", {
                        params: {
                            page: this.currentPage,
                            per_page: this.perPage,
                        },
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "token"
                            )}`,
                        },
                    }),
                    axios.get("/api/inquiries", {
                        params: { dashboard: true, limit: 5 },
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "token"
                            )}`,
                        },
                    }),
                    axios.get("/api/notifications/read-status", {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "token"
                            )}`,
                        },
                    }),
                ]);

                this.notifications =
                    notificationsResponse.data.notifications.data || [];
                this.totalNotifications =
                    notificationsResponse.data.notifications.total;
                this.lastPage =
                    notificationsResponse.data.notifications.last_page;
                this.notificationReadStatuses = (
                    readStatusesResponse.data || []
                ).reduce((acc, id) => {
                    acc[id] = true;
                    return acc;
                }, {});
                this.unresolvedInquiryCount =
                    inquiriesResponse.data.unresolvedInquiryCount;
                this.unresolvedInquiries =
                    inquiriesResponse.data.inquiries.data;

                this.isNotificationsLoaded = true;
                this.isInquiriesLoaded = true;
                this.isReadStatusesLoaded = true;
                this.lastFetchTime = now;
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                this.isNotificationsLoaded = false;
                this.isInquiriesLoaded = false;
                this.isReadStatusesLoaded = false;
            }
        },

        async fetchNotificationReadStatuses() {
            try {
                const response = await axios.get(
                    "/api/notifications/read-status",
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "token"
                            )}`,
                        },
                    }
                );
                if (response.data && Array.isArray(response.data)) {
                    this.notificationReadStatuses = response.data.reduce(
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
            }
        },

        prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
            }
        },
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
            }
        },

        async changePage(page) {
            if (page >= 1 && page <= this.lastPage) {
                this.currentPage = page;
                await this.fetchDashboardData(true);
            }
        },

        async fetchUnresolvedInquiries() {
            try {
                const response = await axios.get("/api/inquiries", {
                    params: {
                        dashboard: true,
                        page: this.inquiryCurrentPage,
                        per_page: this.inquiryPerPage,
                    },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                this.unresolvedInquiryCount = response.data.unresolvedInquiryCount;
                this.unresolvedInquiries = response.data.inquiries.data;
                this.inquiryTotalPages = response.data.inquiries.last_page;
                this.isInquiriesLoaded = true;
            } catch (error) {
                console.error("Error fetching unresolved inquiries:", error);
                this.isInquiriesLoaded = false;
            }
        },

        async changeInquiryPage(page) {
            if (page >= 1 && page <= this.inquiryTotalPages) {
                this.inquiryCurrentPage = page;
                await this.fetchUnresolvedInquiries();
            }
        },

        async updateNotificationStatus(notificationId) {
            this.notificationReadStatuses[notificationId] = true;
            try {
                await axios.post(
                    `/api/notifications/${notificationId}/read`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "token"
                            )}`,
                        },
                    }
                );
            } catch (error) {
                console.error("Error updating notification status:", error);
                this.notificationReadStatuses[notificationId] = false;
            }
        },

        clearDashboardData() {
            this.notifications = [];
            this.notificationReadStatuses = {};
            this.unresolvedInquiryCount = 0;
            this.unresolvedInquiries = [];
            this.isNotificationsLoaded = false;
            this.isInquiriesLoaded = false;
            this.isReadStatusesLoaded = false;
        },
    },
});
