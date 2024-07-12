<template>
    <div class="login-container">
        <form @submit.prevent="handleLogin">
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
import axios from 'axios';

export default {
    data() {
        return {
            email: '',
            password: '',
            errors: {}
        }
    },
    methods: {
        async handleLogin() {
            try {
                const response = await axios.post('/api/login', {
                    email: this.email,
                    password: this.password
                });
                localStorage.setItem('authToken', response.data.token);
                this.$router.push('/account/dashboard');
            } catch (error) {
                if (error.response && error.response.data) {
                    this.errors = error.response.data.errors || {};
                    this.errors.error = error.response.data.message;
                } else {
                    console.error('Login error: ', error);
                }
            }
        }
    }
}
</script>

<style scoped>
.login-container {
    /* Login.blade.phpと同じスタイルを適用 */
}
</style>
