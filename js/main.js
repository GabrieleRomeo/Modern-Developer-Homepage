(function(win) {
    'use strict';

    var doc       = win.document;
    var API       = 'https://moderndeveloper.com/api';
    var errorMsg, form;
    var ERRORS    = {
        'List_AlreadySubscribed': 'You have already subscribed to receive email.'
    };

    doc.addEventListener('DOMContentLoaded', function () {
        errorMsg  = doc.querySelector('.error--email');
        form      = doc.querySelector('#getFirstAccess');

        var email = form.elements.namedItem('email'),
        submit    = form.elements.namedItem('submit');

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
            event.preventDefault();

            if (!email.validity.valid) {
                return;
            }

            subscribeMailchimp();
            return false;
        }, false);
    });

    function subscribeMailchimp () {
        var httpRequest = new XMLHttpRequest();
        errorMsg.textContent = 'Subscribing...';

        httpRequest.open('POST', API + '/mailchimp/early-access');
        httpRequest.setRequestHeader('Content-Type', 'application/json');
        httpRequest.setRequestHeader('Cache-Control', 'no-cache');

        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState !== 4) return;
            var response = JSON.parse(httpRequest.responseText);

            if (response.success) {
                errorMsg.textContent = 'Thank you for your interest!';
            } else {
                errorMsg.textContent = ERRORS[response.name] || response.error || 'Some error occurred';
            }

            form.style.display = 'none';
            errorMsg.style.display = 'block';
        };

        httpRequest.send(JSON.stringify({
            email: email.value
        }));
    }

})(window);
