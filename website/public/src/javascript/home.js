/**
 * Created by heavenduke on 17-5-10.
 */

(function () {

    var offset = 0, roffset = 0, refreshed = true, type;

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
            result += "<a class='list-item-title' href='/repositories/" + item.full_name + "'>" + item.full_name + "</a>";
            result += "<a class='pull-right badge' style='background-color: #B0B0B0; margin-top: 5px;' onclick='$(this).children(\"form\").submit();'><form class='hidden' method='POST' action='/repositories/" + item.full_name + "/star'></form><i class='fa fa-star'></i> Star</a>";
            result += "<p class='list-item-description'>" + marked(item.description ? item.description : "null", {renderer: renderer}) + "</p>";
            result += "<p class='list-item-memo text-muted'><strong>Based on </strong>" + item.why + "</p>";
            if (item.language && item.language != "") {
                result += "<span class='pull-right badge' style='background-color: " + item.color + ";'>";
                result += "<a style='color: white;' href='/search?language='" + item.language + "> " + item.language + "</a>";
                result += "</span>";
            }
            result += "</li>";
            return result;
        };

        if (list.length == 0) {
            alert("No more recommendations.");
        }
        else {
            if (!refreshed) {
                roffset += list.length;
            }
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
        var params = {
            offset: roffset
        };
        if (first) {
            params["restart"] = true;
        }
        params["type"] = type;
        $.get("/api/v1/recommendation/guess", params, function (data, status) {
            if (data.type) {
                type = data.type;
            }
            if (data.offset) {
                roffset = data.offset;
                refreshed = true;
            }
            else {
                refreshed = false;
            }
            construct_recommendation_list(data.recommendations);
        });
    };

    var fetch_events = function (type) {
        switch(type) {
            case "following":
                $.get("/api/v1/events?type=following", {
                    offset: offset
                }, function (data, status) {
                    construct_event_list($("#following-event-container"), $("#following-event-refresher"), data.events);
                });
                break;
            case "broadcast":
                $.get("/api/v1/events", {
                    offset: offset
                }, function (data, status) {
                    construct_event_list($("#broadcast-event-container"), $("#broadcast-event-refresher"), data.events);
                });
                break;
            default:
                $.get("/api/v1/events", {
                    offset: offset
                }, function (data, status) {
                    construct_event_list($("#event-container"), $("#event-refresher"), data.events);
                });
        }
    };

    var construct_event_list = function (container, refresher, list) {
        var construct_event_item = function (item) {
            var result = "<li class='list-group-item event-item'>";
            result += "<i class='fa fa-star'></i> " + item.login + " starred ";
            result += "<a href='/repositories/" + item.full_name + "'>" + item.full_name + "</a>";
            result += "<span class='text-muted pull-right'> " + item.created_at + "</span>";
            result += "</li>";
            return result;
        };


        if (list.length == 0) {
            alert("No more event.");
        }
        else {
            offset += list.length;
            list.forEach(function (item) {
                if (refresher.prev().length == 0) {
                    refresher.before($(construct_event_item(item)));
                }
                else {
                    refresher.prev().after($(construct_event_item(item)));
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
            fetch_events("");
            $(this).blur();
        });
        $("#broadcast-event-refresher").click(function () {
            fetch_events("broadcast");
            $(this).blur();
        });
        $("#following-event-refresher").click(function () {
            fetch_events("following");
            $(this).blur();
        });
        $(".event-switcher").click(function () {
            $($(this).attr('target')).css("display", "block");
            $($(this).siblings().attr('target')).css("display", "none");
            $(this).removeClass("btn-default");
            $(this).addClass("btn-inverse");
            $(this).siblings().removeClass("btn-inverse");
            $(this).siblings().addClass("btn-default");
            $(this).blur();
        });
    };

    function prepare_homepage (){
        $(".medal-description").each(function () {
            $(this).children("p").html(marked($(this).children().text(), {renderer: renderer}));
        });
        prepare_recommendation();
        prepare_repository_event();
        fetch_recommendations(true);
        if ($("#broadcast-event-refresher").length > 0) {
            fetch_events("broadcast");
            fetch_events("following");
        }
        else {
            fetch_events("");
        }
    }

    $(document).ready(function () {
        prepare_homepage();
    });

})();