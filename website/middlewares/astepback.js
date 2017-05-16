/**
 * Created by heavenduke on 17-5-16.
 */

var query = require('../libs').query;

module.exports = function (req, res, next) {
    req.session.astepback = query(req.protocol, req.get('host'), req.originalUrl, req.query);
    return next();
};