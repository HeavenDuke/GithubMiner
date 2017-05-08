/**
 * Created by heavenduke on 17-4-28.
 */

exports.index = function (req, res, next) {
    res.render("search/index", {
        title: "Search Page",
        query: req.query.query
    });
};