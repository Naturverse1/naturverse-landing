export function isAdmin(email?: string | null): boolean {
  const allowed = (process.env.ALLOWED_ADMINS || '')
    .split(',')
    .map(e => e.trim())
    .filter(Boolean)
  return email ? allowed.includes(email) : false
}
