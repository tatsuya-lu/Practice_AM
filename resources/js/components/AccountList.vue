<template>
  <div>
    <p class="page-title">アカウント一覧</p>

    <div class="search-form-container">
      <div class="search-form">
        <div class="search-form-item">
          <button @click="sortUsers('newest')" class="sort-btn">新しい順</button>
        </div>

        <div class="search-form-item">
          <button @click="sortUsers('oldest')" class="sort-btn">古い順</button>
        </div>
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
            <input type="submit" value="検索">
          </div>
        </form>
      </div>

      <div class="new-register-btn">
        <router-link to="/account/register"><button><span
              class="fa-solid fa-circle-plus"></span>新規作成</button></router-link>
      </div>
    </div>

    <div v-if="registeredMessage" class="success">
      {{ registeredMessage }} {{ registeredEmail }}
    </div>

    <div v-if="successMessage" class="success">
      {{ successMessage }}
    </div>

    <div class="table-container">
      <table>
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
        <tr v-for="user in users" :key="user.id">
          <td class="table-text-center">
            <router-link :to="{ name: 'account.edit', params: { id: user.id } }">
              <span class="fa-solid fa-pen-to-square"></span>
            </router-link>
          </td>
          <td class="table-text-center">
            <button @click="deleteUser(user.id)">
              <span class="fa-solid fa-trash-can"></span>
            </button>
          </td>
          <td>{{ user.name }}</td>
          <td>{{ user.admin_level }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.tel }}</td>
          <td>{{ user.prefecture }}</td>
          <td>{{ user.city }}</td>
          <td>{{ user.street }}</td>
        </tr>
      </table>
    </div>
    <div class="pagenation">
      <!-- ページネーションコンポーネントをここに追加 -->
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'

export default {
  setup() {
    const users = ref([])
    const registeredMessage = ref('')
    const registeredEmail = ref('')
    const successMessage = ref('')
    const searchName = ref('')
    const searchAdminLevel = ref('')
    const searchEmail = ref('')

    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/account/list', {
          params: {
            search_name: searchName.value,
            search_admin_level: searchAdminLevel.value,
            search_email: searchEmail.value
          }
        })
        users.value = response.data
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    const sortUsers = async (sortType) => {
      try {
        const response = await axios.get('/api/users', {
          params: {
            sort: sortType,
            search_name: searchName.value,
            search_admin_level: searchAdminLevel.value,
            search_email: searchEmail.value
          }
        })
        users.value = response.data.users
      } catch (error) {
        console.error('Error sorting users:', error)
      }
    }

    const searchUsers = () => {
      fetchUsers()
    }

    const deleteUser = async (userId) => {
      if (confirm('削除します。よろしいですか？')) {
        try {
          await axios.delete(`/account/${userId}`)
          successMessage.value = 'ユーザーが削除されました'
          fetchUsers()
        } catch (error) {
          console.error('Error deleting user:', error)
        }
      }
    }

    onMounted(() => {
      fetchUsers()
    })

    return {
      users,
      registeredMessage,
      registeredEmail,
      successMessage,
      searchName,
      searchAdminLevel,
      searchEmail,
      sortUsers,
      searchUsers,
      deleteUser
    }
  }
}
</script>