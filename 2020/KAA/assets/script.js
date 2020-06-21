
$(document).ready(function () {
$('h2').on('mouseover', function(){
    $('h2').removeClass('selected');
    $(this).addClass('selected');
});

});