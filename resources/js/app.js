import './bootstrap';
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import axios from 'axios';
import App from './components/App.vue';
import Dashboard from './components/Dashboard.vue';
import store from './store';

axios.defaults.withCredentials = true;

const app = createApp(App);

axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

const routes = [
    { path: '/login', component: () => import('./components/Login.vue'), name: 'login' },
    { 
        path: '/account/dashboard', 
        component: () => import('./components/Dashboard.vue'), 
        name: 'account.dashboard',
        meta: { requiresAuth: true }
    },
    // 他のルートも追加
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
        // 認証状態をチェック
        axios.get('/api/user')
            .then(() => {
                next();
            })
            .catch(() => {
                next('/login');
            });
    } else {
        next();
    }
});

app.config.errorHandler = (err, vm, info) => {
    console.error('Vue Error:', err, info);
};

app.use(store);
app.use(router);

console.log('Vue app initialization');
app.mount('#app');
console.log('Vue app mounted');
