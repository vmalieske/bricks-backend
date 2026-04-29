import mongoose from "mongoose";

export async function connectDB() {
    const uri = process.env.MONGODB_URI;
    if(!uri) throw new Error('MONGODB_URI fehlt in env');

    await mongoose.connect(uri);
    console.log('Connect to MongoDB Atlas');
}