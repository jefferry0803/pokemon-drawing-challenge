import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/user';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false, title: '登入' },
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('../views/SignupView.vue'),
      meta: { requiresAuth: false, title: '註冊' },
    },
    {
      path: '/pokedraw',
      name: 'pokedraw',
      component: () => import('../views/PokeDraw.vue'),
      meta: { requiresAuth: false, title: '前往繪畫' },
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('../views/DrawHistory.vue'),
      meta: { requiresAuth: true, title: '繪畫紀錄' },
    },
    {
      path: '/gallery',
      name: 'gallery',
      component: () => import('../views/PublicGallery.vue'),
      meta: { requiresAuth: false, title: '公共畫廊' },
    },
    // {
    //   path: '/users',
    //   name: 'users',
    //   component: () => import('../views/dev/UserList.vue'),
    //   meta: { requiresAuth: false, title: '使用者' },
    // },
    // {
    //   path: '/script',
    //   name: 'script',
    //   component: () => import('../views/dev/LikerCountScript.vue'),
    //   meta: { requiresAuth: false, title: '測試' },
    // },
  ],
});

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  // 等待 Firebase Auth 狀態同步
  const auth = getAuth();
  await new Promise<void>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        userStore.isLogin = true;
        userStore.setUser(
          user.uid,
          user.email ?? '',
          user.email ? user.email.split('@')[0] : '',
        );
      } else {
        userStore.isLogin = false;
        userStore.setUser('', '', '');
      }
      unsubscribe();
      resolve();
    });
  });

  // 已登入者禁止進入 /login 或 /signup，直接導向 /history
  if ((to.path === '/login' || to.path === '/signup') && userStore.isLogin) {
    next({ path: '/history' });
    return;
  }

  if (to.meta.requiresAuth) {
    if (userStore.isLogin) {
      next();
    } else {
      next({ path: '/login' });
    }
    return;
  }

  next();
});

export default router;
