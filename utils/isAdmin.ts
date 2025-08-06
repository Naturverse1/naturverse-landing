const allowed = (process.env.NEXT_PUBLIC_ALLOWED_ADMINS || '').split(',')

export function isAdmin(email: string) {
  return allowed.includes(email)
}

