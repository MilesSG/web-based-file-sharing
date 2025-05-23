<template>
  <div class="min-h-screen p-6">
    <div class="max-w-7xl mx-auto">
      <!-- 页面标题和操作栏 -->
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-secondary-800 mb-2">文件管理</h1>
          <p class="text-secondary-600">管理你的所有文件</p>
        </div>
        
        <div class="flex items-center space-x-3 mt-4 md:mt-0">
          <!-- 视图切换 -->
          <div class="flex bg-secondary-100 rounded-xl p-1">
            <button
              @click="setViewMode('grid')"
              class="p-2 rounded-lg transition-colors"
              :class="viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-secondary-200'"
            >
              <Grid3X3 class="w-4 h-4" />
            </button>
            <button
              @click="setViewMode('list')"
              class="p-2 rounded-lg transition-colors"
              :class="viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-secondary-200'"
            >
              <List class="w-4 h-4" />
            </button>
          </div>
          
          <!-- 上传按钮 -->
          <button @click="triggerFileUpload" class="btn-primary flex items-center space-x-2">
            <Plus class="w-4 h-4" />
            <span>添加文件</span>
          </button>
        </div>
      </div>

      <!-- 搜索和筛选栏 -->
      <div class="glass-card p-4 mb-6">
        <div class="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <!-- 搜索框 -->
          <div class="flex-1 relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索文件名、标签..."
              class="input-glass w-full pl-10 pr-4"
              @input="handleSearch"
            />
          </div>
          
          <!-- 类型筛选 -->
          <div class="flex space-x-2">
            <button
              v-for="filter in typeFilters"
              :key="filter.type"
              @click="toggleTypeFilter(filter.type)"
              class="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              :class="isTypeFilterActive(filter.type) 
                ? 'bg-primary-500 text-white' 
                : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'"
            >
              {{ filter.label }}
            </button>
          </div>
          
          <!-- 排序 -->
          <div class="flex items-center space-x-2">
            <span class="text-sm text-secondary-600">排序:</span>
            <select v-model="currentSort" @change="handleSortChange" class="input-glass text-sm">
              <option value="uploadTime-desc">最新上传</option>
              <option value="uploadTime-asc">最早上传</option>
              <option value="name-asc">名称 A-Z</option>
              <option value="name-desc">名称 Z-A</option>
              <option value="size-desc">大小 大-小</option>
              <option value="size-asc">大小 小-大</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 文件统计 -->
      <div class="mb-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="glass-card p-4 text-center">
            <div class="text-2xl font-bold text-primary-600 mb-1">{{ filteredFiles.length }}</div>
            <div class="text-sm text-secondary-500">当前显示</div>
          </div>
          <div class="glass-card p-4 text-center">
            <div class="text-2xl font-bold text-secondary-800 mb-1">{{ fileStats.totalFiles }}</div>
            <div class="text-sm text-secondary-500">总文件数</div>
          </div>
          <div class="glass-card p-4 text-center">
            <div class="text-2xl font-bold text-green-600 mb-1">{{ formatFileSize(fileStats.totalSize) }}</div>
            <div class="text-sm text-secondary-500">总大小</div>
          </div>
          <div class="glass-card p-4 text-center">
            <div class="text-2xl font-bold text-blue-600 mb-1">{{ selectedFiles.size }}</div>
            <div class="text-sm text-secondary-500">已选择</div>
          </div>
        </div>
      </div>

      <!-- 批量操作栏 -->
      <div v-if="selectedFiles.size > 0" class="glass-card p-4 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <span class="text-sm text-secondary-600">已选择 {{ selectedFiles.size }} 个文件</span>
            <button @click="selectAllFiles" class="text-sm text-primary-600 hover:text-primary-700">
              全选
            </button>
            <button @click="clearSelection" class="text-sm text-secondary-600 hover:text-secondary-700">
              取消选择
            </button>
          </div>
          <div class="flex items-center space-x-2">
            <button @click="downloadSelected" class="btn-secondary text-sm">
              <Download class="w-4 h-4 mr-1" />
              下载
            </button>
            <button @click="shareSelected" class="btn-secondary text-sm">
              <Share2 class="w-4 h-4 mr-1" />
              分享
            </button>
            <button @click="deleteSelected" class="btn-secondary text-sm text-red-600 hover:text-red-700">
              <Trash2 class="w-4 h-4 mr-1" />
              删除
            </button>
          </div>
        </div>
      </div>

      <!-- 文件列表 -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="glass-card p-8 text-center">
          <div class="animate-spin w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p class="text-secondary-600">加载中...</p>
        </div>
      </div>

      <div v-else-if="filteredFiles.length === 0" class="text-center py-12">
        <div class="glass-card p-12 max-w-md mx-auto">
          <FolderOpen class="w-16 h-16 text-secondary-400 mx-auto mb-4" />
          <h3 class="text-xl font-semibold text-secondary-700 mb-2">没有找到文件</h3>
          <p class="text-secondary-500 mb-6">
            {{ searchKeyword ? '尝试调整搜索条件' : '上传你的第一个文件开始使用' }}
          </p>
          <button @click="triggerFileUpload" class="btn-primary">
            上传文件
          </button>
        </div>
      </div>

      <!-- 网格视图 -->
      <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <FileCard
          v-for="file in filteredFiles"
          :key="file.id"
          :file="file"
          :selected="selectedFiles.has(file.id)"
          @click="toggleFileSelection(file.id)"
          @preview="handleFilePreview"
          @download="handleFileDownload"
          @share="handleFileShare"
          @rename="handleFileRename"
          @copy="handleFileCopy"
          @move="handleFileMove"
          @delete="handleFileDelete"
        />
      </div>

      <!-- 列表视图 -->
      <div v-else class="glass-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-secondary-50">
              <tr>
                <th class="px-4 py-3 text-left">
                  <input type="checkbox" @change="handleSelectAll" :checked="isAllSelected">
                </th>
                <th class="px-4 py-3 text-left text-sm font-medium text-secondary-700">名称</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-secondary-700">大小</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-secondary-700">类型</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-secondary-700">上传时间</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-secondary-700">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-secondary-200">
              <tr
                v-for="file in filteredFiles"
                :key="file.id"
                class="hover:bg-secondary-50 transition-colors"
                :class="{ 'bg-primary-50': selectedFiles.has(file.id) }"
              >
                <td class="px-4 py-3">
                  <input
                    type="checkbox"
                    :checked="selectedFiles.has(file.id)"
                    @change="toggleFileSelection(file.id)"
                  >
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center space-x-3">
                    <div class="file-icon text-xs w-8 h-8" :style="{ backgroundColor: getFileColor(file.type) }">
                      {{ getFileIcon(file.type) }}
                    </div>
                    <span class="font-medium text-secondary-800">{{ file.name }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-secondary-600">{{ formatFileSize(file.size) }}</td>
                <td class="px-4 py-3 text-sm text-secondary-600">{{ getFileTypeLabel(file.type) }}</td>
                <td class="px-4 py-3 text-sm text-secondary-600">{{ formatDate(file.uploadTime) }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center space-x-2">
                    <button @click="handleFilePreview(file)" class="p-1 text-secondary-400 hover:text-primary-600">
                      <Eye class="w-4 h-4" />
                    </button>
                    <button @click="handleFileDownload(file)" class="p-1 text-secondary-400 hover:text-green-600">
                      <Download class="w-4 h-4" />
                    </button>
                    <button @click="handleFileShare(file)" class="p-1 text-secondary-400 hover:text-blue-600">
                      <Share2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 隐藏的文件输入 -->
      <input
        ref="fileInput"
        type="file"
        multiple
        class="hidden"
        @change="handleFileSelect"
      />

      <!-- 分享对话框 -->
      <QrShareDialog
        :is-open="showShareDialog"
        :file="selectedFileForShare!"
        @close="showShareDialog = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  Grid3X3, 
  List, 
  Plus, 
  Search, 
  Download, 
  Share2, 
  Trash2, 
  FolderOpen, 
  Eye 
} from 'lucide-vue-next'
import { useFileStore } from '@/stores/fileStore'
import FileCard from '@/components/FileCard.vue'
import QrShareDialog from '@/components/QrShareDialog.vue'
import { formatFileSize, getFileIcon, getFileColor } from '@/utils/fileUtils'
import type { FileItem } from '@/types'

const fileStore = useFileStore()
const fileInput = ref<HTMLInputElement>()

// 响应式数据
const searchKeyword = ref('')
const currentSort = ref('uploadTime-desc')
const activeTypeFilters = ref<string[]>([])

// 分享对话框状态
const showShareDialog = ref(false)
const selectedFileForShare = ref<FileItem | null>(null)

// 计算属性
const viewMode = computed(() => fileStore.viewMode)
const filteredFiles = computed(() => fileStore.filteredFiles)
const selectedFiles = computed(() => fileStore.selectedFiles)
const fileStats = computed(() => fileStore.fileStats)
const isLoading = computed(() => fileStore.isLoading)

const isAllSelected = computed(() => 
  filteredFiles.value.length > 0 && 
  filteredFiles.value.every(file => selectedFiles.value.has(file.id))
)

// 类型筛选选项
const typeFilters = [
  { type: 'image/*', label: '图片' },
  { type: 'video/*', label: '视频' },
  { type: 'audio/*', label: '音频' },
  { type: 'application/*', label: '文档' },
  { type: 'text/*', label: '文本' }
]

// 方法
function setViewMode(mode: 'grid' | 'list') {
  fileStore.setViewMode(mode)
}

function handleSearch() {
  fileStore.searchFiles(searchKeyword.value)
}

function toggleTypeFilter(type: string) {
  const index = activeTypeFilters.value.indexOf(type)
  if (index > -1) {
    activeTypeFilters.value.splice(index, 1)
  } else {
    activeTypeFilters.value.push(type)
  }
  fileStore.filterByType(activeTypeFilters.value)
}

function isTypeFilterActive(type: string) {
  return activeTypeFilters.value.includes(type)
}

function handleSortChange() {
  const [field, order] = currentSort.value.split('-')
  fileStore.setSortOption({ field: field as any, order: order as any })
}

function toggleFileSelection(fileId: string) {
  fileStore.toggleFileSelection(fileId)
}

function selectAllFiles() {
  fileStore.selectAllFiles()
}

function clearSelection() {
  fileStore.clearSelection()
}

function handleSelectAll(event: Event) {
  const checked = (event.target as HTMLInputElement).checked
  if (checked) {
    selectAllFiles()
  } else {
    clearSelection()
  }
}

function triggerFileUpload() {
  fileInput.value?.click()
}

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  
  if (files && files.length > 0) {
    try {
      await fileStore.uploadFiles(Array.from(files))
      target.value = ''
    } catch (error) {
      console.error('文件上传失败:', error)
    }
  }
}

// 文件操作
function handleFilePreview(file: FileItem) {
  console.log('预览文件:', file)
}

function handleFileDownload(file: FileItem) {
  console.log('下载文件:', file)
}

function handleFileShare(file: FileItem) {
  selectedFileForShare.value = file
  showShareDialog.value = true
}

function handleFileRename(file: FileItem) {
  console.log('重命名文件:', file)
}

function handleFileCopy(file: FileItem) {
  console.log('复制文件:', file)
}

function handleFileMove(file: FileItem) {
  console.log('移动文件:', file)
}

function handleFileDelete(file: FileItem) {
  if (confirm(`确定要删除文件 "${file.name}" 吗？`)) {
    fileStore.deleteFile(file.id)
  }
}

// 批量操作
function downloadSelected() {
  console.log('批量下载:', selectedFiles.value)
}

function shareSelected() {
  console.log('批量分享:', selectedFiles.value)
}

function deleteSelected() {
  if (confirm(`确定要删除选中的 ${selectedFiles.value.size} 个文件吗？`)) {
    fileStore.deleteSelectedFiles()
  }
}

// 工具函数
function getFileTypeLabel(type: string) {
  const category = type.split('/')[0]
  const categoryMap: Record<string, string> = {
    'image': '图片',
    'video': '视频',
    'audio': '音频',
    'application': '应用',
    'text': '文本'
  }
  return categoryMap[category] || '未知'
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  // 组件挂载时的初始化
})
</script>

<style scoped>
/* 文件图标样式 */
.file-icon {
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 表格样式 */
table {
  border-collapse: separate;
  border-spacing: 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style> 