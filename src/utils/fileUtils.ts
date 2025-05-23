import type { FileItem, UploadProgress } from '@/types'

// 文件大小格式化
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 判断是否为图片文件
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

// 判断是否为视频文件
export function isVideoFile(mimeType: string): boolean {
  return mimeType.startsWith('video/')
}

// 判断是否为音频文件
export function isAudioFile(mimeType: string): boolean {
  return mimeType.startsWith('audio/')
}

// 文件类型映射
const FILE_TYPE_ICONS: Record<string, { icon: string; color: string; category: string }> = {
  // 图片
  'image/jpeg': { icon: '🖼️', color: '#FF6B35', category: 'image' },
  'image/png': { icon: '🖼️', color: '#FF6B35', category: 'image' },
  'image/gif': { icon: '🎞️', color: '#FF6B35', category: 'image' },
  'image/webp': { icon: '🖼️', color: '#FF6B35', category: 'image' },
  'image/svg+xml': { icon: '🎨', color: '#FF6B35', category: 'image' },
  
  // 文档
  'application/pdf': { icon: '📄', color: '#E74C3C', category: 'document' },
  'application/msword': { icon: '📝', color: '#2B579A', category: 'document' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: '📝', color: '#2B579A', category: 'document' },
  'application/vnd.ms-excel': { icon: '📊', color: '#217346', category: 'document' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: '📊', color: '#217346', category: 'document' },
  'application/vnd.ms-powerpoint': { icon: '📽️', color: '#D24726', category: 'document' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { icon: '📽️', color: '#D24726', category: 'document' },
  'text/plain': { icon: '📄', color: '#5D6D7E', category: 'document' },
  'text/html': { icon: '🌐', color: '#E67E22', category: 'document' },
  'text/css': { icon: '🎨', color: '#3498DB', category: 'document' },
  'text/javascript': { icon: '📜', color: '#F1C40F', category: 'document' },
  'application/json': { icon: '⚙️', color: '#2ECC71', category: 'document' },
  
  // 视频
  'video/mp4': { icon: '🎬', color: '#9B59B6', category: 'video' },
  'video/avi': { icon: '🎬', color: '#9B59B6', category: 'video' },
  'video/mov': { icon: '🎬', color: '#9B59B6', category: 'video' },
  'video/wmv': { icon: '🎬', color: '#9B59B6', category: 'video' },
  'video/flv': { icon: '🎬', color: '#9B59B6', category: 'video' },
  'video/webm': { icon: '🎬', color: '#9B59B6', category: 'video' },
  
  // 音频
  'audio/mpeg': { icon: '🎵', color: '#E91E63', category: 'audio' },
  'audio/wav': { icon: '🎵', color: '#E91E63', category: 'audio' },
  'audio/flac': { icon: '🎵', color: '#E91E63', category: 'audio' },
  'audio/ogg': { icon: '🎵', color: '#E91E63', category: 'audio' },
  'audio/mp3': { icon: '🎵', color: '#E91E63', category: 'audio' },
  
  // 压缩包
  'application/zip': { icon: '🗜️', color: '#795548', category: 'archive' },
  'application/x-rar-compressed': { icon: '🗜️', color: '#795548', category: 'archive' },
  'application/x-7z-compressed': { icon: '🗜️', color: '#795548', category: 'archive' },
  'application/x-tar': { icon: '🗜️', color: '#795548', category: 'archive' },
  'application/gzip': { icon: '🗜️', color: '#795548', category: 'archive' },
  
  // 默认
  'default': { icon: '📁', color: '#95A5A6', category: 'other' }
}

// 获取文件类型信息
export function getFileTypeInfo(mimeType: string) {
  return FILE_TYPE_ICONS[mimeType] || FILE_TYPE_ICONS.default
}

// 生成唯一ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 生成文件缩略图
export async function generateThumbnail(file: File): Promise<string | undefined> {
  return new Promise((resolve) => {
    if (!isImageFile(file.type)) {
      resolve(undefined)
      return
    }

    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      resolve(undefined)
      return
    }

    img.onload = () => {
      // 设置缩略图尺寸
      const MAX_SIZE = 200
      let { width, height } = img

      if (width > height) {
        if (width > MAX_SIZE) {
          height = (height * MAX_SIZE) / width
          width = MAX_SIZE
        }
      } else {
        if (height > MAX_SIZE) {
          width = (width * MAX_SIZE) / height
          height = MAX_SIZE
        }
      }

      canvas.width = width
      canvas.height = height

      // 绘制图片
      ctx.drawImage(img, 0, 0, width, height)
      
      // 转换为base64
      const thumbnail = canvas.toDataURL('image/jpeg', 0.8)
      resolve(thumbnail)
    }

    img.onerror = () => resolve(undefined)
    img.src = URL.createObjectURL(file)
  })
}

// 读取文件内容
export async function readFileContent(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result)
      } else {
        reject(new Error('读取文件失败'))
      }
    }
    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.readAsArrayBuffer(file)
  })
}

// 文件上传处理
export async function processFileUpload(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<FileItem> {
  const fileId = generateId()
  
  // 创建上传进度对象
  const progress: UploadProgress = {
    fileId,
    fileName: file.name,
    progress: 0,
    status: 'pending'
  }

  try {
    // 开始上传
    if (onProgress) {
      progress.status = 'uploading'
      progress.progress = 10
      onProgress(progress)
    }

    // 生成缩略图
    let thumbnail: string | undefined = undefined
    if (isImageFile(file.type)) {
      thumbnail = await generateThumbnail(file)
      if (onProgress) {
        progress.progress = 30
        onProgress(progress)
      }
    }

    // 读取文件内容
    const content = await readFileContent(file)
    if (onProgress) {
      progress.progress = 70
      onProgress(progress)
    }

    // 创建文件对象
    const fileItem: FileItem = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadTime: new Date(),
      lastModified: file.lastModified ? new Date(file.lastModified) : undefined,
      thumbnail,
      file,
      content,
      tags: [],
      description: '',
      isShared: false
    }

    // 完成上传
    if (onProgress) {
      progress.status = 'completed'
      progress.progress = 100
      onProgress(progress)
    }

    return fileItem

  } catch (error) {
    // 上传失败
    if (onProgress) {
      progress.status = 'error'
      progress.error = error instanceof Error ? error.message : '上传失败'
      onProgress(progress)
    }
    throw error
  }
}

// 批量文件上传
export async function processBatchUpload(
  files: File[],
  onProgress?: (progresses: UploadProgress[]) => void
): Promise<FileItem[]> {
  const progresses: UploadProgress[] = files.map(file => ({
    fileId: generateId(),
    fileName: file.name,
    progress: 0,
    status: 'pending'
  }))

  const results: FileItem[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const progressIndex = i

    try {
      const fileItem = await processFileUpload(file, (progress) => {
        progresses[progressIndex] = progress
        if (onProgress) {
          onProgress([...progresses])
        }
      })
      results.push(fileItem)
    } catch (error) {
      progresses[progressIndex].status = 'error'
      progresses[progressIndex].error = error instanceof Error ? error.message : '上传失败'
      if (onProgress) {
        onProgress([...progresses])
      }
    }
  }

  return results
}

// 下载文件
export function downloadFile(fileItem: FileItem): void {
  if (!fileItem.content) {
    throw new Error('文件内容不存在')
  }

  const blob = new Blob([fileItem.content], { type: fileItem.type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  
  link.href = url
  link.download = fileItem.name
  link.style.display = 'none'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

// 预览文件URL
export function getFilePreviewUrl(fileItem: FileItem): string | null {
  if (!fileItem.content) return null

  const blob = new Blob([fileItem.content], { type: fileItem.type })
  return URL.createObjectURL(blob)
}

// 复制文件
export function copyFile(fileItem: FileItem): FileItem {
  const newId = generateId()
  const copyName = `${fileItem.name.replace(/(\.[^.]+)?$/, '_copy$1')}`

  return {
    ...fileItem,
    id: newId,
    name: copyName,
    uploadTime: new Date(),
    isShared: false,
    shareInfo: undefined
  }
}

// 文件类型验证
export function validateFileType(file: File, allowedTypes?: string[]): boolean {
  if (!allowedTypes || allowedTypes.length === 0) {
    return true
  }

  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.slice(0, -1))
    }
    return file.type === type
  })
}

// 文件大小验证
export function validateFileSize(file: File, maxSize?: number): boolean {
  if (!maxSize) return true
  return file.size <= maxSize
}

// 批量文件验证
export function validateFiles(
  files: File[],
  options?: {
    allowedTypes?: string[]
    maxFileSize?: number
    maxTotalSize?: number
    maxFiles?: number
  }
): { valid: File[], invalid: { file: File, reason: string }[] } {
  const valid: File[] = []
  const invalid: { file: File, reason: string }[] = []

  // 检查文件数量
  if (options?.maxFiles && files.length > options.maxFiles) {
    return {
      valid: [],
      invalid: files.map(file => ({ file, reason: `最多只能上传 ${options.maxFiles} 个文件` }))
    }
  }

  // 检查总大小
  if (options?.maxTotalSize) {
    const totalSize = files.reduce((sum, file) => sum + file.size, 0)
    if (totalSize > options.maxTotalSize) {
      return {
        valid: [],
        invalid: files.map(file => ({ 
          file, 
          reason: `总文件大小超过限制 (${formatFileSize(options.maxTotalSize!)})`
        }))
      }
    }
  }

  for (const file of files) {
    // 检查文件类型
    if (!validateFileType(file, options?.allowedTypes)) {
      invalid.push({ file, reason: '不支持的文件类型' })
      continue
    }

    // 检查文件大小
    if (!validateFileSize(file, options?.maxFileSize)) {
      invalid.push({ 
        file, 
        reason: `文件大小超过限制 (${formatFileSize(options?.maxFileSize || 0)})` 
      })
      continue
    }

    valid.push(file)
  }

  return { valid, invalid }
}

// 生成分享链接
export function generateShareUrl(fileId: string, baseUrl?: string): string {
  const base = baseUrl || window.location.origin
  return `${base}/share/${fileId}`
}

// 生成二维码数据URL
export async function generateQRCode(text: string): Promise<string> {
  try {
    // 动态导入二维码库
    const QRCode = await import('qrcode-generator')
    
    // 创建二维码
    const qr = QRCode.default(0, 'M')
    qr.addData(text)
    qr.make()
    
    // 生成SVG
    const size = 200
    const cellSize = size / qr.getModuleCount()
    const margin = cellSize * 2
    const svgSize = size + margin * 2
    
    let svg = `<svg width="${svgSize}" height="${svgSize}" xmlns="http://www.w3.org/2000/svg">`
    svg += `<rect width="100%" height="100%" fill="white"/>`
    
    // 绘制二维码
    for (let row = 0; row < qr.getModuleCount(); row++) {
      for (let col = 0; col < qr.getModuleCount(); col++) {
        if (qr.isDark(row, col)) {
          const x = margin + col * cellSize
          const y = margin + row * cellSize
          svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="black"/>`
        }
      }
    }
    
    svg += '</svg>'
    
    // 转换为数据URL
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    return URL.createObjectURL(blob)
  } catch (error) {
    console.error('生成二维码失败:', error)
    // 降级方案：生成简单的SVG占位符
    const svg = `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white" stroke="#ddd"/>
        <text x="50%" y="45%" text-anchor="middle" dy=".3em" font-family="monospace" font-size="12" fill="#666">
          QR Code
        </text>
        <text x="50%" y="60%" text-anchor="middle" dy=".3em" font-family="monospace" font-size="8" fill="#999">
          ${text.length > 25 ? text.substring(0, 25) + '...' : text}
        </text>
      </svg>
    `
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    return URL.createObjectURL(blob)
  }
}

// 文件搜索高亮
export function highlightSearchText(text: string, keyword: string): string {
  if (!keyword) return text
  
  const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

// 获取文件图标
export function getFileIcon(mimeType: string): string {
  const typeInfo = getFileTypeInfo(mimeType)
  return typeInfo.icon
}

// 获取文件颜色
export function getFileColor(mimeType: string): string {
  const typeInfo = getFileTypeInfo(mimeType)
  return typeInfo.color
}

// 创建文件拖拽处理器
export function createDragHandler(
  onDrop: (files: File[]) => void,
  onDragOver?: (event: DragEvent) => void,
  onDragLeave?: (event: DragEvent) => void
) {
  const handleDragOver = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (onDragOver) {
      onDragOver(event)
    }
  }

  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (onDragLeave) {
      onDragLeave(event)
    }
  }

  const handleDrop = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()

    const files = Array.from(event.dataTransfer?.files || [])
    if (files.length > 0) {
      onDrop(files)
    }
  }

  return {
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop
  }
}

// 压缩图片
export async function compressImage(
  file: File, 
  options: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
  } = {}
): Promise<File> {
  return new Promise((resolve, reject) => {
    if (!isImageFile(file.type)) {
      resolve(file)
      return
    }

    const { maxWidth = 1920, maxHeight = 1080, quality = 0.8 } = options

    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      resolve(file)
      return
    }

    img.onload = () => {
      let { width, height } = img

      // 计算新尺寸
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height
        if (aspectRatio > maxWidth / maxHeight) {
          width = maxWidth
          height = maxWidth / aspectRatio
        } else {
          height = maxHeight
          width = maxHeight * aspectRatio
        }
      }

      canvas.width = width
      canvas.height = height

      // 绘制压缩后的图片
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          })
          resolve(compressedFile)
        } else {
          resolve(file)
        }
      }, file.type, quality)
    }

    img.onerror = () => resolve(file)
    img.src = URL.createObjectURL(file)
  })
} 