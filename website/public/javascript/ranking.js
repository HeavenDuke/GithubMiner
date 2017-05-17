/**
 * Created by heavenduke on 17-4-28.
 */

(function () {

    $(document).ready(function () {
        var languages = JSON.parse($("#cloud").attr('data'));
        var max = -1, min = 9999999, lb = 20, rb = 60;
        for(var i = 0; i < languages.length; i++) {
            max = Math.max(languages[i][1], max);
            min = Math.min(languages[i][1], min);
        }
        for(i = 0; i < languages.length; i++) {
            if (max == min) {
                languages[i][1] = Math.round((lb + rb) / 2);
            }
            else {
                languages[i][1] = Math.round(lb + (rb - lb) * (languages[i][1] - min) / (max - min));
            }
        }
        var width = $("#cloud").parent()[0].clientWidth;
        var height = width * 9 / 16;
        $("#cloud").attr("width", width);
        $("#cloud").attr("height", height);

        WordCloud(document.getElementById('cloud'), {
            gridSize: 18,
            fontFamily: 'Finger Paint, cursive, sans-serif',
            list: languages,
            click: function(item) {
                window.location.href="/ranking?type=Overall&language=" + encodeURIComponent(item[0]);
            },
            backgroundColor: '#FFFFFF'
        });
    });

})();