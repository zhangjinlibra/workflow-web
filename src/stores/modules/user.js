import { defineStore } from "pinia";

const useUserStore = defineStore("user", {
  state: () => ({
    user: {},
  }),
  getters: {
    loginUser: (state) => {
      return state.user;
    },
  },
  actions: {
    setLoginUser(user) {
      this.user = user;
    },
  },
});

export default useUserStore;
