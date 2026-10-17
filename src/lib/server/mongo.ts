import { MongoClient } from 'mongodb';
import { MONGODB_URI } from '$app/env/private';

const uri = MONGODB_URI;
// Fix for MongoDB connection issues in development mode
const globalMongo = globalThis as unknown as {
	_mongoClient?: MongoClient;
};

export const client = globalMongo._mongoClient ?? new MongoClient(uri);

if (process.env.NODE_ENV !== 'production') {

	globalMongo._mongoClient = client;
}

export const db = client.db('myapp');
