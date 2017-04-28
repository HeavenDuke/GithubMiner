/**
 * Created by heavenduke on 17-4-28.
 */

var express = require('express');
var repository_controller = require('../../controllers').repositories;
var router = express.Router();

router.get('/:repository_id', repository_controller.show);

module.exports = router;