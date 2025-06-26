import { AppUser } from '@/app/types/User';

export async function signInWithGoogle(role: 'buyer' | 'seller'): Promise<AppUser | null> {
  try {
    // Ensure the Google script is loaded
    await loadGoogleScript();

    return new Promise<AppUser | null>((resolve, reject) => {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        scope: 'email profile',
        callback: async (tokenResponse) => {
          try {
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
            resolve(user);
          } catch (error) {
            console.error('Error during Google profile fetch or login:', error);
            reject(null);
          }
        },
      });

      tokenClient.requestAccessToken();
    });
  } catch (error) {
    console.error('Google sign-in error:', error);
    return null;
  }
}

// helper
function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google script'));

    document.head.appendChild(script);
  });
}
