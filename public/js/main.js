/* eslint-env jquery, browser */
$(document).ready(() => {

    // Place all Client-Side JavaScript code here...
    $('.ui.dropdown').dropdown();
    $('.ui.accordion').accordion({
        exclusive: false
    });
    $('.accordion .title').first().addClass('active');
    $('.accordion .content').first().addClass('active');
});