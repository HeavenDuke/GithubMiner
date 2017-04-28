/**
 * Created by heavenduke on 17-4-28.
 */

var express = require('express');
var event_router = require('./event');
var recommendation_router = require('./recommendation');
var star_router = require('./star');
var router = express.Router();

router.use('/events', event_router);

router.use('/recommendation', recommendation_router);

router.use('/stars', star_router);

module.exports = router;