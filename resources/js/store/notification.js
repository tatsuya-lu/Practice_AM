import { defineStore } from "pinia";
import axios from "axios";

export const useNotificationStore = defineStore("notification", {
    state: () => ({
        unreadNotifications: [],
        isLoaded: false,
    }),
    actions: {
        async fetchUnreadNotifications() {
            if (this.isLoaded) return;
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
