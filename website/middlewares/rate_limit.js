/**
 * Created by heavenduke on 17-5-10.
 */

module.exports = function (req, res, next) {
    if (req.query.query) {
        if (!req.session.last_search_time) {
            return next();
        }
        else {
            var last = new Date(req.session.last_search_time);
            var current = new Date();
            if (current - last >= 2000) {
                req.session.last_search_time = current;
                return next();
            }
            else {
                req.flash("error", "Please submit query after 2 seconds");
                res.redirect('back');
            }
        }
    }
    else {
        return next();
    }
};