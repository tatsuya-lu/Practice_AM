<template>
    <div>
        <p class="page-title">
            {{ user.id ? 'アカウント編集' : 'アカウント登録' }}
        </p>

        <div class="register-form-container">
            <form @submit.prevent="submitForm" enctype="multipart/form-data">
                <div class="form-item">
                    <label><span class="required">必須</span>会員名</label>
                    <input class="form-item-input" type="text" id="name" v-model="user.name" placeholder="例）山田太郎">
                    <p v-if="errors.name" class="error-message">{{ errors.name[0] }}</p>
                </div>

                <div class="form-item">
                    <label><span class="required">必須</span>フリガナ</label>
                    <input class="form-item-input" type="text" id="sub_name" v-model="user.sub_name"
                        placeholder="例）ヤマダタロウ">
                    <p v-if="errors.sub_name" class="error-message">{{ errors.sub_name[0] }}</p>
                </div>

                <div class="form-item">
                    <label><span class="required">必須</span>メールアドレス</label>
                    <input class="form-item-input" type="text" id="email" v-model="user.email"
                        placeholder="例）example@gmail.com">
                    <p v-if="errors.email" class="error-message">{{ errors.email[0] }}</p>
                </div>

                <div class="form-item">
                    <label><span class="required">必須</span>パスワード</label>
                    <input class="form-item-input" type="password" id="password" v-model="user.password"
                        placeholder="八文字以上で入力してください。" autocomplete="new-password">
                    <p v-if="errors.password" class="error-message">{{ errors.password[0] }}</p>
                </div>

                <div class="form-item">
                    <label><span class="required">必須</span>パスワード(再入力)</label>
                    <input class="form-item-input" type="password" id="password_confirmation"
                        v-model="user.password_confirmation" placeholder="パスワードを再入力してください。">
                </div>

                <div class="form-item">
                    <label><span class="required">必須</span>電話番号</label>
                    <input class="form-item-input" type="text" id="tel" v-model="user.tel"
                        placeholder="例）000 0000 0000   注:ハイフン無しで入力してください">
                    <p v-if="errors.tel" class="error-message">{{ errors.tel[0] }}</p>
                </div>

                <div class="form-item">
                    <label><span class="required">必須</span>郵便番号</label>
                    <input class="form-item-input" type="text" id="post_code" v-model="user.post_code"
                        placeholder="例）000 0000   注:ハイフン無しで入力してください">
                    <p v-if="errors.post_code" class="error-message">{{ errors.post_code[0] }}</p>
                </div>

                <div class="form-item">
                    <label><span class="required">必須</span>都道府県</label>
                    <select class="form-item-input minimal" v-model="user.prefecture">
                        <option value="" disabled>都道府県を選択してください</option>
                        <option v-for="(value, key) in prefectures" :key="key" :value="key">{{ value }}</option>
                    </select>
                    <p v-if="errors.prefecture" class="error-message">{{ errors.prefecture[0] }}</p>
                </div>

                <div class="form-item">
                    <label><span class="required">必須</span>市町村</label>
                    <input class="form-item-input" type="text" id="city" v-model="user.city" placeholder="">
                    <p v-if="errors.city" class="error-message">{{ errors.city[0] }}</p>
                </div>

                <div class="form-item">
                    <label><span class="required">必須</span>番地・アパート名</label>
                    <input class="form-item-input" type="text" id="street" v-model="user.street" placeholder="">
                    <p v-if="errors.street" class="error-message">{{ errors.street[0] }}</p>
                </div>

                <div class="form-item">
                    <label>備考欄</label>
                    <textarea class="form-item-input" v-model="user.comment"></textarea>
                    <p v-if="errors.comment" class="error-message">{{ errors.comment[0] }}</p>
                </div>

                <div v-if="user.id">
                    <label for="profile_image">プロフィール画像:</label>
                    <input type="file" name="profile_image" id="profile_image" @change="handleFileUpload">
                    <img v-if="user.profile_image" :src="'/images/profile/' + user.profile_image" alt="プロフィール画像"
                        style="width: 200px; height: 200px; border-radius: 50%; object-fit: cover;">
                    <img v-else src="/images/noimage.png" alt="プロフィール画像"
                        style="width: 200px; height: 200px; border-radius: 50%; object-fit: cover;">
                </div>

                <div class="form-item">
                    <label><span class="required">必須</span>アカウントの種類</label>
                    <select class="form-item-input minimal" v-model="user.admin_level">
                        <option value="" disabled>アカウントの種類を選択してください</option>
                        <option v-for="(value, key) in adminLevels" :key="key" :value="key">{{ value }}</option>
                    </select>
                    <p v-if="errors.admin_level" class="error-message">{{ errors.admin_level[0] }}</p>
                </div>

                <button type="submit" class="form-btn">{{ user.id ? '更新する' : '確認する' }}</button>
            </form>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'

export default {
    setup() {
        const route = useRoute()
        const router = useRouter()
        const user = ref({})
        const prefectures = ref({})
        const adminLevels = ref({})
        const errors = ref({})

        const fetchUserData = async () => {
            if (route.params.id) {
                try {
                    const response = await axios.get(`/account/${route.params.id}/edit`)
                    user.value = response.data.user
                    prefectures.value = response.data.prefectures
                    adminLevels.value = response.data.adminLevels
                } catch (error) {
                    console.error('Error fetching user data:', error)
                }
            } else {
                try {
                    const response = await axios.get('/account/register')
                    prefectures.value = response.data.prefectures
                    adminLevels.value = response.data.adminLevels
                } catch (error) {
                    console.error('Error fetching form data:', error)
                }
            }
        }

        const fetchFormData = async () => {
            try {
                const response = await axios.get('/api/form-data')
                prefectures.value = response.data.prefectures
                adminLevels.value = response.data.adminLevels
            } catch (error) {
                console.error('Error fetching form data:', error)
            }
        }

        const handleFileUpload = (event) => {
            user.value.profile_image = event.target.files[0]
        }

        const submitForm = async () => {
            try {
                const formData = new FormData()
                for (const key in user.value) {
                    formData.append(key, user.value[key])
                }

                if (user.value.id) {
                    await axios.put(`/account/${user.value.id}`, formData)
                    router.push({ name: 'account.list', query: { success: 'アカウントが更新されました' } })
                } else {
                    await axios.post('/account/register', formData)
                    router.push({ name: 'account.list', query: { success: 'アカウントが登録されました' } })
                }
            } catch (error) {
                if (error.response && error.response.data && error.response.data.errors) {
                    errors.value = error.response.data.errors
                } else {
                    console.error('Error submitting form:', error)
                }
            }
        }

        onMounted(() => {
            fetchUserData()
        })

        return {
            user,
            prefectures,
            adminLevels,
            errors,
            submitForm,
            handleFileUpload
        }
    }
}
</script>