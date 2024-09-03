import { defineStore } from "pinia";
import axios from "axios";

export const useContactStore = defineStore("contact", {
    state: () => ({
        from: {
            company: "",
            name: "",
            tel: "",
            email: "",
            birthday: "",
            gender: "",
            profession: "",
            body: "",
        },
        genders: {},
        professions: {},
    }),
    actions: {
        async fetchFormData() {
            try {
                const response = await axios.get("/api/contact/form-data");
                this.genders = response.data.genders;
                this.professions = response.data.professions;
            } catch (error) {
                console.error("Error fetching form data:", error);
            }
        },
        async submitForm() {
            try {
                const response = await axios.post(
                    "/api/contact/confirm",
                    this.form
                );
                return response.data;
            } catch (error) {
                console.error("Error submitting form:", error);
                throw error;
            }
        },
        async sendForm() {
            try {
                const response = await axios.post(
                    "/api/contact/send",
                    this.form
                );
                return response.data;
            } catch (error) {
                console.error("Error sending form", error);
                throw error;
            }
        },
    },
});
