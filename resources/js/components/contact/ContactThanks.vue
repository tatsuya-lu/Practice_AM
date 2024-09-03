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
            <p>{{ contactStore.form.gender }}</p>
        </div>

        <div class="form-item under-line">
            <label>職業</label>
            <p>{{ contactStore.form.profession }}</p>
        </div>

        <div class="form-item">
            <label class=" ">お問い合わせ内容</label>
            <p>{{ contactStore.form.body }}</p>
        </div>
        <a @click.prevent="goToContactForm" href="#"><button type="button" class="form-btn">戻る</button></a>
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
            router.push('/contact');
        };

        return {
            contactStore,
            goToContactForm
        };
    }
}
</script>