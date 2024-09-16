import { defineStore } from "pinia";
import axios from "axios";

export const useUserStore = defineStore("user", {
    state: () => ({
        users: {},
        isLoaded: false,
        adminLevels: {},
        prefectures: {},
        isMappingsLoaded: false,
        currentPage: 1,
        totalPages: 1,
        perPage: 20,
        cachedParams: {},
    }),
    actions: {
        async fetchUsers(forceRefresh = false, params = {}) {
            const pageKey = `${this.currentPage}-${JSON.stringify(params)}`;
            if (!forceRefresh && this.users[pageKey]) {
                return;
            }

            try {
                const response = await axios.get("/api/account/list", {
                    params: {
                        ...params,
                        page: this.currentPage,
                        per_page: this.perPage,
                    },
                });
                this.users[pageKey] = response.data.data;
                this.currentPage = response.data.current_page;
                this.totalPages = response.data.last_page;
                this.isLoaded = true;
                this.cachedParams = params;

                this.prefetchAdjacentPages(params);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        },
        async prefetchAdjacentPages(params) {
            const adjacentPages = [this.currentPage - 1, this.currentPage + 1];
            adjacentPages.forEach(async (page) => {
                if (page > 0 && page <= this.totalPages) {
                    const pageKey = `${page}-${JSON.stringify(params)}`;
                    if (!this.users[pageKey]) {
                        try {
                            const response = await axios.get(
                                "/api/account/list",
                                {
                                    params: {
                                        ...params,
                                        page: page,
                                        per_page: this.perPage,
                                    },
                                }
                            );
                            this.users[pageKey] = response.data.data;
                        } catch (error) {
                            console.error(
                                `Error prefetching page ${page}:`,
                                error
                            );
                        }
                    }
                }
            });
        },
        async changePage(page, params = {}) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
                await this.fetchUsers(false, params);
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
                return {
                    success: true,
                    message: response.data.message,
                    user: response.data.user,
                };
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
        getCurrentPageUsers: (state) => {
            const pageKey = `${state.currentPage}-${JSON.stringify(
                state.cachedParams
            )}`;
            return state.users[pageKey] || [];
        },
        getUsers: (state) => state.users,
        getAdminLevelLabel: (state) => (level) =>
            state.isMappingsLoaded ? state.adminLevels[level] || level : level,
        getPrefectureLabel: (state) => (prefCode) =>
            state.isMappingsLoaded
                ? state.prefectures[prefCode] || prefCode
                : prefCode,
        getUserById: (state) => (userId) => {
            for (const pageUsers of Object.values(state.users)) {
                const user = pageUsers.find((user) => user.id === userId);
                if (user) return user;
            }
            return null;
        },
        getSortedUsers:
            (state) =>
            (sortType = "newest") => {
                const allUsers = Object.values(state.users).flat();
                return [...allUsers].sort((a, b) => {
                    if (sortType === "newest") {
                        return new Date(b.created_at) - new Date(a.created_at);
                    } else {
                        return new Date(a.created_at) - new Date(b.created_at);
                    }
                });
            },
    },
});
