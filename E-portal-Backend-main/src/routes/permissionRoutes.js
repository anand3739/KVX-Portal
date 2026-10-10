'use strict';

const express = require('express');
const router = express.Router();
const { getAllPermissions } = require('../controllers/permissionController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getAllPermissions);

module.exports = router;
