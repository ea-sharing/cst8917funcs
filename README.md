# cst8917funcs

# Serverless Functions Deployment Guide
This guide provides instructions on how to deploy each serverless function to Azure.

# userCreate Function (HTTP trigger)
This function creates a new user by saving the user details to Azure Cosmos DB.

Deployment Instructions:
Navigate to the Azure portal.
Create a new Azure Function.
Choose HTTP trigger as the function type.
Copy the provided code for the UserCreate function.
Set the connection string for Azure Cosmos DB in the function settings.
Save and deploy the function.


# userUpdate Function (HTTP trigger)
This function updates an existing user's details in Azure Cosmos DB.

Deployment Instructions:
Follow the same deployment steps as the UserCreate Function.
Copy the provided code for the UserUpdate function.
Ensure that the Azure Cosmos DB connection string is correctly configured.

# imageUpload Function (HTTP trigger)
This function allows users to upload images securely to Azure Blob Storage.

Deployment Instructions:
Create a new Azure Function with an HTTP trigger.
Copy the provided code for the ImageUpload function.
Set up Azure Blob Storage and configure the connection string in the function settings.
Save and deploy the function.


# imageResize Function (Blob trigger)
This function automatically resizes uploaded images and triggers notifications upon completion.

Deployment Instructions:
Create a new Azure Function with a Blob trigger.
Copy the provided code for the ImageResize function.
Set up Azure Blob Storage and configure the connection string in the function settings.
Set up Azure Service Bus and configure the connection string in the function settings.
Save and deploy the function.


# schCleanup Function (Timer trigger)
This function periodically scans Azure Blob Storage and removes old images.

Deployment Instructions:
Create a new Azure Function with a Timer trigger.
Copy the provided code for the ScheduledCleanup function.
Set up Azure Blob Storage and configure the connection string in the function settings.
Save and deploy the function.


# userNotify Function (Azure Service Bus Queue Trigger)
This function sends email notifications to users upon image resizing completion.

Deployment Instructions:
Create a new Azure Function with a Service Bus queue trigger.
Copy the provided code for the UserNotifications function.
Set up Azure Service Bus and configure the connection string in the function settings.
Save and deploy the function.