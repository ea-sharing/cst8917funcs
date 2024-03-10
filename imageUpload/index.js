const jwt = require('jsonwebtoken');
const { BlobServiceClient } = require('@azure/storage-blob');
const { MongoClient, ObjectId } = require('mongodb');
const multipart = require("parse-multipart");

// Azure Blob Storage configuration
const connectionString = "DefaultEndpointsProtocol=https;AccountName=cst8917blobstorageacc;AccountKey=hEiR5VfV3JM8PI3zQJeJG7Y9UBAnX8EuTl5+sigax8GuXOeyhbBl05APCEGMr6WnTg1mMYiLzQx7+AStaJqclA==;EndpointSuffix=core.windows.net";
const containerName = "userimages";

// MongoDB configuration
const mongoConnectionString = "mongodb://cst8917cosmodbacc:LNOtxW2VG8OX14sAHPna6FDZGpZaH09fyUC2BUas3P0DXu8dYBFUHDq8jF7F87kWhIhD0H4kEjQDACDbX2NFiQ==@cst8917cosmodbacc.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@cst8917cosmodbacc@";
const mongoDbName = "userdb";
const mongoCollectionName = "usercolid";

// JWT configuration
const jwtSecret = "ZGpZaH09fyUC2BUas3P0DXu8dYBFUHDq8jF7F8"; // Same secret key used in User Login Function

module.exports = async function (context, req) {
    const token = req.headers.token;

    // Check if required properties are present in the request headers
    if (!token) {
        context.res = {
            status: 400,
            body: "Missing 'token' property in the request headers.",
        };
        return;
    }

    try {
        // Verify the JWT token and extract the email
        const decodedToken = jwt.verify(token, jwtSecret);
        const email = decodedToken.email;

        // Connect to Azure Blob Storage
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(containerName);

        // Parse the request body as multipart/form-data using parse-multipart
        const boundary = req.headers['content-type'].split('; ')[1].split('=')[1];
        const bodyBuffer = Buffer.from(req.body);
        const parts = multipart.Parse(bodyBuffer, boundary);

        // Extract the file data from the multipart form data
        const fileData = parts[0];

        // Upload the image to Azure Blob Storage
        const blobName = `${email}/${fileData.filename}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.upload(fileData.data, fileData.data.length);

        // Get the URL of the uploaded image
        const imageUrl = blockBlobClient.url;

        // Connect to MongoDB
        const mongoClient = new MongoClient(mongoConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });
        await mongoClient.connect();

        const db = mongoClient.db(mongoDbName);
        const collection = db.collection(mongoCollectionName);

        // Construct the image object
        const imageObject = {
            imageId: new ObjectId(), // Generate unique image ID
            imageName: fileData.filename,
            originalImageUrl: imageUrl,
            uploadDate: new Date().toISOString(),
        };

        // Update the user's uploadedImages array in MongoDB
        await collection.updateOne(
            { email: email },
            { $push: { uploadedImages: imageObject } }
        );

        // Close MongoDB connection
        mongoClient.close();

        // Return success response with the image URL
        context.res = {
            status: 200,
            body: {
                imageUrl,
                message: 'Image uploaded successfully.',
            },
        };
    } catch (error) {
        // Return error response
        context.res = {
            status: 500,
            body: {
                message: 'Error uploading image.',
                error: error.message,
            },
        };
    }
};
