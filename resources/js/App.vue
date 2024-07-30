<template>
    <div id="app">
        <header v-if="isLoggedIn">
            <div class="header-content-left">
                <img class="logo" src="/img/testlogo.png" alt="ロゴ画像">
                <nav>
                    <ul>
                        <li><router-link to="/dashboard"><button><span
                                        class="fa-solid fa-house"></span>HOME</button></router-link></li>
                        <li><router-link to="/account/list"><button><span
                                        class="fa-solid fa-envelopes-bulk"></span>アカウント一覧</button></router-link></li>
                        <li><router-link to="/inquiry/list"><button><span
                                        class="fa-solid fa-envelopes-bulk"></span>お問い合わせ一覧</button></router-link></li>
                    </ul>
                </nav>
            </div>

            <div class="header-content-right">
                <div class="notification-area">
                    <div class="notification-bell" @mouseover="showNotifications = true"
                        @mouseleave="showNotifications = false">
                        <i class="far fa-bell"></i>
                        <span v-if="unreadNotificationsCount > 0" class="notification-count">{{ unreadNotificationsCount
                            }}</span>
                    </div>
                    <div v-if="showNotifications" class="notification-dropdown">
                        <ul v-if="notifications.length > 0">
                            <li v-for="notification in notifications" :key="notification.id"
                                @click="markAsRead(notification)">
                                <router-link :to="{ name: 'notification.show', params: { id: notification.id } }">
                                    {{ notification.title }}
                                </router-link>
                            </li>
                        </ul>
                        <p v-else>新しいお知らせはありません</p>
                    </div>
                </div>
                <ul class="user-control-aria">
                    <li class="logged-in-user-text">
                        ログイン中： {{ user.name }}
                        <img :src="userProfileImage" :alt="user.name + 'のプロフィール画像'" class="user-profile-image">
                    </li>
                    <li><button @click="logout" class="logout-btn">ログアウト</button></li>
                </ul>
            </div>
        </header>

        <main>
            <router-view></router-view>
        </main>
    </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

export default {
    setup() {
        const router = useRouter()
        const user = ref(null)

        const isLoggedIn = computed(() => !!user.value)

        const userProfileImage = computed(() => {
            if (user.value && user.value.profile_image) {
                return `/img/profile/${user.value.profile_image}`
            }
            return '/img/noimage.png' // デフォルトのプロフィール画像
        })

        const logout = async () => {
            try {
                await axios.post('/api/logout', {}, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                })
                localStorage.removeItem('token')
                user.value = null
                router.push('/login')
            } catch (error) {
                console.error('Logout failed', error)
            }
        }

        const checkAuth = async () => {
            const token = localStorage.getItem('token')
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
                try {
                    const response = await axios.get('/api/user')
                    user.value = response.data
                } catch (error) {
                    console.error('Auth check failed', error)
                    localStorage.removeItem('token')
                    router.push('/login')
                }
            } else {
                router.push('/login')
            }
        }

        checkAuth()

        return {
            user,
            isLoggedIn,
            userProfileImage,
            logout
        }
    }
}
</script>

<style>
/* グローバルスタイルをここに追加 */
</style>