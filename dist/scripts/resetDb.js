// src/scripts/resetDb.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
async function reset() {
    const uri = process.env.MONGO_URI;
    console.log(`Connecting to ${uri}`);
    await mongoose.connect(uri);
    // Once connected, mongoose.connection.db is non-null
    const db = mongoose.connection.db;
    const toDrop = [
        'users',
        'restaurants',
        'menus',
        'orders',
        // add other collections as needed
    ];
    for (const name of toDrop) {
        const exists = (await db.listCollections({ name }).toArray()).length > 0;
        if (exists) {
            console.log(`Dropping collection ${name}…`);
            await db.dropCollection(name);
        }
        else {
            console.log(`No collection named ${name}, skipping`);
        }
    }
    console.log('✅ Reset complete.');
    process.exit(0);
}
reset().catch((err) => {
    console.error('Error resetting DB:', err);
    process.exit(1);
});
