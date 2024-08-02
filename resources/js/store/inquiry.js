import { defineStore } from "pinia";
import axios from 'axios';

export const useInquiryStore = defineStore("inquiry", {
    state: () => ({
        inquiries: [],
        isLoaded: false,
    }),
    actions: {
        async fetchInquiries(params = {}) {
            try {
                const response = await axios.get('/api/inquiries', { params });
                this.inquiries = response.data.inquiries.data;
                this.isLoaded = true;
            } catch (error) {
                console.error('Error fetching inquiries:', error);
            }
        },
        setInquiries(inquiries) {
            this.inquiries = inquiries;
            this.isLoaded = true;
        },
        clearInquiries() {
            this.inquiries = [];
            this.isLoaded = false;
        },
    },
    getters: {
        getInquiries: (state) => state.inquiries,
    },
});