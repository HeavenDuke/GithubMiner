/**
 * Created by heavenduke on 17-4-28.
 */

var express = require('express');
var recommendation_controller = require('../../../../controllers').api.v1.recommendations;
var router = express.Router();

router.get('/', recommendation_controller.index);

module.exports = router;