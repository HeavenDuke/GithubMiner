/**
 * Created by heavenduke on 17-4-28.
 */

var express = require('express');
var event_router = require('./event');
var recommendation_router = require('./recommendation');
var select_database = require('../../../middlewares').select_database;
var router = express.Router();

router.use('/events', event_router);

router.use('/recommendation', select_database, recommendation_router);

module.exports = router;