/**
 * Created by heavenduke on 17-5-10.
 */

exports.lucky_guess = function (excluded, offset, limit, callback) {
    var query = "MATCH (r:Repository) WHERE NOT(r.repository_id IN " + JSON.stringify(excluded) + ") RETURN r.repository_id as repository_id, r.full_name as full_name, r.description as description, r.stargazers_count as stargazers_count, rand() as score ORDER BY score DESC "
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

exports.collaborative_filtering = function (user, excluded, offset, limit, callback) {
    console.log(excluded);
    global.mongoose.db.itemcf.find({
        where: {
            user_id: user.user_id,
            repository_id: {
                $nin: excluded
            }
        },
        order: [["score", "DESC"]],
        limit: limit,
        offset: offset
    }).then(function (result) {
        console.log(result);
        var metas = {}, rids = [];
        result.forEach(function (item) {
            rids.push(item.repository_id);
            metas[item.repository_id] = item.score;
        });
        global.db.cypherQuery("MATCH (r:Repository) WHERE r.repository_id IN " + JSON.stringify(rids) + " RETURN r", function (err, result) {
            if (err) {
                return callback(err);
            }
            else {
                result.data.forEach(function (item) {
                    item.score = metas["" + item.repository_id];
                });
                result.data.sort(function (i1, i2) {
                    return i1.score < i2.score;
                });
                return callback(null, result.data);
            }
        });
    }).catch(function (err) {
        return callback(err);
    });
};

exports.similar_social_repository = function (repository, excluded, offset, limit, callback) {
    var query = "MATCH (r0:Repository {repository_id: " + repository.repository_id + "})<-[]-(u:User)-[]->(r:Repository) "
              + "WHERE r.repository_id<>" + repository.repository_id + " "
              + "AND NOT(r.repository_id IN " + JSON.stringify(excluded) + ") "
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

exports.similar_content_repository = function (repository, excluded, offset, limit, callback) {
    var query = "MATCH (r:Repository {language: '" + repository.language + "'}) "
        + "WHERE r.repository_id<>" + repository.repository_id + " "
        + "AND NOT(r.repository_id IN " + JSON.stringify(excluded) + ") "
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

exports.from_explore_action = function (action, excluded, offset, limit, callback) {
    function construct_map(action) {
        var result = "{", first = true;
        for(var repository_id in action) {
            if (!first) {
                result += ",";
            }
            result += repository_id + ":" + action[repository_id];
            first = false;
        }
        result += "}";
        return result;
    }

    function construct_list(action) {
        var result = "[", first = true;
        for(var repository_id in action) {
            if (!first) {
                result += ",";
            }
            result += repository_id;
            first = false;
        }
        result += "]";
        return result;
    }

    var query;
    if (Object.keys(action).length != 0) {
        query = "MATCH (r0:Repository)<-[]-(u:User)-[]->(r:Repository) "
            + "WHERE NOT(r.repository_id IN " + construct_list(action) + ") "
            + "AND r0.repository_id IN " + construct_list(action) + " "
            + "AND NOT(r.repository_id IN " + JSON.stringify(excluded) + ") "
            + " RETURN r.repository_id as repository_id, r.full_name as full_name, r.description as description,sum(CASE r0.repository_id ";
        for(var repository_id in action) {
            query += "WHEN " + repository_id + " THEN " + action[repository_id] + " ";
        }
        query += "END) AS score ORDER BY score DESC "
                + "SKIP " + offset + " LIMIT " + limit;
    }
    else {
        query = "MATCH (r:Repository) "
            + "WHERE r.language IN [] "
            + "AND NOT(r.repository_id IN " + JSON.stringify(excluded) + ") "
            + "RETURN r.repository_id as repository_id, r.full_name as full_name, r.description as description "
            + "SKIP " + offset + " LIMIT " + limit;
    }
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

exports.from_explore_languages = function (languages, excluded, offset, limit, callback) {
    var query;
    if (Object.keys(languages).length != 0) {
        query = "MATCH (r:Repository) "
        + "WHERE r.language IN " + JSON.stringify(Object.keys(languages)) + " "
        + "AND NOT(r.repository_id IN " + JSON.stringify(excluded) + ") "
        + "RETURN r.repository_id as repository_id, r.full_name as full_name, r.description as description, ";
        query += "CASE r.language ";
        for(var l in languages) {
            query += "WHEN '" + l + "' ";
            query += "THEN " + languages[l] + " "
        }
        query += "END AS score ORDER BY score DESC ";
        query += "SKIP " + offset + " LIMIT " + limit;
    }
    else {
        query = "MATCH (r:Repository) "
            + "WHERE r.language IN [] "
            + "AND NOT(r.repository_id IN " + JSON.stringify(excluded) + ") "
            + "RETURN r.repository_id as repository_id, r.full_name as full_name, r.description as description "
            + "SKIP " + offset + " LIMIT " + limit;
    }
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