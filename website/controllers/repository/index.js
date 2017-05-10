/**
 * Created by heavenduke on 17-4-28.
 */

var Repository = require('../../libs').repository;

exports.show = function (req, res, next) {
    global.db.cypherQuery("MATCH (r:Repository {repository_id: '" + req.params.repository_id + "'}) RETURN r LIMIT 1", function (err, result) {
        if (err) {
            return next(err);
        }
        else {
            var repository = result.data[0];
            Repository.getReadme(repository.name, function (readme) {
                res.render("repository/show", {
                    title: repository.name,
                    info: req.flash('info'),
                    error: req.flash('error'),
                    repository: repository,
                    readme: readme
                });
            });
        }
    });
};