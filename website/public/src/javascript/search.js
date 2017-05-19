/**
 * Created by heavenduke on 17-5-9.
 */

(function () {

    function prepare_language_filter () {
        $("#language-filter-expander").click(function () {
            var states = {
                more: "collapse",
                collapse: "more"
            };
            $(this).parent().prevAll("[type='collapsed']").toggle("fast");
            $(this).text(states[$(this).text().trim()]);
            $(this).children().blur();
            return false;
        });

        $("#advanced-toggler").click(function () {
            $("#advanced").show("fast");
        });

        $("#language-filter-expander").parent().prevAll(".language-selector").click(function () {
            $("#language-filter-expander").parent().prevAll().find("input").val($(this).text().trim());
        });

        $("#sorter").children().click(function () {
            var orders = {
                desc: "asc",
                asc: "desc"
            };
            if ($(this).attr("sort")) {
                if ($(this).attr("sort") != $("input[name='sort']").val()) {
                    $("input[name='sort']").val($(this).attr("sort"));
                    $("input[name='order']").val("desc");
                }
                else {
                    $("input[name='sort']").val($(this).attr("sort"));
                    $("input[name='order']").val($(this).attr("order"));
                }
            }
            else {
                $("input[name='sort']").val("");
                $("input[name='order']").val("");
            }
            $("form").submit();
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