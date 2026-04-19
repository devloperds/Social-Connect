type RateLimitInfo = { count: number, resetAt: number }
const rateLimitMap = new Map<string, RateLimitInfo>()

export function checkRateLimit(ip: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now()
  const info = rateLimitMap.get(ip)
  
  if (!info || info.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs })
    return true
  }
  
  if (info.count >= limit) return false
  
  info.count += 1
  return true
}

export function getIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  return '127.0.0.1'
}
