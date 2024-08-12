const forge = require('node-forge');
const rsaController = {};
const User = require('../models/user.model');
const { connectToDatabase, closeConnection } = require('../config/dbConfig');

// Función para encriptar datos con la clave pública
function encryptData(publicKey, data) {
    const encryptedData = forge.pki.publicKeyFromPem(publicKey).encrypt(data, 'RSA-OAEP', {
        md: forge.md.sha256.create(),
        mgf1: {
            md: forge.md.sha256.create(),
        },
    });
    return forge.util.encode64(encryptedData);
}

// Función para desencriptar datos con la clave privada
function decryptData(privateKey, encryptedData) {
    const decodedData = forge.util.decode64(encryptedData);
    return forge.pki.privateKeyFromPem(privateKey).decrypt(decodedData, 'RSA-OAEP', {
        md: forge.md.sha256.create(),
        mgf1: {
            md: forge.md.sha256.create(),
        },
    });
}

rsaController.createUser = async (req, res) => {
    try {
        const { name, document, password, secret } = req.body;

        if (!name || !document || !password || !secret) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const keyPair = forge.pki.rsa.generateKeyPair(2048);
        const publicKey = forge.pki.publicKeyToPem(keyPair.publicKey).replace(/\r?\n|\r/g, '');
        const privateKey = forge.pki.privateKeyToPem(keyPair.privateKey).replace(/\r?\n|\r/g, '');

        const encryptedPassword = encryptData(publicKey, password);
        const encryptedSecret = encryptData(publicKey, secret);

        await connectToDatabase();

        const newUser = new User({
            name,
            document,
            password: encryptedPassword,
            secrets: [encryptedSecret],
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

        const decryptedPassword = decryptData(user.privateKey, user.password);

        await closeConnection();

        if (decryptedPassword === password) {
            const decryptedSecrets = user.secrets.map(secret => decryptData(user.privateKey, secret));
            return res.status(200).json({ secrets: decryptedSecrets });
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
        const { document, password, newSecret } = req.body;

        if (!document || !password || !newSecret) {
            return res.status(400).json({ error: 'Document, password, and newSecret are required' });
        }

        await connectToDatabase();

        const user = await User.findOne({ document });
        if (!user) {
            await closeConnection();
            return res.status(404).json({ error: 'User not found' });
        }

        const decryptedPassword = decryptData(user.privateKey, user.password);

        if (decryptedPassword !== password) {
            await closeConnection();
            return res.status(401).json({ error: 'Incorrect password' });
        }

        const encryptedNewSecret = encryptData(user.publicKey, newSecret);

        user.secrets.push(encryptedNewSecret);

        await user.save();
        await closeConnection();

        res.status(200).json({ message: 'Secret added successfully', secrets: user.secrets });
    } catch (err) {
        console.error('Add secret error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = rsaController;
