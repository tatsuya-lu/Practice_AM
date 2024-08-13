<template>
    <div>
        <div class="form-title">
            <p class="page-title">お問い合わせ編集</p>
        </div>

        <div v-if="successMessage" class="success">
            {{ successMessage }}
        </div>

        <div v-if="inquiryStore.isLoading" class="loading">
            データを読み込んでいます...
        </div>

        <div v-else-if="inquiryStore.error" class="error">
            エラーが発生しました: {{ inquiryStore.error }}
        </div>

        <div v-else-if="inquiryStore.currentInquiry" class="inquiry-edit-container">
            <div class="inquiry-form-content">
                <form @submit.prevent="updateInquiry">
                    <div class="form-item">
                        <label for="status">ステータス</label>
                        <select v-model="inquiryStore.currentInquiry.status" id="status"
                            class="form-item-input minimal">
                            <option v-for="(label, key) in inquiryStore.statusOptions" :key="key" :value="key">
                                {{ label }}
                            </option>
                        </select>
                    </div>

                    <div class="form-item">
                        <label for="body">お問い合わせ内容</label>
                        <p class="form-item-input form-item-textarea">{{ inquiryStore.currentInquiry.body }}</p>
                    </div>

                    <div class="form-item">
                        <label for="comment">備考欄</label>
                        <textarea v-model="inquiryStore.currentInquiry.comment" id="comment"
                            class="form-item-input form-item-textarea"></textarea>
                    </div>

                    <button type="submit" class="form-btn">更新する</button>
                </form>
            </div>

            <div class="inquiry-info-content">
                <p class="sub-title">お問い合わせ情報</p>

                <div class="info-item">
                    <label for="company">会社名</label>
                    <p>{{ inquiryStore.currentInquiry.company }}</p>
                </div>

                <div class="info-item">
                    <label for="name">氏名</label>
                    <p>{{ inquiryStore.currentInquiry.name }}</p>
                </div>

                <div class="info-item">
                    <label for="tel">電話番号</label>
                    <p>{{ inquiryStore.currentInquiry.tel }}</p>
                </div>

                <div class="info-item">
                    <label for="email">メールアドレス</label>
                    <p>{{ inquiryStore.currentInquiry.email }}</p>
                </div>

                <div class="info-item">
                    <label for="birthday">生年月日</label>
                    <p>{{ inquiryStore.currentInquiry.birthday }}</p>
                </div>

                <div class="info-item">
                    <label for="gender">性別</label>
                    <p>{{ inquiryStore.currentInquiry.gender }}</p>
                </div>

                <div class="info-item">
                    <label for="profession">職業</label>
                    <p>{{ inquiryStore.currentInquiry.profession }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
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

        const updateInquiry = async () => {
            try {
                const message = await inquiryStore.updateInquiry(route.params.id, inquiryStore.currentInquiry);
                successMessage.value = message;

                // ダッシュボードストアを更新
                await dashboardStore.fetchUnresolvedInquiries();

                router.push({ path: '/inquiry/list', query: { success: 'お問い合わせが更新されました' } });
            } catch (error) {
                console.error('Error updating inquiry:', error);
            }
        };

        onMounted(async () => {
            await inquiryStore.fetchInquiry(route.params.id);
        });

        onUnmounted(() => {
            inquiryStore.clearCurrentInquiry();
        });

        return {
            inquiryStore,
            successMessage,
            updateInquiry
        };
    }
}
</script>

<style scoped>
/* ここにコンポーネント固有のスタイルを追加 */
</style>