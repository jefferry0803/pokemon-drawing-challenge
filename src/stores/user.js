import { defineStore } from 'pinia';
import router from '../router';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../firebase';

export const useUserStore = defineStore('user', {
  state: () => ({
    username: '訪客',
    userId: '',
    token: '',
    logoutTimer: '',
  }),
  actions: {
    /**
     * 註冊
     * @param {string} email 電子郵件
     * @param {string} password 密碼
     * @returns {Promise}
     */
    signup(email, password) {
      return createUserWithEmailAndPassword(auth, email, password);
    },
    /**
     * 登入
     * @param {string} email 電子郵件
     * @param {string} password 密碼
     * @returns {Promise}
     */
    login(email, password) {
      return signInWithEmailAndPassword(auth, email, password).then((res) => {
        const email = res.user.email;
        const username = email.substring(0, email.search('@'));

        const expiresIn = +res._tokenResponse.expiresIn * 1000;
        const expirationDate = new Date().getTime() + expiresIn;

        localStorage.setItem('username', username);
        localStorage.setItem('userId', res._tokenResponse.localId);
        localStorage.setItem('token', res._tokenResponse.idToken);
        localStorage.setItem('tokenExpiration', expirationDate);

        this.logoutTimer = setTimeout(() => {
          this.logout();
        }, expiresIn);

        this.setUser(
          username,
          res._tokenResponse.localId,
          res._tokenResponse.idToken,
        );
      });
    },
    /**
     * 自動登入
     */
    autoLogin() {
      const username = localStorage.getItem('username');
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      const tokenExpiration = localStorage.getItem('tokenExpiration');

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
    /**
     * 登出
     */
    logout() {
      signOut(auth).then(() => {
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        localStorage.removeItem('token');
        localStorage.removeItem('tokenExpiration');

        clearTimeout(this.logoutTimer);

        this.setUser(null, null, null);

        router.replace('/login');
      });
    },
  },
});
