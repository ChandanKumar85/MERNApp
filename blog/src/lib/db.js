import { ServerApiVersion, MongoClient } from 'mongodb';

if (!process.env.DB_URI) {
  throw new Error('Mongobd is not found');
}

const client = new MongoClient(process.env.DB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function getDB(dbName) {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db(dbName);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

export async function getCollection(collectionName) {
  const db = await getDB(process.env.DATABASE_NAME);
  if (db) return db.collection(collectionName);

  return null;
}
