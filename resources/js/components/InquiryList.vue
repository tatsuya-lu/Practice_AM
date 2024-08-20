<template>
    <div>
        <div class="table-title">
            <p class="page-title">お問い合わせ一覧</p>

            <div class="search-form">
                <div class="search-form-item">
                    <button @click="sortInquiries('newest')" class="sort-btn">新しい順</button>
                </div>

                <div class="search-form-item">
                    <button @click="sortInquiries('oldest')" class="sort-btn">古い順</button>
                </div>
                <form @submit.prevent="searchInquiries">
                    <div class="search-form-item">
                        <select class="minimal" v-model="searchStatus">
                            <option value="">ステータスを選択</option>
                            <option value="default">未対応</option>
                            <option value="checking">対応中</option>
                            <option value="checked">対応済み</option>
                        </select>
                    </div>

                    <div class="search-form-item">
                        <input type="search" v-model="searchCompany" placeholder="会社名を入力" aria-label="会社名検索">
                    </div>

                    <div class="search-form-item">
                        <input type="search" v-model="searchTel" placeholder="電話番号を入力" aria-label="電話番号検索">
                    </div>

                    <div class="search-form-item">
                        <input type="submit" value="検索">
                    </div>
                </form>
            </div>
        </div>

        <div v-if="successMessage" class="success">
            {{ successMessage }}
        </div>

        <div class="table-container">
            <table>
                <tr>
                    <th>編集</th>
                    <th>ステータス</th>
                    <th>会社名</th>
                    <th>氏名</th>
                    <th>電話番号</th>
                </tr>
                <tr v-for="inquiry in inquiries" :key="inquiry.id">
                    <td class="table-text-center">
                        <router-link :to="{ name: 'inquiry.edit', params: { id: inquiry.id } }">
                            <span class="fa-solid fa-pen-to-square"></span>
                        </router-link>
                    </td>
                    <td>{{ inquiry.statusText }}</td>
                    <td>{{ inquiry.company }}</td>
                    <td>{{ inquiry.name }}</td>
                    <td>{{ inquiry.tel }}</td>
                </tr>
            </table>
        </div>
        <div class="pagenation">
            <!-- ページネーションコンポーネントをここに追加 -->
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useInquiryStore } from '../store/inquiry';
import { useAuthStore } from '../store/auth';

export default {
    setup() {
        const route = useRoute();
        const router = useRouter();
        const inquiryStore = useInquiryStore();
        const authStore = useAuthStore();
        const successMessage = ref('');
        const searchStatus = ref('');
        const searchCompany = ref('');
        const searchTel = ref('');

        const inquiries = computed(() => inquiryStore.getInquiries);

        const fetchInquiries = async () => {
            await inquiryStore.fetchInquiries({
                search_status: searchStatus.value,
                search_company: searchCompany.value,
                search_tel: searchTel.value
            });
        };

        const sortInquiries = async (sortType) => {
            await inquiryStore.fetchInquiries({
                sort: sortType,
                search_status: searchStatus.value,
                search_company: searchCompany.value,
                search_tel: searchTel.value
            });
        };

        const searchInquiries = () => {
            fetchInquiries();
        };

        onMounted(async () => {
            if (route.query.success) {
                successMessage.value = route.query.success;
                router.replace({ query: {} });
            }
            await authStore.ensureAuthenticated();
            await fetchInquiries();
        });

        watch(() => route.fullPath, () => {
            if (route.name === 'inquiry.list') {
                fetchInquiries();
            }
        });

        return {
            inquiries,
            successMessage,
            searchStatus,
            searchCompany,
            searchTel,
            sortInquiries,
            searchInquiries,
            inquiryStore,
        };
    }
}
</script>