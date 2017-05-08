/**
 * Created by heavenduke on 17-4-28.
 */

var Server = require('./server/');
var config = require('../config')(process.env.environment);
var server = new Server(config);
server.initialize_global_variables();
server.listen(config.server.port);