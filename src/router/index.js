import { createWebHistory, createRouter } from 'vue-router';
// import axios from 'axios';
import Login from '../views/LoginView.vue';
import Dashboard from '../views/DashboardView.vue';
import Signup from '../views/SignupView.vue';
import OnBoarding from '../views/OnboardingView.vue'
import Test from '../views/TestView.vue'
import NotFound from '../views/404View.vue'


const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    // meta: { requiresAuth: true },
  },
  {
    path: '/signup',
    name: 'Signup',
    component: Signup,
    meta: { requiresAuth: false },
  },
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: OnBoarding,
    meta: { requiresAuth: false },
  },{
    path: '/test',
    name: 'Test',
    component: Test,
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/:catchAll(.*)',
    name: '404-not-found',
    component: NotFound,
  },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// const url = `${import.meta.env.VITE_SERVER_API_URL}users/user-verification`;

// router.beforeEach(async (to, from, next) => {
//   if (
//     to.matched.some((record) => record.meta.requiresAuth) &&
//     to.name !== 'Login'
//   ) {
//     const authToken = localStorage.getItem('authToken');
//     console.log(to.name);
//     if (authToken) {
//       try {
//         const response = await axios.post(
//           url,
//           {},
//           {
//             headers: {
//               authorization: `Bearer ${authToken}`,
//             },
//           }
//         );
//         if (response.status === 200 && response.data.status === 'success') {
//           console.log('access allowed');
//           next(); // Authentication successful, proceed to the route
//         } else {
//           throw new Error('Authentication failed');
//         }
//       } catch (error) {
//         console.error('Authentication error:', error);
//         localStorage.removeItem('authToken');
//         next({ name: 'Login' });
//       }
//     } else {
//       next({ name: 'Login' });
//     }
//   } else {
//     next(); // Route does not require authentication, proceed as normal
//   }
// });
export default router;
