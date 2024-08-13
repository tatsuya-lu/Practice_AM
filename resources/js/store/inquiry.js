import { defineStore } from "pinia";
import axios from 'axios';

export const useInquiryStore = defineStore("inquiry", {
    state: () => ({
        inquiries: [],
        currentInquiry: {},
        statusOptions: {},
        isLoaded: false,
        isLoading: false,
        error: null,
    }),
    actions: {
        async fetchInquiries(params = {}) {
            this.isLoading = true;
            try {
                const response = await axios.get('/api/inquiries', { params });
                this.inquiries = response.data.inquiries.data;
                this.isLoaded = true;
            } catch (error) {
                console.error('Error fetching inquiries:', error);
                this.error = error.message;
            } finally {
                this.isLoading = false;
            }
        },
        async fetchInquiry(id) {
            this.isLoading = true;
            try {
                const response = await axios.get(`/api/inquiries/${id}`);
                this.currentInquiry = response.data.inquiry;
                this.statusOptions = response.data.statusOptions;
            } catch (error) {
                console.error('Error fetching inquiry:', error);
                this.error = error.message;
            } finally {
                this.isLoading = false;
            }
        },
        async updateInquiry(id, data) {
            this.isLoading = true;
            try {
                const response = await axios.put(`/api/inquiries/${id}`, data);
                this.currentInquiry = response.data.inquiry;
                return response.data.message;
            } catch (error) {
                console.error('Error updating inquiry:', error);
                this.error = error.message;
                throw error;
            } finally {
                this.isLoading = false;
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
        clearCurrentInquiry() {
            this.currentInquiry = null;
            this.error = null;
        },
    },
    getters: {
        getInquiries: (state) => state.inquiries,
        getCurrentInquiry: (state) => state.currentInquiry,
    },
});