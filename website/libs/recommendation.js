/**
 * Created by heavenduke on 17-5-10.
 */

exports.collaborative_filtering = function (user, offset, limit, callback) {
    global.mongoose.db.itemcf.findAll({
        where: {
            user_id: user.user_id
        },
        order: [["score", "DESC"]],
        limit: limit,
        offset: offset
    }).then(function (result) {
        return callback(null, result);
    }).catch(function (err) {
        return callback(err);
    });
};

// todo: 这是一个Online算法，把它改装成能同时兼容个性化与非个性化的版本
exports.social = function (repository, offset, limit, callback) {
    var query = "MATCH (:Repository {repository_id: " + repository.repository_id + "})<-[]-(u:User)-[]->(r:Repository) "
              + "WHERE r.repository_id<>" + repository.repository_id + " "
              + "RETURN r.repository_id as repository_id, r.full_name as full_name, r.description as description,count(*) AS score ORDER BY score DESC "
              + "SKIP " + offset + " LIMIT " + limit;
    global.db.cypherQuery(query, function (err, result) {
        if (err) {
            return callback(err);
        }
        else {
            for(var i = 0; i < result.data.length; i++) {
                result.data[i] = {
                    repository_id: result.data[i][0],
                    full_name: result.data[i][1],
                    description: result.data[i][2]
                };
            }
            return callback(null, result.data);
        }
    });
};