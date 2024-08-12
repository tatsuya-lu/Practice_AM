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
    },
    getters: {
        getUsers: (state) => state.users,
        getAdminLevelLabel: (state) => (level) =>
            state.isMappingsLoaded ? state.adminLevels[level] || level : level,
        getPrefectureLabel: (state) => (prefCode) =>
            state.isMappingsLoaded
                ? state.prefectures[prefCode] || prefCode
                : prefCode,
    },
});
