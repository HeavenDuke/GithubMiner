/**
 * Created by heavenduke on 17-4-28.
 */

exports.index = function (req, res, next) {
    res.render("ranking/index", {
        title: "Ranking"
    });
};