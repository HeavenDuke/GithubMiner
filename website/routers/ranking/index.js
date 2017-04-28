/**
 * Created by heavenduke on 17-4-28.
 */

var express = require('express');
var ranking_controller = require('../../controllers').ranking;
var router = express.Router();

router.get('/', ranking_controller.index);

module.exports = router;