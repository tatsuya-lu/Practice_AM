import { useInquiryStore } from "../store/inquiry";

export const InquiryService = {
    async fetchUnresolvedInquiries(page = 1, perPage = 10) {
        const inquiryStore = useInquiryStore();
        await inquiryStore.fetchInquiries(true, { status: 'default', dashboard: true, page, per_page: perPage });
        return {
            inquiries: inquiryStore.getCurrentPageInquiries,
            totalCount: inquiryStore.totalInquiries,
            totalPages: inquiryStore.totalPages
        };
    }
};