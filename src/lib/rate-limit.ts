const rateLimitMap = new Map()

export function rateLimit(identifier: string, limit = 10, window = 60000) {
  const now = Date.now()
  const windowStart = now - window
  
  if (!rateLimitMap.has(identifier)) {
    rateLimitMap.set(identifier, [])
  }
  
  const requests = rateLimitMap.get(identifier)
  const validRequests = requests.filter((time: number) => time > windowStart)
  
  if (validRequests.length >= limit) {
    return false
  }
  
  validRequests.push(now)
  rateLimitMap.set(identifier, validRequests)
  
  if (Math.random() < 0.01) {
    for (const [key, times] of rateLimitMap.entries()) {
      const validTimes = times.filter((time: number) => time > windowStart)
      if (validTimes.length === 0) {
        rateLimitMap.delete(key)
      } else {
        rateLimitMap.set(key, validTimes)
      }
    }
  }
  
  return true
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}
