<template>
  <div class="file-preview w-full h-full min-h-64">
    <!-- 图片预览 -->
    <div v-if="fileType === 'image'" class="flex items-center justify-center h-full">
      <img
        :src="previewUrl"
        :alt="file.name"
        class="max-w-full max-h-full object-contain rounded-lg shadow-lg"
        @load="onImageLoad"
        @error="onImageError"
      />
    </div>

    <!-- 文本文件预览 -->
    <div v-else-if="fileType === 'text'" class="h-full">
      <div v-if="isLoading" class="flex items-center justify-center h-full">
        <div class="text-center">
          <div class="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p class="text-sm text-secondary-500">加载中...</p>
        </div>
      </div>
      <div v-else-if="textContent" class="h-full overflow-auto">
        <pre class="text-sm text-secondary-700 whitespace-pre-wrap p-4 bg-secondary-50 rounded-lg h-full"><code>{{ textContent }}</code></pre>
      </div>
      <div v-else class="flex items-center justify-center h-full">
        <p class="text-secondary-500">无法预览此文本文件</p>
      </div>
    </div>

    <!-- PDF 预览 -->
    <div v-else-if="fileType === 'pdf'" class="h-full">
      <iframe
        v-if="previewUrl"
        :src="previewUrl"
        class="w-full h-full border-0 rounded-lg"
        title="PDF 预览"
      ></iframe>
      <div v-else class="flex items-center justify-center h-full">
        <div class="text-center">
          <FileText class="w-16 h-16 text-secondary-400 mx-auto mb-4" />
          <p class="text-secondary-600 font-medium mb-2">PDF 文档</p>
          <p class="text-sm text-secondary-500">{{ file.name }}</p>
        </div>
      </div>
    </div>

    <!-- 音频预览 -->
    <div v-else-if="fileType === 'audio'" class="flex items-center justify-center h-full">
      <div class="text-center max-w-sm w-full">
        <div class="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Music class="w-10 h-10 text-white" />
        </div>
        <h3 class="font-medium text-secondary-800 mb-2">{{ file.name }}</h3>
        <audio
          v-if="previewUrl"
          :src="previewUrl"
          controls
          class="w-full"
          preload="metadata"
        >
          你的浏览器不支持音频播放
        </audio>
        <p v-else class="text-sm text-secondary-500">无法预览此音频文件</p>
      </div>
    </div>

    <!-- 视频预览 -->
    <div v-else-if="fileType === 'video'" class="flex items-center justify-center h-full">
      <div class="w-full max-w-2xl">
        <video
          v-if="previewUrl"
          :src="previewUrl"
          controls
          class="w-full rounded-lg shadow-lg"
          preload="metadata"
        >
          你的浏览器不支持视频播放
        </video>
        <div v-else class="text-center">
          <div class="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video class="w-10 h-10 text-white" />
          </div>
          <h3 class="font-medium text-secondary-800 mb-2">{{ file.name }}</h3>
          <p class="text-sm text-secondary-500">无法预览此视频文件</p>
        </div>
      </div>
    </div>

    <!-- 文档预览 -->
    <div v-else-if="fileType === 'document'" class="flex items-center justify-center h-full">
      <div class="text-center">
        <div class="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText class="w-10 h-10 text-white" />
        </div>
        <h3 class="font-medium text-secondary-800 mb-2">{{ file.name }}</h3>
        <p class="text-sm text-secondary-500 mb-4">{{ getFileTypeDescription() }}</p>
        <p class="text-xs text-secondary-400">此文件类型暂不支持预览</p>
      </div>
    </div>

    <!-- 压缩文件预览 -->
    <div v-else-if="fileType === 'archive'" class="flex items-center justify-center h-full">
      <div class="text-center">
        <div class="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Archive class="w-10 h-10 text-white" />
        </div>
        <h3 class="font-medium text-secondary-800 mb-2">{{ file.name }}</h3>
        <p class="text-sm text-secondary-500 mb-4">压缩文件</p>
        <p class="text-xs text-secondary-400">请下载后解压查看内容</p>
      </div>
    </div>

    <!-- 默认/不支持的文件类型 -->
    <div v-else class="flex items-center justify-center h-full">
      <div class="text-center">
        <div class="w-20 h-20 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileQuestion class="w-10 h-10 text-white" />
        </div>
        <h3 class="font-medium text-secondary-800 mb-2">{{ file.name }}</h3>
        <p class="text-sm text-secondary-500 mb-4">{{ file.type || '未知文件类型' }}</p>
        <p class="text-xs text-secondary-400">暂不支持预览此文件类型</p>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-if="hasError" class="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg">
      <div class="text-center">
        <AlertCircle class="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p class="text-red-600 font-medium mb-1">预览失败</p>
        <p class="text-sm text-red-500">{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { 
  FileText, 
  Music, 
  Video, 
  Archive, 
  FileQuestion, 
  AlertCircle 
} from 'lucide-vue-next'
import type { FileItem } from '@/types'

interface Props {
  file: FileItem
}

const props = defineProps<Props>()

// 状态
const isLoading = ref(false)
const hasError = ref(false)
const errorMessage = ref('')
const textContent = ref('')
const previewUrl = ref('')

// 计算属性
const fileType = computed(() => {
  const type = props.file.type.toLowerCase()
  
  if (type.startsWith('image/')) return 'image'
  if (type.startsWith('text/')) return 'text'
  if (type.startsWith('audio/')) return 'audio'
  if (type.startsWith('video/')) return 'video'
  if (type === 'application/pdf') return 'pdf'
  if (type.includes('document') || type.includes('sheet') || type.includes('presentation')) return 'document'
  if (type.includes('zip') || type.includes('rar') || type.includes('tar') || type.includes('gzip')) return 'archive'
  
  return 'other'
})

// 方法
async function generatePreviewUrl() {
  try {
    hasError.value = false
    
    if (props.file.file) {
      // 如果有原始文件对象
      previewUrl.value = URL.createObjectURL(props.file.file)
    } else if (props.file.content) {
      // 如果有文件内容
      const blob = new Blob([props.file.content], { type: props.file.type })
      previewUrl.value = URL.createObjectURL(blob)
    } else {
      throw new Error('没有可用的文件内容')
    }
    
    // 对于文本文件，读取内容
    if (fileType.value === 'text') {
      await loadTextContent()
    }
    
  } catch (error) {
    console.error('生成预览URL失败:', error)
    hasError.value = true
    errorMessage.value = error instanceof Error ? error.message : '预览生成失败'
  }
}

async function loadTextContent() {
  try {
    isLoading.value = true
    
    let text = ''
    
    if (props.file.file) {
      text = await props.file.file.text()
    } else if (props.file.content) {
      const decoder = new TextDecoder()
      text = decoder.decode(props.file.content)
    }
    
    // 限制显示的文本长度，避免性能问题
    const maxLength = 10000
    if (text.length > maxLength) {
      text = text.substring(0, maxLength) + '\n\n... (文件内容过长，仅显示前' + maxLength + '个字符)'
    }
    
    textContent.value = text
    
  } catch (error) {
    console.error('加载文本内容失败:', error)
    hasError.value = true
    errorMessage.value = '无法读取文本内容'
  } finally {
    isLoading.value = false
  }
}

function getFileTypeDescription(): string {
  const type = props.file.type.toLowerCase()
  
  if (type.includes('pdf')) return 'PDF 文档'
  if (type.includes('doc')) return 'Word 文档'
  if (type.includes('xls') || type.includes('sheet')) return 'Excel 表格'
  if (type.includes('ppt') || type.includes('presentation')) return 'PowerPoint 演示'
  if (type.includes('txt')) return '文本文档'
  
  return '文档文件'
}

function onImageLoad() {
  // 图片加载成功
}

function onImageError() {
  hasError.value = true
  errorMessage.value = '图片加载失败'
}

// 监听文件变化
watch(() => props.file, () => {
  generatePreviewUrl()
}, { immediate: true })

// 清理资源
onMounted(() => {
  // 组件卸载时清理 URL
  return () => {
    if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl.value)
    }
  }
})
</script>

<style scoped>
/* 预览容器样式 */
.file-preview {
  position: relative;
  background: #fafafa;
  border-radius: 0.5rem;
  overflow: hidden;
}

/* 滚动条样式 */
pre::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

pre::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

pre::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

pre::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 代码语法高亮的基础样式 */
code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  line-height: 1.5;
}

/* 媒体元素样式 */
audio, video {
  max-width: 100%;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .file-preview {
    min-height: 200px;
  }
}
</style> 