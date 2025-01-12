let cachedVapidKey: string | null = null;

export const getVapidKey = async (): Promise<string> => {
    if (cachedVapidKey) {
        return cachedVapidKey;
    }

    try {
        const response = await fetch('/api/vapid-key');
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