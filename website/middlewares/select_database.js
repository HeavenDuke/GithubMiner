/**
 * Created by heavenduke on 17-5-18.
 */

module.exports = function (req, res, next) {
    if (req.session.user) {
        global.mongoose.flag.current_db.findOne({}).then(function (item) {
            global.mongoose.db = global.mongoose["db" + (item.flag == 1 ? 1 : 0)];
            return next();
        });
    }
};