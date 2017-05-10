/**
 * Created by heavenduke on 17-4-28.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var database = {
    models: {}
};

var ItemCF = require('./itemcf');

mongoose.Promise = global.Promise;

var ItemCFSchema = new Schema(ItemCF.Schema, ItemCF.collection);

database.itemcf = mongoose.model('itemcf', ItemCFSchema);

module.exports = {
    loader: database
};