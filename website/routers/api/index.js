/**
 * Created by heavenduke on 17-4-28.
 */

var express = require('express');
var v1_router = require('./v1');
var router = express.Router();

router.use('/v1', v1_router);

module.exports = router;