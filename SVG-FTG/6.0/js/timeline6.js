// Timeline Report application code, for use with family trees as generated by the SVG Family-Tree Generator (SVG-FTG)
// Author:	A.C.Proctor	5-Jan-2018
// Modified:	A.C.Proctor	13-Jan-2018
//		Support both div and span elements in Notes
//		Support GEDCOM date keywords
//		Link event-descriptions back to original information panels
// Modified:	A.C.Proctor	1-Sep-2018
//		Use charCodeAt() rather than codePointAt() for IE compatibility
// Modified:	A.C.Proctor	13-Sep-2018
//		Strengthen handling of unrecognised GEDCOM dates.
//		Omit day-of-week for Julian dates.
// Modified:	A.C.Proctor	11-Oct-2018
//		Added support for selecting multiple items
// Modified:	A.C.Proctor	21-Feb-2020
//		Added optional argument to tl_show() to dictate UK rather than US date formatting (i.e. D M Y rather than M D Y).
// Modified:	A.C.Proctor	5-Oct-2020
//		Acknowledge some renaming of items inside navigation.js
//		Improve tl_mark, and add a tl_unmark, just in case it's needed.
//		Use application prefix in var and const.
//

var tl_log, tl_divsDone = {}, tl_sortMe = [];
const TL_DATE=0, TL_SORTKEY=1, TL_DIV=2, TL_INST=3, TL_KEY=4;
const TL_PERSON="tl-person", TL_FAMILY="tl-family";

function tl_getSortKey (date) {
// Generates a sort key from an extended ISO date
    const W_JULIAN='1', W_NORM='2', W_YY='3';
    var weight=W_NORM;
    if (date.charAt(date.length-1) == "D") {
	weight=W_YY; date = date.slice(0,-1);
    } else if (date.charAt(date.length-1) == "J") {
	weight=W_JULIAN; date = date.slice(0,-1);
    }
    while (date.length < 10) { date += "-00"; }
    return date + weight;
}

function tl_addDivs (inst,key,type) {
// Add event divs/spans from notes associated with given person/family key
    var note, div, evStart, sortKey, elements;
    const WEIGHTS = {"BEF":'0', "TO":'1', "CAL":'2', "ABT":'3', "EST":'4', "":'5', "BET":'6', "FROMTO":'7', "FROM":'8', "AFT":'9'};
    note = nd_getNoteByKey(inst,key,type);
    if (!note) { return; }					// No notes for person/family
    if (tl_divsDone.hasOwnProperty(note.id)) { return; }	// Already have these notes
    tl_divsDone[note.id] = note;
    tl_mark (note.id);

    elements = note.getElementsByTagName ('*');
    for (var i=0; i<elements.length; i++) {
	div = elements[i];
	if ((div.nodeName=='DIV' || div.nodeName=='SPAN') && div.hasAttributes) {
	    if (div.hasAttribute("data-start")) {
		evStart = div.getAttribute("data-start");
		if (evStart.length > 0) {
		    if (evStart.charAt(0) == 'c') {
			evStart = "ABT " + evStart.substring(1);
		    } else if (evStart.charAt(0) == '{') {
			evStart = evStart.substr(1,evStart.length-2);
		    }
		    if (evStart.charAt(0) == '@') {
			sortKey = "??";			//Match GEDLoad.dll sorting
		    } else {
			var parts = evStart.split(' ');
			if (parts.length == 1) {
			    sortKey = tl_getSortKey (evStart) + WEIGHTS[""];
			} else {
			    if (parts[0] == "FROM" && parts.length == 4) { parts[0] = "FROMTO"; }
			    sortKey = tl_getSortKey (parts[1]) + WEIGHTS[parts[0]];
			}
			if (parts.length == 4) { sortKey += tl_getSortKey (parts[3]); }
		    }
	    	    tl_sortMe.push([ evStart, sortKey, div, inst, key ]);
		}
	    }
	}
    }
}

function tl_addPerson (inst,key) {
// Add event divs/spans for a given person
    tl_addDivs (inst,key,'P');
}

function tl_addFamily (inst,key) {
// Add event divs/spans for the given family, the spouses, and all its direct children
    tl_addDivs (inst,key,'F');
    var index = nd_fkeyToIndex(inst,key);
    var parents = nd_index[inst].famParents[index];
    tl_addDivs (inst,nd_indexToPkey(inst,parents[0]),'P');
    tl_addDivs (inst,nd_indexToPkey(inst,parents[1]),'P');
    var children = nd_index[inst].famChildren[index];
    for (var i=0; i<children.length; i++) {
	tl_addDivs (inst,nd_indexToPkey(inst,children[i]),'P');
    }
}

function tl_addItem (type,inst,key) {
// Add event divs/spans for a given person or family
    return type=='F' ? tl_addFamily(inst,key) : tl_addPerson(inst,key);
}

function tl_addAll (instq) {
// Add event divs/spans for all the person-boxes and family-circles associated with the given instance number or '*'
    var elements, id, type, key, inst;
    elements = document.querySelectorAll('g[id^="P"],use[id^="F"]');
    for (var i=0; i<elements.length; i++) {
	id=elements[i].id; type='';
	if (id.charAt(1) == '-') {
	    inst=''; key=id.substring(2); type=id.charAt(0);
	} else if (id.charAt(2) == '-') {
	    inst=id.charAt(1); key=id.substring(3); type=id.charAt(0);
	}
	if (type != '' && (inst==instq || instq=='*')) { tl_addItem(type,inst,key); }
    }
}

function tl_clear () {
// Clear all visible selections
    for (var noteId in tl_divsDone) { tl_unmark(noteId); }
    tl_divsDone = {};
    tl_sortMe.length = 0;
}

function tl_unmark (noteId) {
// Unmarks the person-box or family-circle associated with the notes id (i.e. as 'un-selected')
    var elem = document.getElementById(noteId.replace('_','-'));
    if (noteId.charAt(0) == 'P') {
	pd_unmarkPer (elem,TL_PERSON);
    } else {
	pd_unmarkFam (elem,TL_FAMILY);
    }
}

function tl_mark (noteId) {
// Mark the person-box or family-circle associated with the notes id as 'selected'
    var elem = document.getElementById(noteId.replace('_','-'));
    if (noteId.charAt(0) == 'P') {
	pd_markPer (elem,TL_PERSON);
    } else {
	pd_markFam (elem,TL_FAMILY);
    }
}

function tl_fmtDateVal (date, ukDateFmt) {
// Formats an elided ISO date, possibly having J/D suffix
    var year = "YYYY", dow="dddd ";
    if (date.charAt(date.length-1) == "D") {
	year += "[/" + ((+date.substr(0,4))+1).toString().substr(-2,2) + ']'; date = date.slice(0,-1);
    } else if (date.charAt(date.length-1) == "J") {
	year += " [[J]]"; date = date.slice(0,-1);
	dow = "";
    }
    if (date.length == 4) {
	return moment(date).format(year);
    } else if (date.length == 7) {
	return moment(date).format("MMMM, "+year);
    } else if (ukDateFmt) {
	return moment(date).format(dow + "D MMMM "+year);
    } else {		// Must be US format dates
	return moment(date).format(dow + "MMMM D, "+year);
    }
}

function tl_fmtDate (date, ukDateFmt) {
// Formats a date involving GEDCOM-like keywords
    var fmt;
    const PRE1 = {"BEF":'before ', "TO":'to ', "CAL":'', "ABT":'about ', "EST":'', "BET":'between ', "FROM":'from ', "AFT":'after '};
    const POST1 = {"BEF":'', "TO":'', "CAL":' (calculated)', "ABT":'', "EST":' (estimated)', "BET":'', "FROM":'', "AFT":''};
    const PRE2 = {"AND":' and ', "TO":' to '};
    if (date.charAt(0) == '@') {
	return "(Date?)";	//Must match GEDLoad.dll value
    } else {
	var parts = date.split(' ');
	if (parts.length == 1) {
	    fmt = tl_fmtDateVal (parts[0], ukDateFmt);
	} else if (parts.length == 2) {
	    fmt = PRE1[parts[0]] + tl_fmtDateVal (parts[1],ukDateFmt) + POST1[parts[0]];
 	} else {
	    fmt = PRE1[parts[0]] + tl_fmtDateVal (parts[1],ukDateFmt) + POST1[parts[0]] + PRE2[parts[2]] + tl_fmtDateVal(parts[3],ukDateFmt);
	}
	return fmt.charAt(0).toUpperCase() + fmt.slice(1);
    }
}

function tl_docOpen (logId) {
// Opens a new timeline "document". This will appear in the div with the specified id
    tl_log = document.getElementById(logId);
    tl_log.style.display='none';
    tl_log.innerHTML = "";
}

function tl_docWrite (text) 
// Write to current timeline "document"
    { tl_log.innerHTML += text; }

function tl_docClose () {
// Close and display the current timeline "document"
    tl_log.style.display='';
    tl_log.scrollIntoView(true);
}

function tl_dismiss ()
// Dismiss the currently visible timeline "document"
    { tl_log.style.display='none'; }

function tl_encodeText (string) {
// Converts certain HTML characters into numeric references for portability
    var encStr = [], ch;
    for (var i = 0; i < string.length; i++) { 
	ch = string.charCodeAt(i);
	if (ch < 32 || ch == 38 || ch == 60 || ch == 62 || ch > 127) {
	    encStr[i] = '&#' + ch + ';';
	} else {
	    encStr[i] = string.charAt(i);
	}
    }
    return encStr.join('');
}

function tl_show (logId) {
// Sorts the currently selected event divs/spans and formats them into a timeline "document" visible to the user
    var lastDate = "", div, evName, evType, inst, key, names, onclick;
    var ukDateFmt = (window.navigator.language != "en-US");

    tl_sortMe.sort(function(a, b) {
 	if (a[TL_SORTKEY] === b[TL_SORTKEY]) {
	    return 0;
	} else {
	    return (a[TL_SORTKEY] < b[TL_SORTKEY]) ? -1 : 1;
	}
    });
    tl_docOpen(logId);
    tl_docWrite("<h1 class='tl'>Timeline Report</h1>");

    for (var i=0; i<tl_sortMe.length; i++) {
	div = tl_sortMe[i][TL_DIV];
	if (tl_sortMe[i][TL_DATE] != lastDate) {
	    lastDate = tl_sortMe[i][TL_DATE];
	    tl_docWrite("<h2 class='tl'>" + tl_fmtDate(tl_sortMe[i][TL_DATE],ukDateFmt)  + "</h2>");
	}
	evName = "";
	if (div.hasAttribute("data-event")) { evName = div.getAttribute("data-event"); }
	if (evName.length == 0) { evName = "Untitled event"; }
	evType = "";
	if (div.hasAttribute("data-evtype")) { evType = div.getAttribute("data-evtype"); }
	if (evType.length > 0) { evType = " class='" + evType + "'"; }
	inst = tl_sortMe[i][TL_INST]; key = tl_sortMe[i][TL_KEY];
	if (nd_isFamilyKey(inst,key)) {
	    var parents = nd_index[inst].famParents[nd_fkeyToIndex(inst,key)];
	    names = "<span class='tl-" + nd_getSexClassByIndex(inst,parents[0]) + "'>" + tl_encodeText(nd_getCaptionByIndex(inst,parents[0])) + "</span> and " +
		"<span class='tl-" + nd_getSexClassByIndex(inst,parents[1]) + "'>" + tl_encodeText(nd_getCaptionByIndex(inst,parents[1])) + "</span>";
	    onclick="onclick=\"ip_showDiv(null,'F','" + inst + "','" + key + "');\"";
	} else {
	    names = "<span class='tl-" + nd_getSexClassByPkey(inst,key) + "'>" + tl_encodeText(nd_getCaptionByPkey(inst,key)) + "</span>";
	    onclick="onclick=\"ip_showDiv(null,'P','" + inst + "','" + key + "');\"";
	}
	if (typeof ip_showDiv === "function") { 
	    tl_docWrite("<h3 class='tl'" + evType + ">" + names + " &#x2014; <a " + onclick + "><span class='tl-du'>" + tl_encodeText(evName) + "</span></a></h3>");
	} else {
	    tl_docWrite("<h3 class='tl'" + evType + ">" + names + " &#x2014; <span class='tl-d'>" + tl_encodeText(evName) + "</span></h3>");
	}
	tl_docWrite(div.innerHTML);
    }

    tl_docWrite ("<br/><br/>");
    tl_docWrite("<button onclick='tl_dismiss();' type='button' class='tl' title='Dismiss timeline report'>Dismiss</button>");
    tl_docClose ();
}