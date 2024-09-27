import { createApp } from "vue";
import { createPinia } from "pinia";
import { createRouter, createWebHistory } from "vue-router";
import ExternalLayout from './layouts/ExternalLayout.vue';
import ContactForm from "./components/contact/ContactForm.vue";
import ContactConfirm from "./components/contact/ContactConfirm.vue";
import ContactThanks from "./components/contact/ContactThanks.vue";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:8000";
axios.defaults.withCredentials = true;

const routes = [
    {
        path: "/",
        component: ContactForm,
    },
    {
        path: "/confirm",
        component: ContactConfirm,
    },
    {
        path: "/thanks",
        component: ContactThanks,
    },
];

const router = createRouter({
    history: createWebHistory('/contact'),
    routes,
});

const pinia = createPinia();

const app = createApp(ExternalLayout);
app.use(pinia);
app.use(router);
app.mount("#app");