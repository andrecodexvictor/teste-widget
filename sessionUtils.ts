// Session Management Utilities
export const STORAGE_KEY_SESSION_ID = 'kawaii-widget-session-id';
export const API_BASE_URL = '/api/session';

export function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export function getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem(STORAGE_KEY_SESSION_ID);
    if (!sessionId) {
        sessionId = generateSessionId();
        localStorage.setItem(STORAGE_KEY_SESSION_ID, sessionId);
    }
    return sessionId;
}

export async function syncToBackend(sessionId: string, settings: any, donations: any[]): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}?id=${sessionId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ settings, donations }),
        });
        return response.ok;
    } catch (error) {
        console.error('Sync error:', error);
        return false;
    }
}

export async function fetchFromBackend(sessionId: string): Promise<{ settings: any; donations: any[] } | null> {
    try {
        const response = await fetch(`${API_BASE_URL}?id=${sessionId}`);
        if (response.ok) {
            return await response.json();
        }
        return null;
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}
