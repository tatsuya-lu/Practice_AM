import { defineStore } from "pinia";
import axios from "axios";

export const useUserStore = defineStore("user", {
    state: () => ({
        users: [],
        isLoaded: false,
        adminLevels: {},
        prefectures: {},
        isMappingsLoaded: false,
        currentPage: 1,
        totalPages: 1,
        perPage: 20,
    }),
    actions: {
        async fetchUsers(forceRefresh = false, params = {}) {
            if (this.isLoaded && !forceRefresh) return;
            try {
                const response = await axios.get("/api/account/list", {
                    params: {
                        ...params,
                        page: this.currentPage,
                        per_page: this.perPage,
                    },
                });
                this.users = response.data.data;
                this.currentPage = response.data.current_page;
                this.totalPages = response.data.last_page;
                this.isLoaded = true;
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        },
        async changePage(page, params = {}) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
                await this.fetchUsers(true, params);
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
            const index = this.users.findIndex(user => user.id === updatedUser.id);
            if (index !== -1) {
                this.users.splice(index, 1, updatedUser);
            }
        },
        removeUser(userId) {
            this.users = this.users.filter(user => user.id !== userId);
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
                    this.addUser(response.data.user);
                    this.isLoaded = false;
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
                    this.updateUser(response.data.user);
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
        getUsers: (state) => state.users,
        getAdminLevelLabel: (state) => (level) =>
            state.isMappingsLoaded ? state.adminLevels[level] || level : level,
        getPrefectureLabel: (state) => (prefCode) =>
            state.isMappingsLoaded
                ? state.prefectures[prefCode] || prefCode
                : prefCode,
        getUserById: (state) => (userId) => state.users.find(user => user.id === userId),
        getSortedUsers: (state) => (sortType = 'newest') => {
            return [...state.users].sort((a, b) => {
                if (sortType === 'newest') {
                    return new Date(b.created_at) - new Date(a.created_at);
                } else {
                    return new Date(a.created_at) - new Date(b.created_at);
                }
            });
        },
    },
});