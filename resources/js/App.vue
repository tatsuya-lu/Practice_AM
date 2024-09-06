<template>
    <div id="app">
        <header v-if="showHeader">
            <div class="header-content-left">
                <img class="logo" src="/img/testlogo.png" alt="ロゴ画像" />
                <nav>
                    <ul>
                        <li>
                            <router-link to="/dashboard"><button>
                                    <span class="fa-solid fa-house"></span>HOME
                                </button></router-link>
                        </li>
                        <li>
                            <router-link to="/account/list"><button>
                                    <span class="fa-solid fa-envelopes-bulk"></span>アカウント一覧
                                </button></router-link>
                        </li>
                        <li>
                            <router-link to="/inquiry/list"><button>
                                    <span class="fa-solid fa-envelopes-bulk"></span>お問い合わせ一覧
                                </button></router-link>
                        </li>
                    </ul>
                </nav>
            </div>

            <div class="header-content-right">
                <div class="notification-aria" @mouseenter="showNotifications" @mouseleave="hideNotifications">
                    <div class="notification-bell">
                        <i class="far fa-bell"></i>
                        <span v-if="notificationStore.unreadCount > 0" class="notification-count-badge">
                            {{ notificationStore.unreadCount }}
                        </span>
                    </div>
                    <div v-if="isNotificationVisible" class="notification-list">
                        <ul v-if="unreadNotifications.length > 0">
                            <li v-for="notification in unreadNotifications" :key="notification.id"
                                @click="openNotificationModal(notification)">
                                {{ notification.title }}
                                <span class="notification-date">{{ formatDate(notification.created_at) }}</span>
                            </li>
                        </ul>
                        <p v-else>新しいお知らせはありません</p>
                    </div>
                </div>
                <ul class="user-control-aria">
                    <li class="logged-in-user-text">
                        ログイン中： {{ user.name }}
                        <img :src="userProfileImage" :alt="user.name + 'のプロフィール画像'" class="user-profile-image" />
                    </li>
                    <li>
                        <button @click="logout" class="logout-btn">ログアウト</button>
                    </li>
                </ul>
            </div>
        </header>
        <router-view v-slot="{ Component }">
            <transition :name="transitionName" mode="out-in">
                <component :is="Component" :key="$route.fullPath" />
            </transition>
        </router-view>
        <div v-if="isInitialLoading" class="loading-overlay">
            Loading...
        </div>
        <NotificationModal :show="showNotificationModal" :notification="selectedNotification"
            @close="closeNotificationModal" />
    </div>
</template>

<script>
import { ref, computed, onMounted, watch, onUnmounted, provide } from "vue";
import { useRouter } from "vue-router";
import { useNotificationStore } from "./store/notification";
import { useAuthStore } from "./store/auth";
import { useUserStore } from "./store/user";
import NotificationModal from "@/components/NotificationModal.vue";

export default {
    components: {
        NotificationModal,
    },
    setup() {
        const router = useRouter();
        const notificationStore = useNotificationStore();
        const authStore = useAuthStore();
        const userStore = useUserStore();
        const isNotificationVisible = ref(false);
        let hideTimeout;
        const isInitialLoading = ref(false);
        const transitionName = ref('');

        provide('setInitialLoading', (value) => {
            isInitialLoading.value = value;
        });

        const showHeader = computed(() => {
            return authStore.isLoggedIn && router.currentRoute.value.meta.layout !== 'empty';
        });

        const user = computed(() => authStore.user || {});

        const userProfileImage = computed(() => {
            if (user.value && user.value.profile_image) {
                return `/img/profile/${user.value.profile_image}`;
            }
            return "/img/noimage.png";
        });

        const showNotificationModal = ref(false);
        const selectedNotification = ref(null);

        const openNotificationModal = (notification) => {
            selectedNotification.value = notification;
            showNotificationModal.value = true;
            markAsRead(notification);
        };

        const closeNotificationModal = () => {
            showNotificationModal.value = false;
        };

        const unreadNotifications = computed(() => notificationStore.unreadNotifications);
        const unreadNotificationsCount = computed(() => unreadNotifications.value.length);

        const logout = async () => {
            try {
                await authStore.clearUser();
                notificationStore.clearUnreadNotifications();
                router.push("/login");
            } catch (error) {
                console.error("Logout failed", error);
            }
        };

        const checkAuth = async () => {
            await authStore.fetchUser();
            if (authStore.isLoggedIn) {
                if (router.currentRoute.value.path === "/login") {
                    await authStore.fetchInitialData();
                    await router.push("/dashboard");
                }
            } else if (router.currentRoute.value.meta.requiresAuth) {
                await router.push("/login");
            }
        };

        const fetchNotifications = async () => {
            if (authStore.isLoggedIn) {
                await notificationStore.fetchUnreadNotifications(true);
            }
        };

        const markAsRead = async (notification) => {
            await notificationStore.markAsRead(notification.id);
        };

        const showNotifications = () => {
            clearTimeout(hideTimeout);
            isNotificationVisible.value = true;
        };

        const hideNotifications = () => {
            hideTimeout = setTimeout(() => {
                isNotificationVisible.value = false;
            }, 300);
        };

        const formatDate = (dateString) => {
            return new Date(dateString).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
            });
        };

        onMounted(async () => {
            await checkAuth();
            await fetchNotifications();
            await userStore.fetchMappings();
        });

        onUnmounted(() => {
            clearTimeout(hideTimeout);
        });

        watch(() => router.currentRoute.value, (to, from) => {
            const toDepth = to.path.split('/').length;
            const fromDepth = from.path.split('/').length;
            transitionName.value = toDepth < fromDepth ? 'slide-right' : 'slide-left';
        });

        watch(() => router.currentRoute.value, async (to) => {
            if (to.path === '/dashboard') {
                await fetchNotifications();
            }
        });

        return {
            authStore,
            showHeader,
            user,
            userProfileImage,
            logout,
            unreadNotifications,
            unreadNotificationsCount,
            isNotificationVisible,
            showNotifications,
            hideNotifications,
            notificationStore,
            markAsRead,
            formatDate,
            isInitialLoading,
            transitionName,
            userStore,
            showNotificationModal,
            selectedNotification,
            openNotificationModal,
            closeNotificationModal,
        };
    },
};
</script>

<style>

</style>