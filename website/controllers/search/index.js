/**
 * Created by heavenduke on 17-4-28.
 */

var search = require('../../libs').search;
var Github = require('github');

exports.index = function (req, res, next) {
    var query = req.query.query ? req.query.query : "";
    var sort = ["stars", "forks", "updated"].includes(req.query.sort) ? req.query.sort : "";
    var order = ["desc", "asc"].includes(req.query.order) ? req.query.order : "";
    var owner = req.query.owner;
    var forks = req.query.forks;
    var language = req.query.language;
    var page = Math.min((req.query.page ? parseInt(req.query.page) : 1), 10);
    var languages = [];
    var pagination = 10;
    var Helper = function (url, options) {
        var result = [url, "?"], first = true;
        for(var key in options) {
            if (options[key]) {
                if (!first) {
                    result.push("&");
                }
                result.push(key);
                result.push("=");
                result.push(options[key]);
                first = false;
            }
        }
        return result.join("");
    };
    var term = search(query, {
        user: owner,
        fork: forks,
        language: language
    });
    global.db.cypherQuery("MATCH (l:Language) RETURN l", function (err, result) {
        if (err) {
            return next(err);
        }
        else {
            result.data.forEach(function (l) {
                languages.push(l.name);
            });
            if (term != "") {
                var github = new Github(global.config.github.options);
                github.authenticate({
                    type: "oauth",
                    token: req.session.user.access_token
                });
                github.search.repos({q: term, sort: sort, order: order, per_page: pagination, page: page}).then(function (result) {
                    var total_pages = Math.min(Math.ceil(result.data.total_count / pagination), 10);
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
                        user: req.session.user,
                        term: term,
                        info: req.flash('info'),
                        error: req.flash('error'),
                        query: query,
                        sort: sort,
                        languages: languages,
                        owner: owner,
                        language: language,
                        fork: forks,
                        language_style: global.language_style,
                        order: order,
                        options: options,
                        result: result.data.items,
                        current_page: page,
                        total_pages: total_pages,
                        Helper: Helper
                    });
                });
            }
            else {
                res.render("search/index", {
                    title: "Search Page",
                    languages: languages,
                    user: req.session.user,
                    query: req.query.query,
                    term: term,
                });
            }
        }
    });
};