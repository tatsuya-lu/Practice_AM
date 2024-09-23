import { defineStore } from "pinia";
import axios from "axios";
import { useInquiryStore } from "./inquiry";
import { useUserStore } from "./user";
import { useDashboardStore } from "./dashboard";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        user: null,
        isLoaded: false,
    }),
    actions: {
        async fetchUser() {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    this.clearUser();
                    return;
                }

                axios.defaults.headers.common[
                    "Authorization"
                ] = `Bearer ${token}`;
                const response = await axios.get("/api/user");
                this.setUser(response.data);
            } catch (error) {
                console.error("Failed to fetch user:", error);
                this.clearUser();
            }
        },
        setUser(userData) {
            this.user = userData;
            this.isLoaded = true;
        },
        clearUser() {
            this.user = null;
            this.isLoaded = true;
            localStorage.removeItem("token");
            delete axios.defaults.headers.common["Authorization"];
        },
        async fetchInitialData() {
            const inquiryStore = useInquiryStore();
            const userStore = useUserStore();
            const dashboardStore = useDashboardStore();
            await Promise.all([
                this.fetchUser(),
                inquiryStore.fetchInquiries(),
                userStore.fetchUsers(),
                userStore.fetchMappings(),
                dashboardStore.prefetchAllPages(),
            ]);
        },
        async ensureAuthenticated() {
            if (!this.isLoggedIn) {
                await this.fetchUser();
            }
            if (!this.isLoggedIn) {
                throw new Error("Authentication required");
            }
        },
    },
    getters: {
        isLoggedIn: (state) => !!state.user,
    },
});
