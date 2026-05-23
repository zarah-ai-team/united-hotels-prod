const express = require('express');
const router = express.Router();
const { submitGroupRequest } = require('../controllers/groupRequests');

router.post('/', submitGroupRequest);

module.exports = router;
