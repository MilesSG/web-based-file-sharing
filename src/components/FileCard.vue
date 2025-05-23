<template>
  <div 
    class="file-card group"
    :class="{ 'ring-2 ring-primary-500 bg-primary-50': selected }"
    @click="handleClick"
  >
    <!-- 文件预览区域 -->
    <div class="relative mb-4">
      <!-- 文件缩略图或图标 -->
      <div 
        class="w-full h-32 rounded-xl overflow-hidden bg-gradient-to-br from-secondary-100 to-secondary-200 
               flex items-center justify-center relative"
      >
        <!-- 图片缩略图 -->
        <img 
          v-if="file.thumbnail" 
          :src="file.thumbnail" 
          :alt="file.name"
          class="w-full h-full object-cover"
        />
        
        <!-- 文件类型图标 -->
        <div 
          v-else
          class="file-icon text-4xl"
          :style="{ backgroundColor: fileColor }"
        >
          {{ fileIcon }}
        </div>

        <!-- 悬停操作层 -->
        <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 
                    transition-opacity duration-200 flex items-center justify-center">
          <div class="flex space-x-2">
            <button
              @click.stop="handlePreview"
              class="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
              title="预览"
            >
              <Eye class="w-4 h-4 text-white" />
            </button>
            <button
              @click.stop="handleDownload"
              class="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
              title="下载"
            >
              <Download class="w-4 h-4 text-white" />
            </button>
            <button
              @click.stop="handleShare"
              class="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
              title="分享"
            >
              <Share2 class="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <!-- 文件大小标签 -->
        <div class="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
          {{ formatFileSize(file.size) }}
        </div>
        
        <!-- 选中标识 -->
        <div v-if="selected" class="absolute top-2 left-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
    </div>

    <!-- 文件信息 -->
    <div class="space-y-2">
      <!-- 文件名 -->
      <h3 
        class="font-medium text-secondary-800 truncate text-sm group-hover:text-primary-600 transition-colors"
        :title="file.name"
      >
        {{ file.name }}
      </h3>

      <!-- 文件类型和时间 -->
      <div class="flex items-center justify-between text-xs text-secondary-500">
        <span class="truncate">{{ fileTypeLabel }}</span>
        <span>{{ formatDate(file.uploadTime) }}</span>
      </div>

      <!-- 标签 -->
      <div v-if="file.tags && file.tags.length > 0" class="flex flex-wrap gap-1">
        <span
          v-for="tag in file.tags.slice(0, 2)"
          :key="tag"
          class="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full"
        >
          {{ tag }}
        </span>
        <span
          v-if="file.tags.length > 2"
          class="px-2 py-0.5 bg-secondary-100 text-secondary-600 text-xs rounded-full"
        >
          +{{ file.tags.length - 2 }}
        </span>
      </div>

      <!-- 分享状态 -->
      <div v-if="file.isShared" class="flex items-center space-x-1 text-xs text-green-600">
        <Share2 class="w-3 h-3" />
        <span>已分享</span>
      </div>
    </div>

    <!-- 操作菜单 -->
    <div class="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity" v-if="!selected">
      <el-dropdown @command="handleCommand" trigger="click">
        <button class="p-1.5 bg-black/50 backdrop-blur-sm text-white rounded-lg hover:bg-black/60">
          <MoreVertical class="w-4 h-4" />
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="rename">
              <Edit class="w-4 h-4 mr-2" />
              重命名
            </el-dropdown-item>
            <el-dropdown-item command="copy">
              <Copy class="w-4 h-4 mr-2" />
              复制
            </el-dropdown-item>
            <el-dropdown-item command="move">
              <FolderOpen class="w-4 h-4 mr-2" />
              移动
            </el-dropdown-item>
            <el-dropdown-item command="delete" divided>
              <Trash2 class="w-4 h-4 mr-2 text-red-500" />
              <span class="text-red-500">删除</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  Eye, 
  Download, 
  Share2, 
  MoreVertical, 
  Edit, 
  Copy, 
  FolderOpen, 
  Trash2 
} from 'lucide-vue-next'
import type { FileItem } from '@/types'
import { formatFileSize, getFileIcon, getFileColor, downloadFile } from '@/utils/fileUtils'

// Props
interface Props {
  file: FileItem
  selected?: boolean
}

const props = defineProps<Props>()

// 事件定义
const emit = defineEmits<{
  preview: [file: FileItem]
  download: [file: FileItem]
  share: [file: FileItem]
  rename: [file: FileItem]
  copy: [file: FileItem]
  move: [file: FileItem]
  delete: [file: FileItem]
  click: [file: FileItem]
}>()

// 计算属性
const fileIcon = computed(() => getFileIcon(props.file.type))
const fileColor = computed(() => getFileColor(props.file.type))

const fileTypeLabel = computed(() => {
  const type = props.file.type
  const category = type.split('/')[0]
  const subtype = type.split('/')[1]
  
  const categoryMap: Record<string, string> = {
    'image': '图片',
    'video': '视频',
    'audio': '音频',
    'application': '应用',
    'text': '文本'
  }
  
  return categoryMap[category] || subtype || '未知'
})

// 格式化日期
function formatDate(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    return '今天'
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return new Date(date).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    })
  }
}

// 处理下拉菜单命令
function handleCommand(command: string) {
  switch (command) {
    case 'rename':
      emit('rename', props.file)
      break
    case 'copy':
      emit('copy', props.file)
      break
    case 'move':
      emit('move', props.file)
      break
    case 'delete':
      emit('delete', props.file)
      break
  }
}

// 处理文件操作
function handlePreview() {
  emit('preview', props.file)
}

function handleDownload() {
  try {
    downloadFile(props.file)
    emit('download', props.file)
  } catch (error) {
    console.error('下载失败:', error)
  }
}

function handleShare() {
  emit('share', props.file)
}

function handleClick() {
  emit('click', props.file)
}
</script>

<style scoped>
.file-card {
  position: relative;
}

/* 悬停效果 */
.file-card:hover {
  transform: translateY(-2px);
}

/* 文件图标样式 */
.file-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 响应式调整 */
@media (max-width: 640px) {
  .file-card {
    padding: 0.75rem;
  }
  
  .h-32 {
    height: 6rem;
  }
}
</style> 