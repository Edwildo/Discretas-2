const mongoose = require('mongoose');

// Definir el esquema de usuario
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  document: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  secrets: [
    {
      type: String,
      required: true,
    }
  ],
  publicKey: {
    type: String,
  },
  privateKey: {
    type: String, 
  }
});

// Crear el modelo de usuario basado en el esquema
const User = mongoose.model('User', userSchema);

module.exports = User;
