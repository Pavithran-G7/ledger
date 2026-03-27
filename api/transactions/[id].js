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

export default function handler(request, response) {
  const { id } = request.query;
  
  if (request.method === 'GET') {
    try {
      const db = readDB();
      if (!Array.isArray(db.transactions)) {
        db.transactions = [];
      }
      const transaction = db.transactions.find(t => t.id === id);
      
      if (!transaction) {
        return response.status(404).json({ error: 'Transaction not found' });
      }
      
      return response.status(200).json(transaction);
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return response.status(500).json({ error: 'Failed to fetch transaction' });
    }
  }
  
  if (request.method === 'PUT') {
    try {
      const db = readDB();
      if (!Array.isArray(db.transactions)) {
        db.transactions = [];
      }
      const index = db.transactions.findIndex(t => t.id === id);
      
      if (index === -1) {
        return response.status(404).json({ error: 'Transaction not found' });
      }
      
      const { date, type, category, description, amount, month } = request.body;
      
      db.transactions[index] = {
        ...db.transactions[index],
        date: date || db.transactions[index].date,
        type: type || db.transactions[index].type,
        category: category || db.transactions[index].category,
        description: description || db.transactions[index].description,
        amount: amount !== undefined ? parseFloat(amount) : db.transactions[index].amount,
        month: month || db.transactions[index].month,
        updatedAt: new Date().toISOString()
      };
      
      writeDB(db);
      
      return response.status(200).json(db.transactions[index]);
    } catch (error) {
      console.error('Error updating transaction:', error);
      return response.status(500).json({ error: 'Failed to update transaction' });
    }
  }
  
  if (request.method === 'DELETE') {
    try {
      const db = readDB();
      if (!Array.isArray(db.transactions)) {
        db.transactions = [];
      }
      const index = db.transactions.findIndex(t => t.id === id);
      
      if (index === -1) {
        return response.status(404).json({ error: 'Transaction not found' });
      }
      
      const deleted = db.transactions.splice(index, 1);
      writeDB(db);
      
      return response.status(200).json({ message: 'Transaction deleted', transaction: deleted[0] });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return response.status(500).json({ error: 'Failed to delete transaction' });
    }
  }
  
  return response.status(405).json({ error: 'Method not allowed' });
}
