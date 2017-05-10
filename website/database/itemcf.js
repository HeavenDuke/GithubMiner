/**
 * Created by heavenduke on 17-5-10.
 */


var ItemCF = {};

ItemCF.Schema = {
    user_id: {
        type: Number,
        required: true
    },
    repository_id: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true
    }
};

ItemCF.collection = {
    collection: "itemcf"
};

module.exports = ItemCF;