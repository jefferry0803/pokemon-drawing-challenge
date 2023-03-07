import { defineStore } from "pinia";
import router from "../router";
import axios from "axios";

export const useUserStore = defineStore("user", {
  state: () => ({
    username: "",
    userId: "",
    token: "",
    logoutTimer: "",
  }),
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
    guestLogin() {
      const data = { returnSecureToken: true };
      const url =
        "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyC-mWBQB9BMbFZsR5DG0fxiNnLIq2e5fYM";
      return axios.post(url, data);
    },
    autoLogin() {
      const username = localStorage.getItem("username");
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      const tokenExpiration = localStorage.getItem("tokenExpiration");

      const expiresIn = +tokenExpiration - new Date().getTime();

      if (expiresIn < 0) {
        return;
      }

      this.logoutTimer = setTimeout(() => {
        this.logout();
      }, expiresIn);

      if (username && userId && token) {
        this.setUser(username, userId, token);
      }
    },
    setUser(username, userId, token) {
      this.username = username;
      this.userId = userId;
      this.token = token;
    },
    logout() {
      localStorage.removeItem("username");
      localStorage.removeItem("userId");
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiration");

      clearTimeout(this.logoutTimer);

      this.setUser(null, null, null);

      router.push("/login");
    },
  },
});
