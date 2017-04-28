/**
 * Created by heavenduke on 17-4-28.
 */

var express = require('express');
var event_controller = require('../../../../controllers').api.v1.events;
var router = express.Router();

router.get('/', event_controller.index);

module.exports = router;