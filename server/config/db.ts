import mongoose from 'mongoose';

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartspend';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log("db is connected");
    (global as any).isMongoOffline = false;
    return conn;
  } catch (error) {
    console.error('db connection error:', error);
    (global as any).isMongoOffline = true;
    return mongoose;
  }
}
