/**
 * Created by heavenduke on 17-4-28.
 */

var express = require('express');
var home_controller = require('../controllers').home;
var user_router = require('./user');
var ranking_router = require('./ranking');
var repository_router = require('./repository');
var search_router = require('./search');
var api_router = require('./api');
var astepback = require('../middlewares').astepback;
var router = express.Router();

router.get('/', astepback, home_controller);

router.use('/user', user_router);

router.use('/ranking', ranking_router);

router.use('/search', search_router);

router.use('/api', api_router);

router.use('/repositories', repository_router);

module.exports = router;