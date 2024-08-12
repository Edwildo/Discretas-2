const express = require('express');
const rsaControllers = require('../controllers/RSA.controllers');

const router = express.Router();

router.post('/encrypt', rsaControllers.createUser);
router.post('/decrypt', rsaControllers.decryptPassword);
router.post('/secret', rsaControllers.addSecret);//secretos

module.exports = router;
