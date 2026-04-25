import jwt from 'jsonwebtoken';

const TRUECALLER_PUBLIC_KEY = process.env.TRUECALLER_PUBLIC_KEY!;

export interface TruecallerPayload {
  name?: string;
  phoneNumber?: string;
  phone?: string;
  countryCode?: string;
  iat?: number;
  exp?: number;
}

export function verifyTruecallerToken(token: string): TruecallerPayload {
  try {
    const decoded = jwt.verify(token, TRUECALLER_PUBLIC_KEY, {
      algorithms: ['RS256'],
    }) as TruecallerPayload;

    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired Truecaller token');
  }
}