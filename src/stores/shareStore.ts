import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ShareInfo, FileItem } from '@/types'
import { ShareDB } from '@/utils/fileDB'
import { generateId, generateShareUrl, generateQRCode } from '@/utils/fileUtils'

export const useShareStore = defineStore('share', () => {
  // 状态
  const shares = ref<ShareInfo[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const activeShares = computed(() => {
    const now = new Date()
    return shares.value.filter(share => {
      if (share.expiresAt) {
        return share.expiresAt > now
      }
      return true
    })
  })

  const expiredShares = computed(() => {
    const now = new Date()
    return shares.value.filter(share => {
      if (share.expiresAt) {
        return share.expiresAt <= now
      }
      return false
    })
  })

  const shareStats = computed(() => {
    return {
      total: shares.value.length,
      active: activeShares.value.length,
      expired: expiredShares.value.length,
      totalAccess: shares.value.reduce((sum, share) => sum + share.accessCount, 0)
    }
  })

  // 动作
  async function loadShares() {
    try {
      isLoading.value = true
      error.value = null
      const dbShares = await ShareDB.getAllShares()
      shares.value = dbShares
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载分享列表失败'
      console.error('Failed to load shares:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function createShare(
    fileItem: FileItem,
    options: {
      password?: string
      expiresAt?: Date
      maxAccess?: number
      isPublic?: boolean
    } = {}
  ): Promise<ShareInfo> {
    try {
      error.value = null
      const shareId = generateId()
      const shareUrl = generateShareUrl(shareId)
      const qrCode = await generateQRCode(shareUrl)

      const shareInfo: ShareInfo = {
        id: shareId,
        fileId: fileItem.id,
        shareUrl,
        password: options.password,
        expiresAt: options.expiresAt,
        accessCount: 0,
        maxAccess: options.maxAccess,
        createdAt: new Date(),
        isPublic: options.isPublic ?? true,
        qrCode
      }

      await ShareDB.addShare(shareInfo)
      shares.value.push(shareInfo)

      return shareInfo
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建分享失败'
      throw err
    }
  }

  async function updateShare(shareData: ShareInfo) {
    try {
      error.value = null
      await ShareDB.updateShare(shareData)
      const index = shares.value.findIndex(share => share.id === shareData.id)
      if (index >= 0) {
        shares.value[index] = shareData
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新分享失败'
      throw err
    }
  }

  async function deleteShare(shareId: string) {
    try {
      error.value = null
      await ShareDB.deleteShare(shareId)
      shares.value = shares.value.filter(share => share.id !== shareId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除分享失败'
      throw err
    }
  }

  async function incrementAccessCount(shareId: string) {
    try {
      error.value = null
      await ShareDB.incrementAccessCount(shareId)
      const share = shares.value.find(s => s.id === shareId)
      if (share) {
        share.accessCount += 1
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新访问次数失败'
      throw err
    }
  }

  function getShareByFileId(fileId: string): ShareInfo | undefined {
    return shares.value.find(share => share.fileId === fileId)
  }

  function getShareById(shareId: string): ShareInfo | undefined {
    return shares.value.find(share => share.id === shareId)
  }

  async function cleanupExpiredShares(): Promise<number> {
    try {
      error.value = null
      const cleaned = await ShareDB.cleanupExpiredShares()
      if (cleaned > 0) {
        await loadShares() // 重新加载数据
      }
      return cleaned
    } catch (err) {
      error.value = err instanceof Error ? err.message : '清理过期分享失败'
      throw err
    }
  }

  function validateShareAccess(share: ShareInfo, password?: string): {
    valid: boolean
    reason?: string
  } {
    // 检查是否过期
    if (share.expiresAt && share.expiresAt <= new Date()) {
      return { valid: false, reason: '分享已过期' }
    }

    // 检查访问次数限制
    if (share.maxAccess && share.accessCount >= share.maxAccess) {
      return { valid: false, reason: '访问次数已达上限' }
    }

    // 检查密码
    if (share.password && share.password !== password) {
      return { valid: false, reason: '密码错误' }
    }

    return { valid: true }
  }

  // 返回状态和方法
  return {
    // 状态
    shares,
    isLoading,
    error,

    // 计算属性
    activeShares,
    expiredShares,
    shareStats,

    // 方法
    loadShares,
    createShare,
    updateShare,
    deleteShare,
    incrementAccessCount,
    getShareByFileId,
    getShareById,
    cleanupExpiredShares,
    validateShareAccess
  }
}) 