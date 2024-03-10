const { MongoClient } = require('mongodb');
const userModel = require('../userModel');

// MongoDB configuration
const mongoConnectionString = "<mongoConnectionString>";
const mongoDbName = "<mongoDbName>";
const mongoCollectionName = "<mongoCollectionName>";    

module.exports = async function (context, req) {
    const { firstName, lastName, email, password } = req.body;

    // Check if required properties are present in the request body
    if (!firstName || !lastName || !email || !password) {
        context.res = {
            status: 400,
            body: "Missing required properties in the request body.",
        };
        return;
    }

    try {
        const client = new MongoClient(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();

        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        // Create a new user instance
        const user = new userModel({
            firstName,
            lastName,
            email,
            password
        });

        // Save the new user to MongoDB
        const result = await collection.insertOne(user);

        // Close the MongoDB connection
        client.close();

        // Return success response
        context.res = {
            status: 200,
            body: {
                id: result.insertedId.toString(),
                message: 'User created successfully.',
            },
        };
    } catch (error) {
        // Return error response
        context.res = {
            status: 500,
            body: {
                message: 'Error creating user.',
                error: error.message,
            },
        };
    }
};
