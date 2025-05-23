<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <!-- 导航栏 -->
    <AppNavbar />
    
    <!-- 主内容区 -->
    <main class="pt-20">
      <Suspense>
        <template #default>
          <RouterView />
        </template>
        <template #fallback>
          <div class="flex items-center justify-center min-h-screen">
            <div class="glass-card p-8 text-center">
              <div class="animate-spin w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p class="text-secondary-600">页面加载中...</p>
            </div>
          </div>
        </template>
      </Suspense>
    </main>

    <!-- 全局通知 -->
    <NotificationContainer />
    
    <!-- 上传进度弹窗 -->
    <UploadProgressModal />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'
import AppNavbar from '@/components/AppNavbar.vue'
import NotificationContainer from '@/components/NotificationContainer.vue'
import UploadProgressModal from '@/components/UploadProgressModal.vue'
import { useFileStore } from '@/stores/fileStore'
import { useShareStore } from '@/stores/shareStore'
import { initDB } from '@/utils/fileDB'

const fileStore = useFileStore()
const shareStore = useShareStore()

// 初始化应用
onMounted(async () => {
  try {
    // 初始化数据库
    await initDB()
    
    // 加载数据
    await Promise.all([
      fileStore.loadFiles(),
      shareStore.loadShares()
    ])
    
    // 设置定时清理
    setupAutoCleanup()
    
    console.log('CloudVault 初始化完成')
  } catch (error) {
    console.error('应用初始化失败:', error)
  }
})

// 自动清理过期数据
let cleanupInterval: number | null = null

function setupAutoCleanup() {
  // 每小时清理一次过期数据
  cleanupInterval = window.setInterval(async () => {
    try {
      await shareStore.cleanupExpiredShares()
    } catch (error) {
      console.error('自动清理失败:', error)
    }
  }, 60 * 60 * 1000) // 1小时
}

onUnmounted(() => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval)
  }
})

// 全局错误处理
window.addEventListener('error', (event) => {
  console.error('全局错误:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的Promise拒绝:', event.reason)
})
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 路由过渡动画 */
.v-enter-active,
.v-leave-active {
  transition: all 0.3s ease-out;
}

.v-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.v-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 122, 255, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 122, 255, 0.5);
}

/* 禁用选择文本时的高亮（在某些UI交互中） */
.no-select {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* 响应式布局调整 */
@media (max-width: 768px) {
  #app {
    font-size: 14px;
  }
}
</style> 