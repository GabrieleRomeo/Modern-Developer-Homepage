(function(win) {
    'use strict';

    var doc = win.document;

    doc.addEventListener('DOMContentLoaded', function () {
        var form    = doc.querySelector('#getFirstAccess'),
            email   = form.elements.namedItem('email'),
            submit  = form.elements.namedItem('submit');

        email.addEventListener('keyup', function () {
            if (!this.validity.valid) {
                if (!this.classList.contains('input--invalid')) {
                    this.classList.add('input--invalid');
                }
                if (!submit.disabled) {
                    submit.disabled = true;
                }
            } else {
                this.classList.remove('input--invalid');
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