import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const DB_PATH = join(process.cwd(), 'db.json');

const readDB = () => {
  const data = readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
};

const writeDB = (data) => {
  writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
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
