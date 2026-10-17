import { db } from './mongo.ts'; // adjust to whatever your mongo.ts exports

export const rooms = db.collection<{ _id: string; ownerId: string; createdAt: Date }>('rooms');
