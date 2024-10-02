import { defineStore } from "pinia";
import axios from "axios";

export const useInquiryStore = defineStore("inquiry", {
    state: () => ({
        inquiries: [],
        statusOptions: {},
        isLoaded: false,
        isLoading: false,
        error: null,
        currentPage: 1,
        totalPages: 1,
        perPage: 20,
        cachedParams: {},
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
        async fetchInquiries(forceRefresh = false, params = {}) {
            const pageKey = `${this.currentPage}-${JSON.stringify(params)}`;
            if (!forceRefresh && this.inquiries[pageKey]) {
                return;
            }

            this.isLoading = true;
            try {
                const response = await axios.get("/api/inquiries", {
                    params: {
                        ...params,
                        page: this.currentPage,
                        per_page: this.perPage,
                    },
                });
                this.inquiries[pageKey] = response.data.inquiries.data;
                this.statusOptions = response.data.statusOptions;
                this.currentPage = response.data.inquiries.current_page;
                this.totalPages = response.data.inquiries.last_page;
                this.isLoaded = true;
                this.cachedParams = params;

                this.prefetchAdjacentPages(params);
            } catch (error) {
                console.error("Error fetching inquiries:", error);
                this.error = error.message;
            } finally {
                this.isLoading = false;
            }
        },
        async prefetchAdjacentPages(params) {
            const adjacentPages = [this.currentPage - 1, this.currentPage + 1];
            adjacentPages.forEach(async (page) => {
                if (page > 0 && page <= this.totalPages) {
                    const pageKey = `${page}-${JSON.stringify(params)}`;
                    if (!this.inquiries[pageKey]) {
                        try {
                            const response = await axios.get("/api/inquiries", {
                                params: {
                                    ...params,
                                    page: page,
                                    per_page: this.perPage,
                                },
                            });
                            this.inquiries[pageKey] =
                                response.data.inquiries.data;
                        } catch (error) {
                            console.error(
                                `Error prefetching page ${page}:`,
                                error
                            );
                        }
                    }
                }
            });
        },
        async changePage(page, params = {}) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
                await this.fetchInquiries(false, params);
            }
        },
        sortInquiries(sortType) {
            const sortedInquiries = Object.values(this.inquiries).sort(
                (a, b) => {
                    if (sortType === "newest") {
                        return new Date(b.created_at) - new Date(a.created_at);
                    } else {
                        return new Date(a.created_at) - new Date(b.created_at);
                    }
                }
            );
            this.inquiries = sortedInquiries.reduce((acc, inquiry) => {
                acc[inquiry.id] = inquiry;
                return acc;
            }, {});
        },
        addInquiry(inquiry) {
            this.inquiries[inquiry.id] = inquiry;
            this.sortInquiries("newest");
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
        getCurrentPageInquiries: (state) => {
            const pageKey = `${state.currentPage}-${JSON.stringify(
                state.cachedParams
            )}`;
            return state.inquiries[pageKey] || [];
        },
        getStatusText: (state) => (statusCode) =>
            state.statusOptions[statusCode] || statusCode,
        getCurrentInquiry: (state) => (id) => {
            id = parseInt(id);
            for (const pageInquiries of Object.values(state.inquiries)) {
                const inquiry = pageInquiries.find((inq) => inq.id === id);
                if (inquiry) return inquiry;
            }
            return null;
        },
    },
});
