// 文件类型接口
export interface FileItem {
  id: string
  name: string
  size: number
  type: string
  uploadTime: Date
  lastModified?: Date
  thumbnail?: string
  file?: File
  content?: ArrayBuffer
  tags?: string[]
  description?: string
  isShared: boolean
  shareInfo?: ShareInfo
}

// 分享信息接口
export interface ShareInfo {
  id: string
  fileId: string
  shareUrl: string
  password?: string
  expiresAt?: Date
  accessCount: number
  maxAccess?: number
  createdAt: Date
  isPublic: boolean
  qrCode?: string
}

// 文件预览信息
export interface FilePreview {
  id: string
  type: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other'
  thumbnail?: string
  canPreview: boolean
  previewUrl?: string
}

// 上传进度
export interface UploadProgress {
  fileId: string
  fileName: string
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
}

// 文件统计
export interface FileStats {
  totalFiles: number
  totalSize: number
  imageCount: number
  documentCount: number
  videoCount: number
  audioCount: number
  otherCount: number
}

// 搜索过滤条件
export interface SearchFilter {
  keyword?: string
  type?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  sizeRange?: {
    min: number
    max: number
  }
  tags?: string[]
}

// 视图模式
export type ViewMode = 'grid' | 'list'

// 排序选项
export interface SortOption {
  field: 'name' | 'size' | 'uploadTime' | 'type'
  order: 'asc' | 'desc'
}

// 文件操作类型
export type FileAction = 'download' | 'delete' | 'share' | 'rename' | 'move' | 'copy'

// 用户设置
export interface UserSettings {
  viewMode: 'grid' | 'list'
  sortOption: SortOption
  autoCleanup: boolean
  maxStorageSize: number
  enableNotifications: boolean
  theme: 'auto' | 'light' | 'dark'
  language: 'zh-CN' | 'en-US'
}

// 通知类型
export interface NotificationItem {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: Date
  read: boolean
  action?: {
    label: string
    callback: () => void
  }
} 