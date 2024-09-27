import { createApp } from "vue";
import { createPinia } from "pinia";
import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "./store/user";
import { useAuthStore } from "./store/auth";
import { useInquiryStore } from "./store/inquiry";
import { useDashboardStore } from "./store/dashboard";
import App from "./App.vue";
import Login from "./components/Login.vue";
import Dashboard from "./components/Dashboard.vue";
import NotificationRegister from "./components/NotificationRegister.vue";
import AccountList from "./components/AccountList.vue";
import Register from "./components/Register.vue";
import InquiryList from "./components/InquiryList.vue";
import InquiryEdit from "./components/InquiryEdit.vue";
import ContactForm from "./components/contact/ContactForm.vue";
import ContactConfirm from "./components/contact/ContactConfirm.vue";
import ContactThanks from "./components/contact/ContactThanks.vue";
import axios from "axios";
axios.defaults.baseURL = "http://localhost:8000";
axios.defaults.withCredentials = true;

const routes = [
    {
        path: "/",
        redirect: (to) => {
            return { path: "/dashboard" };
        },
    },
    {
        path: "/login",
        component: Login,
        meta: { layout: "empty", requiresAuth: false },
    },
    {
        path: "/dashboard",
        component: Dashboard,
        name: "dashboard",
        meta: { requiresAuth: true },
    },
    {
        path: "/notifications/create",
        component: NotificationRegister,
        name: "notification.create",
    },
    { path: "/account/list", component: AccountList, name: "account.list" },
    {
        path: "/account/register",
        component: Register,
        name: "account.register",
    },
    { path: "/account/:id/edit", component: Register, name: "account.edit" },
    { path: "/inquiry/list", component: InquiryList },
    {
        path: "/inquiry/edit/:id",
        name: "inquiry.edit",
        component: InquiryEdit,
        meta: { requiresAuth: true },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

const pinia = createPinia();

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore(pinia);
    const userStore = useUserStore(pinia);
    const dashboardStore = useDashboardStore(pinia);
    const inquiryStore = useInquiryStore(pinia);

    if (!authStore.isLoaded) {
        await authStore.fetchUser();
    }

    if (authStore.isLoggedIn) {
        if (!userStore.isLoaded) {
            await userStore.fetchUsers();
        }
        if (!userStore.isMappingsLoaded) {
            await userStore.fetchMappings();
        }
        if (to.path === "/dashboard" || !dashboardStore.isReadStatusesLoaded) {
            await dashboardStore.fetchDashboardData();
        }
        if (!inquiryStore.isLoaded) {
            await authStore.fetchInitialData();
        }
    }

    if (to.matched.some((record) => record.meta.requiresAuth)) {
        if (!authStore.isLoggedIn) {
            next("/login");
        } else {
            next();
        }
    } else if (to.path === "/login" && authStore.isLoggedIn) {
        next("/dashboard");
    } else {
        next();
    }
});

const app = createApp(App);
app.use(pinia);
app.use(router);
app.mount("#app");

export default router;
