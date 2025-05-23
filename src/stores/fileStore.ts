import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FileItem, UploadProgress, SearchFilter, SortOption, ViewMode, FileStats } from '@/types'
import { FileDB } from '@/utils/fileDB'
import { processFileUpload, processBatchUpload, formatFileSize } from '@/utils/fileUtils'

export const useFileStore = defineStore('file', () => {
  // 状态
  const files = ref<FileItem[]>([])
  const uploadProgresses = ref<UploadProgress[]>([])
  const searchFilter = ref<SearchFilter>({})
  const sortOption = ref<SortOption>({ field: 'uploadTime', order: 'desc' })
  const viewMode = ref<ViewMode>('grid')
  const selectedFiles = ref<Set<string>>(new Set())
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const filteredFiles = computed(() => {
    let result = [...files.value]

    // 关键词搜索
    if (searchFilter.value.keyword) {
      const keyword = searchFilter.value.keyword.toLowerCase()
      result = result.filter(file =>
        file.name.toLowerCase().includes(keyword) ||
        file.description?.toLowerCase().includes(keyword) ||
        file.tags?.some(tag => tag.toLowerCase().includes(keyword))
      )
    }

    // 类型过滤
    if (searchFilter.value.type && searchFilter.value.type.length > 0) {
      result = result.filter(file => {
        return searchFilter.value.type!.some(type => {
          if (type.endsWith('/*')) {
            return file.type.startsWith(type.slice(0, -1))
          }
          return file.type === type
        })
      })
    }

    // 日期范围过滤
    if (searchFilter.value.dateRange) {
      const { start, end } = searchFilter.value.dateRange
      result = result.filter(file => {
        const uploadTime = new Date(file.uploadTime)
        return uploadTime >= start && uploadTime <= end
      })
    }

    // 大小范围过滤
    if (searchFilter.value.sizeRange) {
      const { min, max } = searchFilter.value.sizeRange
      result = result.filter(file => file.size >= min && file.size <= max)
    }

    // 标签过滤
    if (searchFilter.value.tags && searchFilter.value.tags.length > 0) {
      result = result.filter(file =>
        searchFilter.value.tags!.some(tag =>
          file.tags?.includes(tag)
        )
      )
    }

    // 排序
    result.sort((a, b) => {
      const { field, order } = sortOption.value
      let aValue: any = a[field]
      let bValue: any = b[field]

      if (field === 'uploadTime') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (order === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return result
  })

  const fileStats = computed<FileStats>(() => {
    const stats: FileStats = {
      totalFiles: files.value.length,
      totalSize: files.value.reduce((sum, file) => sum + file.size, 0),
      imageCount: 0,
      documentCount: 0,
      videoCount: 0,
      audioCount: 0,
      otherCount: 0
    }

    files.value.forEach(file => {
      const category = file.type.split('/')[0]
      switch (category) {
        case 'image':
          stats.imageCount++
          break
        case 'video':
          stats.videoCount++
          break
        case 'audio':
          stats.audioCount++
          break
        case 'application':
        case 'text':
          stats.documentCount++
          break
        default:
          stats.otherCount++
      }
    })

    return stats
  })

  const isUploading = computed(() => {
    return uploadProgresses.value.some(progress => progress.status === 'uploading')
  })

  // 动作
  async function loadFiles() {
    try {
      isLoading.value = true
      error.value = null
      const dbFiles = await FileDB.getAllFiles()
      files.value = dbFiles
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载文件失败'
      console.error('Failed to load files:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function uploadFiles(fileList: File[]) {
    try {
      error.value = null
      const results = await processBatchUpload(fileList, (progresses) => {
        uploadProgresses.value = progresses
      })

      // 保存到数据库
      for (const fileItem of results) {
        await FileDB.addFile(fileItem)
        files.value.push(fileItem)
      }

      // 清空上传进度
      uploadProgresses.value = []
      return results
    } catch (err) {
      error.value = err instanceof Error ? err.message : '上传文件失败'
      throw err
    }
  }

  async function uploadSingleFile(file: File) {
    try {
      error.value = null
      const fileItem = await processFileUpload(file, (progress) => {
        const index = uploadProgresses.value.findIndex(p => p.fileId === progress.fileId)
        if (index >= 0) {
          uploadProgresses.value[index] = progress
        } else {
          uploadProgresses.value.push(progress)
        }
      })

      await FileDB.addFile(fileItem)
      files.value.push(fileItem)

      // 清空该文件的上传进度
      uploadProgresses.value = uploadProgresses.value.filter(p => p.fileId !== fileItem.id)
      return fileItem
    } catch (err) {
      error.value = err instanceof Error ? err.message : '上传文件失败'
      throw err
    }
  }

  async function deleteFile(fileId: string) {
    try {
      error.value = null
      await FileDB.deleteFile(fileId)
      files.value = files.value.filter(file => file.id !== fileId)
      selectedFiles.value.delete(fileId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除文件失败'
      throw err
    }
  }

  async function deleteSelectedFiles() {
    try {
      error.value = null
      const idsToDelete = Array.from(selectedFiles.value)
      
      for (const id of idsToDelete) {
        await FileDB.deleteFile(id)
      }
      
      files.value = files.value.filter(file => !selectedFiles.value.has(file.id))
      selectedFiles.value.clear()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除选中文件失败'
      throw err
    }
  }

  async function updateFile(fileData: FileItem) {
    try {
      error.value = null
      await FileDB.updateFile(fileData)
      const index = files.value.findIndex(file => file.id === fileData.id)
      if (index >= 0) {
        files.value[index] = fileData
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新文件失败'
      throw err
    }
  }

  function setSearchFilter(filter: SearchFilter) {
    searchFilter.value = { ...filter }
  }

  function setSortOption(option: SortOption) {
    sortOption.value = { ...option }
  }

  function setViewMode(mode: ViewMode) {
    viewMode.value = mode
  }

  function toggleFileSelection(fileId: string) {
    if (selectedFiles.value.has(fileId)) {
      selectedFiles.value.delete(fileId)
    } else {
      selectedFiles.value.add(fileId)
    }
  }

  function selectAllFiles() {
    filteredFiles.value.forEach(file => {
      selectedFiles.value.add(file.id)
    })
  }

  function clearSelection() {
    selectedFiles.value.clear()
  }

  function getFileById(id: string): FileItem | undefined {
    return files.value.find(file => file.id === id)
  }

  function searchFiles(keyword: string) {
    setSearchFilter({ ...searchFilter.value, keyword })
  }

  function filterByType(types: string[]) {
    setSearchFilter({ ...searchFilter.value, type: types })
  }

  function clearFilters() {
    searchFilter.value = {}
  }

  // 返回状态和方法
  return {
    // 状态
    files,
    uploadProgresses,
    searchFilter,
    sortOption,
    viewMode,
    selectedFiles,
    isLoading,
    error,

    // 计算属性
    filteredFiles,
    fileStats,
    isUploading,

    // 方法
    loadFiles,
    uploadFiles,
    uploadSingleFile,
    deleteFile,
    deleteSelectedFiles,
    updateFile,
    setSearchFilter,
    setSortOption,
    setViewMode,
    toggleFileSelection,
    selectAllFiles,
    clearSelection,
    getFileById,
    searchFiles,
    filterByType,
    clearFilters
  }
}) 