import { defineStore } from "pinia";
import axios from "axios";

export const useNotificationStore = defineStore("notification", {
    state: () => ({
        unreadNotifications: [],
        isLoaded: false,
        globalReadStatus: {},
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
                this.unreadNotifications.forEach((notification) => {
                    this.globalReadStatus[notification.id] = false;
                });
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
                this.updateGlobalReadStatus(notificationId);
            } catch (error) {
                console.error("Error marking notification as read:", error);
            }
        },
        updateGlobalReadStatus(notificationId) {
            this.globalReadStatus[notificationId] = true;
            this.unreadNotifications = this.unreadNotifications.filter(
                (n) => n.id !== notificationId
            );
        },

        revertGlobalReadStatus(notificationId) {
            this.globalReadStatus[notificationId] = false;
            // unreadNotificationsの更新が必要な場合は、ここで再取得するロジックを追加
        },
    },
    getters: {
        unreadCount: (state) => state.unreadNotifications.length,
    },
});
