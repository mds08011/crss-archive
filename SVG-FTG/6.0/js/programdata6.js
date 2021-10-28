// Higher-level support code for applications and services utilised by SVG Family-Tree Generator (SVG-FTG)
// Author:	A.C.Proctor	10-Oct-2020

pd_dataSignatures = {};

function pd_clearPer (className) {
// Clear all visible person-box selections
    var elements = document.querySelectorAll('g[id^="P"]');
    for (var i=0; i<elements.length; i++) {
	pd_unmarkPer (elements[i],className);
    }
}

function pd_clearFam (className) {
// Clear all visible family-circle selections
    var elements = document.querySelectorAll('use[id^="F"]');
    for (var i=0; i<elements.length; i++) {
	pd_unmarkFam (elements[i],className);
    }
}

function pd_markPer (elem, className) {
// Mark the given person-box as selected.
    className = className || "pd-person";
    su_getClassList(elem).add(className);
}

function pd_markFam (elem, className) {
// Mark the given family-circle as selected.
    className = className || "pd-family";
    su_getClassList(elem).add(className);
}

function pd_unmarkPer (elem, className) {
// Mark the given person-box as un-selected (i.e. normal) 
    className = className || "pd-person";
    su_getClassList(elem).remove(className);
}

function pd_unmarkFam (elem, className) {
// Mark the given family-circle as un-selected (i.e. normal) 
    className = className || "pd-family";
    su_getClassList(elem).remove(className);
}

function pd_mark (elem) {
// Convenience to apply default highlight to the given person-box or family-circle element, dependent upon its type
    if (nd_elemToType(elem) == 'P') {
	pd_markPer (elem);
    } else {
	pd_markFam (elem);
    }
}

function pd_unmark (elem) {
// Convenience to remove any default highlight from the given person-box or family-circle element, dependent upon its type
    if (nd_elemToType(elem) == 'P') {
	pd_unmarkPer (elem);
    } else {
	pd_unmarkFam (elem);
    }
}

function pd_clear () {
// Convenience to remove all default highlights from person-box and family-circle elements, dependent upon their type
    pd_clearPer ();
    pd_clearFam ();
}

function pd_getAppData (data,dataId) {
// Extracts the records from the given program-data element that relate to the given data id.
// It builds a dictionary of data-items for each such record, and returns an array of all such dictionaries.
// The returned array may be zero-length.
    var inst = (data.id.charAt(2) == '.' ? data.id.charAt(1) : '');
    var itemNames = pd_dataSignatures[inst][dataId].split('|');
    var dict, arrDict=[];

    if (data) {
	// In IE 11, innerText has line breaks stripped out
	var lines = (data.textContent ? data.textContent : data.innerText);
	var arr1 = lines.split(/\r\n|\n|\r/);
	for (var i=0; i < arr1.length; i++) {
	    var entry = arr1[i].trim();
	    if (entry.length > 0) {
		dict = {};
		var arr2 = entry.split('|');
		if (arr2[0].trim() == dataId) {
    		    for (var j=1; j < arr2.length; j++) {
			dict[itemNames[j-1]] = arr2[j].trim();
		    }
		    arrDict.push (dict);
		}
	    }
	}
    }
    return arrDict;
}

function pd_matchMulti (arrDict1, arrDict2, match) {
// Tests whether any entry in the first 'Program Data' array is deemed to match any entry in the second one.
// match=comparison function(dict1,dict2) called for each pair of entries.
    for (var i=0; i < arrDict1.length; i++) {
	for (var j=0; j < arrDict2.length; j++) {
	    if (match (arrDict1[i], arrDict2[j])) return true;
	}
    }
    return false;
}

function pd_compareProgData (type,inst,key,dataId,match,options) {
// Compares the Program Data of this object (if any defined) with every other object of the same type (P/F).
// type=P/F, inst=instance ID, key=person or family key name, dataId=data id,
// match=comparison function(dict1,dict2) to implement the comparison semantics between two records.
// options.Mark=optional function to highlight matching elements, default is pd_mark.
// options.Clear=optional function to remove current highlights, default is pd_clear.??
    options = options || {};
    var mark = options.Mark || pd_mark;
    var clear = options.Clear || pd_clear;
    var id = type + inst + '-' + key;
    var dataElem = nd_getDataByKey(inst,key,type);
    clear();

    if (dataElem) {
	var arrDict = pd_getAppData (dataElem,dataId);
	mark (document.getElementById(id));

	var elements, id2, type2, inst2;
	elements = document.querySelectorAll('g[id^="P"],use[id^="F"]');
	for (var i=0; i < elements.length; i++) {
	    id2=elements[i].id; inst2=nd_elemToInst(elements[i]); type2=nd_elemToType(elements[i]);
	    if (id2 != id) {
		var dataElem2 = nd_getDataByKey(inst2,nd_elemToKey(elements[i]),type2);
		if (dataElem2) {
		    var arrDict2 = pd_getAppData (dataElem2,dataId);
		    if (pd_matchMulti (arrDict, arrDict2, match)) mark (elements[i]);
		}
	    }
	}
    }
}

function pd_scrollIntoView (pElem) {
// Scrolls the given person element into view. This works for both the case of the SVG being in a scrolling div and when pan-zoom is present.
// We do not use the standard scrollIntoView() method in the first case because it is not well supported for SVG, and the coarse options
// are not supported across all browsers.
    var inst = nd_elemToInst (pElem);
    if (su_SVGFile()) return;
    var elemUse = pElem.getElementsByTagName ('use')[0];
    var w = nd_index[inst].dims[ND_D_W], h = nd_index[inst].dims[ND_D_H];

    if (su_pz (inst)) {
	// Pan-zoom present
	var pz = window['tp_panZoomTree' + inst];
	var sizes = pz.getSizes(), realZoom = sizes.realZoom;
	w = w * realZoom; h = h * realZoom;
	var xScaled = elemUse.x.baseVal.value*realZoom, yScaled = elemUse.y.baseVal.value*realZoom;

	var ctm = document.getElementById (nd_index[inst].title).querySelector('.svg-pan-zoom_viewport').getCTM();
	var xAdj = xScaled+ctm.e, yAdj = yScaled+ctm.f;

	var xPan = pz.getPan().x, yPan = pz.getPan().y;
	if (xAdj < 0) {
	    xPan = -xScaled;
	} else if (xAdj+w > sizes.width) {
	    xPan = -xScaled +sizes.width-w;
	}
	if (yAdj < 0) {
	    yPan = -yScaled;
	} else if (yAdj+h > sizes.height) {
	    yPan  =-yScaled + sizes.height-h;
	}

	pz.pan ({ x: xPan, y: yPan });
    } else {
	// Assume scrolling div
	// Get container viewing area
	var container = document.getElementById ("tp-" + nd_index[inst].title);
	var cTop = container.scrollTop;
	var cBottom = cTop + container.clientHeight;
	var cLeft = container.scrollLeft;
	var cRight = cLeft + container.clientWidth;

	// Get bounds of person element
 	var eTop = elemUse.y.baseVal.value;
	var eBottom = eTop + h;
	var eLeft = elemUse.x.baseVal.value;
	var eRight = eLeft + w;

	// Check if out of view, and apply any correction to bring it back
	if (eTop < cTop) {
	    container.scrollTop -= (cTop - eTop);
	} else if (eBottom > cBottom) {
	    container.scrollTop += (eBottom - cBottom);
	}

	if (eLeft < cLeft) {
	    container.scrollLeft -= (cLeft - eLeft);
	} else if (eRight > cRight) {
	    container.scrollLeft += (eRight - cRight);
	}
    }
}
