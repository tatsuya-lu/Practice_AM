export default {
    namespaced: true,
    state: {
        user: null
    },
    mutations: {
        setUser(state, user) {
            state.user = user
        }
    },
    actions: {
        login({ commit }, user) {
            commit('setUser', user)
        },
        logout({ commit }) {
            commit('setUser', null)
        }
    },
    getters: {
        isAuthenticated: state => !!state.user,
        currentUser: state => state.user
    }
}