/**
 * Created by heavenduke on 17-2-14.
 */

var Controllers = {};

Controllers.page = function (req, res, next) {
    res.render("index");
};

Controllers.api = function (req, res, next) {
    res.json({repository: req.params.repository, message: "Hello World!"});
};

module.exports = Controllers;