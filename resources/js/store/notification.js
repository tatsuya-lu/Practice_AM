import { defineStore } from "pinia";
import axios from "axios";

export const useNotificationStore = defineStore("notification", {
    state: () => ({
        notifications: [],
        unreadNotifications: [],
    }),
    actions: {
        async fetchNotifications() {
            try {
                const response = await axios.get(
                    "/api/dashboard/notifications",
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "token"
                            )}`,
                        },
                    }
                );
                this.notifications = (
                    response.data.notifications.data || []
                ).filter((notification) => notification && notification.id);
            } catch (error) {
                console.error("Error fetching notifications:", error);
                this.notifications = [];
            }
        },
        async fetchUnreadNotifications() {
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
            } catch (error) {
                console.error("Error fetching unread notifications:", error);
                this.unreadNotifications = [];
            }
        },
    },
});