<template>
    <div>
        <div class="form-title">
            <p class="page-title">お問い合わせ編集</p>
        </div>

        <div v-if="successMessage" class="success">
            {{ successMessage }}
        </div>

        <div class="inquiry-edit-container">
            <div class="inquiry-form-content">
                <form @submit.prevent="updateInquiry">
                    <div class="form-item">
                        <label for="status">ステータス</label>
                        <select v-model="inquiry.status" id="status" class="form-item-input minimal">
                            <option v-for="(label, key) in statusOptions" :key="key" :value="key">
                                {{ label }}
                            </option>
                        </select>
                    </div>

                    <div class="form-item">
                        <label for="body">お問い合わせ内容</label>
                        <p class="form-item-input form-item-textarea">{{ inquiry.body }}</p>
                    </div>

                    <div class="form-item">
                        <label for="comment">備考欄</label>
                        <textarea v-model="inquiry.comment" id="comment"
                            class="form-item-input form-item-textarea"></textarea>
                    </div>

                    <button type="submit" class="form-btn">更新する</button>
                </form>
            </div>

            <div class="inquiry-info-content">
                <p class="sub-title">お問い合わせ情報</p>

                <div class="info-item">
                    <label for="company">会社名</label>
                    <p>{{ inquiry.company }}</p>
                </div>

                <div class="info-item">
                    <label for="name">氏名</label>
                    <p>{{ inquiry.name }}</p>
                </div>

                <div class="info-item">
                    <label for="tel">電話番号</label>
                    <p>{{ inquiry.tel }}</p>
                </div>

                <div class="info-item">
                    <label for="email">メールアドレス</label>
                    <p>{{ inquiry.email }}</p>
                </div>

                <div class="info-item">
                    <label for="birthday">生年月日</label>
                    <p>{{ inquiry.birthday }}</p>
                </div>

                <div class="info-item">
                    <label for="gender">性別</label>
                    <p>{{ inquiry.gender }}</p>
                </div>

                <div class="info-item">
                    <label for="profession">職業</label>
                    <p>{{ inquiry.profession }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';

export default {
    setup() {
        const route = useRoute();
        const router = useRouter();
        const inquiry = ref({});
        const successMessage = ref('');
        const statusOptions = ref({});

        const fetchInquiry = async () => {
            try {
                const response = await axios.get(`/api/inquiries/${route.params.id}`);
                inquiry.value = response.data.inquiry;
                statusOptions.value = response.data.statusOptions;
            } catch (error) {
                console.error('Error fetching inquiry:', error);
            }
        };

        const updateInquiry = async () => {
            try {
                const response = await axios.put(`/api/inquiries/${route.params.id}`, inquiry.value);
                successMessage.value = response.data.message;
                // リダイレクト先を変更
                router.push({ path: '/inquiry/list', query: { success: 'お問い合わせが更新されました' } });
            } catch (error) {
                console.error('Error updating inquiry:', error);
            }
        };

        onMounted(() => {
            fetchInquiry();
        });

        return {
            inquiry,
            successMessage,
            statusOptions,
            updateInquiry
        };
    }
}
</script>