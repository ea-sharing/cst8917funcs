const { BlobServiceClient } = require("@azure/storage-blob");
const sharp = require("sharp");
const { ServiceBusClient } = require("@azure/service-bus");
const { MongoClient } = require('mongodb');

// MongoDB configuration
const mongoConnectionString = "mongodb://cst8917cosmodbacc:LNOtxW2VG8OX14sAHPna6FDZGpZaH09fyUC2BUas3P0DXu8dYBFUHDq8jF7F87kWhIhD0H4kEjQDACDbX2NFiQ==@cst8917cosmodbacc.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@cst8917cosmodbacc@";
const mongoDbName = "userdb";
const mongoCollectionName = "usercolid";    

// Azure Blob Storage configuration
const connectionString = "DefaultEndpointsProtocol=https;AccountName=cst8917blobstorageacc;AccountKey=hEiR5VfV3JM8PI3zQJeJG7Y9UBAnX8EuTl5+sigax8GuXOeyhbBl05APCEGMr6WnTg1mMYiLzQx7+AStaJqclA==;EndpointSuffix=core.windows.net";
const containerName = "userimages";

// Service Bus configuration
const serviceBusConnectionString = "Endpoint=sb://cst8917sbus.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=QEA/j8qztBk3Ressi2x4C9uvT9A8unTWd+ASbL4jIpM=";
const queueName = "user-notifications";

module.exports = async function (context, myBlob) {
    const blobName = context.bindingData.blobTrigger; // Use the correct binding data to get the blob name

    if (!blobName) {
        context.log.error("Blob name is undefined.");
        throw new Error("Blob name is undefined.");
    }

    // Split the blob name into parts
    const parts = blobName.split('/');
    if (parts.length < 3) {
        context.log.error("Blob name does not contain expected parts.");
        throw new Error("Blob name does not contain expected parts.");
    }

    // Extract user email from the blob name
    const userEmail = parts[1];
    const originalImageName = parts.slice(2).join('/'); // Extract original image name from the blob name

    context.log("Image resizing function processed blob \n Name:", userEmail, originalImageName, "\n Blob Size:", myBlob.length, "Bytes");

    // Check if the image is already resized
    if (originalImageName.includes("resized-")) {
        context.log("Skipping resizing for already resized image:", originalImageName);
        return;
    }



    try {

        
        // Initialize BlobServiceClient
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

        // Get a reference to the container
        const containerClient = blobServiceClient.getContainerClient(containerName);

        // Resize image
        const resizedImage = await sharp(myBlob)
            .resize(150, 150) // Example: Resize to 10x10 pixels
            .toBuffer();
        context.log("resizedImage name:", resizedImage);
        
        
        // Construct the blob name for the resized image        
        const resizedBlobName = `${userEmail}/resized-${originalImageName}`;
        context.log("Resized blob name:", resizedBlobName);
        const blobClient = containerClient.getBlockBlobClient(resizedBlobName);
        await blobClient.uploadData(resizedImage);
        
        

        // Get the URL of the resized image
        const resizedImageUrl = blobClient.url;

        // Connect to MongoDB
        const mongoClient = new MongoClient(mongoConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });
        await mongoClient.connect();

        const db = mongoClient.db(mongoDbName);
        const collection = db.collection(mongoCollectionName);

        // Log the original image name
        context.log("Original image name:", originalImageName);

        // Update the resizedImageUrl in the uploadedImages array
        const updatedUser = await collection.findOneAndUpdate(
            { "uploadedImages.imageName": originalImageName },
            { $set: { "uploadedImages.$.resizedImageUrl": resizedImageUrl, 
            "uploadedImages.$.originalImageUrl": resizedImageUrl.replace(`/resized-${originalImageName}`, `/${originalImageName}`)
            } },
            { returnDocument: 'after' } // Return the updated document
        );
 
        context.log("Resized image URL updated in MongoDB.");
    
        // Send message to Service Bus Queue
        const serviceBusClient = new ServiceBusClient(serviceBusConnectionString);
        const sender = serviceBusClient.createSender(queueName);

        await sender.sendMessages({
            body: {
                originalImageUrl: updatedUser.uploadedImages.find(img => img.imageName === originalImageName).originalImageUrl,
                resizedImageUrl: resizedImageUrl,
                imageName: originalImageName,
                userEmail: userEmail
            }
        });

        // Close MongoDB and Service Bus clients
        await sender.close();
        await mongoClient.close();
        await serviceBusClient.close();
        context.log("Resized image uploaded to blob storage and message sent to Service Bus Queue.");
        
        
        
    } catch (error) {
        context.log.error("Error processing blob:", error);
        throw error; // Re-throw the error to trigger retries or logging in Azure Functions
    }
};
