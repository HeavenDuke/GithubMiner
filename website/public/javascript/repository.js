/**
 * Created by heavenduke on 17-5-9.
 */


(function () {

    var toggle_readme = function () {
        var actions = {
            "show": "hide",
            "hide": "show"
        };
        var action = $(this).children().text().replace(" README", "");
        $(this).children().text(actions[action] + " README");
        $(this).prev().toggle("fast");
    };

    var prepare_repository_detail = function () {
        var container = $(".readme");
        var renderer = new marked.Renderer();
        renderer.image = function(href, title, text) {
            var out = '<img class="md-image" style="max-width: 100%;" src="' + href + '" alt="' + text + '"';
            if (title) {
                out += ' title="' + title + '"';
            }
            out += this.options.xhtml ? '/>' : '>';
            return out;
        };
        container.html(marked(container.text(), {renderer: renderer}));


        $("#readme-viewer").click(toggle_readme)
    };

    $(document).ready(function () {
        if(window.location.href.match(/repositories/) != null) {
            prepare_repository_detail();
        }
    });

})();