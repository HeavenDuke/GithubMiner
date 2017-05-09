/**
 * Created by heavenduke on 17-5-9.
 */

(function () {

    function compose_query(query, options) {
        var result = [query];
        for(var key in options) {
            result.push(key + ":" + options[key])
        }
        return {
            query: result.join(" "),
            encoded: result.join("+")
        }
    }

    $(document).ready(function () {

    });

})();