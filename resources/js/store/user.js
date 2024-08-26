import { defineStore } from "pinia";
import axios from "axios";

export const useUserStore = defineStore("user", {
    state: () => ({
        users: {},  // オブジェクトに変更
        isLoaded: false,
        adminLevels: {},
        prefectures: {},
        isMappingsLoaded: false,
    }),
    actions: {
        async fetchUsers(forceRefresh = false) {
            if (this.isLoaded && !forceRefresh) return;
            try {
                const response = await axios.get("/api/account/list");
                const users = Array.isArray(response.data) ? response.data : response.data.data;
                this.users = users.reduce((acc, user) => {
                    acc[user.id] = user;
                    return acc;
                }, {});
                this.isLoaded = true;
                console.log('Fetched users:', this.users); // デバッグ用
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        },
        setUsers(users) {
            this.users = users.reduce((acc, user) => {
                acc[user.id] = user;
                return acc;
            }, {});
            this.isLoaded = true;
        },
        clearUsers() {
            this.users = {};
            this.isLoaded = false;
        },
        addUser(user) {
            this.users = { [user.id]: user, ...this.users };
        },
        updateUser(updatedUser) {
            this.users[updatedUser.id] = updatedUser;
        },
        removeUser(userId) {
            delete this.users[userId];
        },
        async fetchMappings(forceRefresh = false) {
            if (this.isMappingsLoaded && !forceRefresh) return;
            try {
                const response = await axios.get("/api/form-data");
                this.adminLevels = response.data.adminLevels;
                this.prefectures = response.data.prefectures;
                this.isMappingsLoaded = true;
            } catch (error) {
                console.error("Error fetching mappings:", error);
            }
        },
        async registerUser(formData) {
            try {
                const response = await axios.post("/api/account/register", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                if (response.data.user) {
                    this.users[response.data.user.id] = response.data.user;
                    this.isLoaded = false; // 強制的に再読み込みを促す
                }
                return {
                    success: true,
                    message: response.data.message,
                    user: response.data.user,
                };
            } catch (error) {
                console.error("Error registering user:", error);
                return {
                    success: false,
                    errors: error.response?.data?.errors || {},
                };
            }
        },
        async updateUser(userId, formData) {
            try {
                const response = await axios.post(
                    `/api/account/${userId}`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                            "X-HTTP-Method-Override": "PUT",
                        },
                    }
                );
                if (response.data.user) {
                    this.users[userId] = response.data.user;
                }
                return { success: true, message: response.data.message, user: response.data.user };
            } catch (error) {
                console.error("Error updating user:", error);
                return {
                    success: false,
                    errors: error.response?.data?.errors || {},
                };
            }
        },
    },
    getters: {
        getUsers: (state) => Object.values(state.users),
        getAdminLevelLabel: (state) => (level) =>
            state.isMappingsLoaded ? state.adminLevels[level] || level : level,
        getPrefectureLabel: (state) => (prefCode) =>
            state.isMappingsLoaded
                ? state.prefectures[prefCode] || prefCode
                : prefCode,
        getUserById: (state) => (userId) => state.users[userId],
    },
});
