import Vue from 'vue';
import Router from 'vue-router';

import Home from '@/components/Home/Home';
import Login from '@/components/Auth/Login';
import NotFound from '@/components/ErrorPages/NotFound';
import FileProcessor from '@/components/FileProcessor/FileProcessor';
import VANAttribution from '@/components/VANAttribution/VANAttribution';

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
      component: Login,
      beforeEnter: ifNotAuthenticated,
    },
    {
      path: '/',
      redirect: () => ({
        name: 'vanattribution',
      }),
    },
    {
      path: '/',
      component: Home,
      children: [
        {
          path: '/processor',
          name: 'processor',
          component: FileProcessor,
          beforeEnter: ifAuthenticated,
        },
        {
          path: '/vanattribution',
          name: 'vanattribution',
          component: VANAttribution,
          beforeEnter: ifAuthenticated,
        },
      ],
    },
    {
      path: '*',
      name: 'NotFound',
      component: NotFound,
    },
    {
      path: '/app/health',
      component: () => import('../components/HealthCheck/HealthCheck'),
    },
  ],
});

export default router;
