<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click="closeDialog"
  >
    <div
      class="glass-card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <!-- 标题 -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-secondary-800 flex items-center">
          <Share class="w-5 h-5 mr-2 text-primary-500" />
          文件分享
        </h2>
        <button
          @click="closeDialog"
          class="text-secondary-400 hover:text-secondary-600 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- 文件信息 -->
      <div class="flex items-center space-x-3 mb-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-100">
        <div 
          class="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm"
          :style="{ backgroundColor: getFileColor(file.type) }"
        >
          {{ getFileIcon(file.type) }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-secondary-800 truncate">{{ file.name }}</p>
          <p class="text-sm text-secondary-500">{{ formatFileSize(file.size) }}</p>
        </div>
      </div>

      <!-- 大小检查 -->
      <div v-if="!canShare" class="mb-6">
        <div class="flex items-center space-x-3 text-orange-700 bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-xl border border-orange-200">
          <AlertTriangle class="w-6 h-6 flex-shrink-0" />
          <div>
            <p class="font-semibold">文件过大无法分享</p>
            <p class="text-sm text-orange-600 mt-1">
              当前: {{ formatFileSize(file.size) }} | 限制: {{ formatFileSize(maxSize) }}
            </p>
          </div>
        </div>
        
        <div class="mt-4 space-y-3">
          <p class="text-sm text-secondary-700 font-medium">💡 建议的解决方案：</p>
          <div class="bg-secondary-50 p-3 rounded-lg">
            <ul class="text-sm text-secondary-600 space-y-1">
              <li>📦 压缩文件后再分享</li>
              <li>☁️ 使用云存储服务</li>
              <li>✉️ 通过邮件传输</li>
            </ul>
          </div>
        </div>
        
        <div class="flex justify-end mt-6">
          <button @click="closeDialog" class="btn-secondary">
            关闭
          </button>
        </div>
      </div>

      <!-- 分享界面 -->
      <div v-else>
        <!-- 生成状态 -->
        <div v-if="isGenerating" class="text-center py-8">
          <div class="animate-spin w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p class="text-secondary-600 font-medium">正在生成预览页面...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="text-center py-6">
          <AlertCircle class="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p class="text-red-600 font-semibold mb-2">生成失败</p>
          <p class="text-sm text-red-500 mb-4">{{ error }}</p>
          <button @click="generateShare" class="btn-primary">
            重试
          </button>
        </div>

        <!-- 成功状态 -->
        <div v-else-if="shareResult" class="space-y-6">
          <!-- 预览卡片 -->
          <div class="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-semibold text-secondary-800 flex items-center">
                <Eye class="w-4 h-4 mr-2 text-primary-500" />
                文件预览页面
              </h3>
              <span class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                ✓ 已就绪
              </span>
            </div>
            <p class="text-sm text-secondary-600 mb-4">
              已为您生成精美的文件预览页面，包含下载和预览功能
            </p>
            
            <!-- 主要操作按钮 -->
            <div class="grid grid-cols-2 gap-3">
              <button @click="openPreview" class="btn-primary flex items-center justify-center space-x-2">
                <ExternalLink class="w-4 h-4" />
                <span>新窗口预览</span>
              </button>
              <button @click="openInCurrentTab" class="btn-secondary flex items-center justify-center space-x-2">
                <Eye class="w-4 h-4" />
                <span>当前页预览</span>
              </button>
            </div>
          </div>

          <!-- 分享链接 -->
          <div class="space-y-3">
            <label class="block text-sm font-semibold text-secondary-700 flex items-center">
              <Link class="w-4 h-4 mr-2" />
              分享链接
            </label>
            
            <!-- 使用提示 -->
            <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
              <div class="flex items-start space-x-2">
                <span class="text-amber-600 mt-0.5">💡</span>
                <div class="text-amber-700">
                  <p class="font-medium">使用提示：</p>
                  <p class="text-amber-600 mt-1">如果新窗口预览被阻止，请尝试"当前页预览"或复制链接手动打开</p>
                </div>
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <input
                :value="shareResult.shareUrl"
                readonly
                class="input-glass flex-1 text-sm font-mono"
                @click="selectAllText"
                placeholder="点击查看完整链接"
              />
              <button
                @click="copyLink"
                class="btn-secondary flex items-center space-x-1 transition-all"
                :class="{ 'bg-green-100 text-green-700 border-green-200': copied }"
              >
                <Copy v-if="!copied" class="w-4 h-4" />
                <Check v-else class="w-4 h-4" />
                <span>{{ copied ? '已复制' : '复制' }}</span>
              </button>
            </div>
          </div>

          <!-- 功能说明 -->
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
            <div class="flex items-start space-x-3">
              <Info class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div class="text-sm text-blue-800">
                <p class="font-semibold mb-2">🎯 分享特性：</p>
                <ul class="space-y-1 text-blue-700">
                  <li>• 📱 美观的移动端适配界面</li>
                  <li>• 👁️ 支持图片、PDF等文件预览</li>
                  <li>• 💾 一键下载功能</li>
                  <li>• 🔒 无需服务器，完全安全</li>
                  <li>• ⚡ 文件内容直接编码到链接中</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex justify-between items-center pt-2">
            <button @click="generateShare" class="btn-secondary text-sm">
              🔄 重新生成
            </button>
            <button @click="closeDialog" class="btn-primary">
              完成
            </button>
          </div>
        </div>

        <!-- 初始状态 -->
        <div v-else class="text-center py-8">
          <div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Share class="w-8 h-8 text-white" />
          </div>
          <p class="text-secondary-600 mb-4 font-medium">准备生成预览页面</p>
          <button @click="generateShare" class="btn-primary">
            生成分享链接
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { 
  Share,
  X, 
  AlertTriangle, 
  AlertCircle, 
  Copy, 
  Check, 
  Info, 
  ExternalLink,
  Download,
  Eye,
  Link
} from 'lucide-vue-next'
import { UrlShareService, type UrlShareResult } from '@/utils/urlShareService'
import { getFileIcon, getFileColor } from '@/utils/fileUtils'
import type { FileItem } from '@/types'

interface Props {
  file: FileItem
  isOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

// 状态
const isGenerating = ref(false)
const shareResult = ref<UrlShareResult | null>(null)
const error = ref('')
const copied = ref(false)

// 计算属性
const shareCheck = computed(() => UrlShareService.canShareFile(props.file))
const canShare = computed(() => shareCheck.value.canShare)
const maxSize = computed(() => shareCheck.value.maxSize)

// 方法
async function generateShare() {
  isGenerating.value = true
  error.value = ''
  shareResult.value = null

  try {
    const result = await UrlShareService.createShare(props.file)
    if (result.success) {
      shareResult.value = result
    } else {
      error.value = result.error || '生成分享失败'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '生成分享失败'
  } finally {
    isGenerating.value = false
  }
}

async function copyLink() {
  if (!shareResult.value?.shareUrl) return

  try {
    await navigator.clipboard.writeText(shareResult.value.shareUrl)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
    
    showNotification('success', '链接已复制', '分享链接已复制到剪贴板')
  } catch (error) {
    showNotification('error', '复制失败', '无法复制到剪贴板')
  }
}

function openPreview() {
  if (!shareResult.value?.shareUrl) {
    showNotification('error', '打开失败', '分享链接不存在')
    return
  }
  
  console.log('🔍 调试信息:')
  console.log('- 链接类型:', shareResult.value.shareUrl.startsWith('blob:') ? 'Blob URL' : 'Data URL')
  console.log('- 链接长度:', shareResult.value.shareUrl.length)
  console.log('- 完整链接:', shareResult.value.shareUrl)
  
  try {
    // 使用Blob URL应该可以正常打开
    const newWindow = window.open(shareResult.value.shareUrl, '_blank')
    
    if (newWindow) {
      console.log('✅ 预览窗口已打开')
      showNotification('success', '预览打开', '文件预览页面已在新标签页打开')
    } else {
      console.warn('⚠️ 窗口被阻止，请允许弹窗')
      showNotification('warning', '弹窗被阻止', '请允许弹窗或使用"当前页预览"')
    }
  } catch (error) {
    console.error('❌ 预览打开失败:', error)
    showNotification('error', '打开失败', '请尝试"当前页预览"')
  }
}

function openInCurrentTab() {
  if (!shareResult.value?.shareUrl) {
    showNotification('error', '打开失败', '分享链接不存在')
    return
  }
  
  console.log('🔄 当前页预览:', shareResult.value.shareUrl)
  
  // 直接跳转到预览页面
  window.location.href = shareResult.value.shareUrl
}

function selectAllText(event: Event) {
  const input = event.target as HTMLInputElement
  input.select()
}

function closeDialog() {
  emit('close')
  // 清理Blob URL
  if (shareResult.value?.shareUrl && shareResult.value.shareUrl.startsWith('blob:')) {
    URL.revokeObjectURL(shareResult.value.shareUrl)
  }
  // 重置状态
  shareResult.value = null
  error.value = ''
  copied.value = false
}

function formatFileSize(bytes: number): string {
  return UrlShareService.formatFileSize(bytes)
}

function showNotification(type: string, title: string, message: string) {
  window.dispatchEvent(new CustomEvent('app-notification', {
    detail: { type, title, message }
  }))
}

function downloadFile() {
  if (!shareResult.value?.shareUrl) return

  try {
    // 对于HTML预览页面，我们需要提取文件内容
    window.open(shareResult.value.shareUrl, '_blank')
    showNotification('success', '预览打开', '文件预览页面已打开，可在其中下载文件')
  } catch (error) {
    console.error('打开预览失败:', error)
    showNotification('error', '打开失败', '无法打开预览页面')
  }
}

// 当对话框打开时，如果文件可以分享，自动生成
watch(() => props.isOpen, (newValue) => {
  if (newValue && canShare.value) {
    generateShare()
  }
}, { immediate: true })
</script>

<style scoped>
/* 动画效果 */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 按钮悬停效果 */
.btn-secondary:hover,
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 输入框聚焦效果 */
.input-glass:focus {
  ring: 2px;
  ring-color: rgb(99 102 241 / 0.5);
  border-color: rgb(99 102 241);
}

/* 渐变边框效果 */
.border-3 {
  border-width: 3px;
}
</style> 