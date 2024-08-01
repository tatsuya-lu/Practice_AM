import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Login from './components/Login.vue'
import Dashboard from './components/Dashboard.vue'
import NotificationShow from './components/NotificationShow.vue';
import NotificationRegister from './components/NotificationRegister.vue';
import AccountList from './components/AccountList.vue'
import Register from './components/Register.vue'
import InquiryList from './components/InquiryList.vue'
import InquiryEdit from './components/InquiryEdit.vue'
import axios from 'axios'
axios.defaults.baseURL = 'http://localhost:8000'
axios.defaults.withCredentials = true

const routes = [
    { 
        path: '/', 
        redirect: to => {
            return { path: '/dashboard' }
        }
    },
    { path: '/login', component: Login },
    { 
        path: '/dashboard', 
        component: Dashboard,
        meta: { requiresAuth: true }
    },
    { path: '/notifications/:id', component: NotificationShow, name: 'notification.show' },
    { path: '/notifications/create', component: NotificationRegister, name: 'notification.create' },
    { path: '/account/list', component: AccountList, name: 'account.list' },
    { path: '/account/register', component: Register, name: 'account.register' },
    { path: '/account/:id/edit', component: Register, name: 'account.edit' },
    { path: '/inquiry/list', component: InquiryList },
    { path: '/inquiry/:id/edit', component: InquiryEdit, name: 'inquiry.edit' },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const isLoggedIn = !!localStorage.getItem('token') // または他の認証チェック方法
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!isLoggedIn) {
            next('/login')
        } else {
            next()
        }
    } else if (to.path === '/login' && isLoggedIn) {
        next('/dashboard')
    } else {
        next()
    }
})

export default router

const app = createApp(App)
app.use(router)
app.mount('#app')