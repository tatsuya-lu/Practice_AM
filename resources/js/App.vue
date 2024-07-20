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
                <div class="notification-aria">
                    <!-- 通知コンポーネントをここに配置 -->
                </div>
                <ul class="user-control-aria">
                    <li class="logged-in-user-text">
                        ログイン中： {{ user.name }}
                        <img :src="user.profile_image" :alt="user.name + 'のプロフィール画像'">
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
            logout
        }
    }
}
</script>

<style>
/* グローバルスタイルをここに追加 */
</style>