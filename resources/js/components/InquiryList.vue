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
                    <tr v-for="inquiry in currentPageInquiries" :key="inquiry.id">
                        <td class="table-text-center">
                            <router-link :to="{ name: 'inquiry.edit', params: { id: inquiry.id } }"
                                class="icon-btn edit-icon">
                                <span class="fa-solid fa-pen-to-square"></span>
                            </router-link>
                        </td>
                        <td>{{ inquiryStore.getStatusText(inquiry.status) }}</td>
                        <td>{{ inquiry.company }}</td>
                        <td>{{ inquiry.name }}</td>
                        <td>{{ inquiry.tel }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="pagination">
            <button @click="changePage(1)" :disabled="inquiryStore.currentPage === 1" class="pagination-button">
                &laquo;
            </button>
            <button @click="changePage(inquiryStore.currentPage - 1)" :disabled="inquiryStore.currentPage === 1"
                class="pagination-button">
                &lsaquo;
            </button>
            <template v-for="page in displayedPages" :key="page">
                <button v-if="page !== '...'" @click="changePage(page)"
                    :class="['pagination-button', { 'active': page === inquiryStore.currentPage }]">
                    {{ page }}
                </button>
                <span v-else class="pagination-ellipsis">{{ page }}</span>
            </template>
            <button @click="changePage(inquiryStore.currentPage + 1)"
                :disabled="inquiryStore.currentPage === inquiryStore.totalPages" class="pagination-button">
                &rsaquo;
            </button>
            <button @click="changePage(inquiryStore.totalPages)"
                :disabled="inquiryStore.currentPage === inquiryStore.totalPages" class="pagination-button">
                &raquo;
            </button>
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

        const currentPageInquiries = computed(() => inquiryStore.getCurrentPageInquiries);

        const fetchInquiries = async () => {
            await inquiryStore.fetchInquiries(true, {
                search_status: searchStatus.value,
                search_company: searchCompany.value,
                search_tel: searchTel.value,
                sort: sortType.value
            });
        };

        const sortInquiries = async (newSortType) => {
            sortType.value = newSortType;
            inquiryStore.currentPage = 1;
            await fetchInquiries();
        };

        const searchInquiries = () => {
            inquiryStore.currentPage = 1;
            fetchInquiries();
        };

        const displayedPages = computed(() => {
            const currentPage = inquiryStore.currentPage;
            const totalPages = inquiryStore.totalPages;
            const delta = 2;

            let range = [];
            for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
                range.push(i);
            }

            if (currentPage - delta > 2) range.unshift("...");
            if (currentPage + delta < totalPages - 1) range.push("...");

            range.unshift(1);
            if (totalPages > 1) range.push(totalPages);

            return range;
        });

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
            currentPageInquiries,
            displayedPages,
            successMessage,
            searchStatus,
            searchCompany,
            searchTel,
            sortInquiries,
            searchInquiries,
            inquiryStore,
            changePage,
            sortType,
        };
    }
}
</script>