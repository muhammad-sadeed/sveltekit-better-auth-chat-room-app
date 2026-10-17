import { MongoClient } from 'mongodb';
import { MONGODB_URI } from '$app/env/private';

const client = new MongoClient(MONGODB_URI);
export const db = client.db('myapp');
