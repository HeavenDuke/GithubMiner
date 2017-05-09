/**
 * Created by heavenduke on 17-5-10.
 */

module.exports = function (req, res, next) {
    if (req.query.query) {
        var last = new Date(req.session.last_search_time);
        var current = new Date();
        if (current - last >= 2000) {
            req.session.last_search_time = current;
            return next();
        }
        else {
            req.flash("error", "Please submit query in 2 seconds");
            res.redirect('back');
        }
    }
    else {
        return next();
    }
};