import * as jose from 'jose';

const jwtConfig = {
  secret: new TextEncoder().encode(process.env.JWT_SECRET),
};

export interface SessionPayload {
  userId: string;
  role: string;
}

// ─── Access Token (session) — 15 daqiqa ──────────────────────────────────────
export async function encrypt(payload: SessionPayload) {
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(jwtConfig.secret);
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jose.jwtVerify(session, jwtConfig.secret, {
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// ─── Refresh Token — 30 kun ───────────────────────────────────────────────────
// Refresh token payload'i — faqat userId va version (revoke uchun)
export interface RefreshTokenPayload {
  userId: string;
  version: number; // DB'dagi tokenVersion bilan solishtiriladi
}

export async function encryptRefreshToken(payload: RefreshTokenPayload) {
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(jwtConfig.secret);
}

export async function decryptRefreshToken(
  token: string | undefined = ''
): Promise<RefreshTokenPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, jwtConfig.secret, {
      algorithms: ['HS256'],
    });
    return payload as unknown as RefreshTokenPayload;
  } catch {
    return null;
  }
}
