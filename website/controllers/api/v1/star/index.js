/**
 * Created by heavenduke on 17-4-28.
 */

exports.create = function (req, res, next) {

    res.json({
        message: "success",
        data: {
            repository_id: 233,
            action: "create"
        }
    });
};

exports.destroy = function (req, res, next) {
    res.json({
        message: "success",
        data: {
            repository_id: 233,
            action: "destroy"
        }
    });
};