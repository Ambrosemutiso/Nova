export async function submitToIndexNow(urls: string[]) {
  const INDEXNOW_KEY = process.env.INDEXNOW_KEY!;
  const HOST = 'https://novaxmax.com';

  const payload = {
    host: 'novaxmax.com',
    key: INDEXNOW_KEY,
    keyLocation: `${HOST}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  };

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error('IndexNow failed:', await res.text());
    }
  } catch (error) {
    console.error('IndexNow error:', error);
  }
}
