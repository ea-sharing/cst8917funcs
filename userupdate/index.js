const { MongoClient, ObjectId } = require('mongodb');
const userModel = require('../userModel');

// MongoDB configuration
const connectionString = "mongodb://cst8917cosmodbacc:LNOtxW2VG8OX14sAHPna6FDZGpZaH09fyUC2BUas3P0DXu8dYBFUHDq8jF7F87kWhIhD0H4kEjQDACDbX2NFiQ==@cst8917cosmodbacc.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@cst8917cosmodbacc@";
const dbName = "userdb";
const collectionName = "usercolid";

module.exports = async function (context, req) {
    const { id, firstName, lastName, email, password } = req.body;
 
    // Check if required properties are present in the request body
    if (!id || !firstName || !lastName || !email || !password) {
        context.res = {
            status: 400,
            body: "Missing required properties in the request body."
        };
        
        return;
    }

    try {
        const client = new MongoClient(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();

        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        // Create a new user instance with updated values using userModel
        const updatedUser = {
            id,
            firstName,
            lastName,
            email,
            password
        };

        // Update the user in MongoDB
        const result = await collection.updateOne(
            { _id: new ObjectId(id) }, // Assuming 'id' is the ObjectId of the user document
            { $set: updatedUser }
        );

        // Check if the user was found and updated
        if (result.matchedCount === 0) {
            context.res = {
                status: 404,
                body: "User not found.",
            };
            return;
        }
        
        // Close the MongoDB connection
        client.close();
        
        // Return success response
        context.res = {
            status: 200,
            body: {
                id: id, // Return the original id
                message: 'User updated successfully.',
            },
        };
    } catch (error) {
        // Return error response
        context.res = {
            status: 500,
            body: {
                message: 'Error updating user.',
                error: error.message,
            },
        };
    }
};
