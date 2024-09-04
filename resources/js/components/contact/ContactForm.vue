<template>
    <div class="contact-form-container">
        <form @submit.prevent="submitForm">
            <div class="form-item">
                <label><span class="required">必須</span>会社名</label>
                <input class="form-item-input" type="text" v-model="contactStore.form.company" placeholder="例）株式会社令和">
                <p v-if="errors.company" class="error-message">{{ errors.company[0] }}</p>
            </div>

            <div class="form-item">
                <label><span class="required">必須</span>氏名</label>
                <input class="form-item-input" type="text" v-model="contactStore.form.name" placeholder="例）山田太郎">
                <p v-if="errors.name" class="error-message">{{ errors.name[0] }}</p>
            </div>

            <div class="form-item">
                <label><span class="required">必須</span>電話番号</label>
                <input class="form-item-input" type="tel" v-model="contactStore.form.tel" placeholder="例）000-0000-0000">
                <p v-if="errors.tel" class="error-message">{{ errors.tel[0] }}</p>
            </div>

            <div class="form-item">
                <label><span class="required">必須</span>メールアドレス</label>
                <input class="form-item-input" type="email" v-model="contactStore.form.email"
                    placeholder="例）example@gmail.com">
                <p v-if="errors.email" class="error-message">{{ errors.email[0] }}</p>
            </div>

            <div class="form-item">
                <label><span class="required">必須</span>生年月日</label>
                <input class="form-item-input" type="date" v-model="contactStore.form.birthday">
                <p v-if="errors.birthday" class="error-message">{{ errors.birthday[0] }}</p>
            </div>

            <div class="form-item">
                <label><span class="required">必須</span>性別</label>
                <div class="form-item-check">
                    <template v-for="(label, value) in contactStore.genders" :key="value">
                        <input type="radio" :id="value" :value="value" v-model="contactStore.form.gender">
                        <label :for="value">{{ label }}</label>
                    </template>
                </div>
                <p v-if="errors.gender" class="error-message">{{ errors.gender[0] }}</p>
            </div>

            <div class="form-item">
                <label><span class="required">必須</span>職業</label>
                <select v-model="contactStore.form.profession" class="form-item-input">
                    <option value="">職業を選択してください</option>
                    <option v-for="(label, value) in contactStore.professions" :key="value" :value="value">
                        {{ label }}
                    </option>
                </select>
                <p v-if="errors.profession" class="error-message">{{ errors.profession[0] }}</p>
            </div>

            <div class="form-item">
                <label><span class="required">必須</span>お問い合わせ内容</label>
                <textarea class="form-item-input" v-model="contactStore.form.body"></textarea>
                <p v-if="errors.body" class="error-message">{{ errors.body[0] }}</p>
            </div>

            <button type="submit" class="form-btn">確認する</button>
        </form>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useContactStore } from '../../store/contact/contact';

export default {
    setup() {
        const contactStore = useContactStore();
        const router = useRouter();
        const errors = ref({});

        onMounted(async () => {
            await contactStore.initializeStore();
        });

        const submitForm = async () => {
            try {
                errors.value = {};
                await contactStore.submitForm();
                router.push('/contact/confirm');
            } catch (error) {
                if (error.response && error.response.status === 422) {
                    errors.value = error.response.data.errors;
                } else {
                    console.error('Error submitting form:', error);
                }
            }
        };

        return {
            contactStore,
            submitForm,
            errors
        };
    }
}
</script>