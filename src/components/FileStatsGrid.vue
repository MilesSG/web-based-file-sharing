<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
    <!-- 总文件数 -->
    <div class="glass-card p-6 text-center hover:scale-105 transition-all duration-300">
      <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <FolderOpen class="w-6 h-6 text-blue-500" />
      </div>
      <h3 class="text-2xl font-bold text-secondary-800 mb-1">
        {{ stats.totalFiles }}
      </h3>
      <p class="text-secondary-500 text-sm">总文件数</p>
    </div>

    <!-- 总大小 -->
    <div class="glass-card p-6 text-center hover:scale-105 transition-all duration-300">
      <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <HardDrive class="w-6 h-6 text-green-500" />
      </div>
      <h3 class="text-2xl font-bold text-secondary-800 mb-1">
        {{ formatFileSize(stats.totalSize) }}
      </h3>
      <p class="text-secondary-500 text-sm">存储大小</p>
    </div>

    <!-- 图片文件 -->
    <div class="glass-card p-6 text-center hover:scale-105 transition-all duration-300">
      <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <ImageIcon class="w-6 h-6 text-purple-500" />
      </div>
      <h3 class="text-2xl font-bold text-secondary-800 mb-1">
        {{ stats.imageCount }}
      </h3>
      <p class="text-secondary-500 text-sm">图片文件</p>
    </div>

    <!-- 文档文件 -->
    <div class="glass-card p-6 text-center hover:scale-105 transition-all duration-300">
      <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <FileText class="w-6 h-6 text-orange-500" />
      </div>
      <h3 class="text-2xl font-bold text-secondary-800 mb-1">
        {{ stats.documentCount }}
      </h3>
      <p class="text-secondary-500 text-sm">文档文件</p>
    </div>

    <!-- 视频文件 -->
    <div class="glass-card p-6 text-center hover:scale-105 transition-all duration-300">
      <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Video class="w-6 h-6 text-red-500" />
      </div>
      <h3 class="text-2xl font-bold text-secondary-800 mb-1">
        {{ stats.videoCount }}
      </h3>
      <p class="text-secondary-500 text-sm">视频文件</p>
    </div>

    <!-- 音频文件 -->
    <div class="glass-card p-6 text-center hover:scale-105 transition-all duration-300">
      <div class="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Music class="w-6 h-6 text-pink-500" />
      </div>
      <h3 class="text-2xl font-bold text-secondary-800 mb-1">
        {{ stats.audioCount }}
      </h3>
      <p class="text-secondary-500 text-sm">音频文件</p>
    </div>

    <!-- 其他文件 -->
    <div class="glass-card p-6 text-center hover:scale-105 transition-all duration-300">
      <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Package class="w-6 h-6 text-gray-500" />
      </div>
      <h3 class="text-2xl font-bold text-secondary-800 mb-1">
        {{ stats.otherCount }}
      </h3>
      <p class="text-secondary-500 text-sm">其他文件</p>
    </div>

    <!-- 存储使用率 -->
    <div class="glass-card p-6 text-center hover:scale-105 transition-all duration-300">
      <div class="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <BarChart3 class="w-6 h-6 text-indigo-500" />
      </div>
      <h3 class="text-2xl font-bold text-secondary-800 mb-1">
        {{ storageUsagePercent }}%
      </h3>
      <p class="text-secondary-500 text-sm">存储使用率</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  FolderOpen, 
  HardDrive, 
  ImageIcon, 
  FileText, 
  Video, 
  Music, 
  Package, 
  BarChart3 
} from 'lucide-vue-next'
import type { FileStats } from '@/types'
import { formatFileSize } from '@/utils/fileUtils'

// Props
interface Props {
  stats: FileStats
}

const props = defineProps<Props>()

// 计算存储使用率（假设最大存储为 1GB）
const storageUsagePercent = computed(() => {
  const maxStorage = 1024 * 1024 * 1024 // 1GB
  const percentage = (props.stats.totalSize / maxStorage) * 100
  return Math.min(Math.round(percentage), 100)
})
</script>

<style scoped>
/* 统计卡片悬停效果 */
.glass-card:hover {
  box-shadow: 0 8px 32px rgba(0, 122, 255, 0.15);
}

/* 图标容器动画 */
.glass-card:hover .w-12 {
  transform: scale(1.1);
  transition: transform 0.2s ease-out;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .glass-card {
    padding: 1rem;
  }
  
  .w-12 {
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .text-2xl {
    font-size: 1.5rem;
  }
}
</style> 