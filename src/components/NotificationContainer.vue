<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <TransitionGroup name="notification" tag="div" class="space-y-2">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="glass-card p-4 max-w-sm shadow-lg"
          :class="notificationClass(notification.type)"
        >
          <div class="flex items-start space-x-3">
            <!-- 图标 -->
            <div class="flex-shrink-0">
              <CheckCircle v-if="notification.type === 'success'" class="w-5 h-5 text-green-500" />
              <XCircle v-else-if="notification.type === 'error'" class="w-5 h-5 text-red-500" />
              <AlertTriangle v-else-if="notification.type === 'warning'" class="w-5 h-5 text-yellow-500" />
              <Info v-else class="w-5 h-5 text-blue-500" />
            </div>

            <!-- 内容 -->
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-medium text-secondary-800">
                {{ notification.title }}
              </h4>
              <p class="text-sm text-secondary-600 mt-1">
                {{ notification.message }}
              </p>
              
              <!-- 操作按钮 -->
              <div v-if="notification.action" class="mt-2">
                <button
                  @click="notification.action.callback"
                  class="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  {{ notification.action.label }}
                </button>
              </div>
            </div>

            <!-- 关闭按钮 -->
            <button
              @click="removeNotification(notification.id)"
              class="flex-shrink-0 text-secondary-400 hover:text-secondary-600"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-vue-next'
import type { NotificationItem } from '@/types'

// 通知列表
const notifications = ref<NotificationItem[]>([])

// 通知样式类
function notificationClass(type: string) {
  const baseClass = 'border-l-4'
  const typeClasses = {
    success: 'border-green-500 bg-green-50/80',
    error: 'border-red-500 bg-red-50/80',
    warning: 'border-yellow-500 bg-yellow-50/80',
    info: 'border-blue-500 bg-blue-50/80'
  }
  return `${baseClass} ${typeClasses[type as keyof typeof typeClasses] || typeClasses.info}`
}

// 添加通知
function addNotification(notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) {
  const newNotification: NotificationItem = {
    ...notification,
    id: Date.now().toString() + Math.random().toString(36).substr(2),
    timestamp: new Date(),
    read: false
  }
  
  notifications.value.push(newNotification)
  
  // 自动移除（除了错误通知）
  if (notification.type !== 'error') {
    setTimeout(() => {
      removeNotification(newNotification.id)
    }, 5000)
  }
}

// 移除通知
function removeNotification(id: string) {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

// 清空所有通知
function clearAllNotifications() {
  notifications.value = []
}

// 全局事件监听
onMounted(() => {
  // 监听全局通知事件
  window.addEventListener('app-notification', (event: any) => {
    addNotification(event.detail)
  })
  
  // 监听文件上传事件
  window.addEventListener('file-upload-success', () => {
    addNotification({
      type: 'success',
      title: '上传成功',
      message: '文件已成功上传到 CloudVault'
    })
  })
  
  window.addEventListener('file-upload-error', (event: any) => {
    addNotification({
      type: 'error',
      title: '上传失败',
      message: event.detail.message || '文件上传时发生错误'
    })
  })
})

onUnmounted(() => {
  window.removeEventListener('app-notification', () => {})
  window.removeEventListener('file-upload-success', () => {})
  window.removeEventListener('file-upload-error', () => {})
})

// 暴露方法给其他组件使用
defineExpose({
  addNotification,
  removeNotification,
  clearAllNotifications
})
</script>

<style scoped>
/* 通知动画 */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease-out;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease-out;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .fixed {
    top: 1rem;
    right: 1rem;
    left: 1rem;
  }
  
  .max-w-sm {
    max-width: none;
  }
}
</style> 