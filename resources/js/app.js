import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Login from './components/Login.vue'
import Dashboard from './components/Dashboard.vue'
import AccountList from './components/AccountList.vue'
import Register from './components/Register.vue'
import InquiryList from './components/InquiryList.vue'
import InquiryEdit from './components/InquiryEdit.vue'
import axios from 'axios'
axios.defaults.baseURL = 'http://localhost:8000'
axios.defaults.withCredentials = true

const routes = [
    { path: '/login', component: Login },
    { path: '/dashboard', component: Dashboard },
    { path: '/account/list', component: AccountList },
    { path: '/account/register', component: Register },
    { path: '/account/:id/edit', component: Register, name: 'account.edit' },
    { path: '/inquiry/list', component: InquiryList },
    { path: '/inquiry/:id/edit', component: InquiryEdit, name: 'inquiry.edit' },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

const app = createApp(App)
app.use(router)
app.mount('#app')