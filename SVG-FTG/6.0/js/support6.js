// Low-level support code for applications and services utilised by SVG Family-Tree Generator (SVG-FTG)
// Author:	A.C.Proctor	17-Jan-2021
// Modified:	A.C.Proctor	23-Mar-2021
//		Added test for IE versions. Fix su_showFile for IE


function su_getClassList (elem) {
// Returns a reference to the classList associated with the given person-box or family-circle element. If not null then this will be a DOMTokenList object,
// to which you can apply properties and methods such as:
//    .length  {=count of tokens},  .value  {=normalised list as string},  .item(index),  .contains(token),  .add(token[,...]),  .remove(token[,...])
//    .replace(oldToken,newToken),  .toggle(token)  {=add or remove token}
    if (nd_elemToType(elem) == 'P') {
	var elemUse = elem.getElementsByTagName ('use')[0];
	return elemUse.classList;
    } else {
	return elem.classList;
    }
}

function su_SVGFile () {
// Tests whether the current document is an SVG-only one, as opposed to an SVG/HTML mix (see associated header setting in SVG-FTG)
    return (document.lastChild.tagName === "svg");
}

function su_pz (inst) {
// Tests whether pan-zoom is present for the specified tree instance
    return (typeof window['tp_panZoomTree' + inst] === "object");
}

function su_ie() {
// Tests for Internet Explorer (IE) and returns the major version number. Returns 0 if other browser
    var ua = window.navigator.userAgent;
    // Version string for pre-11: "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)"
    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }
    // Version string for 11: "Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko"
    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }
    return 0;
}

function su_showFile (file,title) {
// Show the contents of the given file in a new browser tab

    // Test whether content is an html/svg document. The "unacceptable" positions of dot in the filename are -1 (lastIndexOf failed) and 0, which
    // respectively refer to names with no extension (e.g. "name") or start with dot (e.g. ".htaccess"). Zero-fill right shift operator (>>>) if
    // used with zero affects -ve numbers transforming -1 to 4294967295 and -2 to 4294967294 etc. (i.e. making them large +ve)
    var extn = file.slice((file.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase();
    var html = ("htm|html|svg|".indexOf(extn) == -1 ? false : true);

    // NB: We use a short timer to disassociate the window.open call from the actual user click operation. Some browsers impose functionality based
    // on the modify keys used in conjunction with the mouse click, e.g. Chrome: Ctrl+click doesn't give focus to new tab, and Shift+click opens new window.
    if (html) {
	setTimeout (function () {
	    window.open (file, "_blank");
	},20);
    } else {
	setTimeout (function () {
	    var win = window.open("", "_blank");
	    win.document.write("<html><head><title>" + title + "</title></head><body>");
	    if (su_ie() == 0) {
		win.document.write("<embed  src='" + file + "' width='100%' height='100%' style='object-fit:contain;'>");
	    } else {
		win.document.write("<div style=\"background-image:url('" + file + "');height:100%;width:100%;background-size:contain;background-position:50% 50%;background-repeat:no-repeat;\"></div>");
	    }
	    win.document.write("</body></html>");
	    win.document.close();
	},20);
    }
}

function su_dragDialog (idCont, idHdr, enable) {
// Support for dragging a dialog box around the browser window. idCont is the id of the main container div, and idHdr (if specified)
// is the id of the header div (i.e. title bar). Specifying the latter means that you have to grab the header to move the dialog. If
// 'enable' is false then any dragging is disabled by removing the event handler.
    var deltaX = 0, deltaY = 0, mouseX = 0, mouseY = 0;
    var elem = document.getElementById(idCont);
    if (document.getElementById(idHdr)) {
	// If present, the header is what you grab to move the dialog
	document.getElementById(idHdr).onmousedown = enable ? su_dragMouseDown : '';
    } else {
	// Otherwise, move the dialog from anywhere inside the div
	elem.onmousedown = enable ? su_dragMouseDown : '';
    }
    if (!enable) return;

    function su_dragMouseDown (e) {
	e = e || window.event;
	e.preventDefault();
	// Get the mouse cursor position at startup:
	mouseX = e.clientX;
	mouseY = e.clientY;
	document.onmouseup = su_closeDragElement;
	// Call a function whenever the cursor moves:
	document.onmousemove = su_elementDrag;
    }

    function su_elementDrag (e) {
	e = e || window.event;
	e.preventDefault();
	if (e.clientY >= 0 && e.clientX >= 0 && e.clientX < window.innerWidth && e.clientY < window.innerHeight) {
	    // Calculate the new cursor position:
	    deltaX = mouseX - e.clientX;
	    deltaY = mouseY - e.clientY;
	    mouseX = e.clientX;
	    mouseY = e.clientY;
	    // Set the container div's new position:
	    elem.style.top = (elem.offsetTop - deltaY) + "px";
	    elem.style.left = (elem.offsetLeft - deltaX) + "px";
	}
    }

    function su_closeDragElement () {
	// Stop moving when mouse button is released:
	document.onmouseup = null;
	document.onmousemove = null;
    }
}

// The following code is required for IE 10 and 11. The classList property is supposed to be supported, but it's only on HTML elements.
// This code copies it to the base of SVG elements. See https://stackoverflow.com/questions/8098406/code-with-classlist-does-not-work-in-ie
if (!Object.getOwnPropertyDescriptor(Element.prototype,'classList')) {
    if (HTMLElement && Object.getOwnPropertyDescriptor (HTMLElement.prototype, 'classList')) {
	Object.defineProperty (Element.prototype, 'classList', Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'classList'));
    }
}

// The following is required because IE 11 does not support the startsWith() function on strings
if (!String.prototype.startsWith) {
    Object.defineProperty (String.prototype, 'startsWith', {
	value: function(search, rawPos) {
	    var pos = rawPos > 0 ? rawPos|0 : 0;
	    return this.substring(pos, pos + search.length) === search;
	}
    });
}

// The following is required because IE 11 only supports the matches() function on elements under the non-standard name of msMatchesSelector
if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector;
}
