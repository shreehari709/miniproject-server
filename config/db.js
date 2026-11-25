import mongoose from 'mongoose';
import './loadEnv.js';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://transitops:FOZc9PIjgHw4zpI6@cluster0.sha48qi.mongodb.net/transitops';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[TransitOps] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[TransitOps] Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
