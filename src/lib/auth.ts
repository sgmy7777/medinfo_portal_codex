import { NextRequest, NextResponse } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'

const DEFAULT_JWT_SECRET = 'change-this-secret-in-production'

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET ?? DEFAULT_JWT_SECRET

  if (process.env.NODE_ENV === 'production' && secret === DEFAULT_JWT_SECRET) {
    throw new Error('JWT_SECRET must be configured in production')
  }

  return new TextEncoder().encode(secret)
}

export async function signToken(payload: { adminId: string; email: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(getJwtSecret())
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    return payload as { adminId: string; email: string }
  } catch {
    return null
  }
}

export async function requireAuth(req: NextRequest): Promise<NextResponse | null> {
  const token = req.cookies.get('admin_token')?.value
    ?? req.headers.get('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  const payload = await verifyToken(token)
  if (!payload) {
    return NextResponse.json({ error: 'Невалидный токен' }, { status: 401 })
  }

  return null // авторизация прошла
}
