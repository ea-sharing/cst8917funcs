const { BlobServiceClient } = require('@azure/storage-blob'); 

// Azure Blob Storage configuration
const connectionString = "<connectionString>";
const containerName = "<containername>";

module.exports = async function (context, myTimer) {
    // Connect to Azure Blob Storage
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    try {
        // Get the list of blobs in the container
        const blobs = containerClient.listBlobsFlat();

        // Calculate the date threshold for deletion (current date minus 1 day)
        //const currentDate = new Date();
        //const thresholdDate = new Date(currentDate);
        //thresholdDate.setDate(thresholdDate.getDate() - 1);
        
        // Test (current date minus 1 minute)
        const currentDate = new Date();
        const thresholdDate = new Date(currentDate);
        thresholdDate.setMinutes(thresholdDate.getMinutes() - 1);


        // Iterate over the blobs and delete the ones that exceed the threshold date
        for await (const blob of blobs) {
            const blobClient = containerClient.getBlobClient(blob.name);
            const blobProperties = await blobClient.getProperties();

            if (blobProperties.lastModified < thresholdDate) {
                await blobClient.delete();
            }
        }

        // Return success response
        context.log('Scheduled Cleanup completed successfully.');
        context.done(null, { message: 'Scheduled Cleanup completed successfully.' });
    } catch (error) {
        // Return error response
        context.log.error('Error during Scheduled Cleanup:', error);
        context.done(error, { message: 'Error during Scheduled Cleanup.' });
    }
};