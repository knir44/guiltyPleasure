import mongoose from 'mongoose';

export async function connectWithRetry(retries = 5, delay = 2000) {
  const uri = process.env.MONGO_URI;
  for (let i = 1; i <= retries; i++) {
    try {
      await mongoose.connect(uri);
      console.log('[DB] Connected to MongoDB');
      return;
    } catch (err) {
      console.error(`[DB] Connection attempt ${i}/${retries} failed: ${err.message}`);
      if (i === retries) throw err;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

export default mongoose;
