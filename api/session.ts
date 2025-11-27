import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

interface SessionData {
  settings: any;
  donations: any[];
  lastUpdated: number;
}

const DATA_DIR = '/tmp/widget-sessions';
const getSessionPath = (id: string) => join(DATA_DIR, `${id}.json`);

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

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

      const sessionPath = getSessionPath(id);
      
      if (!existsSync(sessionPath)) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const data = JSON.parse(readFileSync(sessionPath, 'utf-8'));
      return res.status(200).json(data);
    }

    // POST - Create new session
    if (req.method === 'POST') {
      const sessionId = generateSessionId();
      const sessionData: SessionData = {
        settings: req.body.settings || {},
        donations: req.body.donations || [],
        lastUpdated: Date.now(),
      };

      const sessionPath = getSessionPath(sessionId);
      writeFileSync(sessionPath, JSON.stringify(sessionData, null, 2));

      return res.status(201).json({ sessionId, data: sessionData });
    }

    // PUT - Update session data
    if (req.method === 'PUT') {
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Session ID is required' });
      }

      const sessionPath = getSessionPath(id);
      const sessionData: SessionData = {
        settings: req.body.settings || {},
        donations: req.body.donations || [],
        lastUpdated: Date.now(),
      };

      writeFileSync(sessionPath, JSON.stringify(sessionData, null, 2));

      return res.status(200).json({ success: true, data: sessionData });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}
