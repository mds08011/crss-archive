﻿// Message Box service code, for use with family trees as generated by the SVG Family-Tree Generator (SVG-FTG)
// Author:	A.C.Proctor	17-Jan-2021
//

function mb_show (title, msg, callback, options) {
// Displays the given message (with accompanying title), and invokes the callback function(iBut) on dismissal of the dialog.
// See documentation for options
    var tmo = null, ret;

    options = options || {};
    if (su_SVGFile() || options.Basic) {
        if (options.hasOwnProperty("Button2")) {
            ret = (confirm(msg) ? 1 : 2);
        } else {
	    alert (msg);
            ret = 1;
        }
        callback (ret);
    } else {
        var elem = document.getElementById('mb_container'), elemSub, elemScr;

        elemSub = document.getElementById('mb_hdr');
        elemSub.innerText = ( title.length>0 ? title : "Message");
        elemSub = document.getElementById('mb_body');
        elemSub.innerText = msg;

        elemSub = document.getElementById('mb_img');
	if (options.hasOwnProperty("Icon")) {
           elemSub.src = options.Icon;
           elemSub.style.display = "inline-block";
        } else {
           elemSub.style.display = "none";
        }

        elem.style.display = "block";			// Make visible first before we use its size
        elem.style.left = ((window.innerWidth/2) - elem.offsetWidth/2) + 'px';
        elem.style.top = ((window.innerHeight/2) - elem.offsetHeight/2) + 'px';

        elemScr = document.getElementById('mb_screen');
        if (options.hasOwnProperty('Screen')) {
            elemScr.style.display = "block";
            tmo = setTimeout (function() { elemScr.style.display = "none"; tmo = null; }, options.Screen * 1000);
        } else {
            elemScr.style.display = "none";
        }

        elemSub = document.getElementById('mb_but1');
        elemSub.innerText = ( options.hasOwnProperty("Button1") ? options.Button1 : "OK");
        elemSub.onclick = function() {
            callback (1);
            mb_close(tmo);
        };
        elemSub = document.getElementById('mb_but2');
        if (options.hasOwnProperty("Button2")) {
            elemSub.innerText = options.Button2;
            elemSub.style.display = "inline-block";
            elemSub.onclick = function() {
                callback (2);
                mb_close(tmo);
            };
        } else {
            elemSub.style.display = "none";
            elemSub.onlick = '';
        }

        // Make the dialog draggable (or not)
        su_dragDialog ('mb_container', 'mb_hdr', !options.Fixed);
    }
}

function mb_close(tmo) {
// Close the dialog, cancel any timer, and remove event handlers
    document.getElementById('mb_container').style.display = "none";
    if (tmo) clearTimeout(tmo);
    su_dragDialog ('mb_container', 'mb_hdr', false);
    document.getElementById('mb_screen').style.display = "none";
}