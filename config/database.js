const { MongoClient } = require('mongodb');
require('dotenv').config();

class Database {
    constructor() {
        this.client = null;
        this.db = null;
    }

    async connect() {
        try {
            this.client = new MongoClient(process.env.MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });

            await this.client.connect();
            this.db = this.client.db(process.env.DB_NAME);
            
            console.log('Successfully connected to MongoDB');
            return this.db;
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
            throw error;
        }
    }

    async disconnect() {
        try {
            if (this.client) {
                await this.client.close();
                console.log('Disconnected from MongoDB');
            }
        } catch (error) {
            console.error('Error disconnecting from MongoDB:', error);
            throw error;
        }
    }

    getDB() {
        if (!this.db) {
            throw new Error('Database not connected. Call connect() first.');
        }
        return this.db;
    }

    getUsersCollection() {
        return this.getDB().collection(process.env.USERS_COLLECTION);
    }

    getTripsCollection() {
        return this.getDB().collection(process.env.TRIPS_COLLECTION);
    }

    async createIndexes() {
        try {
            const usersCollection = this.getUsersCollection();
            const tripsCollection = this.getTripsCollection();

            await usersCollection.createIndex({ email: 1 }, { unique: true });
            await usersCollection.createIndex({ username: 1 }, { unique: true });
            await usersCollection.createIndex({ createdAt: 1 });

            await tripsCollection.createIndex({ userId: 1 });
            await tripsCollection.createIndex({ startDate: 1 });
            await tripsCollection.createIndex({ destination: "text", title: "text" });
            await tripsCollection.createIndex({ createdAt: 1 });

            console.log('Database indexes created successfully');
        } catch (error) {
            console.error('Error creating indexes:', error);
            throw error;
        }
    }
}

const database = new Database();

module.exports = database;
