/**
 * Created by heavenduke on 17-4-28.
 */

var express = require('express');
var star_controller = require('../../../../controllers').api.v1.stars;
var authentication = require('../../../../middlewares').authentication;
var router = express.Router();

router.post('/', authentication, star_controller.create);

router.delete('/', authentication, star_controller.destroy);

module.exports = router;