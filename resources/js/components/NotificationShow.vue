<template>
    <div>
        <div class="form-title">
            <p class="page-title">お知らせ情報</p>
        </div>

        <div v-if="notification" class="form-item">
            <p class="sub-title">{{ notification.title }}</p>
            <p class="form-item-input form-item-textarea">{{ notification.description }}</p>
            <p>作成日時: {{ formatDate(notification.created_at) }}</p>
        </div>
        <div v-else-if="loading">
            <p>読み込み中...</p>
        </div>
        <div v-else>
            <p>お知らせが見つかりません。</p>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';

export default {
    setup() {
        const route = useRoute();
        const notification = ref(null);
        const loading = ref(true);

        const fetchNotification = async () => {
            try {
                const response = await axios.get(`/api/notifications/${route.params.id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                notification.value = response.data;
            } catch (error) {
                console.error('Error fetching notification:', error);
            } finally {
                loading.value = false;
            }
        };

        const formatDate = (dateString) => {
            return new Date(dateString).toLocaleString();
        };

        onMounted(fetchNotification);

        return {
            notification,
            loading,
            formatDate
        };
    }
}
</script>