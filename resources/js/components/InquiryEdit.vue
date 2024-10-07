<template>
    <div>
        <div class="form-title">
            <p class="page-title">お問い合わせ編集</p>
        </div>

        <div v-if="successMessage" class="success">
            {{ successMessage }}
        </div>

        <div v-if="!currentInquiry" class="loading">
            データを読み込んでいます...
        </div>

        <div v-else-if="inquiryStore.error" class="error">
            エラーが発生しました: {{ inquiryStore.error }}
        </div>

        <div v-else class="inquiry-edit-container">
            <div class="inquiry-form-content">
                <form @submit.prevent="updateInquiry">
                    <div class="form-item">
                        <label for="status">ステータス</label>
                        <select v-model="currentInquiry.status" id="status" class="form-item-input minimal">
                            <option v-for="(label, key) in inquiryStore.statusOptions" :key="key" :value="key">
                                {{ label }}
                            </option>
                        </select>
                    </div>

                    <div class="form-item">
                        <label for="body">お問い合わせ内容</label>
                        <p class="form-item-input form-item-textarea">{{ currentInquiry.body }}</p>
                    </div>

                    <div class="form-item">
                        <label for="comment">備考欄</label>
                        <textarea v-model="currentInquiry.comment" id="comment"
                            class="form-item-input form-item-textarea"></textarea>
                    </div>

                    <button type="submit" class="form-btn">更新する</button>
                </form>
            </div>

            <div class="inquiry-info-content">
                <p class="sub-title">お問い合わせ情報</p>

                <div class="info-item">
                    <label for="company">会社名</label>
                    <p>{{ currentInquiry.company }}</p>
                </div>

                <div class="info-item">
                    <label for="name">氏名</label>
                    <p>{{ currentInquiry.name }}</p>
                </div>

                <div class="info-item">
                    <label for="tel">電話番号</label>
                    <p>{{ currentInquiry.tel }}</p>
                </div>

                <div class="info-item">
                    <label for="email">メールアドレス</label>
                    <p>{{ currentInquiry.email }}</p>
                </div>

                <div class="info-item">
                    <label for="birthday">生年月日</label>
                    <p>{{ currentInquiry.birthday }}</p>
                </div>

                <div class="info-item">
                    <label for="gender">性別</label>
                    <p>{{ inquiryStore.getGenderText(currentInquiry.gender) }}</p>
                </div>
                <div class="info-item">
                    <label for="profession">職業</label>
                    <p>{{ inquiryStore.getProfessionText(currentInquiry.profession) }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useInquiryStore } from "../store/inquiry";
import { useDashboardStore } from "../store/dashboard";

export default {
    setup() {
        const route = useRoute();
        const router = useRouter();
        const inquiryStore = useInquiryStore();
        const dashboardStore = useDashboardStore();
        const successMessage = ref('');
        const currentInquiry = ref(null);

        const fetchInquiryData = async () => {
            const id = parseInt(route.params.id);
            let inquiryData = inquiryStore.getCurrentInquiry(id);
            if (!inquiryData) {
                await inquiryStore.fetchInquiries(true);
                inquiryData = inquiryStore.getCurrentInquiry(id);
            }
            if (inquiryData) {
                currentInquiry.value = { ...inquiryData, statusText: inquiryStore.getStatusText(inquiryData.status) };
            } else {
                console.error('お問い合わせが見つかりません');
                router.push({ name: 'inquiry.list' });
            }
        };

        const updateInquiry = async () => {
            try {
                const message = await inquiryStore.updateInquiry(currentInquiry.value.id, currentInquiry.value);
                successMessage.value = message;

                await dashboardStore.fetchUnresolvedInquiries();
                await inquiryStore.fetchInquiries(true);

                router.push({
                    path: '/inquiry/list',
                    query: { success: 'お問い合わせが更新されました' }
                });
            } catch (error) {
                console.error('お問い合わせの更新中にエラーが発生しました:', error);
            }
        };

        onMounted(async () => {
            if (!inquiryStore.isFormDataLoaded) {
                await inquiryStore.fetchFormData();
            }
            await fetchInquiryData();
        });

        watch(() => route.params.id, fetchInquiryData);

        return {
            inquiryStore,
            currentInquiry,
            successMessage,
            updateInquiry
        };
    }
}
</script>