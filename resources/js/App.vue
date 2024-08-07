<template>
    <div id="app">
        <header v-if="authStore.isLoggedIn">
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
                        <span v-if="unreadNotifications.length > 0" class="notification-count-badge">
                            {{ unreadNotifications.length }}
                        </span>
                    </div>
                    <div v-if="isNotificationVisible" class="notification-list">
                        <ul v-if="unreadNotifications.length > 0">
                            <li v-for="notification in unreadNotifications" :key="notification.id"
                                @click="markAsRead(notification)">
                                <router-link :to="{
                                    name: 'notification.show',
                                    params: { id: notification.id },
                                }">
                                    {{ notification.title }}
                                    <span class="notification-date">{{
                                        formatDate(notification.created_at)
                                        }}</span>
                                </router-link>
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
        <transition name="fade" mode="out-in">
            <main>
                <router-view></router-view>
            </main>
        </transition>
    </div>
</template>

<script>
import { ref, computed, onMounted, watch, onUnmounted } from "vue"; // onUnmounted を追加
import { useRouter } from "vue-router";
import { useNotificationStore } from "./store/notification";
import { useAuthStore } from "./store/auth";

export default {
    setup() {
        const router = useRouter();
        const notificationStore = useNotificationStore();
        const authStore = useAuthStore();
        const isNotificationVisible = ref(false);
        let hideTimeout;

        const user = computed(() => authStore.user || {});

        const userProfileImage = computed(() => {
            if (user.value && user.value.profile_image) {
                return `/img/profile/${user.value.profile_image}`;
            }
            return "/img/noimage.png";
        });

        const logout = async () => {
            try {
                await authStore.clearUser();
                router.push("/login");
            } catch (error) {
                console.error("Logout failed", error);
            }
        };

        const checkAuth = async () => {
            await authStore.fetchUser();
            if (authStore.isLoggedIn) {
                if (router.currentRoute.value.path === "/login") {
                    router.push("/dashboard");
                }
            } else if (router.currentRoute.value.meta.requiresAuth) {
                router.push("/login");
            }
        };

        const fetchUnreadNotifications = async () => {
            await notificationStore.fetchUnreadNotifications();
        };

        const markAsRead = async (notification) => {
            try {
                await axios.post(
                    `/api/notifications/${notification.id}/read`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                unreadNotifications.value = unreadNotifications.value.filter(
                    (n) => n.id !== notification.id
                );
            } catch (error) {
                console.error("Error marking notification as read:", error);
            }
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
            if (authStore.isLoggedIn) {
                fetchUnreadNotifications();
            }
        });

        onUnmounted(() => {
            clearTimeout(hideTimeout);
        });

        watch(() => router.currentRoute.value.path, async () => {
            await checkAuth();
        });

        return {
            authStore,
            user,
            userProfileImage,
            logout,
            unreadNotifications: computed(() => notificationStore.unreadNotifications),
            isNotificationVisible,
            showNotifications,
            hideNotifications,
            markAsRead,
            formatDate,
        };
    },
};
</script>

<style>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>