const { ServiceBusClient } = require("@azure/service-bus");
const { EmailClient } = require("@azure/communication-email");

// Service Bus configuration
const serviceBusConnectionString = "Endpoint=sb://cst8917sbus.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=QEA/j8qztBk3Ressi2x4C9uvT9A8unTWd+ASbL4jIpM=";

// Email service configuration
const fromEmail = "DoNotReply@673bc09c-3cd1-49e7-b095-c0eb8459bfaa.azurecomm.net";
const emailconnectionString = "endpoint=https://cst8917commservice.canada.communication.azure.com/;accesskey=3yZ8EL2j7M+0W8J+WQMxOkZrxKKkpyaB+xR2NDJpNSP80s7yYPlvBfSCeoPB8xDuYuPg+tBTQIoU97jIef5NTw==";
const client = new EmailClient(emailconnectionString);



module.exports = async function (context, mySbMsg) {
  try {
   const messageBody = JSON.stringify(mySbMsg);
   context.log("JavaScript ServiceBus queue trigger function processed message", messageBody);
   parsedMessageBody = JSON.parse(messageBody);
   // Parsing successful, access individual properties
   const { originalImageUrl, resizedImageUrl, imageName, userEmail } = parsedMessageBody;
    

  if (!originalImageUrl || !resizedImageUrl || !imageName || !userEmail) {
    context.log("Parsed message body:", originalImageUrl, resizedImageUrl, imageName, userEmail);
      throw new Error("Invalid message format. Required fields 'originalImageUrl', 'resizedImageUrl', 'imageName', and 'userEmail' are missing.");
    }  
    
    const emailMessage = {
        senderAddress: fromEmail,
        content: {
            subject: "Image Resize Notification",
            plainText: `Your image ${imageName} has been resized. You can access it at ${resizedImageUrl}.`,
        },
        recipients: {
            to: [{ address: userEmail }],
        },
    };

    const poller = await client.beginSend(emailMessage);
    const result = await poller.pollUntilDone();

    // Log success
    context.log(`Sent email notification to ${userEmail} for image ${imageName}`);

    // Complete the Service Bus message
    context.done();
    
  } catch (error) {
    // Log error
    context.log.error("Error during User Notifications:", error);
    // Abandon the Service Bus message to retry later
    context.done(error);
  }
};

 