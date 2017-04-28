/**
 * Created by heavenduke on 17-4-28.
 */

exports.show = function (req, res, next) {
    res.render("repository/show", {
        title: "Repository Detail",
        repository_id: req.params.repository_id
    });
};