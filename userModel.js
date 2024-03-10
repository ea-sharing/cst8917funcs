const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  authToken: {
    token: {
      type: String,
      required: false
    },
    expiryDate: {
      type: Date,
      required: false
    }
  },
  uploadedImages: [{
    imageId: {
      type: String,
      required: true
    },
    imageName: {
      type: String,
      required: true
    },
    originalImageUrl: {
      type: String,
      required: true
    },
    resizedImageUrl: {
      type: String,
      required: true
    },
    uploadDate: {
      type: Date,
      required: true
    }
  }]
});

module.exports = mongoose.model('User', userSchema);