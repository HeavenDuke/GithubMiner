/**
 * Created by heavenduke on 17-4-28.
 */

var engines = require('../../../../libs').recommendation;

exports.index = function (req, res, next) {

};

exports.repository = function (req, res, next) {
    var pagination = 6;
    global.db.cypherQuery("MATCH (r:Repository {repository_id: '" + req.query.repository_id + "'}) RETURN r LIMIT 1", function (err, result) {
        if (err) {
            return next(err);
        }
        else {
            var repository = result.data[0];
            if (repository) {
                engines.social(repository, (isNaN(parseInt(req.query.offset)) ? 0 : parseInt(req.query.offset)) , pagination, function (err, result) {
                    if (err) {
                        return next(err);
                    }
                    else {
                        res.json({
                            message: "success",
                            recommendations: result
                        });
                    }
                });
            }
            else {
                res.json({
                    message: "success",
                    recommendations: []
                });
            }
        }
    });
};