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
    }),
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
                this.isNotificationsLoaded &&
                this.isInquiriesLoaded &&
                this.isReadStatusesLoaded &&
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
        async fetchUnresolvedInquiries() {
            if (this.isInquiriesLoaded) return;

            try {
                const response = await axios.get("/api/inquiries", {
                    params: {
                        dashboard: true,
                        limit: 5,
                    },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                });
                this.unresolvedInquiryCount =
                    response.data.unresolvedInquiryCount;
                this.unresolvedInquiries = response.data.inquiries.data;
                this.isInquiriesLoaded = true;
            } catch (error) {
                console.error("Error fetching unresolved inquiries:", error);
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
                // エラーが発生した場合、ステータスを元に戻す
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
        },
    },
    getters: {
        validNotifications: (state) =>
            state.notifications.filter(
                (notification) => notification && notification.id
            ),
        isLoaded: (state) =>
            state.isNotificationsLoaded && state.isInquiriesLoaded,
    },
});
