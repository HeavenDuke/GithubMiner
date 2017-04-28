/**
 * Created by heavenduke on 17-4-28.
 */

var express = require('express');
var star_controller = require('../../../../controllers').api.v1.stars;
var router = express.Router();

router.post('/', star_controller.create);

router.delete('/', star_controller.destroy);

module.exports = router;