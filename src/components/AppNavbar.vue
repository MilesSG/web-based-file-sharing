<template>
  <nav class="navbar-glass px-6 py-4">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <!-- Logo和品牌名 -->
      <RouterLink 
        to="/" 
        class="flex items-center space-x-3 group transition-all duration-300 hover:scale-105"
      >
        <div class="w-10 h-10 bg-apple-gradient rounded-2xl flex items-center justify-center shadow-lg">
          <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
          </svg>
        </div>
        <h1 class="text-xl font-bold text-gradient">CloudVault</h1>
      </RouterLink>

      <!-- 导航菜单 -->
      <div class="hidden md:flex items-center space-x-1">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium
                 text-secondary-600 hover:text-primary-600 hover:bg-glass-300
                 transition-all duration-200 hover:scale-105 active:scale-95
                 router-link-active:text-primary-600 router-link-active:bg-glass-400"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </div>

      <!-- 右侧功能区 -->
      <div class="flex items-center space-x-3">
        <!-- 搜索按钮 -->
        <button
          @click="toggleSearch"
          class="p-2.5 rounded-xl bg-glass-300 backdrop-blur-md hover:bg-glass-400 
                 transition-all duration-200 hover:scale-105 active:scale-95"
          title="搜索文件"
        >
          <Search class="w-5 h-5 text-secondary-600" />
        </button>

        <!-- 上传按钮 -->
        <button
          @click="triggerFileUpload"
          class="btn-primary flex items-center space-x-2"
          title="上传文件"
        >
          <Upload class="w-5 h-5" />
          <span class="hidden sm:inline">上传</span>
        </button>

        <!-- 移动端菜单按钮 -->
        <button
          @click="toggleMobileMenu"
          class="md:hidden p-2.5 rounded-xl bg-glass-300 backdrop-blur-md hover:bg-glass-400 
                 transition-all duration-200"
        >
          <Menu class="w-5 h-5 text-secondary-600" />
        </button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <Transition name="slide-down">
      <div v-if="showSearch" class="mt-4 pt-4 border-t border-white/20">
        <div class="max-w-2xl mx-auto">
          <div class="relative">
            <Search class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索文件名、标签..."
              class="input-glass w-full pl-12 pr-4"
              @keyup.enter="performSearch"
              @keyup.esc="hideSearch"
              ref="searchInput"
            >
            <button
              v-if="searchKeyword"
              @click="clearSearch"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 移动端菜单 -->
    <Transition name="slide-down">
      <div v-if="showMobileMenu" class="md:hidden mt-4 pt-4 border-t border-white/20">
        <div class="space-y-2">
          <RouterLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-glass-300 transition-all duration-200"
            @click="hideMobileMenu"
          >
            <component :is="item.icon" class="w-5 h-5 text-secondary-600" />
            <span class="text-secondary-700 font-medium">{{ item.label }}</span>
          </RouterLink>
        </div>
      </div>
    </Transition>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      multiple
      class="hidden"
      @change="handleFileSelect"
    >
  </nav>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { Search, Upload, Menu, X, Home, FolderOpen, Share2, Settings } from 'lucide-vue-next'
import { useFileStore } from '@/stores/fileStore'

// 组件引用
const searchInput = ref<HTMLInputElement>()
const fileInput = ref<HTMLInputElement>()

// 响应式状态
const showSearch = ref(false)
const showMobileMenu = ref(false)
const searchKeyword = ref('')

// 路由和存储
const router = useRouter()
const fileStore = useFileStore()

// 导航项配置
const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/files', icon: FolderOpen, label: '文件' },
  { path: '/shared', icon: Share2, label: '分享' },
  { path: '/settings', icon: Settings, label: '设置' }
]

// 搜索功能
function toggleSearch() {
  showSearch.value = !showSearch.value
  if (showSearch.value) {
    nextTick(() => {
      searchInput.value?.focus()
    })
  }
}

function hideSearch() {
  showSearch.value = false
  searchKeyword.value = ''
}

function clearSearch() {
  searchKeyword.value = ''
  fileStore.clearFilters()
}

function performSearch() {
  if (searchKeyword.value.trim()) {
    fileStore.searchFiles(searchKeyword.value.trim())
    router.push('/files')
  }
  hideSearch()
}

// 移动端菜单
function toggleMobileMenu() {
  showMobileMenu.value = !showMobileMenu.value
}

function hideMobileMenu() {
  showMobileMenu.value = false
}

// 文件上传
function triggerFileUpload() {
  fileInput.value?.click()
}

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  
  if (files && files.length > 0) {
    try {
      await fileStore.uploadFiles(Array.from(files))
      // 清空input，允许重复选择同一文件
      target.value = ''
      
      // 跳转到文件页面
      router.push('/files')
    } catch (error) {
      console.error('文件上传失败:', error)
    }
  }
}

// 点击外部隐藏菜单
function handleClickOutside(event: Event) {
  const target = event.target as Element
  if (!target.closest('nav')) {
    showMobileMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* 动画效果 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-out;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 激活的导航链接样式 */
.router-link-active {
  @apply text-primary-600 bg-glass-400;
}
</style> 