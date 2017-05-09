/**
 * Created by heavenduke on 17-4-28.
 */

var Github = require('github');

var github = new Github({
    protocol: "https",
    host: "api.github.com",
    headers: {
        Accept: "application/vnd.github.mercy-preview+json"
    },
    Promise: require('bluebird')
});

github.authenticate({
    type: "basic",
    username: "DoubleDeckers",
    password: "15tfosaaub_rees"
});

exports.index = function (req, res, next) {
    var query = req.query.query;
    var sort = req.query.sort;
    var order = req.query.order;
    var page = req.query.page ? parseInt(req.query.page) : 0;
    var pagination = 10;
    if (query) {
        github.search.repos({q: query, sort: sort, order: order, per_page: pagination, page: page}).then(function (result) {
            console.log(result);
            var total_pages = Math.ceil(result.data.total_count / pagination);
            var options = {};
            var _options = query.split(' ');
            for(var _option in _options) {
                var option = _option.split(":");
                if (option.length == 2) {
                    options[option[0]] = option[1];
                }
            }
            res.render("search/index", {
                title: "Search Page",
                info: req.flash('info'),
                error: req.flash('error'),
                query: query,
                sort: sort,
                order: order,
                options: options,
                result: result.data.items,
                current_page: page,
                total_pages: total_pages
            });
        });
    }
    else {
        res.render("search/index", {
            title: "Search Page",
            query: req.query.query
        });
    }
};