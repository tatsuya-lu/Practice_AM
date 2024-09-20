<template>
    <div>
        <p class="page-title">新規お知らせ登録</p>

        <form @submit.prevent="submitForm">
            <div class="form-item">
                <label for="title"><span class="required">必須</span>タイトル</label>
                <input class="form-item-input" id="title" type="text" v-model="title">
                <p v-if="errors.title" class="error-message">{{ errors.title[0] }}</p>
            </div>

            <div class="form-item">
                <label for="description"><span class="required">必須</span>内容</label>
                <textarea class="form-item-input" id="description" v-model="description"></textarea>
                <p v-if="errors.description" class="error-message">{{ errors.description[0] }}</p>
            </div>

            <div>
                <button class="form-btn" type="submit">作成</button>
            </div>
        </form>
    </div>
</template>

<script>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useNotificationStore } from "../store/notification";
import { useDashboardStore } from "../store/dashboard";

export default {
    setup() {
        const router = useRouter();
        const notificationStore = useNotificationStore();
        const dashboardStore = useDashboardStore();
        const title = ref('');
        const description = ref('');
        const errors = ref({});

        const submitForm = async () => {
            try {
                const response = await axios.post('/api/notifications', {
                    title: title.value,
                    description: description.value
                }, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });

                if (response.data.success) {
                    await dashboardStore.addNewNotification(response.data.notification);
                    await notificationStore.addNewNotification(response.data.notification);
                    await router.push({ name: 'dashboard', query: { sort: 'newest', page: 1 } });
                    await dashboardStore.fetchDashboardData(true);
                } else {
                    errors.value = response.data.errors || {};
                }
            } catch (error) {
                if (error.response && error.response.data) {
                    errors.value = error.response.data.errors || {};
                } else {
                    errors.value = { general: ['通知の作成中にエラーが発生しました。'] };
                }
            }
        };

        return {
            title,
            description,
            errors,
            submitForm
        };
    }
}
</script>