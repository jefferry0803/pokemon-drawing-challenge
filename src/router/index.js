import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/user';

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
  ],
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();

  if (to.meta.requiresAuth) {
    if (userStore.token) {
      next();
    } else {
      next({ path: '/login' });
    }
  } else {
    next();
  }
});

export default router;
