import { supabase } from './supabase'

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Upload an image file to Supabase Storage
 * @param file - The image file to upload
 * @param bucket - The storage bucket name ('user-images' or 'business-images')
 * @param path - The file path within the bucket (e.g., 'userId/avatar.jpg')
 * @returns Promise with upload result
 */
export async function uploadImage(
  file: File,
  bucket: 'user-images' | 'business-images',
  path: string
): Promise<UploadResult> {
  try {
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'File must be an image' }
    }

    const maxSize = bucket === 'user-images' ? 5 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024)
      return { success: false, error: `File size must be less than ${maxSizeMB}MB` }
    }

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      return { success: false, error: error.message }
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return { success: true, url: publicUrl }
  } catch (_error) {
    return { success: false, error: 'Upload failed' }
  }
}

/**
 * Delete an image from Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @returns Promise with deletion result
 */
export async function deleteImage(
  bucket: 'user-images' | 'business-images',
  path: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (_error) {
    return { success: false, error: 'Delete failed' }
  }
}

/**
 * Get public URL for an image in Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @returns Public URL for the image
 */
export function getImageUrl(
  bucket: 'user-images' | 'business-images',
  path: string
): string {
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)
  
  return publicUrl
}

/**
 * Generate a unique file path for user avatar
 * @param userId - The user ID
 * @param fileName - Original file name
 * @returns Unique file path
 */
export function generateAvatarPath(userId: string, fileName: string): string {
  const extension = fileName.split('.').pop()
  const timestamp = Date.now()
  return `${userId}/avatar_${timestamp}.${extension}`
}

/**
 * Generate a unique file path for business gallery image
 * @param userId - The user ID (business owner)
 * @param fileName - Original file name
 * @returns Unique file path
 */
export function generateGalleryPath(userId: string, fileName: string): string {
  const extension = fileName.split('.').pop()
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 8)
  return `${userId}/gallery/${timestamp}_${randomId}.${extension}`
}
