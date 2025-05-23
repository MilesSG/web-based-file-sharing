import type { FileItem, ShareInfo } from '@/types'

// IndexedDB 数据库配置
const DB_NAME = 'CloudVaultDB'
const DB_VERSION = 1
const FILES_STORE = 'files'
const SHARES_STORE = 'shares'

// 数据库实例
let db: IDBDatabase | null = null

// 初始化数据库
export async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(new Error('无法打开数据库'))
    }

    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result

      // 创建文件存储对象
      if (!database.objectStoreNames.contains(FILES_STORE)) {
        const filesStore = database.createObjectStore(FILES_STORE, { keyPath: 'id' })
        filesStore.createIndex('name', 'name', { unique: false })
        filesStore.createIndex('type', 'type', { unique: false })
        filesStore.createIndex('uploadTime', 'uploadTime', { unique: false })
        filesStore.createIndex('size', 'size', { unique: false })
      }

      // 创建分享存储对象
      if (!database.objectStoreNames.contains(SHARES_STORE)) {
        const sharesStore = database.createObjectStore(SHARES_STORE, { keyPath: 'id' })
        sharesStore.createIndex('fileId', 'fileId', { unique: false })
        sharesStore.createIndex('createdAt', 'createdAt', { unique: false })
      }
    }
  })
}

// 文件操作类
export class FileDB {
  // 添加文件
  static async addFile(fileData: FileItem): Promise<void> {
    const database = await initDB()
    const transaction = database.transaction([FILES_STORE], 'readwrite')
    const store = transaction.objectStore(FILES_STORE)
    
    return new Promise((resolve, reject) => {
      const request = store.add(fileData)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('添加文件失败'))
    })
  }

  // 获取所有文件
  static async getAllFiles(): Promise<FileItem[]> {
    const database = await initDB()
    const transaction = database.transaction([FILES_STORE], 'readonly')
    const store = transaction.objectStore(FILES_STORE)
    
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error('获取文件列表失败'))
    })
  }

  // 根据ID获取文件
  static async getFileById(id: string): Promise<FileItem | null> {
    const database = await initDB()
    const transaction = database.transaction([FILES_STORE], 'readonly')
    const store = transaction.objectStore(FILES_STORE)
    
    return new Promise((resolve, reject) => {
      const request = store.get(id)
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(new Error('获取文件失败'))
    })
  }

  // 更新文件
  static async updateFile(fileData: FileItem): Promise<void> {
    const database = await initDB()
    const transaction = database.transaction([FILES_STORE], 'readwrite')
    const store = transaction.objectStore(FILES_STORE)
    
    return new Promise((resolve, reject) => {
      const request = store.put(fileData)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('更新文件失败'))
    })
  }

  // 删除文件
  static async deleteFile(id: string): Promise<void> {
    const database = await initDB()
    const transaction = database.transaction([FILES_STORE], 'readwrite')
    const store = transaction.objectStore(FILES_STORE)
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('删除文件失败'))
    })
  }

  // 根据类型搜索文件
  static async getFilesByType(type: string): Promise<FileItem[]> {
    const database = await initDB()
    const transaction = database.transaction([FILES_STORE], 'readonly')
    const store = transaction.objectStore(FILES_STORE)
    const index = store.index('type')
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(type)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error('搜索文件失败'))
    })
  }

  // 搜索文件（按名称）
  static async searchFilesByName(keyword: string): Promise<FileItem[]> {
    const allFiles = await this.getAllFiles()
    return allFiles.filter(file => 
      file.name.toLowerCase().includes(keyword.toLowerCase())
    )
  }

  // 获取文件统计
  static async getFileStats(): Promise<{
    totalFiles: number
    totalSize: number
    typeStats: Record<string, number>
  }> {
    const files = await this.getAllFiles()
    const stats = {
      totalFiles: files.length,
      totalSize: files.reduce((total, file) => total + file.size, 0),
      typeStats: {} as Record<string, number>
    }

    files.forEach(file => {
      const category = file.type.split('/')[0]
      stats.typeStats[category] = (stats.typeStats[category] || 0) + 1
    })

    return stats
  }

  // 清理过期文件
  static async cleanupExpiredFiles(): Promise<number> {
    const files = await this.getAllFiles()
    const now = new Date()
    let cleanedCount = 0

    for (const file of files) {
      // 如果文件有分享信息且已过期，删除文件
      if (file.shareInfo?.expiresAt && file.shareInfo.expiresAt < now) {
        await this.deleteFile(file.id)
        cleanedCount++
      }
    }

    return cleanedCount
  }
}

// 分享操作类
export class ShareDB {
  // 添加分享
  static async addShare(shareData: ShareInfo): Promise<void> {
    const database = await initDB()
    const transaction = database.transaction([SHARES_STORE], 'readwrite')
    const store = transaction.objectStore(SHARES_STORE)
    
    return new Promise((resolve, reject) => {
      const request = store.add(shareData)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('添加分享失败'))
    })
  }

  // 获取所有分享
  static async getAllShares(): Promise<ShareInfo[]> {
    const database = await initDB()
    const transaction = database.transaction([SHARES_STORE], 'readonly')
    const store = transaction.objectStore(SHARES_STORE)
    
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error('获取分享列表失败'))
    })
  }

  // 根据文件ID获取分享
  static async getShareByFileId(fileId: string): Promise<ShareInfo | null> {
    const database = await initDB()
    const transaction = database.transaction([SHARES_STORE], 'readonly')
    const store = transaction.objectStore(SHARES_STORE)
    const index = store.index('fileId')
    
    return new Promise((resolve, reject) => {
      const request = index.get(fileId)
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(new Error('获取分享信息失败'))
    })
  }

  // 更新分享
  static async updateShare(shareData: ShareInfo): Promise<void> {
    const database = await initDB()
    const transaction = database.transaction([SHARES_STORE], 'readwrite')
    const store = transaction.objectStore(SHARES_STORE)
    
    return new Promise((resolve, reject) => {
      const request = store.put(shareData)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('更新分享失败'))
    })
  }

  // 删除分享
  static async deleteShare(id: string): Promise<void> {
    const database = await initDB()
    const transaction = database.transaction([SHARES_STORE], 'readwrite')
    const store = transaction.objectStore(SHARES_STORE)
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('删除分享失败'))
    })
  }

  // 增加访问次数
  static async incrementAccessCount(shareId: string): Promise<void> {
    const database = await initDB()
    const transaction = database.transaction([SHARES_STORE], 'readwrite')
    const store = transaction.objectStore(SHARES_STORE)
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(shareId)
      getRequest.onsuccess = () => {
        const shareData = getRequest.result
        if (shareData) {
          shareData.accessCount += 1
          const putRequest = store.put(shareData)
          putRequest.onsuccess = () => resolve()
          putRequest.onerror = () => reject(new Error('更新访问次数失败'))
        } else {
          reject(new Error('分享不存在'))
        }
      }
      getRequest.onerror = () => reject(new Error('获取分享信息失败'))
    })
  }

  // 清理过期分享
  static async cleanupExpiredShares(): Promise<number> {
    const shares = await this.getAllShares()
    const now = new Date()
    let cleanedCount = 0

    for (const share of shares) {
      if (share.expiresAt && share.expiresAt < now) {
        await this.deleteShare(share.id)
        cleanedCount++
      }
    }

    return cleanedCount
  }
}

// 数据库工具函数
export const dbUtils = {
  // 检查数据库是否可用
  async isAvailable(): Promise<boolean> {
    try {
      await initDB()
      return true
    } catch {
      return false
    }
  },

  // 清空所有数据
  async clearAllData(): Promise<void> {
    const database = await initDB()
    const transaction = database.transaction([FILES_STORE, SHARES_STORE], 'readwrite')
    
    const filesStore = transaction.objectStore(FILES_STORE)
    const sharesStore = transaction.objectStore(SHARES_STORE)
    
    await Promise.all([
      new Promise<void>((resolve, reject) => {
        const request = filesStore.clear()
        request.onsuccess = () => resolve()
        request.onerror = () => reject(new Error('清空文件数据失败'))
      }),
      new Promise<void>((resolve, reject) => {
        const request = sharesStore.clear()
        request.onsuccess = () => resolve()
        request.onerror = () => reject(new Error('清空分享数据失败'))
      })
    ])
  },

  // 获取数据库大小（估算）
  async getDatabaseSize(): Promise<number> {
    const files = await FileDB.getAllFiles()
    return files.reduce((total, file) => {
      const fileSize = file.content ? file.content.byteLength : file.size
      return total + fileSize + JSON.stringify(file).length
    }, 0)
  },

  // 导出数据
  async exportData(): Promise<{ files: FileItem[], shares: ShareInfo[] }> {
    const [files, shares] = await Promise.all([
      FileDB.getAllFiles(),
      ShareDB.getAllShares()
    ])
    return { files, shares }
  },

  // 导入数据
  async importData(data: { files: FileItem[], shares: ShareInfo[] }): Promise<void> {
    // 清空现有数据
    await this.clearAllData()

    // 导入文件
    for (const file of data.files) {
      await FileDB.addFile(file)
    }

    // 导入分享
    for (const share of data.shares) {
      await ShareDB.addShare(share)
    }
  }
} 