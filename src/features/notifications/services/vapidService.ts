let cachedVapidKey: string | null = null;

const API_BASE_URL = import.meta.env.VITE_API_URL || ''; // Add this to your .env


export const getVapidKey = async (): Promise<string> => {
    if (cachedVapidKey) {
        return cachedVapidKey;
    }
    console.log('getVapidKEY() LETS GO', cachedVapidKey);
    try {
        const response = await fetch(`${API_BASE_URL}/api/notifications/vapid-key`);
        const { publicKey } = await response.json();
        cachedVapidKey = publicKey;
        return publicKey;
    } catch (error) {
        console.error('Failed to fetch VAPID key:', error);
        // Fallback to env variable if API fails
        cachedVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        return cachedVapidKey;
    }
}; 