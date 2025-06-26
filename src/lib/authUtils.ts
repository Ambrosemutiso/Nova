import { User } from '@/app/types/User'; // Make sure this interface exists

export async function signInWithGoogle(role: 'buyer' | 'seller'): Promise<User | null> {
  try {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      scope: 'email profile',
      callback: async (tokenResponse) => {
        const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });

        const profile = await googleRes.json();

        const response = await fetch('/api/auth/google-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: profile.name,
            email: profile.email,
            image: profile.picture,
            role,
          }),
        });

        const user = await response.json();
        return user;
      },
    });

    tokenClient.requestAccessToken();
  } catch (error) {
    console.error('Google sign-in error:', error);
    return null;
  }

  return null;
}
