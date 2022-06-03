import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGODB_URI ?? "";
console.log(`⚡️[server]: Connecting to mongodb at ${uri}`);
let client;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  console.log("Please add your Mongo URI to .env.local");
}

if (process.env.NODE_ENV === "development") {
  // @ts-ignore
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    // @ts-ignore
    global._mongoClientPromise = client.connect();
  }
  // @ts-ignore
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}
export default clientPromise;
