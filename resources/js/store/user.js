import { defineStore } from "pinia";
import axios from "axios";

export const useUserStore = defineStore("user", {
    state: () => ({
        users: [],
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
                this.users = response.data.data || response.data;
                this.isLoaded = true;
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        },
        setUsers(users) {
            this.users = users;
            this.isLoaded = true;
        },
        clearUsers() {
            this.users = [];
            this.isLoaded = false;
        },
        addUser(user) {
            this.users.unshift(user);
        },
        updateUser(updatedUser) {
            const index = this.users.findIndex(
                (user) => user.id === updatedUser.id
            );
            if (index !== -1) {
                this.users.splice(index, 1, updatedUser);
            }
        },
        removeUser(userId) {
            this.users = this.users.filter((user) => user.id !== userId);
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
        async fetchUserById(userId) {
            try {
                const response = await axios.get(`/api/account/${userId}`);
                const userData = response.data;
                this.updateUser(userData);
                return userData;
            } catch (error) {
                console.error("Error fetching user by ID:", error);
                throw error;
            }
        },
        async registerUser(formData) {
            try {
                const response = await axios.post(
                    "/api/account/register",
                    formData,
                    {
                        headers: { "Content-Type": "multipart/form-data" },
                    }
                );
                if (response.data.user) {
                    this.addUser(response.data.user);
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
                    `/api/account/${userId}`, // ここを修正
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                            "X-HTTP-Method-Override": "PUT",
                        },
                    }
                );
                if (response.data.user) {
                    this.updateUser(response.data.user);
                }
                return { success: true, message: response.data.message };
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
        getUsers: (state) => state.users,
        getAdminLevelLabel: (state) => (level) =>
            state.isMappingsLoaded ? state.adminLevels[level] || level : level,
        getPrefectureLabel: (state) => (prefCode) =>
            state.isMappingsLoaded
                ? state.prefectures[prefCode] || prefCode
                : prefCode,
        getUserById: (state) => (userId) => {
            return state.users.find((user) => user.id === userId);
        },
    },
});