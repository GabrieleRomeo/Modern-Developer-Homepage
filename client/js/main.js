'use strict';

(function(win) {

    var doc     = win.document;
    var API     = 'https://moderndeveloper.com/api';
    var ERRORS  = {
        'List_AlreadySubscribed': 'You have already subscribed to receive email.'
    };

    var sizewait, signedMsg, errorMsg, form;


    doc.addEventListener('DOMContentLoaded', function () {

        signedMsg = doc.querySelector('#signedMsg');
        errorMsg  = doc.querySelector('.error--email');
        form      = doc.querySelector('#getFirstAccess');

        var email     = form.elements.namedItem('email'),
            submit    = form.elements.namedItem('submit');

        // Initialize the animation
        animation.init();

        email.addEventListener('keyup', checkValidity, false);
        email.addEventListener('change', checkValidity, false);

        form.addEventListener('submit', function (event) {
            event.preventDefault();

            if (!email.validity.valid) {
                return;
            }

            TweenMax.staggerTo([email, submit], 1, {
                autoAlpha:0,
                y:-50
            });

            TweenMax.set(signedMsg, {
                display: 'block',
                position: 'relative',
                top: '-50px'
            });

            TweenMax.from(signedMsg, 1, {
                autoAlpha:1,
                y:-100
            }, 0.5);

            subscribeMailchimp();
            return false;
        }, false);
    });


    win.addEventListener('resize', function () {
        if(typeof sizewait !== 'undefined'){
            clearTimeout(sizewait);
        }
        sizewait = setTimeout(function() {
            animation.handleResize();
        }, 200);
    });

    function checkValidity() {
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
    }


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
