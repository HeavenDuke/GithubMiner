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

    function prepare_language_filter () {
        $("#language-filter-expander").click(function () {
            var states = {
                more: "collapse",
                collapse: "more"
            };
            $(this).parent().prevAll("[type='collapsed']").toggle("fast");
            $(this).children().text(states[$(this).children().text().trim()]);
            $(this).children().blur();
            return false;
        });

        $("#advanced-toggler").click(function () {
            $("#advanced").show("fast");
        });
    }

    function prepare_search_page() {
        prepare_language_filter();

    }

    $(document).ready(function () {
        if (window.location.href.match(/\/search/) != null) {
            prepare_search_page();
        }
    });

})();