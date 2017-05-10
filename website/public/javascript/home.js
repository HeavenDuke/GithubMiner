/**
 * Created by heavenduke on 17-5-10.
 */

(function () {

    var offset = 0;

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

    var fetch_events = function (first) {
        $.get("/api/v1/events", {
            offset: offset
        }, function (data, status) {
            construct_event_list(data.events);
        });
    };

    var construct_event_list = function (list) {
        var construct_event_item = function (item) {
            var result = "<li class='list-group-item event-item'>";
            result += "<i class='fa fa-star'></i> " + item.login + " starred ";
            result += "<a href='/repositories/" + item.repository_id + "'>" + item.name + "</a>";
            result += "<span class='text-muted pull-right'> " + item.created_at + "</span>";
            result += "</li>";
            return result;
        };

        if (list.length == 0) {
            alert("No more recommendations.");
        }
        else {
            offset += list.length;
            list.forEach(function (item) {
                if ($("#event-refresher").prev().length == 0) {
                    $("#event-refresher").before($(construct_event_item(item)));
                }
                else {
                    $("#event-refresher").prev().after($(construct_event_item(item)));
                }
            });
        }
    };

    var prepare_recommendation = function () {
        $(".refresher").click(function () {
            fetch_recommendations(false);
        });
        $("#recommendation-refresher").click(function () {
            fetch_recommendations(false);
        });
    };

    var prepare_repository_event = function () {
        $("#event-refresher").click(function () {
            fetch_events(false);
        });
    };

    function prepare_homepage (){
        $(".medal-description").each(function () {
            $(this).children("p").html(marked($(this).children().text(), {renderer: renderer}));
        });
        prepare_recommendation();
        prepare_repository_event();
        fetch_recommendations(true);
        fetch_events();
    }

    $(document).ready(function () {
        prepare_homepage();
    });

})();