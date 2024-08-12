const forge = require('node-forge');
const rsaController = {};
const User = require('../models/user.model');
const { connectToDatabase, closeConnection } = require('../config/dbConfig');

rsaController.createUser = async (req, res) => {
  try {
    const { name, document, password, secret } = req.body;

    if (!name || !document || !password || !secret) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const keyPair = forge.pki.rsa.generateKeyPair(2048);
    const publicKey = forge.pki.publicKeyToPem(keyPair.publicKey).replace(/\r?\n|\r/g, '');
    const privateKey = forge.pki.privateKeyToPem(keyPair.privateKey).replace(/\r?\n|\r/g, '');

    const encryptedPassword = forge.pki.publicKeyFromPem(publicKey).encrypt(password, 'RSA-OAEP', {
      md: forge.md.sha256.create(),
      mgf1: {
        md: forge.md.sha256.create(),
      },
    });
    const encodedPassword = forge.util.encode64(encryptedPassword);

    await connectToDatabase();

    const newUser = new User({
      name,
      document,
      password: encodedPassword,
      secret,
      publicKey,
      privateKey,
    });

    await newUser.save();

    const user = await User.findById(newUser._id).select('-password -privateKey');

    await closeConnection();

    res.status(201).json({ message: 'User created successfully', user });
  } catch (err) {
    console.error('User creation error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

rsaController.decryptPassword = async (req, res) => {
  try {
    const { document, password } = req.body;

    if (!document || !password) {
      return res.status(400).json({ error: 'Document and password are required' });
    }

    await connectToDatabase();

    const user = await User.findOne({ document });
    if (!user) {
      await closeConnection();
      return res.status(404).json({ error: 'User not found' });
    }

    const decodedPassword = forge.util.decode64(user.password);
    const decryptedPassword = forge.pki.privateKeyFromPem(user.privateKey).decrypt(decodedPassword, 'RSA-OAEP', {
      md: forge.md.sha256.create(),
      mgf1: {
        md: forge.md.sha256.create(),
      },
    });

    await closeConnection();

    if (decryptedPassword === password) {
      return res.status(200).json({ secrets: user.secrets });
    } else {
      return res.status(401).json({ error: 'Incorrect password' });
    }
  } catch (err) {
    console.error('Decryption error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

rsaController.addSecret = async (req, res) => {
  try {
    await connectToDatabase();
    const { document, password, newSecret } = req.body;

    if (!document || !password || !newSecret) {
      return res.status(400).json({ error: 'Document, password, and newSecret are required' });
    }

    const user = await User.findOne({ document });
    if (!user) {
      await closeConnection();
      return res.status(404).json({ error: 'User not found' });
    }

    const decodedPassword = forge.util.decode64(user.password);
    const decryptedPassword = forge.pki.privateKeyFromPem(user.privateKey).decrypt(decodedPassword, 'RSA-OAEP', {
      md: forge.md.sha256.create(),
      mgf1: {
        md: forge.md.sha256.create(),
      },
    });

    if (decryptedPassword !== password) {
      await closeConnection();
      return res.status(401).json({ error: 'Incorrect password' });
    }

    user.secrets.push(newSecret);

    await user.save();
    await closeConnection();

    res.status(200).json({ message: 'Secret added successfully', secrets: user.secrets });
  } catch (err) {
    console.error('Add secret error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = rsaController;
