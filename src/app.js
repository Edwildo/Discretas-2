const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const rsaRouter = require('../routes/RSAroutes')
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('../config/swaggerCongif');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173'
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use(express.json());
app.use(logger('dev'));
app.use('/rsa', rsaRouter);

module.exports = app;
