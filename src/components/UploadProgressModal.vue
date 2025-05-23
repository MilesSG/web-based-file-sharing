<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isVisible"
        class="fixed inset-0 z-50 flex items-center justify-center"
        @click="closeModal"
      >
        <!-- 背景遮罩 -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        
        <!-- 弹窗内容 -->
        <div
          class="relative glass-card p-6 w-full max-w-md mx-4 max-h-96 flex flex-col"
          @click.stop
        >
          <!-- 标题栏 -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-secondary-800">
              文件上传进度
            </h3>
            <button
              @click="closeModal"
              class="p-1 text-secondary-400 hover:text-secondary-600 rounded-lg hover:bg-secondary-100"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- 总体进度 -->
          <div class="mb-4">
            <div class="flex justify-between text-sm text-secondary-600 mb-2">
              <span>总进度</span>
              <span>{{ completedCount }}/{{ totalCount }} 文件</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill"
                :style="{ width: `${overallProgress}%` }"
              ></div>
            </div>
          </div>

          <!-- 文件列表 -->
          <div class="flex-1 overflow-y-auto scrollbar-thin space-y-3">
            <div
              v-for="progress in uploadProgresses"
              :key="progress.fileId"
              class="border border-secondary-200 rounded-lg p-3"
            >
              <!-- 文件信息 -->
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-2 flex-1 min-w-0">
                  <!-- 状态图标 -->
                  <div class="flex-shrink-0">
                    <CheckCircle v-if="progress.status === 'completed'" class="w-4 h-4 text-green-500" />
                    <XCircle v-else-if="progress.status === 'error'" class="w-4 h-4 text-red-500" />
                    <Loader v-else class="w-4 h-4 text-primary-500 animate-spin" />
                  </div>
                  
                  <!-- 文件名 -->
                  <span class="text-sm text-secondary-700 truncate" :title="progress.fileName">
                    {{ progress.fileName }}
                  </span>
                </div>
                
                <!-- 进度百分比 -->
                <span class="text-xs text-secondary-500 flex-shrink-0">
                  {{ progress.progress }}%
                </span>
              </div>

              <!-- 进度条 -->
              <div class="progress-bar h-1.5">
                <div 
                  class="progress-fill transition-all duration-300"
                  :class="{
                    'bg-green-500': progress.status === 'completed',
                    'bg-red-500': progress.status === 'error',
                    'bg-primary-500': progress.status === 'uploading'
                  }"
                  :style="{ width: `${progress.progress}%` }"
                ></div>
              </div>

              <!-- 错误信息 -->
              <div v-if="progress.error" class="mt-2">
                <p class="text-xs text-red-600">{{ progress.error }}</p>
              </div>
            </div>
          </div>

          <!-- 底部操作 -->
          <div class="flex justify-end space-x-3 mt-4 pt-4 border-t border-secondary-200">
            <button
              v-if="hasErrors"
              @click="retryFailed"
              class="btn-secondary text-sm"
            >
              重试失败
            </button>
            <button
              @click="closeModal"
              class="btn-primary text-sm"
              :disabled="isUploading"
            >
              {{ isUploading ? '上传中...' : '完成' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { X, CheckCircle, XCircle, Loader } from 'lucide-vue-next'
import { useFileStore } from '@/stores/fileStore'

const fileStore = useFileStore()

// 计算属性
const uploadProgresses = computed(() => fileStore.uploadProgresses)
const isVisible = computed(() => uploadProgresses.value.length > 0)
const isUploading = computed(() => fileStore.isUploading)

const totalCount = computed(() => uploadProgresses.value.length)
const completedCount = computed(() => 
  uploadProgresses.value.filter(p => p.status === 'completed').length
)

const overallProgress = computed(() => {
  if (totalCount.value === 0) return 0
  const totalProgress = uploadProgresses.value.reduce((sum, p) => sum + p.progress, 0)
  return Math.round(totalProgress / totalCount.value)
})

const hasErrors = computed(() => 
  uploadProgresses.value.some(p => p.status === 'error')
)

// 方法
function closeModal() {
  if (!isUploading.value) {
    // 清空已完成的上传进度
    fileStore.uploadProgresses.splice(0)
  }
}

function retryFailed() {
  // 重试失败的上传
  const failedProgresses = uploadProgresses.value.filter(p => p.status === 'error')
  console.log('重试失败的文件:', failedProgresses)
  // 这里可以实现重试逻辑
}
</script>

<style scoped>
/* 弹窗动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease-out;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* 进度条样式 */
.progress-bar {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.3s ease-out;
}

/* 滚动条样式 */
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(0, 122, 255, 0.3);
  border-radius: 2px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 122, 255, 0.5);
}

/* 响应式调整 */
@media (max-width: 640px) {
  .max-w-md {
    max-width: calc(100vw - 2rem);
  }
  
  .glass-card {
    margin: 1rem;
  }
}
</style> 