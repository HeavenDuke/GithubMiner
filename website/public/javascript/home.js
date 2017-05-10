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

    function prepare_homepage (){
        $(".medal-description").each(function () {
            $(this).children("p").html(marked($(this).children().text(), {renderer: renderer}));
        });
    }

    $(document).ready(function () {
        prepare_homepage();
    });

})();