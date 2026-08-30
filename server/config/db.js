import mongoose from "mongoose";

/**
 * Connects to MongoDB. The caller awaits this before starting the HTTP server,
 * so the API never accepts requests it cannot answer.
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is missing. Add it to server/.env");
  }

  const connection = await mongoose.connect(uri);
  console.log(`MongoDB connected`);
  return connection;
};

export default connectDB;
