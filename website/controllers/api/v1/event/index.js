/**
 * Created by heavenduke on 17-4-28.
 */

exports.index = function (req, res, next) {
    res.json({
        message: "success",
        data: {
            events: []
        }
    });
};