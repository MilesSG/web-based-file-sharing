<template>
  <div 
    class="upload-zone"
    :class="{ 'dragover': isDragging }"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @click="triggerFileSelect"
  >
    <div class="text-center">
      <!-- 上传图标 -->
      <div class="mb-6">
        <div class="w-20 h-20 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-4">
          <Upload class="w-10 h-10 text-primary-500" />
        </div>
      </div>

      <!-- 主文本 -->
      <h3 class="text-xl font-semibold text-secondary-700 mb-2">
        拖拽文件到这里上传
      </h3>
      <p class="text-secondary-500 mb-6">
        或者 <span class="text-primary-500 font-medium cursor-pointer hover:underline">点击选择文件</span>
      </p>

      <!-- 支持的格式 -->
      <div class="flex flex-wrap justify-center gap-2 text-sm text-secondary-400">
        <span class="px-2 py-1 bg-secondary-100 rounded">图片</span>
        <span class="px-2 py-1 bg-secondary-100 rounded">文档</span>
        <span class="px-2 py-1 bg-secondary-100 rounded">视频</span>
        <span class="px-2 py-1 bg-secondary-100 rounded">音频</span>
        <span class="px-2 py-1 bg-secondary-100 rounded">其他</span>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      multiple
      class="hidden"
      @change="handleFileSelect"
    >
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Upload } from 'lucide-vue-next'
import { createDragHandler } from '@/utils/fileUtils'

// 事件定义
const emit = defineEmits<{
  upload: [files: File[]]
}>()

// 响应式状态
const isDragging = ref(false)
const fileInput = ref<HTMLInputElement>()

// 拖拽处理
const { onDragOver, onDragLeave, onDrop } = createDragHandler(
  (files: File[]) => {
    isDragging.value = false
    emit('upload', files)
  },
  () => {
    isDragging.value = true
  },
  () => {
    isDragging.value = false
  }
)

function handleDragOver(event: DragEvent) {
  onDragOver(event)
}

function handleDragLeave(event: DragEvent) {
  onDragLeave(event)
}

function handleDrop(event: DragEvent) {
  onDrop(event)
}

// 文件选择
function triggerFileSelect() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  
  if (files && files.length > 0) {
    emit('upload', Array.from(files))
    // 清空input，允许重复选择同一文件
    target.value = ''
  }
}
</script>

<style scoped>
.upload-zone {
  cursor: pointer;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-zone.dragover {
  transform: scale(1.02);
}
</style> 