import { defineStore } from "pinia";
import axios from "axios";

export const useUserStore = defineStore("user", {
  state: () => ({
    userId: "",
    token: "",
    tokenExpiration: "",
  }),
  getters: {},
  actions: {
    signup(email, password) {
      const data = {
        email,
        password,
        returnSecureToken: true,
      };
      const url =
        "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyC-mWBQB9BMbFZsR5DG0fxiNnLIq2e5fYM";

      return axios.post(url, data);
    },
    login(email, password) {
      const data = {
        email,
        password,
        returnSecureToken: true,
      };
      const url =
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyC-mWBQB9BMbFZsR5DG0fxiNnLIq2e5fYM";
      return axios.post(url, data);
    },
    setUser(userId, token, tokenExpiration) {
      this.userId = userId;
      this.token = token;
      this.tokenExpiration = tokenExpiration;
    },
  },
});
