import type { VercelRequest, VercelResponse } from '@vercel/node';

interface SessionData {
  settings: any;
  donations: any[];
  lastUpdated: number;
}

// Armazenamento em memória (temporário - será substituído por Vercel KV depois)
// NOTA: Dados são perdidos quando a função é reiniciada, mas funciona para testes
const sessions = new Map<string, SessionData>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  try {
    // GET - Retrieve session data
    if (req.method === 'GET') {
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Session ID is required' });
      }

      const sessionData = sessions.get(id);

      if (!sessionData) {
        return res.status(404).json({ error: 'Session not found' });
      }

      return res.status(200).json(sessionData);
    }

    // POST - Create new session
    if (req.method === 'POST') {
      const sessionId = generateSessionId();
      const sessionData: SessionData = {
        settings: req.body.settings || {},
        donations: req.body.donations || [],
        lastUpdated: Date.now(),
      };

      sessions.set(sessionId, sessionData);

      return res.status(201).json({ sessionId, data: sessionData });
    }

    // PUT - Update session data
    if (req.method === 'PUT') {
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Session ID is required' });
      }

      const sessionData: SessionData = {
        settings: req.body.settings || {},
        donations: req.body.donations || [],
        lastUpdated: Date.now(),
      };

      sessions.set(id, sessionData);

      return res.status(200).json({ success: true, data: sessionData });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}
