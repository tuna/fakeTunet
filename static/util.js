function newXMLHttpRequest() {
    return window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
}

// Synchronous POST request.
function post(url, data) {
    var req = newXMLHttpRequest();
    req.open('POST', url, false);
    req.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    req.send(data);
    return req.responseText;
}

// Synchronous GET request.
function get(url) {
    var req = newXMLHttpRequest();
    req.open('GET', url, false);
    req.send('');
    return req.responseText;
}

function include(url) {
    $.globalEval(get(url));
}

include('/static/jquery.url.js');
include('/static/jquery.cookie.js');
include('/static/sprintf.js');

dst = $.url().param('url');
wireness = $.url().segment(1);

