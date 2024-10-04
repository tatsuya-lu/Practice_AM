<template>
    <transition name="modal-fade">
        <div v-if="show" class="modal-overlay" @click="closeModal">
            <div class="modal-content" @click.stop>
                <button class="close-button" @click="closeModal">&times;</button>
                <h2>{{ notification.title }}</h2>
                <p class="notification-content">{{ notification.description }}</p>
                <p class="notification-date">作成日時: {{ formatDate(notification.created_at) }}</p>
            </div>
        </div>
    </transition>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        show: Boolean,
        notification: Object,
    },
    emits: ['close'],
    setup(props, { emit }) {
        const closeModal = () => {
            emit('close');
        };

        const formatDate = (dateString) => {
            return new Date(dateString).toLocaleString('ja-JP');
        };

        return {
            closeModal,
            formatDate,
        };
    },
});
</script>