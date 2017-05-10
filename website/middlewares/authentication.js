/**
 * Created by heavenduke on 17-5-10.
 */

module.exports = function (req, res, next) {
    if (req.session.user) {
        return next();
    }
    else {
        req.session.user = {
            user_id: 6873217,
            username: "HeavenDuke",
            password: "win32.luhzu.a",
            avatar_url: "https://avatars1.githubusercontent.com/u/6873217?v=3"
        };
        return next();
    }
};