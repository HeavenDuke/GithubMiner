/**
 * Created by heavenduke on 17-4-28.
 */

var express = require('express');
var ranking_controller = require('../../controllers').ranking;
var astepback = require('../../middlewares').astepback;
var router = express.Router();

router.get('/', astepback, ranking_controller.index);

module.exports = router;