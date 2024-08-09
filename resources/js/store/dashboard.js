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
    }),
    actions: {
        async addNewNotification(notification) {
            this.notifications.unshift(notification);
            this.notificationReadStatuses[notification.id] = false;
        },
        async fetchDashboardData() {
            if (this.isNotificationsLoaded) {
                // データが既にロードされている場合は再取得
                this.isNotificationsLoaded = false;
            }

            try {
                const [dashboardResponse, notificationsResponse] =
                    await Promise.all([
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
                    ]);

                this.notifications =
                    notificationsResponse.data.notifications.data || [];

                this.notificationReadStatuses = (
                    dashboardResponse.data.readNotificationIds || []
                ).reduce((acc, id) => {
                    acc[id] = true;
                    return acc;
                }, {});

                this.isNotificationsLoaded = true;

                if (!this.isInquiriesLoaded) {
                    await this.fetchUnresolvedInquiries();
                }
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
        updateNotificationStatus(notificationId) {
            this.notificationReadStatuses[notificationId] = true;
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
