import { defineStore } from 'pinia';
import router from '@/router';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export const useUserStore = defineStore('user', {
  state: () => ({
    email: '' as string,
    username: '訪客' as string,
    userId: '' as string,
    isLogin: false as boolean,
  }),
  actions: {
    /**
     * 註冊
     * @param {string} email 電子郵件
     * @param {string} password 密碼
     * @returns {Promise}
     */
    signup(email: string, password: string) {
      return createUserWithEmailAndPassword(auth, email, password);
    },
    /**
     * 登入
     * @param {string} email 電子郵件
     * @param {string} password 密碼
     * @returns {Promise}
     */
    login(email: string, password: string) {
      return signInWithEmailAndPassword(auth, email, password).then(
        async (res) => {
          const email = res.user.email ?? '';
          const username = email ? email.split('@')[0] : '';
          const userId = res.user.uid;
          this.isLogin = true;
          this.setUser(userId, email, username);
        },
      );
    },
    /**
     * 自動登入
     */
    autoLogin() {
      const auth = getAuth();

      onAuthStateChanged(auth, (user) => {
        if (!user) return;
        const email = user.email ?? '';
        const username = email ? email.split('@')[0] : '';
        const userId = user.uid;

        this.isLogin = true;
        this.setUser(userId, email, username);
      });
    },
    /**
     * 設定使用者資訊
     */
    setUser(userId: string, email: string, username: string) {
      this.userId = userId;
      this.email = email;
      this.username = username;
    },
    /**
     * 登出
     */
    logout() {
      signOut(auth).then(() => {
        this.setUser('', '', '');
        this.isLogin = false;

        router.replace('/login');
      });
    },
  },
});
