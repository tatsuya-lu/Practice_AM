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

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    min-width: 450px;
    max-width: 80%;
    max-height: 80%;
    overflow-y: auto;
    position: relative;
}

.close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 24px;
    cursor: pointer;
    background: none;
    border: none;
}

.notification-content {
    margin-top: 20px;
    white-space: pre-wrap;
}

.notification-date {
    margin-top: 20px;
    font-style: italic;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}
</style>