import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const DB_PATH = join(process.cwd(), 'db.json');
const IS_VERCEL = Boolean(process.env.VERCEL);

// In-memory cache for serverless environment
let dbCache = null;
let lastReadTime = 0;
const CACHE_TTL = 60000; // 1 minute cache

const readDB = () => {
  // Use cache if available and not expired
  if (dbCache && Date.now() - lastReadTime < CACHE_TTL) {
    return dbCache;
  }
  
  try {
    if (!existsSync(DB_PATH)) {
      dbCache = { transactions: [] };
      return dbCache;
    }
    const data = readFileSync(DB_PATH, 'utf-8');
    dbCache = JSON.parse(data);
    lastReadTime = Date.now();
    return dbCache;
  } catch (error) {
    console.error('Error reading db:', error);
    dbCache = { transactions: [] };
    return dbCache;
  }
};

const writeDB = (data) => {
  try {
    // Vercel serverless filesystem is read-only; keep data in warm memory cache.
    if (IS_VERCEL) {
      dbCache = data;
      lastReadTime = Date.now();
      return;
    }

    writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    dbCache = data;
    lastReadTime = Date.now();
  } catch (error) {
    console.error('Error writing db:', error);
    throw error;
  }
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export default function handler(request, response) {
  if (request.method === 'GET') {
    const { month } = request.query;
    
    try {
      const db = readDB();
      let transactions = db.transactions || [];
      
      if (month) {
        transactions = transactions.filter(t => t.month === month);
      }
      
      transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      return response.status(200).json(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return response.status(500).json({ error: 'Failed to fetch transactions' });
    }
  }
  
  if (request.method === 'POST') {
    try {
      const db = readDB();
      if (!Array.isArray(db.transactions)) {
        db.transactions = [];
      }

      const { date, type, category, description, amount, month } = request.body;
      
      if (!date || !type || !category || !description || amount === undefined || !month) {
        return response.status(400).json({ error: 'Missing required fields' });
      }
      
      const newTransaction = {
        id: generateId(),
        date,
        type,
        category,
        description,
        amount: parseFloat(amount),
        month,
        createdAt: new Date().toISOString()
      };
      
      db.transactions.push(newTransaction);
      writeDB(db);
      
      return response.status(201).json(newTransaction);
    } catch (error) {
      console.error('Error creating transaction:', error);
      return response.status(500).json({ error: 'Failed to create transaction' });
    }
  }
  
  return response.status(405).json({ error: 'Method not allowed' });
}
