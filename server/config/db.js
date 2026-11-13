
import mongoose from "mongoose";

export default async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB Error:", error.message);

    if (error.reason?.servers) {
      for (const [address, server] of error.reason.servers) {
        console.log("\nServer:", address);
        console.log("Server Type:", server.type);
        console.log(
          "Server Error:",
          server.error?.message || "No detailed error"
        );
      }
    }

    process.exit(1);
  }
}
