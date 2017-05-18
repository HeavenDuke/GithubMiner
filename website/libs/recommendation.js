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

exports.similar_social_repository = function (repository, offset, limit, callback) {
    var query = "MATCH (r0:Repository {repository_id: " + repository.repository_id + "})<-[]-(u:User)-[]->(r:Repository) "
              + "WHERE r.repository_id<>" + repository.repository_id + " "
              + "RETURN r.repository_id as repository_id, r.full_name as full_name, r.description as description,count(*) AS score, r.language=r0.language as sim ORDER BY score DESC, sim DESC "
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

exports.similar_content_repository = function (repository, offset, limit, callback) {
    var query = "MATCH (r:Repository {language: '" + repository.language + "'}) "
        + "WHERE r.repository_id<>" + repository.repository_id + " "
        + "RETURN r.repository_id as repository_id, r.full_name as full_name, r.description as description ORDER BY r.stargazers_count "
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

exports.from_explore_action = function (action, offset, limit, callback) {
    var query = "MATCH (r0:Repository {repository_id: " + repository.repository_id + "})<-[]-(u:User)-[]->(r:Repository) "
        + "WHERE r.repository_id<>" + repository.repository_id + " "
        + "RETURN r.repository_id as repository_id, r.full_name as full_name, r.description as description,count(*) AS score, r.language=r0.language as sim ORDER BY score DESC, sim DESC "
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

// 有language用language，没有language用随机版本
exports.from_explore_languages = function (languages, offset, limit, callback) {
    var query = "MATCH (r:Repository) "
        + "WHERE r.language IN " + JSON.stringify(Object.keys(languages)) + " "
        + "RETURN r.repository_id as repository_id, r.full_name as full_name, r.description as description CASE r.language ";
    if (Object.keys(languages).length != 0) {

    }
    query += "SKIP " + offset + " LIMIT " + limit;
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