export function isAdmin(request) {
  const token = request.cookies.get('candlelight_admin')?.value
  return Boolean(token && process.env.ADMIN_SESSION_TOKEN && token === process.env.ADMIN_SESSION_TOKEN)
}
