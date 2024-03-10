const { ServiceBusClient } = require("@azure/service-bus");
const { EmailClient } = require("@azure/communication-email");

// Service Bus configuration
const serviceBusConnectionString = "<serviceBusConnectionString>";

// Email service configuration
const fromEmail = "DoNotReply@EXAMPLE-Azure.net";
const emailconnectionString = "<emailconnectionString>";
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

 