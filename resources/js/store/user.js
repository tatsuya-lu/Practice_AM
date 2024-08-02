import { defineStore } from "pinia";
import axios from 'axios';

export const useUserStore = defineStore("user", {
    state: () => ({
        users: [],
        isLoaded: false,
    }),
    actions: {
        async fetchUsers() {
            if (this.isLoaded) return;
            try {
                const response = await axios.get('/api/account/list');
                this.users = response.data.data || response.data;
                this.isLoaded = true;
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        },
        setUsers(users) {
            this.users = users;
            this.isLoaded = true;
        },
        clearUsers() {
            this.users = [];
            this.isLoaded = false;
        },
    },
    getters: {
        getUsers: (state) => state.users,
    },
});