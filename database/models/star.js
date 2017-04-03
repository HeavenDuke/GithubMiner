/**
 * Created by heavenduke on 17-4-2.
 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('star', {
        userId: {
            type: DataTypes.STRING(15),
            allowNull: false
        },
        repositoryId: {
            type: DataTypes.STRING(15),
            allowNull: false
        }
    })
};