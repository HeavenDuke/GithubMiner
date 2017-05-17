/**
 * Created by heavenduke on 17-5-17.
 */

var express = require('express');
var star_controller = require('../../../controllers').repositories.stars;
var router = express.Router();

router.post('/', star_controller.create);

router.delete('/', star_controller.destroy);

module.exports = router;