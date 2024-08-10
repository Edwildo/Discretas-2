// rsaController.js
const forge = require('node-forge');
const rsaController = {};

// Cargar o generar claves públicas y privadas
let { publicKey, privateKey } = loadOrGenerateKeys();

// Función para cargar o generar claves
function loadOrGenerateKeys() {
  // Aquí podrías cargar las claves de un archivo o base de datos
  // Para simplicidad, generamos nuevas claves si no se encuentran cargadas
  return forge.pki.rsa.generateKeyPair(2048);
}

rsaController.encrypt = async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ error: 'No data provided' });
    }

    // Cifrado con RSA-OAEP y SHA-256
    const encryptedData = publicKey.encrypt(data, 'RSA-OAEP', {
      md: forge.md.sha256.create(),
      mgf1: {
        md: forge.md.sha256.create()
      }
    });
    const encodedData = forge.util.encode64(encryptedData);

    res.status(200).json({ encryptedData: encodedData });
  } catch (err) {
    console.error('Encryption error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

rsaController.decrypt = async (req, res) => {
  try {
    const { encryptedData } = req.body;
    if (!encryptedData) {
      return res.status(400).json({ error: 'No encrypted data provided' });
    }

    // Decodificar y descifrar con RSA-OAEP y SHA-256
    const decodedData = forge.util.decode64(encryptedData);
    const decryptedData = privateKey.decrypt(decodedData, 'RSA-OAEP', {
      md: forge.md.sha256.create(),
      mgf1: {
        md: forge.md.sha256.create()
      }
    });

    res.status(200).json({ decryptedData });
  } catch (err) {
    console.error('Decryption error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = rsaController;
