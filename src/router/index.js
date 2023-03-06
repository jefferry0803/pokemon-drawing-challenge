import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "../stores/user";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "landingPage",
      redirect: "/login",
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/signup",
      name: "signup",
      component: () => import("../views/SignupView.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/pokedraw",
      name: "pokedraw",
      component: () => import("../views/PokeDraw.vue"),
      meta: { requiresAuth: false },
    },
  ],
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();

  if (to.meta.requiresAuth) {
    if (userStore.token) {
      next();
    } else {
      next({ path: "/login" });
    }
  } else {
    next();
  }
});

export default router;
