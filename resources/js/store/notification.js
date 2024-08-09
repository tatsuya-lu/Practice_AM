import { defineStore } from "pinia";
import axios from "axios";

export const useNotificationStore = defineStore("notification", {
    state: () => ({
        unreadNotifications: [],
        isLoaded: false,
    }),
    actions: {
        async addNewNotification(notification) {
            this.unreadNotifications.unshift(notification);
            this.isLoaded = true;
        },
        async fetchUnreadNotifications(forceRefresh = false) {
            if (this.isLoaded && !forceRefresh) return;
            try {
                const response = await axios.get("/api/notifications", {
                    params: { unread: true },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                });
                this.unreadNotifications = response.data.notifications.filter(
                    (notification) => notification && notification.id
                );
                this.isLoaded = true;
            } catch (error) {
                console.error("Error fetching unread notifications:", error);
                this.unreadNotifications = [];
            } finally {
                this.isLoaded = true;
            }
        },
        clearUnreadNotifications() {
            this.unreadNotifications = [];
            this.isLoaded = false;
        },
        async markAsRead(notificationId) {
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
                this.unreadNotifications = this.unreadNotifications.filter(
                    (n) => n.id !== notificationId
                );
            } catch (error) {
                console.error("Error marking notification as read:", error);
            }
        },
    },
});
