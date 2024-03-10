const { MongoClient, ObjectId } = require('mongodb');
const userModel = require('../userModel');
const jwt = require('jsonwebtoken');

// MongoDB configuration
const connectionString = "mongodb://cst8917cosmodbacc:LNOtxW2VG8OX14sAHPna6FDZGpZaH09fyUC2BUas3P0DXu8dYBFUHDq8jF7F87kWhIhD0H4kEjQDACDbX2NFiQ==@cst8917cosmodbacc.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@cst8917cosmodbacc@";
const dbName = "userdb";
const collectionName = "usercolid";
const jwtSecret = "ZGpZaH09fyUC2BUas3P0DXu8dYBFUHDq8jF7F8"; // My own secret key

module.exports = async function (context, req) {
    const { email, password } = req.body;

    // Check if required properties are present in the request body
    if (!email || !password) {
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

        // Find the user with the provided email
        const user = await collection.findOne({ email });

        // Check if the user exists and the password is correct
        if (!user || user.password !== password) {
            context.res = {
                status: 401,
                body: "Invalid email or password.",
            };
            return;
        }

        // Generate JWT token with an expiration time
        const token = jwt.sign({ email }, jwtSecret, { expiresIn: '1h' });

        // Update the user's authToken in MongoDB
        const result = await collection.updateOne(
            { _id: new ObjectId(user._id) },
            { $set: { authToken: { token, expiryDate: new Date(Date.now() + 3600000) } } }
        );

        // Close the MongoDB connection
        client.close();

        // Return success response with the JWT token
        context.res = {
            status: 200,
            body: {
                token,
                message: 'User authenticated successfully.',
            },
        };
    } catch (error) {
        // Return error response
        context.res = {
            status: 500,
            body: {
                message: 'Error authenticating user.',
                error: error.message,
            },
        };
    }
};