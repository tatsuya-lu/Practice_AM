import { defineStore } from "pinia";
import axios from "axios";

export const useInquiryStore = defineStore("inquiry", {
    state: () => ({
        inquiries: {},
        statusOptions: {},
        isLoaded: false,
        isLoading: false,
        error: null,
        currentPage: 1,
        totalPages: 1,
        perPage: 20,
    }),
    actions: {
        async fetchStatusOptions() {
            if (Object.keys(this.statusOptions).length > 0) return;
            try {
                const response = await axios.get(
                    "/api/inquiries/status-options"
                );
                this.statusOptions = response.data.statusOptions;
            } catch (error) {
                console.error("Error fetching status options:", error);
            }
        },
        async fetchInquiries(params = {}) {
            if (this.isLoaded && Object.keys(this.inquiries).length > 0) {
                return;
            }
            try {
                const response = await axios.get("/api/inquiries", {
                    params: {
                        ...params,
                        page: this.currentPage,
                        per_page: this.perPage,
                    }
                });
                this.inquiries = response.data.inquiries.data.reduce(
                    (acc, inquiry) => {
                        acc[inquiry.id] = inquiry;
                        return acc;
                    },
                    {}
                );
                this.statusOptions = response.data.statusOptions;
                this.currentPage = response.data.inquiries.current_page;
                this.totalPages = response.data.inquiries.last_page;
                this.isLoaded = true;
            } catch (error) {
                console.error("Error fetching inquiries:", error);
                this.error = error.message;
            }
        },
        async changePage(page, params = {}) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
                await this.fetchInquiries(params);
            }
        },
        async fetchInquiry(id) {
            this.isLoading = true;
            try {
                const response = await axios.get(`/api/inquiries/${id}`);
                this.inquiries[id] = response.data.inquiry;
                this.statusOptions = response.data.statusOptions;
            } catch (error) {
                console.error("Error fetching inquiry:", error);
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
                console.error("Error updating inquiry:", error);
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
        getInquiries: (state) => Object.values(state.inquiries),
        getStatusText: (state) => (statusCode) =>
            state.statusOptions[statusCode] || statusCode,
        getCurrentInquiry: (state) => (id) => state.inquiries[id],
    },
});
