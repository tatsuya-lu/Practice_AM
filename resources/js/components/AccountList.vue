<template>
  <div>
    <p class="page-title">アカウント一覧</p>

    <div class="search-form-container">
      <div class="search-form">
        <form @submit.prevent="searchUsers">
          <div class="search-form-item">
            <input type="search" v-model="searchName" placeholder="名前を入力" aria-label="名前を検索...">
          </div>

          <div class="search-form-item">
            <select class="minimal" v-model="searchAdminLevel">
              <option value="">アカウントの種類を選択</option>
              <option value="1">管理者</option>
              <option value="2">社員</option>
            </select>
          </div>

          <div class="search-form-item">
            <input type="search" v-model="searchEmail" placeholder="メールアドレスを入力" aria-label="メールアドレスを検索...">
          </div>

          <div class="search-form-item">
            <button type="submit" class="btn btn-primary">検索</button>
          </div>
        </form>
      </div>

      <div class="search-form-item">
        <button @click="sortUsers('newest')" class="btn btn-primary">新しい順</button>
        <button @click="sortUsers('oldest')" class="btn btn-primary">古い順</button>
      </div>

      <div class="new-register-btn">
        <router-link to="/account/register" class="btn btn-primary">
          <span class="fa-solid fa-circle-plus"></span> 新規作成
        </router-link>
      </div>
    </div>

    <div v-if="registeredMessage" class="success">
      {{ registeredMessage }} {{ registeredEmail }}
    </div>

    <div v-if="successMessage" class="success">
      {{ successMessage }}
    </div>

    <div v-if="currentPageUsers.length > 0" class="table-responsive">
      <table>
        <thead>
          <tr>
            <th>編集</th>
            <th>削除</th>
            <th>名前</th>
            <th>アカウントの種類</th>
            <th>メールアドレス</th>
            <th>電話番号</th>
            <th>都道府県</th>
            <th>市町村</th>
            <th>番地・アパート名</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in currentPageUsers" :key="user.id">
            <td class="table-text-center">
              <router-link :to="{ name: 'account.edit', params: { id: user.id } }" class="icon-btn edit-icon">
                <span class="fa-solid fa-pen-to-square"></span>
              </router-link>
            </td>
            <td class="table-text-center">
              <button @click="deleteUser(user.id)" class="icon-btn delete-icon">
                <span class="fa-solid fa-trash-can"></span>
              </button>
            </td>
            <td>{{ user.name }}</td>
            <td>{{ userStore.getAdminLevelLabel(user.admin_level) }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.tel }}</td>
            <td>{{ userStore.getPrefectureLabel(user.prefecture) }}</td>
            <td>{{ user.city }}</td>
            <td>{{ user.street }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      ユーザ情報を読み込んでいます。
    </div>
    <div class="pagination">
      <button @click="changePage(1)" :disabled="userStore.currentPage === 1" class="pagination-button">
        &laquo;
      </button>
      <button @click="changePage(userStore.currentPage - 1)" :disabled="userStore.currentPage === 1"
        class="pagination-button">
        &lsaquo;
      </button>
      <template v-for="page in displayedPages" :key="page">
        <button v-if="page !== '...'" @click="changePage(page)"
          :class="['pagination-button', { 'active': page === userStore.currentPage }]">
          {{ page }}
        </button>
        <span v-else class="pagination-ellipsis">{{ page }}</span>
      </template>
      <button @click="changePage(userStore.currentPage + 1)" :disabled="userStore.currentPage === userStore.totalPages"
        class="pagination-button">
        &rsaquo;
      </button>
      <button @click="changePage(userStore.totalPages)" :disabled="userStore.currentPage === userStore.totalPages"
        class="pagination-button">
        &raquo;
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../store/user'
import axios from 'axios'

export default {
  setup() {
    const router = useRouter()
    const route = useRoute()
    const userStore = useUserStore()
    const successMessage = ref('')
    const registeredMessage = ref('')
    const registeredEmail = ref('')
    const searchName = ref('')
    const searchAdminLevel = ref('')
    const searchEmail = ref('')
    const adminLevels = ref({})
    const prefectures = ref({})
    const sortType = ref('newest')

    const users = computed(() => userStore.getUsers)
    const currentPageUsers = computed(() => userStore.getCurrentPageUsers)

    const displayedPages = computed(() => {
      const currentPage = userStore.currentPage;
      const totalPages = userStore.totalPages;
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
      await userStore.changePage(page, {
        search_name: searchName.value,
        search_admin_level: searchAdminLevel.value,
        search_email: searchEmail.value,
        sort: sortType.value
      });
    };

    const fetchUsers = async () => {
      await userStore.fetchUsers(true, {
        search_name: searchName.value,
        search_admin_level: searchAdminLevel.value,
        search_email: searchEmail.value,
        sort: sortType.value
      })
    }

    const sortUsers = async (newSortType) => {
      sortType.value = newSortType;
      userStore.currentPage = 1;
      await fetchUsers();
    };

    const searchUsers = async () => {
      userStore.currentPage = 1;
      await fetchUsers();
    };

    const deleteUser = async (userId) => {
      if (confirm('削除します。よろしいですか？')) {
        try {
          await axios.delete(`/api/account/${userId}`);
          userStore.removeUser(userId);
          successMessage.value = 'ユーザーが削除されました';
          await fetchUsers(true);
        } catch (error) {
          console.error('Error deleting user:', error);
          alert('ユーザーの削除中にエラーが発生しました。');
        }
      }
    };

    onMounted(async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

      successMessage.value = route.query.success || '';
      registeredMessage.value = route.query.registered_message || '';
      registeredEmail.value = route.query.registered_email || '';
      router.replace({ query: {} })

      await userStore.fetchMappings(true)
      await fetchUsers()
    })

    watch(() => route.fullPath, async () => {
      if (route.name === 'account.list') {
        await fetchUsers()
      }
    })

    return {
      currentPageUsers,
      users,
      fetchUsers,
      displayedPages,
      successMessage,
      registeredMessage,
      registeredEmail,
      searchName,
      searchAdminLevel,
      searchEmail,
      sortUsers,
      searchUsers,
      deleteUser,
      userStore,
      changePage,
    }
  }
}
</script>