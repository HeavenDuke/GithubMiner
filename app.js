/**
 * Created by heavenduke on 17-2-14.
 */

var express = require('express');
var router = require('./routers');
var server = express();

server.set('view engine', 'pug');

server.use("/", router);

server.listen(3000, function () {
    console.log("listening from port 3000!");
});