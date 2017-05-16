/**
 * Created by heavenduke on 17-4-28.
 */

var https = require('https');

exports.create = function (req, res, next) {
    if (req.query.code) {
        var request_data = global.config.github.oauth.query_token(null, req.session.nonce_str, req.query.code);
        var request = https.request(request_data.options, function (rs) {
            rs.on("data", function (buffer) {
                console.log(buffer.toString());
            });
        });
        request.write(request_data.data);
        request.end();
    }
};

exports.destroy = function (req, res, next) {
    delete req.session.user
};