<template>
    <div class="contact-form-container">
        <form @submit.prevent="sendForm">
            <div class="form-item under-line">
                <label>会社名</label>
                <p>{{ contactStore.form.company }}</p>
            </div>

            <div class="form-item under-line">
                <label>氏名</label>
                <p>{{ contactStore.form.name }}</p>
            </div>

            <div class="form-item under-line">
                <label>電話番号</label>
                <p>{{ contactStore.form.tel }}</p>
            </div>

            <div class="form-item under-line">
                <label>メールアドレス</label>
                <p>{{ contactStore.form.email }}</p>
            </div>

            <div class="form-item under-line">
                <label>生年月日</label>
                <p>{{ contactStore.form.birthday }}</p>
            </div>

            <div class="form-item under-line">
                <label>性別</label>
                <p>{{ contactStore.genders[contactStore.form.gender] }}</p>
            </div>

            <div class="form-item under-line">
                <label>職業</label>
                <p>{{ contactStore.professions[contactStore.form.profession] }}</p>
            </div>

            <div class="form-item">
                <label>お問い合わせ内容</label>
                <p style="white-space: pre-wrap;">{{ contactStore.form.body }}</p>
            </div>

            <button type="button" @click="goBack" class="form-btn">入力内容修正</button>
            <button type="submit" class="form-btn">送信する</button>
        </form>
    </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useContactStore } from '../../store/contact/contact';

export default {
    setup() {
        const contactStore = useContactStore();
        const router = useRouter();
        const errors = ref({});

        const sendForm = async () => {
            try {
                errors.value = {};
                await contactStore.sendForm();
                router.push('/contact/thanks');
            } catch (error) {
                if (error.response && error.response.status === 422) {
                    errors.value = error.response.data.errors;
                } else {
                    console.error('Error sending form:', error);
                }
            }
        };

        const goBack = () => {
            router.push('/contact');
        };

        return {
            contactStore,
            sendForm,
            goBack,
            errors
        };
    }
}
</script>

<style scoped>

</style>