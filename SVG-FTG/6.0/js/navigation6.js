// Support for tree-navigation data, as produced by the SVG Family-Tree Generator (SVG-FTG)
// Author:	A.C.Proctor	5-Jan-2018
// Modified:	A.C.Proctor	10-Oct-2020
//		Added many new access functions

var nd_index = {};

// Indexes into nd_colours. Entries 0–3 are indexed by the integers from nd_sex. Entry 4 is the border colour used for all person boxes. Entries 5–8 are used in family
// circles: 5 = main circle, 6 = separator for banded main circle (i.e. indicating the presence of 'more children'), 7 = liaison circle, 8 = separator for banded liaison circle.
// Entry 9 is the single component used in the background for R, G, and B (e.g. 255 if white).
const ND_C_F=0, ND_C_M=1, ND_C_U=2, ND_C_X=3, ND_C_BORD=4, ND_C_C=5, ND_C_C2=6, ND_C_CL=7, ND_C_CL2=8, ND_C_BG=9;
// Indexes into nd_dims. Entry 0 is the opacity. Entries 1–6 correspond to the header settings: W, H, MW, MH, BW, BH.
const ND_D_OPAC=0, ND_D_W=1, ND_D_H=2, ND_D_MW=3, ND_D_MH=4, ND_D_BW=5, ND_D_BH=6, ND_D_LINE_WID=7, ND_D_LINE_WID_SH=7, ND_D_LINE_WID_ROOT=9;

// Conversion between access keys (pkey=person key, fkey=family key, key=either key, index=person or family index, elem=SVG element, inst/type/key as per handler calls)
function nd_pkeyToIndex(inst,key) { return nd_index[inst].persons[key]; }
function nd_indexToPkey(inst,index) { return Object.keys(nd_index[inst].persons)[index]; }
function nd_fkeyToIndex(inst,key) { return nd_index[inst].families[key]; }
function nd_indexToFkey(inst,index) { return Object.keys(nd_index[inst].families)[index]; }

function nd_keyToElem(inst,key,type) { return document.getElementById(type + inst + '-' + key); }
function nd_indexToElem(inst,index,type) { return nd_keyToElem(inst,(type=='P'?nd_indexToPkey(inst,index):nd_indexToFkey(inst,index)),type); }

function nd_elemToInst (elem) {
    var id = elem.id;
    if (id.charAt(2) == '-') {
	return id.charAt(1);
    } else {
	return '';
    }
}
function nd_elemToKey (elem) {
    var id = elem.id;
    if (id.charAt(1) == '-') {
	return id.substring(2);
    } else if (id.charAt(2) == '-') {
	return id.substring(3);
    } else {
	return '';
    }
}
function nd_elemToType (elem) {
    var id = elem.id;
    if (id.charAt(1) == '-' || id.charAt(2) == '-') {
	return id.charAt(0);
    } else {
	return '';
    }
}
function nd_elemToIndex (elem) {
    if (nd_elemToType (elem) == 'P') {
	return nd_pkeyToIndex (nd_elemToInst(elem), nd_elemToKey(elem));
    } else {
	return nd_fkeyToIndex (nd_elemToInst(elem), nd_elemToKey(elem));
    }
}

// Data access functions (note=notes div, data=program data div, sexIndex=0-3, sexClass=f/m/u/x, caption=person caption, perCol=person-box colour)
function nd_getNoteByKey(inst,key,type) { return document.getElementById(type + inst + '_' + key); }	// to Note element
function nd_getNoteByElem(elem) {
    var id = elem.id;
    if (id.charAt(1) == '-' || id.charAt(2) == '-') id = id.replace ('-', '_');
    return document.getElementById(id);
}
function nd_getDataByKey(inst,key,type) { return document.getElementById(type + inst + '.' + key); }	// to Program Data element
function nd_getDataByElem(elem) {
    var id = elem.id;
    if (id.charAt(1) == '-' || id.charAt(2) == '-') id = id.replace ('-', '.');
    return document.getElementById(id);
}
function nd_isFamilyKey(inst,key) { return nd_index[inst].families.hasOwnProperty(key); }

function nd_getSexIndexByIndex(inst,index) { return nd_index[inst].sex[index]; }
function nd_getSexIndexByElem(elem) { return nd_getSexIndexByIndex(nd_elemToInst(elem),nd_elemToIndex(elem)); }
function nd_getSexClassByIndex(inst,index) { return "fmx".charAt(nd_index[inst].sex[index]); }
function nd_getSexClassByPkey(inst,key) { return nd_getSexClassByIndex(inst,nd_pkeyToIndex(inst,key)); }

function nd_getCaptionByElem(elem) {
    var caption = "";
    var elements = elem.getElementsByTagName("text");
    for (var i=0; i<elements.length; i++) { caption += (' ' + elements[i].textContent); }
    return caption.replace(/\u2010 /g,'').substring(1);
}
function nd_getCaptionByPkey(inst,key) { return nd_getCaptionByElem(nd_keyToElem(inst,key,'P')); }
function nd_getCaptionByIndex(inst,index) { return nd_getCaptionByPkey(inst,nd_indexToPkey(inst,index)); }
function nd_description (inst,key,type) {
    if (type == 'P') {
	return nd_getCaptionByPkey(inst,key);
    } else {
	var iFam = nd_fkeyToIndex (inst,key);
	var iPars = nd_index[inst].famParents[iFam];
	return "family of " + nd_getCaptionByIndex(inst,iPars[0]) + " and " + nd_getCaptionByIndex(inst,iPars[1]);
    }
}

function nd_getPersonalNamesByIndex(inst,index) { return nd_index[inst].personalNames[index]; }
function nd_getPersonalNamesByElem(elem) { return nd_getPersonalNamesByIndex(nd_elemToInst(elem),nd_elemToIndex(elem)); }
function nd_getPersonalNamesByPkey(inst,key) { return nd_getPersonalNamesByIndex(inst,nd_pkeyToIndex(inst,key)); }

function nd_getPerColByIndex(inst,index) { return nd_index[inst].colours[ND_C_F+nd_index[inst].sex[index]]; }
function nd_getPerColByElem(elem) { return nd_getPerColByIndex(nd_elemToInst(elem),nd_elemToIndex(elem)); }

