import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { useSession } from '@entities/session/model/store'

// Importa todos los componentes necesarios
const HomeView = () => import('@/views/HomeView.vue')
const AboutView = () => import('@/views/AboutView.vue')
const LoginView = () => import('@/features/auth-login/ui/login-form.vue')
const UsersPage = () => import('@/pages/users/ui/page-users.vue')
const UserDetailPage = () => import('@pages/user-detail/ui/page-user-detail.vue')
//const ForbiddenView = () => import('@views/ForbiddenView.vue')

// Crea el router
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/about', name: 'about', component: AboutView },
    { path: '/login', name: 'login', component: LoginView, meta: { requiresAuth: false } },
    {
      path: '/users',
      name: 'users',
      component: UsersPage,
      meta: { requiresAuth: true, roles: ['admin'] },
    },
    /*{
      path: '/users/:id',
      name: 'user-detail',
      component: UserDetailPage,
      meta: { requiresAuth: true, roles: ['admin', 'manager'] },
    },
    { path: '/403', name: 'forbidden', component: ForbiddenView },
    { path: '/:pathMatch(.*)*', redirect: '/' },*/
  ],
})

// Guardia de navegación
router.beforeEach((to: RouteLocationNormalized) => {
  const { token, role } = useSession()
  if (to.meta.requiresAuth && !token) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (to.meta.requiresAuth && to.meta.roles && !to.meta.roles.includes(role)) {
    return { path: '/403' }
  }
})

// Exporta el router por defecto
export default router
