/**
 * Created by heavenduke on 17-4-28.
 */

var express = require('express');
var user_controller = require('../../controllers').users;
var router = express.Router();

router.get('/', user_controller.create);

router.delete('/', user_controller.destroy);

module.exports = router;