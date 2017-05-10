/**
 * Created by heavenduke on 17-5-9.
 */


(function () {

    var offset = 0, repository_id;
    var renderer = new marked.Renderer();
    renderer.image = function(href, title, text) {
        var out = '<img class="md-image" style="max-width: 100%;" src="' + href + '" alt="' + text + '"';
        if (title) {
            out += ' title="' + title + '"';
        }
        out += this.options.xhtml ? '/>' : '>';
        return out;
    };

    var toggle_readme = function () {
        var actions = {
            "show": "hide",
            "hide": "show"
        };
        var action = $(this).children().text().replace(" README", "");
        $(this).children().text(actions[action] + " README");
        $(this).prev().toggle("fast");
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
            offset += list.length;
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

    var fetch_recommendations = function (rid, skip) {
        $.get("/api/v1/recommendation/repository", {
            repository_id: rid,
            offset: skip
        }, function (data, status) {
            construct_recommendation_list(data.recommendations);
        });
    };

    var prepare_repository_recommendation = function () {
        $(".refresher").click(function () {
            fetch_recommendations(repository_id, offset);
        });
        $("#recommendation-refresher").click(function () {
            fetch_recommendations(repository_id, offset);
        });
    };

    var prepare_repository_detail = function () {
        var container = $(".readme");
        container.html(marked(container.text(), {renderer: renderer}));
        $("#readme-viewer").click(toggle_readme);
        repository_id = $("#rid").text();
        $("#rid").remove();
        prepare_repository_recommendation();
        fetch_recommendations(repository_id, offset);
    };

    $(document).ready(function () {
        if(window.location.href.match(/repositories/) != null) {
            prepare_repository_detail();
        }
    });

})();