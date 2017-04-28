/**
 * Created by heavenduke on 17-4-28.
 */

var express = require('express');
var search_controller = require('../../controllers').search;
var router = express.Router();

router.get('/', search_controller.index);

module.exports = router;