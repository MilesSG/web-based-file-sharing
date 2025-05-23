import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: 'CloudVault - 首页',
      description: '优雅的文件共享平台'
    }
  },
  {
    path: '/files',
    name: 'Files',
    component: () => import('@/views/Files.vue'),
    meta: {
      title: 'CloudVault - 文件管理',
      description: '管理你的文件'
    }
  },
  {
    path: '/shared',
    name: 'Shared',
    component: () => import('@/views/Shared.vue'),
    meta: {
      title: 'CloudVault - 分享管理',
      description: '管理文件分享'
    }
  },
  {
    path: '/share/:id',
    name: 'ShareView',
    component: () => import('@/views/ShareView.vue'),
    meta: {
      title: 'CloudVault - 文件分享',
      description: '查看分享的文件'
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue'),
    meta: {
      title: 'CloudVault - 设置',
      description: '应用设置'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: 'CloudVault - 页面未找到',
      description: '请求的页面不存在'
    }
  }
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = to.meta.title as string
  }

  // 设置meta description
  if (to.meta?.description) {
    let metaDescription = document.querySelector('meta[name="description"]')
    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.setAttribute('name', 'description')
      document.head.appendChild(metaDescription)
    }
    metaDescription.setAttribute('content', to.meta.description as string)
  }

  next()
})

// 导出路由实例
export default router 