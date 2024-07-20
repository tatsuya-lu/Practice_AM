<template>
    <div class="login-container">
        <form @submit.prevent="login">
            <div>
                <label for="email">メールアドレス</label>
                <input type="text" id="email" v-model="email">
                <p v-if="errors.email" class="error-message">{{ errors.email[0] }}</p>
            </div>

            <div>
                <label for="password">パスワード</label>
                <input type="password" id="password" v-model="password">
                <p v-if="errors.password" class="error-message">{{ errors.password[0] }}</p>
            </div>

            <p v-if="errors.error" class="error-message">{{ errors.error }}</p>

            <button type="submit">ログイン</button>
        </form>
    </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

export default {
    setup() {
        const email = ref('');
        const password = ref('');
        const errors = ref({});
        const router = useRouter();

        const login = async () => {
            try {
                // CSRFトークンを取得
                await axios.get('/sanctum/csrf-cookie');

                // ログイン処理
                const response = await axios.post('/api/login', {
                    email: email.value,
                    password: password.value
                });

                console.log(response.data);
                localStorage.setItem('token', response.data.token);
                router.push('/dashboard');
            } catch (error) {
                console.error('Login error:', error.response ? error.response.data : error);
                errors.value = error.response && error.response.data
                    ? error.response.data.errors || { error: error.response.data.message }
                    : { error: 'ログインに失敗しました。' };
            }
        };

        return {
            email,
            password,
            errors,
            login
        };
    }
}
</script>

<style scoped>
.login-container {
    /* スタイルをここに追加 */
}
</style>