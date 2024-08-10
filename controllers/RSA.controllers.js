const bigInt = require('big-integer');
const User = require('../models/user.model')
const millerRabinTest = require('../controllers/Miller-robbin.controller')

export const newUser = {
  createUser: (req, res) =>{
    const newUser = new User(req.body.params, '');
    newUser.password = '';
  }
}

// Función para generar un número primo grande
function generateLargePrime(bits) {
  const min = bigInt(2).pow(bits - 1);
  const max = bigInt(2).pow(bits).subtract(1);

  while (true) {
    const p = bigInt.randBetween(min, max);
    if (p.isProbablePrime(256)) {
      return p;
    }
  }
}

// Función para calcular el máximo común divisor
function gcd(a, b) {
  if (b.equals(0)) {
    return a;
  }
  return gcd(b, a.mod(b));
}

// Función para calcular el inverso modular
function modInverse(e, phi) {
  let [g, x] = extendedGcd(e, phi);
  if (!g.equals(1)) {
    throw new Error("No modular inverse exists");
  }
  return x.mod(phi);
}

// Función para el algoritmo extendido de Euclides
function extendedGcd(a, b) {
  if (b.equals(0)) {
    return [a, bigInt(1), bigInt(0)];
  }
  const [g, x1, y1] = extendedGcd(b, a.mod(b));
  const x = y1;
  const y = x1.subtract(a.divide(b).multiply(y1));
  return [g, x, y];
}

// Función para generar claves RSA
function generateKeys(bits) {
  const p = generateLargePrime(bits / 2);
  const q = generateLargePrime(bits / 2);
  const n = p.multiply(q);
  const phi = p.subtract(1).multiply(q.subtract(1));

  let e = bigInt(65537); // Valor comúnmente usado para e
  while (gcd(e, phi).notEquals(1)) {
    e = e.add(2);
  }

  const d = modInverse(e, phi);
  return {
    publicKey: { e, n },
    privateKey: { d, n }
  };
}

// Función para cifrar un mensaje
function encrypt(message, publicKey) {
  const m = bigInt(message);
  return m.modPow(publicKey.e, publicKey.n);
}

// Función para descifrar un mensaje
function decrypt(encryptedMessage, privateKey) {
  return encryptedMessage.modPow(privateKey.d, privateKey.n);
}

// Ejemplo de uso
const { publicKey, privateKey } = generateKeys(512);

const message = "123456"; // Mensaje a cifrar
const encryptedMessage = encrypt(message, publicKey);
const decryptedMessage = decrypt(encryptedMessage, privateKey);

console.log("Mensaje original:", message);
console.log("Mensaje cifrado:", encryptedMessage.toString());
console.log("Mensaje descifrado:", decryptedMessage.toString());