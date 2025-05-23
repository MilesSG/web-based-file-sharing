import type { FileItem } from '@/types'

export interface UrlShareResult {
  success: boolean
  shareUrl?: string
  error?: string
  fileSize?: number
  sizeLimit?: number
  directDownload?: boolean
}

export class UrlShareService {
  private static readonly MAX_FILE_SIZE = 100 * 1024 // 100KB限制（确保二维码分享稳定）
  
  /**
   * 创建直接文件分享（将文件编码到二维码中）
   */
  static async createShare(file: FileItem): Promise<UrlShareResult> {
    try {
      // 检查文件大小
      if (file.size > this.MAX_FILE_SIZE) {
        return {
          success: false,
          error: '文件太大无法通过链接分享',
          fileSize: file.size,
          sizeLimit: this.MAX_FILE_SIZE
        }
      }

      // 获取文件内容
      let fileContent: ArrayBuffer
      if (file.file) {
        fileContent = await file.file.arrayBuffer()
      } else if (file.content) {
        fileContent = file.content
      } else {
        throw new Error('无法获取文件内容')
      }

      // 对于某些文件类型（如PDF、图片等）不进行压缩，避免损坏文件格式
      const shouldCompress = this.shouldCompressFile(file.type)
      const finalContent = shouldCompress 
        ? await this.compressData(new Uint8Array(fileContent))
        : new Uint8Array(fileContent)
      
      // 创建Data URI（直接包含文件内容）
      const base64Content = this.uint8ArrayToBase64(finalContent)
      
      // 生成Data URI，确保MIME类型正确
      const mimeType = file.type || this.getMimeTypeFromFileName(file.name)
      const dataUri = `data:${mimeType};base64,${base64Content}`
      
      // 创建预览页面HTML
      const previewHtml = this.createPreviewPage(file.name, dataUri, mimeType, file.size, shouldCompress)
      
      // 使用Blob URL而不是data URI，避免浏览器安全限制
      const htmlBlob = new Blob([previewHtml], { type: 'text/html;charset=utf-8' })
      const shareUrl = URL.createObjectURL(htmlBlob)
      
      return {
        success: true,
        shareUrl,
        fileSize: file.size,
        sizeLimit: this.MAX_FILE_SIZE,
        directDownload: true
      }

    } catch (error) {
      console.error('创建文件分享失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '分享创建失败'
      }
    }
  }

  /**
   * 检查是否支持文件分享
   */
  static canShareFile(file: FileItem): {
    canShare: boolean
    reason?: string
    maxSize: number
  } {
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        canShare: false,
        reason: '文件大小超过限制',
        maxSize: this.MAX_FILE_SIZE
      }
    }

    return {
      canShare: true,
      maxSize: this.MAX_FILE_SIZE
    }
  }

  /**
   * 格式化文件大小
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  /**
   * 将Uint8Array转换为安全的base64编码
   */
  private static uint8ArrayToBase64(uint8Array: Uint8Array): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    let result = ''
    
    for (let i = 0; i < uint8Array.length; i += 3) {
      const a = uint8Array[i]
      const b = i + 1 < uint8Array.length ? uint8Array[i + 1] : 0
      const c = i + 2 < uint8Array.length ? uint8Array[i + 2] : 0
      
      const bitmap = (a << 16) | (b << 8) | c
      
      result += chars.charAt((bitmap >> 18) & 63) +
                chars.charAt((bitmap >> 12) & 63) +
                (i + 1 < uint8Array.length ? chars.charAt((bitmap >> 6) & 63) : '=') +
                (i + 2 < uint8Array.length ? chars.charAt(bitmap & 63) : '=')
    }
    
    return result
  }

  /**
   * 压缩数据
   */
  private static async compressData(data: Uint8Array): Promise<Uint8Array> {
    try {
      // 尝试使用浏览器原生的压缩API
      if ('CompressionStream' in window) {
        const stream = new CompressionStream('gzip')
        const writer = stream.writable.getWriter()
        const reader = stream.readable.getReader()
        
        writer.write(data)
        writer.close()

        const chunks: Uint8Array[] = []
        let result = await reader.read()
        while (!result.done) {
          chunks.push(result.value)
          result = await reader.read()
        }

        // 合并chunks
        const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
        const compressed = new Uint8Array(totalLength)
        let offset = 0
        for (const chunk of chunks) {
          compressed.set(chunk, offset)
          offset += chunk.length
        }

        // 如果压缩后更小，返回压缩结果，否则返回原数据
        return compressed.length < data.length ? compressed : data
      }
      
      // 如果不支持压缩，直接返回原数据
      return data
    } catch (error) {
      console.warn('压缩失败，使用原始数据:', error)
      return data
    }
  }

  /**
   * 判断文件是否应该被压缩
   */
  private static shouldCompressFile(type: string | undefined): boolean {
    if (!type) return false
    
    // 不压缩已经压缩的格式，避免损坏文件
    const noCompressTypes = [
      // PDF文件
      'application/pdf',
      // 图片格式
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      // 视频格式  
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
      // 音频格式
      'audio/mp3', 'audio/wav', 'audio/ogg',
      // 压缩文件
      'application/zip', 'application/rar', 'application/7z',
      // Office文件（已经压缩）
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]
    
    return !noCompressTypes.includes(type.toLowerCase())
  }

  /**
   * 根据文件名获取MIME类型
   */
  private static getMimeTypeFromFileName(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase()
    
    const mimeTypes: Record<string, string> = {
      // 文档类型
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      
      // 图片类型
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'bmp': 'image/bmp',
      'svg': 'image/svg+xml',
      
      // 视频类型
      'mp4': 'video/mp4',
      'avi': 'video/x-msvideo',
      'mov': 'video/quicktime',
      'wmv': 'video/x-ms-wmv',
      'flv': 'video/x-flv',
      
      // 音频类型
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'ogg': 'audio/ogg',
      'aac': 'audio/aac',
      
      // 文本类型
      'txt': 'text/plain',
      'html': 'text/html',
      'css': 'text/css',
      'js': 'text/javascript',
      'json': 'application/json',
      'xml': 'text/xml',
      
      // 压缩文件
      'zip': 'application/zip',
      'rar': 'application/x-rar-compressed',
      '7z': 'application/x-7z-compressed',
      'tar': 'application/x-tar',
      'gz': 'application/gzip'
    }
    
    return mimeTypes[ext || ''] || 'application/octet-stream'
  }

  /**
   * 创建预览页面HTML
   */
  private static createPreviewPage(fileName: string, dataUri: string, mimeType: string, fileSize: number, shouldCompress: boolean): string {
    const fileIcon = this.getFileIcon(mimeType)
    const compressionStatus = shouldCompress ? '已压缩以减小大小' : '文件已安全编码'
    
    const previewHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>文件分享 - ${fileName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    .container {
      background: white;
      border-radius: 20px;
      padding: 40px;
      max-width: 400px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
    }
    
    .file-icon {
      width: 80px;
      height: 80px;
      background: ${fileIcon.color};
      border-radius: 16px;
      margin: 0 auto 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
    }
    
    .title {
      font-size: 24px;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
    }
    
    .file-name {
      font-size: 16px;
      color: #666;
      margin-bottom: 32px;
    }
    
    .button {
      display: inline-block;
      padding: 14px 28px;
      border-radius: 50px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      margin: 8px;
      transition: all 0.3s ease;
      cursor: pointer;
      border: none;
    }
    
    .download-btn {
      background: #6366f1;
      color: white;
    }
    
    .download-btn:hover {
      background: #5856eb;
      transform: translateY(-2px);
    }
    
    .preview-btn {
      background: #10b981;
      color: white;
    }
    
    .preview-btn:hover {
      background: #059669;
      transform: translateY(-2px);
    }
    
    .info {
      font-size: 14px;
      color: #666;
      margin-top: 24px;
      line-height: 1.5;
    }
    
    .file-info {
      background: #f8fafc;
      border-radius: 12px;
      padding: 16px;
      margin: 24px 0;
      font-size: 14px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="file-icon">
      ${fileIcon.icon}
    </div>
    
    <h1 class="title">文件分享</h1>
    <p class="file-name">${fileName}</p>
    
    <a href="${dataUri}" download="${fileName}" class="button download-btn">
      📥 下载文件
    </a>
    
    <button onclick="previewFile()" class="button preview-btn">
      👁️ 预览文件
    </button>
    
    <div class="file-info">
      <div>文件大小：${this.formatFileSize(fileSize)}</div>
      <div>文件类型：${mimeType}</div>
    </div>
    
    <p class="info">
      ${compressionStatus}，点击即可下载<br>
      ${compressionStatus}
    </p>
  </div>

  <script>
    function previewFile() {
      const dataUri = "${dataUri}";
      const mimeType = "${mimeType}";
      
      if (mimeType.startsWith('image/')) {
        // 图片预览
        const newWindow = window.open('', '_blank');
        newWindow.document.write(\`
          <html>
            <head><title>图片预览 - ${fileName}</title></head>
            <body style="margin:0; display:flex; justify-content:center; align-items:center; min-height:100vh; background:#000;">
              <img src="\${dataUri}" style="max-width:100%; max-height:100%; object-fit:contain;">
            </body>
          </html>
        \`);
      } else if (mimeType === 'application/pdf') {
        // PDF预览
        const newWindow = window.open('', '_blank');
        newWindow.document.write(\`
          <html>
            <head><title>PDF预览 - ${fileName}</title></head>
            <body style="margin:0;">
              <embed src="\${dataUri}" type="application/pdf" width="100%" height="100vh">
            </body>
          </html>
        \`);
      } else if (mimeType.startsWith('text/')) {
        // 文本预览
        fetch(dataUri)
          .then(response => response.text())
          .then(text => {
            const newWindow = window.open('', '_blank');
            newWindow.document.write(\`
              <html>
                <head><title>文本预览 - ${fileName}</title></head>
                <body style="font-family: monospace; padding: 20px; background: #f5f5f5;">
                  <pre style="white-space: pre-wrap; word-wrap: break-word;">\${text}</pre>
                </body>
              </html>
            \`);
          });
      } else {
        // 其他文件类型直接下载
        window.location.href = dataUri;
      }
    }
  </script>
</body>
</html>`
    
    return previewHtml
  }

  /**
   * 获取文件图标
   */
  private static getFileIcon(mimeType: string): { icon: string, color: string } {
    if (mimeType.startsWith('image/')) {
      return { icon: '🖼️', color: '#06b6d4' }
    } else if (mimeType === 'application/pdf') {
      return { icon: '📄', color: '#ef4444' }
    } else if (mimeType.startsWith('video/')) {
      return { icon: '🎥', color: '#8b5cf6' }
    } else if (mimeType.startsWith('audio/')) {
      return { icon: '🎵', color: '#10b981' }
    } else if (mimeType.includes('document') || mimeType.includes('word')) {
      return { icon: '📝', color: '#3b82f6' }
    } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
      return { icon: '📊', color: '#10b981' }
    } else if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
      return { icon: '📊', color: '#f59e0b' }
    } else if (mimeType.startsWith('text/')) {
      return { icon: '📝', color: '#6b7280' }
    } else if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) {
      return { icon: '🗂️', color: '#f59e0b' }
    }
    
    return { icon: '📁', color: '#6366f1' }
  }

  /**
   * 将字符串转换为安全的base64编码
   */
  private static stringToBase64(str: string): string {
    const uint8Array = new TextEncoder().encode(str)
    return this.uint8ArrayToBase64(uint8Array)
  }
} 