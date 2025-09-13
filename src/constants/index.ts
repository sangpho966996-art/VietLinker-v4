export const APP_NAME = 'VietLinker'
export const APP_DESCRIPTION = 'Kết nối cộng đồng Việt Nam tại Mỹ'

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator'
} as const

export const ADMIN_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const

export const BUSINESS_TYPES = {
  FOOD: 'food',
  SERVICE: 'service'
} as const

export const PROPERTY_TYPES = {
  SALE: 'sale',
  RENT: 'rent',
  ROOM_RENTAL: 'room-rental'
} as const

export const CREDIT_COSTS = {
  MARKETPLACE_POST: 1,
  JOB_POST: 2,
  REAL_ESTATE_POST: 3,
  BUSINESS_PROFILE: 5
} as const

export const MAX_IMAGES_PER_POST = 5
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
