const express = require('express');
const rsaControllers = require('../controllers/RSA.controllers');

const router = express.Router();

router.post('/encrypt', rsaControllers.encrypt);
router.post('/decrypt', rsaControllers.decrypt);

module.exports = router;
