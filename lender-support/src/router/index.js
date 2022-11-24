import Vue from 'vue';
import Router from 'vue-router';

import store from '../store';

Vue.use(Router);

const ifAuthenticated = (to, from, next) => {
  if (store.getters['auth/isAuthenticated']) {
    return next();
  }
  return next('/login');
};

const ifNotAuthenticated = (to, from, next) => {
  if (!store.getters['auth/isAuthenticated']) {
    return next();
  }
  return next('/');
};

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/components/Auth/Login'),
      beforeEnter: ifNotAuthenticated,
    },
    {
      path: '/',
      redirect: () => ({
        name: 'verification',
      }),
    },
    {
      path: '/',
      component: () => import('@/components/Home/Home'),
      children: [
        {
          path: '/verification',
          name: 'verification',
          component: () => import('@/components/Verification/Verification'),
          beforeEnter: ifAuthenticated,
        },
      ],
    },
    {
      path: '*',
      name: 'NotFound',
      component: () => import('@/components/ErrorPages/NotFound'),
    },
  ],
});

export default router;
