const express = require('express');
const router = express.Router();
const { submitContact } = require('../controllers/support');

router.post('/contact', submitContact);

module.exports = router;
