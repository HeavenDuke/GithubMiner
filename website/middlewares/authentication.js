/**
 * Created by heavenduke on 17-5-10.
 */

module.exports = function (req, res, next) {
    if (req.session.user) {
        return next();
    }
    else {
        console.log(global.config.github)
        return res.redirect(global.config.github.oauth.query);
    }
};