(function(win) {
    'use strict';

    var doc = win.document;

    doc.addEventListener('DOMContentLoaded', function () {
        var form    = doc.querySelector('#getFirstAccess'),
            email   = form.elements.namedItem('email'),
            submit  = form.elements.namedItem('submit');

        email.addEventListener('keyup', function () {
            if (!this.validity.valid) {
                if (!submit.disabled) {
                    submit.disabled = true;
                }
            } else {
                submit.disabled = false;
            }
        }, false);

        form.addEventListener('submit', function (event) {
            if (!email.validity.valid) {
                event.preventDefault();
            }
        }, false);
    });

})(window);