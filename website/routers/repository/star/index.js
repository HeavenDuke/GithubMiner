/**
 * Created by heavenduke on 17-5-17.
 */

var express = require('express');
var star_controller = require('../../../controllers').repositories.stars;
var authentication = require('../../../middlewares').authentication;
var router = express.Router();

router.post('/:owner/:name/star', authentication, star_controller.create);

router.delete('/:owner/:name/star', authentication, star_controller.destroy);

module.exports = router;