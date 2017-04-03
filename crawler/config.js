/**
 * Created by heavenduke on 17-4-2.
 */

module.exports = function (environment) {
    var config = {
        authentication: {
            basic: {
                username: "HeavenDuke",
                password: "win32.luhzu.a"
            },
            preview: {
                username: "HeavenDuke",
                password: "win32.luhzu.a",
                acceptHeader: "application/vnd.github.mercy-preview+json"
            }
        },
        repository: {
            minimum: 80,
            maximum: 500000
        },
        user: {
            minimum: 60,
            maximum: 34000
        },
        database: {
            dbname: "GithubMinerData",
            username: "root",
            password: "win32.luhzu.b",
            config: {
                host: "localhost",
                dialect: "mysql",
                port: 3306,
                timezone: "+08:00",
                pool: {
                    max: 5,
                    min: 0,
                    idle: 10000
                },
                logging: null
            }
        }
    };
    if (environment == "development") {
        config.database.password = "win32.luhzu.a";
    }
    return config;
};