/**
 * Created by heavenduke on 17-2-14.
 */

var router = require('express').Router();
var controllers = require('./controllers');

router.get('/', controllers.page);

router.get('/repositories/:repository', controllers.api);

module.exports = router;