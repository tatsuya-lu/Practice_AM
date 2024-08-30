<template>
    <div>
        <h1 class="page-title">お問い合わせ一覧</h1>

        <div class="search-form-container">
            <div class="search-form">
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
                        <button type="submit" class="btn btn-primary">検索</button>
                    </div>
                </form>
            </div>

            <div class="search-form-item">
                <button @click="sortInquiries('newest')" class="btn btn-primary">新しい順</button>
                <button @click="sortInquiries('oldest')" class="btn btn-primary">古い順</button>
            </div>
        </div>

        <div v-if="successMessage" class="success">
            {{ successMessage }}
        </div>

        <div class="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th>編集</th>
                        <th>ステータス</th>
                        <th>会社名</th>
                        <th>氏名</th>
                        <th>電話番号</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="inquiry in inquiries" :key="inquiry.id">
                        <td class="table-text-center">
                            <router-link :to="{ name: 'inquiry.edit', params: { id: inquiry.id } }"
                                class="icon-btn edit-icon">
                                <span class="fa-solid fa-pen-to-square"></span>
                            </router-link>
                        </td>
                        <td>{{ inquiry.statusText }}</td>
                        <td>{{ inquiry.company }}</td>
                        <td>{{ inquiry.name }}</td>
                        <td>{{ inquiry.tel }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="pagination">
            <button @click="changePage(inquiryStore.currentPage - 1)"
                :disabled="inquiryStore.currentPage === 1">前へ</button>
            <span>{{ inquiryStore.currentPage }} / {{ inquiryStore.totalPages }}</span>
            <button @click="changePage(inquiryStore.currentPage + 1)"
                :disabled="inquiryStore.currentPage === inquiryStore.totalPages">次へ</button>
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
        const sortType = ref('newest');

        const inquiries = computed(() => inquiryStore.getInquiries);

        const fetchInquiries = async () => {
            await inquiryStore.fetchInquiries({
                search_status: searchStatus.value,
                search_company: searchCompany.value,
                search_tel: searchTel.value,
                sort: sortType.value,
                page: inquiryStore.currentPage
            });
        };

        const sortInquiries = async (newSortType) => {
            sortType.value = newSortType;
            await fetchInquiries();
        };

        const searchInquiries = () => {
            inquiryStore.currentPage = 1;
            fetchInquiries();
        };

        const changePage = async (page) => {
            await inquiryStore.changePage(page, {
                search_status: searchStatus.value,
                search_company: searchCompany.value,
                search_tel: searchTel.value,
                sort: sortType.value
            });
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
            changePage,
        };
    }
}
</script>