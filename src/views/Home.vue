<template>
  <div class="min-h-screen">
    <!-- 英雄区域 -->
    <section class="relative py-20 px-6">
      <div class="max-w-4xl mx-auto text-center">
        <!-- 主标题 -->
        <h1 class="text-5xl md:text-6xl font-bold text-gradient mb-6 animate-fade-in">
          CloudVault
        </h1>
        <p class="text-xl md:text-2xl text-secondary-600 mb-8 max-w-2xl mx-auto animate-fade-in">
          简约优雅的纯前端文件存储与共享平台
        </p>

        <!-- 特色说明 -->
        <div class="flex flex-wrap justify-center gap-6 mb-12 animate-fade-in">
          <div class="flex items-center space-x-2 text-secondary-700">
            <Shield class="w-5 h-5 text-primary-500" />
            <span>本地存储</span>
          </div>
          <div class="flex items-center space-x-2 text-secondary-700">
            <Zap class="w-5 h-5 text-primary-500" />
            <span>极速访问</span>
          </div>
          <div class="flex items-center space-x-2 text-secondary-700">
            <Share2 class="w-5 h-5 text-primary-500" />
            <span>便捷分享</span>
          </div>
        </div>

        <!-- 上传区域 -->
        <FileUploadZone @upload="handleFileUpload" />
      </div>

      <!-- 背景装饰 -->
      <div class="absolute inset-0 -z-10 overflow-hidden">
        <div class="floating-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
        </div>
      </div>
    </section>

    <!-- 统计信息 -->
    <section class="py-16 px-6">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold text-center text-secondary-800 mb-12">
          文件统计
        </h2>
        <FileStatsGrid :stats="fileStats" />
      </div>
    </section>

    <!-- 最近文件 -->
    <section class="py-16 px-6">
      <div class="max-w-6xl mx-auto">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-3xl font-bold text-secondary-800">最近上传</h2>
          <RouterLink 
            to="/files"
            class="btn-secondary flex items-center space-x-2"
          >
            <span>查看全部</span>
            <ArrowRight class="w-4 h-4" />
          </RouterLink>
        </div>

        <!-- 文件网格 -->
        <div v-if="recentFiles.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <FileCard
            v-for="file in recentFiles"
            :key="file.id"
            :file="file"
            @preview="handleFilePreview"
            @download="handleFileDownload"
            @share="handleFileShare"
          />
        </div>

        <!-- 空状态 -->
        <div v-else class="text-center py-16">
          <div class="glass-card p-12 max-w-md mx-auto">
            <FolderOpen class="w-16 h-16 text-secondary-400 mx-auto mb-4" />
            <h3 class="text-xl font-semibold text-secondary-700 mb-2">还没有文件</h3>
            <p class="text-secondary-500 mb-6">上传你的第一个文件开始使用 CloudVault</p>
            <button @click="triggerFileUpload" class="btn-primary">
              立即上传
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 分享对话框 -->
    <QrShareDialog
      :is-open="showShareDialog"
      :file="selectedFileForShare!"
      @close="showShareDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Shield, Zap, Share2, ArrowRight, FolderOpen } from 'lucide-vue-next'
import { useFileStore } from '@/stores/fileStore'
import FileUploadZone from '@/components/FileUploadZone.vue'
import FileStatsGrid from '@/components/FileStatsGrid.vue'
import FileCard from '@/components/FileCard.vue'
import QrShareDialog from '@/components/QrShareDialog.vue'
import type { FileItem } from '@/types'

const fileStore = useFileStore()

// 分享对话框状态
const showShareDialog = ref(false)
const selectedFileForShare = ref<FileItem | null>(null)

// 计算属性
const fileStats = computed(() => fileStore.fileStats)
const recentFiles = computed(() => {
  return fileStore.files
    .slice()
    .sort((a, b) => new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime())
    .slice(0, 8) // 显示最近8个文件
})

// 方法
async function handleFileUpload(files: File[]) {
  try {
    await fileStore.uploadFiles(files)
  } catch (error) {
    console.error('文件上传失败:', error)
  }
}

function handleFilePreview(file: FileItem) {
  // 文件预览逻辑
  console.log('预览文件:', file)
}

function handleFileDownload(file: FileItem) {
  // 文件下载逻辑
  console.log('下载文件:', file)
}

function handleFileShare(file: FileItem) {
  selectedFileForShare.value = file
  showShareDialog.value = true
}

function triggerFileUpload() {
  // 触发文件上传
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true
  input.onchange = async (e) => {
    const files = (e.target as HTMLInputElement).files
    if (files) {
      await handleFileUpload(Array.from(files))
    }
  }
  input.click()
}

onMounted(() => {
  // 组件挂载后的初始化工作
})
</script>

<style scoped>
/* 背景装饰动画 */
.floating-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 20%;
  animation-delay: 2s;
}

.shape-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 30%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-20px) rotate(120deg);
  }
  66% {
    transform: translateY(20px) rotate(240deg);
  }
}

/* 渐入动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

.animate-fade-in:nth-child(1) { animation-delay: 0.1s; }
.animate-fade-in:nth-child(2) { animation-delay: 0.2s; }
.animate-fade-in:nth-child(3) { animation-delay: 0.3s; }

/* 响应式调整 */
@media (max-width: 768px) {
  .shape {
    display: none;
  }
}
</style> 