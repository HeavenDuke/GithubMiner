/**
 * Created by heavenduke on 17-4-28.
 */

var express = require('express');
var search_controller = require('../../controllers').search;
var authentication = require('../../middlewares').authentication;
var astepback = require('../../middlewares').astepback;
var router = express.Router();

router.get('/', astepback, authentication, search_controller.index);

module.exports = router;