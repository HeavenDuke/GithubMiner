/**
 * Created by heavenduke on 17-5-10.
 */

(function () {

    var renderer = new marked.Renderer();
    renderer.image = function(href, title, text) {
        var out = '<img class="md-image" style="max-width: 100%;" src="' + href + '" alt="' + text + '"';
        if (title) {
            out += ' title="' + title + '"';
        }
        out += this.options.xhtml ? '/>' : '>';
        return out;
    };

    var construct_recommendation_list = function (list) {

        var construct_recommendation_item = function (item) {
            var result = "<li class='list-group-item'>";
            result += "<a class='list-item-title' href='/repositories/" + item.repository_id + "'>" + item.name + "</a>";
            result += "<p class='list-item-description'>" + marked(item.description ? item.description : "null", {renderer: renderer}) + "</p>";
            result += "</li>";
            return result;
        };

        if (list.length == 0) {
            alert("No more recommendations.");
        }
        else {
            $("#recommendation-container").children("li").remove();
            list.forEach(function (item) {
                $("#recommendation-container").append($(construct_recommendation_item(item)));
                if ($("#recommendation-refresher").prev().length == 0) {
                    $("#recommendation-refresher").before($(construct_recommendation_item(item)));
                }
                else {
                    $("#recommendation-refresher").prev().after($(construct_recommendation_item(item)));
                }
            });
        }
    };

    var fetch_recommendations = function (first) {
        var params = {};
        if (first) {
            params["restart"] = true;
        }
        $.get("/api/v1/recommendation/guess", params, function (data, status) {
            construct_recommendation_list(data.recommendations);
        });
    };

    var prepare_repository_recommendation = function () {
        $(".refresher").click(function () {
            fetch_recommendations(false);
        });
        $("#recommendation-refresher").click(function () {
            fetch_recommendations(false);
        });
    };

    function prepare_homepage (){
        $(".medal-description").each(function () {
            $(this).children("p").html(marked($(this).children().text(), {renderer: renderer}));
        });
        prepare_repository_recommendation();
        fetch_recommendations(true);
    }

    $(document).ready(function () {
        prepare_homepage();
    });

})();