import { defineStore } from "pinia";
import axios from 'axios';

export const useDashboardStore = defineStore("dashboard", {
    state: () => ({
        notifications: [],
        notificationReadStatuses: {},
        unresolvedInquiryCount: 0,
        unresolvedInquiries: [],
        isLoaded: false,
    }),
    actions: {
        async fetchDashboardData() {
            try {
                const [dashboardResponse, notificationsResponse] = await Promise.all([
                    axios.get("/api/dashboard", {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }),
                    axios.get("/api/dashboard/notifications", {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }),
                ]);

                this.unresolvedInquiryCount = dashboardResponse.data.unresolvedInquiryCount;
                this.unresolvedInquiries = dashboardResponse.data.unresolvedInquiries;
                this.notifications = notificationsResponse.data.notifications.data || [];

                this.notificationReadStatuses = (dashboardResponse.data.readNotificationIds || []).reduce((acc, id) => {
                    acc[id] = true;
                    return acc;
                }, {});

                this.isLoaded = true;
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
        },
        async fetchNotificationReadStatuses() {
            try {
                const response = await axios.get("/api/notifications/read-status", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                if (response.data && Array.isArray(response.data)) {
                    this.notificationReadStatuses = response.data.reduce((acc, id) => {
                        acc[id] = true;
                        return acc;
                    }, {});
                } else {
                    console.error("Unexpected response format:", response.data);
                }
            } catch (error) {
                console.error("Error fetching read statuses:", error);
            }
        },
        async fetchUnresolvedInquiries() {
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
                this.unresolvedInquiryCount = response.data.unresolvedInquiryCount;
                this.unresolvedInquiries = response.data.inquiries.data;
            } catch (error) {
                console.error("Error fetching unresolved inquiries:", error);
            }
        },
        updateNotificationStatus(notificationId) {
            this.notificationReadStatuses[notificationId] = true;
        },
    },
    getters: {
        validNotifications: (state) => state.notifications.filter(notification => notification && notification.id),
    },
});