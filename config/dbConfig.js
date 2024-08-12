const mongoose = require('mongoose');
require('dotenv').config();

async function connectToDatabase() {
    try {
        // Conectar a la base de datos con opciones adicionales
        await mongoose.connect(process.env.DBURL, {
            useNewUrlParser: true,        // Utiliza el nuevo analizador de URL
            useUnifiedTopology: true,     // Usa la nueva topología unificada de MongoDB
            serverSelectionTimeoutMS: 5000, // Espera 5 segundos para seleccionar un servidor MongoDB
            socketTimeoutMS: 45000,       // Tiempo de espera para las operaciones de socket
        });
        console.log('Database connection successful');
    } catch (err) {
        console.error('Database connection error:', err);
        process.exit(1); // Salir de la aplicación si la conexión falla
    }
}

async function closeConnection() {
    try {
        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (err) {
        console.error('Error closing the database connection:', err);
    }
}

module.exports = { connectToDatabase, closeConnection };
