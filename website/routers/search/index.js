/**
 * Created by heavenduke on 17-4-28.
 */

var express = require('express');
var search_controller = require('../../controllers').search;
var authentication = require('../../middlewares').authentication;
var astepback = require('../../middlewares').astepback;
var rate_limit = require('../../middlewares').rate_limit;
var router = express.Router();

router.get('/', astepback, authentication, rate_limit, search_controller.index);

module.exports = router;