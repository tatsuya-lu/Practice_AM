<template>
    <div class="contact-form-container">
        <form @submit.prevent="submitForm">
            <div class="form-item">
                <label><span class="required">必須</span>会社名</label>
                <input class="form-item-input" type="text" v-model="contactStore.form.company" placeholder="例）株式会社令和">
            </div>

            <div class="form-item">
                <label><span class="required">必須</span>氏名</label>
                <input class="form-item-input" type="text" v-model="contactStore.form.name" placeholder="例）山田太郎">
            </div>

            <div class="form-item">
                <label><span class="required">必須</span>電話番号</label>
                <input class="form-item-input" type="tel" v-model="contactStore.form.tel" placeholder="例）000-0000-0000">
            </div>

            <div class="form-item">
                <label><span class="required">必須</span>メールアドレス</label>
                <input class="form-item-input" type="email" v-model="contactStore.form.email"
                    placeholder="例）example@gmail.com">
            </div>

            <div class="form-item">
                <label><span class="required">必須</span>生年月日</label>
                <input class="form-item-input" type="date" v-model="contactStore.form.birthday">
            </div>

            <div class="form-item">
                <label><span class="required">必須</span>性別</label>
                <div class="form-item-check">
                    <div v-for="(label, value) in genders" :key="value">
                        <input type="radio" :id="'gender_' + value" name="gender" :value="value" v-model="gender" />
                        <label :for="'gender_' + value">{{ label }}</label>
                    </div>
                </div>
                <p class="error-message" v-if="errors.gender">{{ errors.gender }}</p>
            </div>

            <div class="form-item">
                <label><span class="required">必須</span>職業</label>
                <select name="profession" class="form-item-input" v-model="profession">
                    <option value="">職業を選択してください</option>
                    <option v-for="(label, value) in professions" :key="value" :value="value">
                        {{ label }}
                    </option>
                </select>
                <p class="error-message" v-if="errors.profession">{{ errors.profession }}</p>
            </div>

            <div class="form-item">
                <label><span class="required">必須</span>お問い合わせ内容</label>
                <textarea class="form-item-input" v-model="body"></textarea>


            </div>

            <button type="submit" class="form-btn" value="確認する">確認する</button>
        </form>
    </div>
</template>

<script>
import { onMounted } from 'vue';
import { useContactStore } from '../../store/contact/contact';
import { useRouter } from 'vue-router';

export default {
    setup() {
        const contactStore = useContactStore();
        const router = useRouter();

        onMounted(() => {
            contactStore.fetchFormData();
        });

        const submitForm = async () => {
            try {
                await contactStore.submitForm();
                router.push('/contact/confirm');
            } catch (error) {

            }
        };

        return {
            contactStore,
            submitForm
        };
    }
}
</script>

<style scoped>
/* 必要に応じてCSSスタイルを追加 */
</style>