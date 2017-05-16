/**
 * Created by heavenduke on 17-5-16.
 */

var https = require('https');
var config = require('../config')(process.env.environment);
var request_data = config.github.oauth.query_token(null, "ItWDpD59SL", "46759251fa4394b1d411");
console.log(request_data);
var request = https.request(request_data.options, function (rs) {
    rs.on("data", function (buffer) {
        console.log(buffer.toString());
    });
});
request.write(request_data.data);
request.end();