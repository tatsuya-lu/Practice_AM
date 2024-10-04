<template>
    <div class="contact-form-container contact-thanks">
        <p class="check-in-messege">送信完了しました。</p>

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

        <div class="form-item under-line">
            <label>お問い合わせ内容</label>
            <p>{{ contactStore.form.body }}</p>
        </div>

        <a @click.prevent="goToContactForm"><button type="button" class="form-btn">戻る</button></a>
        <a @click.prevent="goToDashboard"><button type="button" class="form-btn">ダッシュボードへ戻る</button></a>
    </div>
</template>

<script>
import { useContactStore } from '../../store/contact/contact';
import { useRouter } from 'vue-router';

export default {
    setup() {
        const contactStore = useContactStore();
        const router = useRouter();

        const goToContactForm = () => {
            contactStore.$reset();
            router.push('/');
        };

        const goToDashboard = () => {
            window.location.href = '/dashboard';
        };

        return {
            contactStore,
            goToContactForm,
            goToDashboard
        };
    }
}
</script>