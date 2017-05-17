/**
 * Created by heavenduke on 17-4-28.
 */

var express = require('express');
var repository_controller = require('../../controllers').repositories;
var star_router = require('./star');
var astepback = require('../../middlewares').astepback;
var router = express.Router();

router.get('/:owner/:name', astepback, repository_controller.show);

router.use(star_router);

module.exports = router;