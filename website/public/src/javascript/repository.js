/**
 * Created by heavenduke on 17-5-9.
 */


(function () {

    var offset = 0, repository_id, type;
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
            result += "<a class='list-item-title' href='/repositories/" + item.full_name + "'>" + item.full_name + "</a>";
            result += "<a class='pull-right badge' style='background-color: #B0B0B0; margin-top: 5px;' onclick='$(this).children(\'form\').submit();'><form class='hidden' method='POST' action='/repositories/" + item.full_name + "/star'></form><i class='fa fa-star'></i> Star</a>";
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

        var construct_empty_container = function () {
            var result = "<li class='list-group-item'>";
            result += "No recommendation</li>";
            return result;
        };

        if (list.length == 0) {
            if (offset != 0) {
                alert("No more recommendations.");
            }
            else {
                $("#recommendation-container").children("li").remove();
                $("#recommendation-container").addClass("empty-list");
                $("#recommendation-container").addClass("text-center");
                $("#recommendation-container").append($(construct_empty_container()));
                var small_container = $("#recommendation-refresher").parent();
                small_container.addClass("empty-list");
                small_container.addClass("text-center");
                small_container.append($(construct_empty_container()));
                $("#recommendation-refresher").remove();
            }
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
            offset: skip,
            type: type
        }, function (data, status) {
            if (data.type) {
                type = data.type;
            }
            if (data.offset) {
                offset = data.offset;
            }
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
        $(".readme").each(function () {
            $(this).html($(this).text());
        });
        $('pre code').each(function () {
            hljs.highlightBlock(this);
        });
        $("#readme-viewer").click(toggle_readme);
        repository_id = $("#rid").text();
        var url = $("#url").text();
        $("#rid").remove();
        $("#url").remove();
        $(".readme").find("a").each(function () {
            var href = $(this).attr("href");
            if (href) {
                if (href.match(/(^.\/)|(^..\/)(^.\\)|(^..\\)/) != null) {
                    href = url + href.replace(/($.\/)|($..\/)($.\\)|($..\\)/, "/");
                }
                else if (href.match(/(^http:\\\\)|(^https:\/\/)|(#)/) == null) {
                    href = url + "/" + href;
                }
            }
            $(this).attr('href', href);
        });
        $(".readme").find("img").each(function () {
            var src = $(this).attr("src");
            if (src) {
                if (src.match(/(^.\/)|(^..\/)(^.\\)|(^..\\)/) != null) {
                    src = url + src.replace(/($.\/)|($..\/)($.\\)|($..\\)/, "/");
                }
                else if (src.match(/(^http:\\\\)|(^https:\/\/)|(#)/) == null) {
                    src = url + "/" + src;
                }
            }
            $(this).attr('src', src);
        });
        prepare_repository_recommendation();
        fetch_recommendations(repository_id, offset);
        $()
    };

    $(document).ready(function () {
        if(window.location.href.match(/repositories/) != null) {
            prepare_repository_detail();
        }
    });

})();