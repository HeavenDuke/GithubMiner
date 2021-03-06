/**
 * Created by heavenduke on 17-4-28.
 */

var express = require('express');
var recommendation_controller = require('../../../../controllers').api.v1.recommendations;
var router = express.Router();

router.get('/repository', recommendation_controller.repository);

router.get('/guess', recommendation_controller.guess);

module.exports = router;