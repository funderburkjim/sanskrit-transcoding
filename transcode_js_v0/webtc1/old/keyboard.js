////java.sun.com/products/java-media/jai/forDevelopers/jai-imageio-1_0-rc-docs/index.html
////www.webdeveloper.com/forum/showthread.php?t=74982
////www.webreference.com/js/column12/trmethods.html (*** documentation for IE's TextRange)
////javascript.about.com/library/bladdjs.htm
////blog.vishalon.net/index.php/javascript-getting-and-setting-caret-position-in-textarea/
////coolwebdeveloper.com/2009/03/fantastic-new-javascript-debugging-tool-with-ie-8-and-its-list-of-features-hard-to-live-without/
////www.java2s.com/Code/JavaScriptReference/Javascript-Objects/TextRangeJavaScriptMethods.htm
////markitup.jaysalvat.com/downloads/demo.php?id=releases/latest (demo of textarea markup)
////www.reynoldsftw.com/2009/03/7-jquery-plugins-to-manipulate-textareas/ (blog for textarea manipulation)
////www.gate2home.com/?language=dev (another devanagari keyboard, (but more intrusive)
////en.wikipedia.org/wiki/Devanagari (descriptions of non-phonetic devanagari keyboards)
////tdil.mit.gov.in/isciichart.pdf (various INSCRIPT keyboard overlays)
////ascii-table.com/keyboard.php/473 (Telegu keyboard layout)
////h3g3m0n.wordpress.com/2007/08/16/stop-javascript-disabling-location-bar-in-firefox/ (how to disable location bar in firefox)
////stackoverflow.com/questions/480360/problem-getting-selected-text-in-ie-using-selection-createrange
////sanskrit.jnu.ac.in/amara/viewdata.jsp (decent devanagari display)
////tomcat.apache.org/tomcat-5.5-doc/config/http.html (Tomcat cookie path of session cookie)
/* ********************************************************************
 *?? Why use false for non-boolean variables, e.g. VKI_deadKey. Why not use null instead?
 *?? It appears that dead keys are independant of the virtual keyboard, e.g. ^ does the same thing no matter which virtual keyboard is current.
 **********************************************************************
 * HTML Virtual Keyboard Interface Script - v1.27
 * Copyright (c) 2009 - GreyWyvern
 *
 * - Licenced for free distribution under the BSDL
 * //www.opensource.org/licenses/bsd-license.php
 *
 * Add a script-driven keyboard interface to text fields, password
 * fields and textareas.
 *
 * See //www.greywyvern.com/code/javascript/keyboard for examples
 * and usage instructions.
 *
 * Version 1.27 - June 11, 2009
 * - Danish keyboard layout added
 *
 * See full changelog at:
 * //www.greywyvern.com/code/javascript/keyboard.changelog.txt
 */
 
/*************** Global variables **********************/
var VKI_keymap = null; // this must be initialized by web page
var VKI_currentCaretPosition = 0;
var VKI_showVersion = true;
var VKI_version = "1.27"; // will be displayed in lower right corner of virtual keyboard if VKI_showVersion is true
var VKI_target = null; // is text box or textarea that is associated with the virtual keyboard
var VKI_visible = false; // set to true when user clicks virtual keyboard icon (see VKI_imageURI below)
var VKI_shift = false; // set to true if a Shift key is typed (and then set back to false after next character is typed)
var VKI_capslock = false; // toggled when Caps Lock ("Caps") key is toggled
var VKI_alternate = false; // set to true if an Alt key is typed (and then set back to false after next character is typed)
var VKI_dead = null; // set to a typed dead key
var VKI_deadkeysOn = false; // this is the initial value of the dead keys checkbox in upper left corner of virtual keyboard.
var VKI_deadkeysElem = null; // will point to dead keys checkbox
var VKI_keyboard = null; // the virtual keyboard, initialized for each type of keyboard.
var VKI_keymapTable = null; // used for the sanskrit grid.
var VKI_topbar = null; // used for the sanskrit grid.
var VKI_closer = null; // used for the sanskrit grid.
var VKI_kt = "devInscript"; // Default keyboard layout
var VKI_clearPasswords = false; // Clear password fields on focus
//var VKI_imageURI = "//www.language.brown.edu/Sanskrit/software/keyboard/keyboard.png";
//var VKI_imageURI = "//sanskrit1.ccv.brown.edu/tomcat/sl/keyboard.png"; // Aug 19, 2012 from Ralph Bunker
var VKI_imageURI = "keyboard.png"; // This is a copy of the above on the Cologne system.
var VKI_clickless = false; // if set to true then if mouse if over key for VKI_clicklessDelay milliseconds, key will fire
var VKI_clicklessDelay = 500; // see comment on VKI_clickless above
var VKI_keyCenter = 3; // the keys of any row with <= VKI_keyCenter keys will be centered. Used for last row which contains space bar and Alt key
var VKI_passThrough = false; // if true then do not process phonetic keystrokes.
var VKI_viewAs = null; // how the user wants to view the phonetic input
var VKI_state = {}; // hash table containing cookie state
var VKI_isIE = /*@cc_on!@*/false;
var VKI_isIE6 = /*@if(@_jscript_version == 5.6)!@end@*/false;
var VKI_isIElt8 = /*@if(@_jscript_version < 5.8)!@end@*/false;
var VKI_isMoz = (navigator.product == "Gecko");
var VKI_isWebKit = RegExp("KHTML").test(navigator.userAgent); // Safari uses WebKit Open Source project //webkit.org/
/* ***** Create keyboards ************************************** */
var VKI_layout = {}; // an associative array containing keyboard layouts
var VKI_layoutParameters = {}; // an associative array containing parameters for a layout. The current parameters are
 // DDK - (if true, no dead key checkbox will be displayed)
 // phonetic - (if true then context analysis (see phf) will be done before inserting a character
 // phf - a function that analyzes the context before inserting the character
var VKI_type = {} // either initial default type or last type used for control (obj->VKI_kt) 
var VKI_caret = {} // keep track of the cursor location for each control

var VKI_qwerty = {
// top row (row 1)
 '~': [0, 0, 1],
 '`': [0, 0, 0],
 
 '!': [0, 1, 1],
 '1': [0, 1, 0],
 
 '@': [0, 2, 1],
 '2': [0, 2, 0],
 
 '#': [0, 3, 1],
 '3': [0, 3, 0],
 
 '$': [0, 4, 1],
 '4': [0, 4, 0],

 '%': [0, 5, 1],
 '5': [0, 5, 0],

 '^': [0, 6, 1],
 '6': [0, 6, 0],

 '&': [0, 7, 1],
 '7': [0, 7, 0],

 '*': [0, 8, 1],
 '8': [0, 8, 0],

 '(': [0, 9, 1],
 '9': [0, 9, 0],

 ')': [0, 10, 1],
 '0': [0, 10, 0],

 '_': [0, 11, 1],
 '-': [0, 11, 0],

 '+': [0, 12, 1],
 '=': [0, 12, 0],

// row 2
 'Tab+': [1, 0, 1],
 'Tab-': [1, 0, 0],

 'Q': [1, 1, 1],
 'q': [1, 1, 0],

 'W': [1, 2, 1],
 'w': [1, 2, 0],

 'E': [1, 3, 1],
 'e': [1, 3, 0],

 'R': [1, 4, 1],
 'r': [1, 4, 0],

 'T': [1, 5, 1],
 't': [1, 5, 0],

 'Y': [1, 6, 1],
 'y': [1, 6, 0],

 'U': [1, 7, 1],
 'u': [1, 7, 0],

 'I': [1, 8, 1],
 'i': [1, 8, 0],

 'O': [1, 9, 1],
 'o': [1, 9, 0],

 'P': [1, 10, 1],
 'p': [1, 10, 0],

 '{': [1, 11, 1],
 '[': [1, 11, 0],

 '}': [1, 12, 1],
 ']': [1, 12, 0],

 '|': [1, 13, 1],
 '\\': [1, 13, 0],

// row 3
 'Caps+': [2, 0, 1],
 'Caps-': [2, 0, 0],
 
 'A': [2, 1, 1],
 'a': [2, 1, 0],

 'S': [2, 2, 1],
 's': [2, 2, 0],

 'D': [2, 3, 1],
 'd': [2, 3, 0],

 'F': [2, 4, 1],
 'f': [2, 4, 0],

 'G': [2, 5, 1],
 'g': [2, 5, 0],

 'H': [2, 6, 1],
 'h': [2, 6, 0],

 'J': [2, 7, 1],
 'j': [2, 7, 0],

 'K': [2, 8, 1],
 'k': [2, 8, 0],

 'L': [2, 9, 1],
 'l': [2, 9, 0],

 ':': [2, 10, 1],
 ';': [2, 10, 0],

 '"': [2, 11, 1],
 '\'': [2, 11, 0],

// row 4
 'Shift+': [3, 0, 1],
 'Shift-': [3, 0, 0],

 'Z': [3, 1, 1],
 'z': [3, 1, 0],

 'X': [3, 2, 1],
 'x': [3, 2, 0],

 'C': [3, 3, 1],
 'c': [3, 3, 0],

 'V': [3, 4, 1],
 'v': [3, 4, 0],

 'B': [3, 5, 1],
 'b': [3, 5, 0],

 'N': [3, 6, 1],
 'n': [3, 6, 0],

 'M': [3, 7, 1],
 'm': [3, 7, 0],

 '<': [3, 8, 1],
 ',': [3, 8, 0],

 '>': [3, 9, 1],
 '.': [3, 9, 0],

 '?': [3, 10, 1],
 '/': [3, 10, 0],

 // row 5
 ' ': [4, 0, 0]
}

VKI_layout["trnRoman"] = [ // US Standard Keyboard with some additional diacritics for transliteration
// top row (row 1)
 [["`", "\u015B"], // palatal diacritical mark (upper case)
 ["1", "\u0304"], // macron diacritical mark (upper case)
 ["2", "\u0307"], // anusvara (top dot) (upper case)
 ["3", "\u0323"], // retroflex dot (bottom dot) (upper case)
 ["4", "$"], 
 ["5", "%"], 
 ["6", "^"], 
 ["7", "&"], 
 ["8", "*"], 
 ["9", "("], 
 ["0", ")"], 
 ["-", "_"], 
 ["=", "+"], 
 ["Bksp", "Bksp"]],
// row 2 
 [["Tab", "Tab"], 
 ["q", "Q"], 
 ["w", "W"], 
 ["e", "E"], 
 ["r", "R", "\u1E5B", "\u1E5D"], // vocalic r, long vocalic r
 ["t", "T", "\u1E6D"], // retroflex t
 ["y", "Y"], 
 ["u", "U", "\u016B"], // long u
 ["i", "I", "\u012B"], // long i
 ["o", "O"], 
 ["p", "P"], 
 ["[", "{"], 
 ["]", "}"], 
 ["\\", "|"]],
// row 3 
 [
 ["Caps", "Caps"], 
 ["a", "A", "\u0101"], // long i
 ["s", "S", "\u015B", "\u1E63"], // palatal s, retroflex s
 ["d", "D", "\u1E0D"], // retroflex d 
 ["f", "F"], 
 ["g", "G"], 
 ["h", "H", "\u1E25"], // visarga
 ["j", "J", "\u00F1"], // palatal n 
 ["k", "K"], 
 ["l", "L", "\u1E37", "\u1E39"], // retroflex l, long retroflx l
 [";", ":"], 
 ["'", '"'], 
 ["Enter", "Enter"]],
// row 4
 [
 ["Shift", "Shift"], 
 ["z", "Z"], 
 ["x", "X"], 
 ["c", "C"], 
 ["v", "V"], 
 ["b", "B"], 
 ["n", "N", "\u1E47", "\u1E45"], // retroflex n, velar n
 ["m", "M", "\u1E41"], // anusvara 
 [",", "<"], 
 [".", ">"], 
 ["/", "?"], 
 ["Shift", "Shift"]],
 // row 5
 [
 [" ", " "], 
 ["Alt", "Alt"]
 ]
 ];


VKI_layout["devInscript"] = [ // Devanagari
 // row 1
 [["`", "~"], 
 ["\u0967", "\u090D"], // 1
 ["\u0968", "\u0945"], // 2
 ["\u0969"], // 3
 ["\u096A"], // 4
 ["\u096B", "\u091C\u094D\u091E"], // 5 j palatal n a
 ["\u096C", "\u0924\u094D\u0930"], // 6 tra
 ["\u096D", "\u0915\u094D\u0937"], // 7 k retroflex s a
 ["\u096E", "\u0936\u094D\u0930"], // 8 palatal s ra
 ["\u096F"], // 9
 ["\u0966"], // 0
 ["-", "\u093C"], // -, dot below 
 ["\u0943", "\u090B"], // attached vocalic r, unattached vocalic r
 ["Bksp", "Bksp"]
 ],
 // row 2
 [["Tab", "Tab"], 
 ["\u094C", "\u0914"], // attached au, unattached au
 ["\u0948", "\u090E"], // attached ai, unattached ai
 ["\u093E", "\u0906"], // attached long a, unattached long a
 ["\u0940", "\u0908"], // attached long i, unattached long i
 ["\u0942", "\u090A"], // attached long u, unattached long u
 ["\u092C", "\u092D"], // ba, bha
 ["\u0939", "\u0919"], // ha, velar na
 ["\u0917", "\u0918"], // ga, gha
 ["\u0926", "\u0927"], // da, dha
 ["\u091C", "\u091D"], // ja, jha
 ["\u0921", "\u0922"], // retroflex da, retroflex dha
 ["\u0902", "\u091E"], // anusvara, palatal na
 ["\u0949", "\u0911"] // attached long a with a diacritic mark, unattached version of previous
 ],
 // row 3
 [
 ["Caps", "Caps"], 
 ["\u094B", "\u0913"], // attached o, unattached o
 ["\u0947", "\u090F"], // attached e, unattached e 
 ["\u094D", "\u0905"], // virama, short a
 ["\u093F", "\u0907"], // attached short i, unattached short i 
 ["\u0941", "\u0909"], // attached short u, unattached short u
 ["\u092A", "\u092B"], // pa, pha
 ["\u0930", "\u0931"], // ra, ra with dot
 ["\u0915", "\u0916"], // ka, kha
 ["\u0924", "\u0925"], // ta, tha
 ["\u091A", "\u091B"], // ca, cha
 ["\u091F", "\u0920"], // retroflex ta, retroflex tha
 ["Enter", "Enter"]
 ],
 // row 4
 [
 ["Shift", "Shift"], 
 ["\u00A0", "\u00A0"], // not used
 ["\u0902", "\u0901"], // anusvara, anunasika
 ["\u092E", "\u0923"], // ma, retroflex na
 ["\u0928", "\u00A0"], // na, line below?
 ["\u0935", "\u00A0"], // va
 ["\u0932", "\u0933"], // la, lla
 ["\u0938", "\u0936"], // sa, palatal sa
 [",", "\u0937"], // comma, retroflex sa
 [".", "\u0964"], // dot, danda 
 ["\u092F", "\u00A0"], // ya
 ["Shift", "Shift"]
 ],
 // row 5
 [
 [" ", " "], 
 ["Alt", "Alt"]
 ]
 ];
VKI_layoutParameters.devInscript = {DDK : true}; // disable dead keys
 
VKI_layout["devQWERTY"] = [ // Devanagari
 // row 1 (numeral row)
 [["\u0946", "\u090E", "`", "~"], // attached short e, unattached ai
 ["\u0967", "!", "1", "\u2026"], // 1 ellipsis
 ["\u0968", "@", "2", "\u00A9"], // 2 copyright
 ["\u0969", "#", "3", "\u00AE"], // 3 registered
 ["\u096A", "$", "4", "\u2122"], // 4 trademark
 ["\u096B", "%", "5", "\u2019"], // 5 smart right quote
 ["\u096C", "^", "6", "\u2018"], // 6 smart left quote
 ["\u096D", "&", "7", "\u2013"], // 7 short dash
 ["\u096E", "*", "8", "\u25CF"], // 8
 ["\u096F", "(", "9", "\u2014"], // 9 long dash
 ["\u0966", ")", "0", "\u00D7"], // 0 funny looking x
 ["-", "_", "_", "-"], 
 ["=", "+", "=", "+"], 
 ["Bksp", "Bksp"]
 ],
 // row 2 (q row)
 [["Tab", "Tab"], 
 ["\u0945", "\u0949", "\u090E", "\u0972"], // [q] attached candra e, attached chandra o
 ["\u0905", "\u0906" ,"\u00A0", "\u00A0"], // [w] a, long a
 ["\u0947", "\u0948" ,"\u090F", "\u0910"], // [e] attached [e, ai], unattached [e, ai]
 ["\u0930", "\u0943" ,"\u090B", "\u0931"], // [r] r, attached vocalic r, vocalic r, r with dot below
 ["\u0924", "\u0925" ,"\u091F", "\u0920"], // [t] t, th, retroflex t, retroflex th
 ["\u092f", "\u095F" ,"\u095F", "\u00A0"], // [y] y, y with a dot below, y with a dot below, ?
 ["\u0941", "\u0942" ,"\u0909", "\u090A"], // [u] attached u, attached long u, u, long u
 ["\u093F", "\u0940" ,"\u0907", "\u0908"], // [i] attached i, attached long i, i, long i
 ["\u094b", "\u094C" ,"\u0913", "\u0914"], // [o] attached o, attached au, o, au
 ["\u092A", "\u092B" ,"\u00A0", "\u00A0"], // [p] p, ph, ?, ?
 ["\u0970\u0930", "[" ,"[", "{"], // [[]
 ["\u0970", "]" ,"]", "}"], // []]
 ["\u094A", "\u0912" ,"\\", "|"] // [\] ?. o
 ],
 // row 3 (a row)
 [
 ["Caps", "Caps"], 
 ["\u093E", "\u093E", "\u0905", "\u0906"], // [a] attached long a, attached long a, a, long a
 ["\u0938", "\u0936", "\u0936\u094D\u0930", "\u0937"], // [s] s, palatal s, palatal s+r, ?
 ["\u0926", "\u0927", "\u0921", "\u0922"], // [d] d dh, retroflex d, retroflex dh
 ["\u094D", "\u093C", "\u00A0", "\u00A0"], // [f] virama, bottom dot, j+palatal n, ?
 ["\u0917", "\u0918", "\u00A0", "\u00A0"], // [g] g, gh, ?, ?
 ["\u0939", "\u0903", "\u00A0", "\u00A0"], // [h] h, visarga, ?, ?
 ["\u091C", "\u091D", "\u091C\u094D\u091E", "\u00A0"], // [j] j, jh, ?, ?
 ["\u0915", "\u0916", "\u00A0", "\u00A0"], // [k] k, kh, ?, ?
 ["\u0932", "\u0933", "\u0934", "\u00A0"], // [l] l, retroflex l, ?, infinity l with dot below
 [";", ":", ";", ":"], 
 ["'", '"', "\u093D", '"'], // ', ", avagraha, "
 ["Enter", "Enter"]
 ],
 // row 4 (z row)
 [
 ["Shift", "Shift"], 
 ["\u0919", "\u0901", "\u00A0", "\u0912"], // [z] velar n, candrabindu, ? ?
 ["\u0937", "\u0915\u094D\u0937", "\u00A0", "\u00A0"], // [x] retroflex s, k+retroflex s, ?, ?
 ["\u091A", "\u091B", "\u00A0", "\u00A0"], // [c] c, ch, ?, ?
 ["\u0935", "\u00A0", "\u00A0", "\u00A0"], // [v] v, ?, ?, ?
 ["\u092C", "\u092D", "\u00A0", "\u00A0"], // [b] b, bh, ?, ?
 ["\u0928", "\u0923", "\u091E", "\u0929"], // [n] n retroflex n, palatal n, n with a dot below
 ["\u092E", "\u0902", "\u0901", "\u00A0"], // [m] m, anusvara, candrabindu
 [",", "<", "\u00A0", "\u00A0"], // [,] ",", <, ?, ?
 ["\u0964", ">", ".", "\u0965"], // [.] danda, >, ?, double danda
 ["/", "\u00A0", "\u00A0", "\u00A0"], // [/]
 ["Shift", "Shift"]
 ],
 // row 5
 [
 [" ", " "], 
 ["Alt", "Alt"]
 ]
 ];
VKI_layoutParameters.devQWERTY = {DDK : false, phonetic : false};

// Telugu Inscript
VKI_layout["telInscript"] = [ // Telugu
 // row 1
 [["\u0C4A", "\u0C12"], // attached O, unattached O 
 ["\u0C67"], // 1
 ["\u0C68"], // 2
 ["\u0C69", "\u0C30\u0C4D"], // 3, [ra virama]
 ["\u0C6A"], // 4
 ["\u0C6B", "\u0C4D\u0C1C"], // 5, [virama ja]
 ["\u0C6C", "\u0C4D\u0C24"], // 6, [virama ta]
 ["\u0C6D", "\u0C4D\u0C15"], // 7, [virama ka]
 ["\u0C6E", "\u0C4D\u0C36"], // 8, [virama sha]
 ["\u0C6F", "("], // 9, (
 ["\u0C66", ")"], // 0, )
 ["-", "\u0C03"], // -, visarga
 ["\u0C43", "\u0C0B"], // attached vocalic r, unattached vocalic r
 ["Bksp", "Bksp"]
 ],
 // row 2
 [["Tab", "Tab"], 
 ["\u0C4C", "\u0C14"], // [q] attached au, unattached au 
 ["\u0C48", "\u0C10"], // [w] attached ai, unattached ai
 ["\u0C3E", "\u0C06"], // [e] attached aa, unattached aa
 ["\u0C40", "\u0C08"], // [r] attached ii, unattached ii
 ["\u0C42", "\u0C0A"], // [t] attached uu, unattached uu
 ["\u0C2C", "\u0C2D"], // [y] ba, bha
 ["\u0C39", "\u0C19"], // [u] ha, nga
 ["\u0C17", "\u0C18"], // [i] ga, gha
 ["\u0C26", "\u0C27"], // [o] da, dha
 ["\u0C1C", "\u0C1D"], // [p] ja, jha
 ["\u0C21", "\u0C22"], // [[] dda, ddha 
 ["\u00A0", "\u0C1E"], // ]
 ["|", "\\"] // |, \
 ],
 // row 3
 [
 ["Caps", "Caps"], 
 ["\u0C4B", "\u0C13"], // [a] attached oo, unattached oo
 ["\u0C47", "\u0C0F"], // [s] attached ee, unattached ee
 ["\u0C4D", "\u0C05"], // [d] virama, unattached a 
 ["\u0C3F", "\u0C07"], // [f] attached i, unattached i
 ["\u0C41", "\u0C09"], // [g] attached u, unattached u
 ["\u0C2A", "\u0C2B"], // [h] p, ph
 ["\u0C30", "\u0C31"], // [j] ra, rra
 ["\u0C15", "\u0C16"], // [k] ka, kha
 ["\u0C24", "\u0C25"], // [l] ta, tha
 ["\u0C1A", "\u0C1B"], // [;] ca, cha
 ["\u0C1F", "\u0C20"], // ['] tta, ttha
 ["Enter", "Enter"]
 ],
 // row 4
 [
 ["Shift", "Shift"], 
 ["\u0C46", "\u0C0E"], // [z] attached e, unattached e 
 ["\u0C02", "\u0C01"], // [x] anusvara, candrabindu
 ["\u0C2E", "\u0C23"], // [c] ma, nna
 ["\u0C28", "\u00A0"], // [v] na
 ["\u0C35", "\u00A0"], // [b] va
 ["\u0C32", "\u0C33"], // [n] la, lla
 ["\u0C38", "\u0C36"], // [m] sa, sha
 [",", "\u0C37"], // [,] ",", ssa
 [".", "\u0964"], // [.] ".", devanagari danda
 ["\u0C2F", "\u00A0"], // [/] ya
 ["Shift", "Shift"]
 ],
 // row 5
 [
 [" ", " "], 
 ["Alt", "Alt"]
 ]
 ];
VKI_layoutParameters.telInscript = {DDK : true}; // disable dead keys

var VKI_deadkey = {}; // no dead keys for now
 
//scriptLoader();
//************************ functions **********************************

if(typeof($) == 'undefined') 
{
 $ = function(id)
 {
 return document.getElementById(id);
 }
}
// this function is called on load and does the following:
// a. attaches the keyboard icon to each element whose class name contains "keyboardInput"
// b. builds the keyboard interface except for the actual keys
function VKI_buildKeyboardInputs(kt) 
{
 VKI_close();
 VKI_initializeViewState();        //REB20101126
 VKI_kt = kt;
 // make sure that each layout in VKI_layout has an object defined in VKI_layoutParameters
 for (var layoutName in window.VKI_layout)
 {
 if (!VKI_layoutParameters[layoutName])
 VKI_layoutParameters[layoutName] = {}; // all parameters will be default parameters
 }

 /* ***** Find tagged input & textarea elements ***************** */
 var inputElems = 
 [
 document.getElementsByTagName('input'),
 document.getElementsByTagName('textarea')
 ];
 
 // attach a keyboard to each element whose className contains the string "keyboardInput" 
 for (var x = 0, elem; elem = inputElems[x++];)
 {
 for (var y = 0, ex; ex = elem[y++];)
 {
 if ((ex.nodeName == "TEXTAREA" || ex.type == "text" || ex.type == "password") && ex.className.indexOf("keyboardInput") > -1)
 {
 VKI_type[ex.id] = kt; // this will be keyboard that onkeypress will use.
 VKI_attachKeyboard(ex);
 }
 }
 }

 /* ***** Build the keyboard interface (except for the keys) ************************** */
 if (VKI_layout[VKI_kt])
 VKI_buildVirtualKeyboard(kt); 
 else
 VKI_buildKeymapTable(kt);
} // end of function VKI_buildKeyboardInputs


function VKI_buildKeymapTable(kt)
{
 if (VKI_keymapTable == null) // load first time, since next time will come from another window.
 VKI_keymapTable = document.getElementById("alphabet");
 VKI_keyboard = VKI_keymapTable;
 
 VKI_keyboard.style.backgroundColor = "white";
 
 if (VKI_topbar == null)
 VKI_topbar = $("topbar"); 
 var topbar = VKI_topbar;
 topbar.onmousedown = function (event) {drag(VKI_keyboard, event);}
 
 if (VKI_closer == null)
 VKI_closer = $("#closeWindow"); 
 var closer = VKI_closer[0];
 closer.onclick = function() { VKI_close(); };
 closer.title = "Close this window";
 closer.onmouseover = function() { this.style.backgroundColor = "gray"; };
 closer.onmouseup = function() { this.style.backgroundColor = "white"; };

 var tds = VKI_keyboard.getElementsByTagName("td");
 var cell = VKI_keymap.getLayout();
 for (var i=0; i<tds.length; i++)
 {
 var km = VKI_keymap.lookupKeystroke(cell[i], false)
 if (km == null)
 {
 alert(cell[i] + " not found in VKI_buildKeymapTable.");
 continue;
 }
 
 var td = tds[i]; // get next cell
 $(td).unbind("click");
 $(td).bind("click", function(evt) {return VKI_devAnalysis(evt)}); // use jQuery to get a browser independant event
 // add event handler to handle request of user to type a character
 //td.onclick = VKI_dispatchKey();
 
 // add event handler that is called when user moves mouse over key. Will change background color.
 td.onmouseover = function() 
 {
 this.style.backgroundColor = "yellow";
 };
 
 // add event handler that is called when user moves mouse off of key. Will change background color back.
 td.onmouseout = function() 
 {
 this.style.backgroundColor = "white";
 };

 td.$keystroke = cell[i]; // smuggle in keystroke

 // clear previous entries
 while (td.firstChild)
 {
 td.removeChild(td.firstChild);
 }
 
 // add devanagari unicode codepoint
 var span = document.createElement("span");
 td.appendChild(span);
 span.className = "fonted";
 var text = document.createTextNode(km.unicode + "\u00A0");
 span.appendChild(text);
 
 // add roman unicode codepoint
 span = document.createElement("span");
 td.appendChild(span);
 span.className = "fonted";
 text = document.createTextNode(km.encodingRoman);
 span.appendChild(text);
 
 // put keystroke on next line 
 var br = document.createElement("br");
 td.appendChild(br);
 
 // what user has to type to get associated devanagari/roman character
 span = document.createElement("span");
 td.appendChild(span);
 span.className = "fonted";
 text = document.createTextNode(cell[i]);
 span.appendChild(text);
 }
}


function VKI_buildVirtualKeyboard(kt)
{
 VKI_keyboard = document.createElement('table');
 VKI_keyboard.id = "keyboardInputMaster";
 VKI_keyboard.dir = "ltr";
 VKI_keyboard.cellSpacing = window.VKI_keyboard.border = "0";

 // the header of table will have list of virtual keyboards, the dead keys checkbox, the clear and close buttons 
 var thead = document.createElement('thead');
 VKI_keyboard.appendChild(thead);
 
 var tr = document.createElement('tr');
 thead.appendChild(tr);
 
 var th = document.createElement('th');
 tr.appendChild(th); 

 var kbtype = document.createTextNode("drag bar");
 th.style.backgroundColor = "red";
 th.style.textAlign = "center";
 th.appendChild(kbtype);
 th.onmousedown = function(event){drag(VKI_keyboard, event)}
 th.colSpan = "2";
 
 var td = document.createElement('td'); // this will follow the th in the header row
 tr.appendChild(td);
 
 // create the "clear" button
 var clearer = document.createElement('span');
 td.appendChild(clearer);

 clearer.id = "keyboardInputClear";
 clearer.appendChild(document.createTextNode("Clear"));
 clearer.title = "Clear this input";
 clearer.onmousedown = function() { this.className = "pressed"; };
 clearer.onmouseup = function() { this.className = ""; };
 clearer.onclick = function() 
 {
 VKI_target.value = "";
 VKI_target.focus();
 return false;
 };

 td.appendChild(createXButton(td));

 // this the rest of the virtual keyboard which will be filled in later with actual keys
 var tbody = document.createElement('tbody');
 VKI_keyboard.appendChild(tbody);

 tr = document.createElement('tr');
 tbody.appendChild(tr);

 td = document.createElement('td');
 tr.appendChild(td);

 td.colSpan = "2";
 var div = document.createElement('div');
 td.appendChild(div);

 div.id = "keyboardInputLayout";
 if (window.VKI_showVersion) 
 {
 div = document.createElement('div');
 td.appendChild(div);

 var ver = document.createElement('var');
 div.appendChild(ver);

 ver.appendChild(document.createTextNode("v" + window.VKI_version));
 }
 
 VKI_buildKeys(kt); // fill in virtual keyboard with default layout (VKI_kt)
 VKI_disableSelection(VKI_keyboard); // force user to activate it.
}

function createXButton()
{
 var closer = document.createElement('span');
 
 closer.id = "keyboardInputClose";
 closer.appendChild(document.createTextNode('X'));
 closer.title = "Close this window";
 closer.onmousedown = function() { this.className = "pressed"; };
 closer.onmouseup = function() { this.className = ""; };
 closer.onclick = function() { VKI_close(); };
 
 return closer;
}

// attach the keyboard to object elem
function VKI_attachKeyboard(elem) 
{
 //if (elem.VKI_attached) 
 // return false;

 var keybut = document.createElement('img');
 keybut.src = this.VKI_imageURI;
 keybut.alt = "Keyboard interface";
 keybut.className = "keyboardInputInitiator";
 keybut.title = "Display graphical keyboard interface";
 keybut.elem = elem;
 keybut.onclick = function() { self.VKI_show(this.elem); }; 
 
 if (elem.VKI_attached)
 {
 for (var i=0; i<elem.parentNode.childNodes.length; i++)
 {
 if (elem.parentNode.childNodes[i] == elem)
 {
 elem.parentNode.removeChild(elem.parentNode.childNodes[i+1]);
 break;
 }
 }
 }
 elem.parentNode.insertBefore(keybut, (elem.dir == "rtl") ? elem : elem.nextSibling);
 elem.VKI_attached = true;
 
 // This is a phonetic keyboard, so add keypress handler to element that is getting the keyboard.
 //if (VKI_layoutParameters[VKI_kt].phf)
 if (VKI_layout[VKI_kt] == null)
 {
 $(elem).unbind('keypress');
 $(elem).bind('keypress', function(evt) {return VKI_devAnalysis(evt)});
 }
 else
 elem.onkeypress = VKI_lookupKey(elem);
 
 elem.onfocus = VKI_setCurrentTarget;
 elem.onmouseup = VKI_saveRange;
 elem.onkeyup = VKI_saveRange;
 
 if (this.VKI_isIE) 
 {
 // guarantee that the range property of the textarea or textbox will reflect the current selection
 // if did document.selection.createRange() in VKI_insert instead, the selection would probably be the td that was clicked!
 elem.onclick = elem.onselect = elem.onkeyup = function(e) 
 {
 if ((e || event).type != "keyup" || !this.readOnly)
 this.range = document.selection.createRange();
 };
 }
}

// this function is called when either user clicks mouse in target or moves cursor with arrow keys
function VKI_saveRange(obj)
{
 if (obj == null)
 obj = this;
 if (document.selection != null)
 obj.range = document.selection.createRange().duplicate();
}

// obj is either a text box (input type='text') or a textarea
function VKI_getCaretPosition(obj)
{
 var caretPosition = 0;
 if (obj.setSelectionRange != null) // Mozilla, Opera and Konqueror
 {
 if (obj.readOnly && VKI_isWebKit) // it is so easy if it is not IE!!
 caretPosition = obj.selStart || 0;
 else 
 caretPosition = obj.selectionStart;
 } 
 else
 {
 if (obj.range != null) // see VKI_saveRange()
 {
 var range = null;
 if (obj.nodeName.toLowerCase() != "textarea")
 {
 range = obj.range.duplicate();
 caretPosition = -1;
 while (true)
 {
 caretPosition++;
 if (range.moveStart("character", -1) == 0)
 break; 
 }
 }
 else // textarea
 {
 range = obj.range;
 var rangeCopy = range.duplicate();
 rangeCopy.moveToElementText(obj);
 if (rangeCopy.text.length != 0)
 {
 caretPosition = -1;
 while(rangeCopy.inRange(range))
 { // fix most of the ie bugs with linefeeds...
 if (rangeCopy.text.charAt(0) == String.fromCharCode(13))
 caretPosition++;
 rangeCopy.moveStart('character'); // this will move past both 13 and 10 so that is why we need to increment caretPosition twice.
 caretPosition++;
 }
 }
 else
 caretPosition = 0;
 } 
 }
 }
 return caretPosition;
}


function VKI_setCurrentTarget()
{
 VKI_target = this;
}

function VKI_lookupKey(elem)
{
 if (document.selection) // if IE
 return function () {return VKI_lookupKeyHandler(event, elem)}; 
 else
 return function (evt) {return VKI_lookupKeyHandler(evt, elem)};
}


// define event handler for virtual keyboards that need no character analysis
function characterHandler() 
{ 
 if (window.VKI_deadkeysOn && window.VKI_dead) // if a dead key has previously been typed
 {
 if (window.VKI_dead != this.firstChild.nodeValue) // and this is not the key that represents the dead key
 {
 for (key in window.VKI_deadkey) // search the deadkey hash table for the previously entered dead key
 {
 if (key == window.VKI_dead) // if this is it
 {
 // since this function is called by an onclick attribute and was dynamically assigned, "this" points to td object that was clicked
 if (this.firstChild.nodeValue != " ") // this is key that was clicked after the dead key was clicked
 {
 for (var z = 0, rezzed = false, dk; dk = window.VKI_deadkey[key][z++];) 
 {
 if (dk[0] == this.firstChild.nodeValue) // if typed key found in list attached to dead key
 {
 window.VKI_insert(dk[1]); // insert the dead key modification (instead of the key that was typed)
 rezzed = true;
 break;
 }
 }
 } 
 else // if typed key is blank, just display the dead key
 {
 window.VKI_insert(VKI_dead);
 rezzed = true;
 } 
 break;
 }
 } // end of search the deadkey hash table for the previously entered dead key
 } // end if current key is not the previously typed dead key
 else 
 rezzed = true; // no dead key processing needed
 } // if a dead key has previously been typed
 
 VKI_dead = null; // force user to type a dead key again
 
 // If no insertion done above (rezzed=false) and the clicked key is not blank
 // If key is a dead key, set VKI_dead to it. Otherwise display key
 if (!rezzed && this.firstChild.nodeValue != "\xa0") 
 {
 if (VKI_deadkeysOn) 
 {
 for (key in VKI_deadkey) 
 {
 if (key == this.firstChild.nodeValue) 
 {
 VKI_dead = key;
 obj.className += " dead";
 if (VKI_shift) 
 VKI_modify("Shift");
 if (VKI_alternate) 
 VKI_modify("AltGr");
 break;
 }
 }
 if (!VKI_dead) 
 VKI_insert(this.firstChild.nodeValue);
 } // if dead keys on 
 else 
 VKI_insert(this.firstChild.nodeValue); // insert key without modification
 }

 VKI_modify("");
 return false; // to be sure that click is not further acted upon.
}


/* ****************************************************************
* Controls modifier keys
*/
function VKI_modify(type) 
{
 if (VKI_kt == null)
 return; // phonetic does not have a virtual keyboard
 // toggle the control key
 switch (type) 
 {
 case "Alt":
 case "AltGr": VKI_alternate = !VKI_alternate; break;
 case "Caps": VKI_capslock = !VKI_capslock; break;
 case "Shift": VKI_shift = !VKI_shift; break;
 } 
 
 var vchar = 0;
 if (!VKI_shift != !VKI_capslock) // if both shift and capslock key are not on
 vchar += 1; // use uppercase version of key

 var tables = VKI_keyboard.getElementsByTagName('table');
 for (var x = 0; x < tables.length; x++) 
 {
 var tds = tables[x].getElementsByTagName('td');
 for (var y = 0; y < tds.length; y++) 
 {
 var className = [];
 var lkey = VKI_layout[VKI_kt][x][y]; // get array [x, X, alt x, alt X]

 if (tds[y].className.indexOf('hover') > -1) 
 className.push("hover");

 // decide how to modify appearance of keys
 switch (lkey[1]) 
 {
 case "Alt":
 case "AltGr":
 if (VKI_alternate) 
 className.push("dead");
 break;
 
 case "Shift":
 if (VKI_shift) 
 className.push("dead");
 break;
 
 case "Caps":
 if (VKI_capslock) 
 className.push("dead");
 break;
 
 case "Tab": 
 case "Enter": 
 case "Bksp": 
 break;
 
 default:
 if (type) 
 tds[y].firstChild.nodeValue = lkey[vchar + ((VKI_alternate && lkey.length == 4) ? 2 : 0)];
 
 if (VKI_deadkeysOn) 
 {
 var chr = tds[y].firstChild.nodeValue;
 if (VKI_dead) 
 {
 if (chr == VKI_dead) 
 className.push("dead");
 
 for (var z = 0; z < VKI_deadkey[VKI_dead].length; z++) 
 {
 if (chr == VKI_deadkey[VKI_dead][z][0]) 
 {
 className.push("target");
 break;
 }
 }
 }
 
 for (key in VKI_deadkey)
 {
 if (key === chr) 
 { 
 className.push("alive"); 
 break; 
 }
 }
 } // 
 } // end switch statement

 if (y == tds.length - 1 && tds.length > VKI_keyCenter) 
 className.push("last");
 if (lkey[0] == " ") 
 className.push("space");
 tds[y].className = className.join(" ");
 } // end for each key in row
 } // end for each row
}


/* ****************************************************************
* Insert text at the caret
*/
function VKI_insert(text) 
{
 VKI_target.focus();
 var rng = null;
 if (typeof VKI_target.maxlength == "undefined" || VKI_target.maxlength < 0 || VKI_target.value.length < VKI_target.maxlength) 
 { // current length of field is less than maxlength
 if (VKI_target.setSelectionRange) // Mozilla, Opera and Konqueror
 {
 if (VKI_target.readOnly && VKI_isWebKit) 
 rng = [VKI_target.selStart || 0, VKI_target.selEnd || 0];
 else 
 rng = [VKI_target.selectionStart, VKI_target.selectionEnd];
 
 VKI_target.value = VKI_target.value.substr(0, rng[0]) + text + VKI_target.value.substr(rng[1]);
 if (text == "\n" && window.opera)
 rng[0]++;
 VKI_target.setSelectionRange(rng[0] + text.length, rng[0] + text.length); // collapse selection to caret
 if (VKI_target.readOnly && VKI_isWebKit) 
 {
 var range = window.getSelection().getRangeAt(0);
 VKI_target.selStart = range.startOffset;
 VKI_target.selEnd = range.endOffset;
 }
 } // end if Mozilla 
 else if (VKI_target.createTextRange != null) // IE
 {
 VKI_target.range.text = text;
 VKI_target.range.collapse(true);
 VKI_target.range.select();
 } // end if IE 
 else // don't try to insert, just append 
 VKI_target.value += text;
 
 if (VKI_shift) 
 VKI_modify("Shift");
 if (VKI_alternate) 
 VKI_modify("AltGr");
 VKI_target.focus();
 VKI_saveRange(VKI_target);
 } // end if max length not exceeded. 
 else if (VKI_target.createTextRange && VKI_target.range)
 VKI_target.range.select();
}


/* ****************************************************************
* Show the keyboard interface
*/
function VKI_show(elem) 
{
 if (elem) // elem is not null
 {
 VKI_target = elem;
 if (VKI_visible != elem) // if it is not already visible
 {
 if (VKI_isIE) 
 {
 if (!VKI_target.range) 
 {
 VKI_target.range = VKI_target.createTextRange();
 VKI_target.range.moveStart('character', VKI_target.value.length);
 } 
 VKI_target.range.select();
 }
 
 try 
 { 
 VKI_keyboard.parentNode.removeChild(VKI_keyboard); 
 } 
 catch (e) {}
 
 if (VKI_clearPasswords && VKI_target.type == "password") 
 VKI_target.value = "";

 elem = VKI_target;
 VKI_target.keyboardPosition = "absolute";
 do 
 {
 if (VKI_getStyle(elem, "position") == "fixed") 
 {
 VKI_target.keyboardPosition = "fixed";
 break;
 }
 elem = elem.offsetParent;
 } while (elem);

 document.body.appendChild(VKI_keyboard);
 VKI_keyboard.style.top = VKI_keyboard.style.right = VKI_keyboard.style.bottom = VKI_keyboard.style.left = "auto";
 VKI_keyboard.style.position = VKI_target.keyboardPosition;
 VKI_keyboard.style.display = "block"; // in case display is "none"

 VKI_visible = VKI_target;
 VKI_position();
 VKI_target.focus();
 } // end if not already visible 
 else 
 VKI_close();
 } // end elem is not null
}



/* ****************************************************************
* Position the keyboard
*
*/
function VKI_position() 
{
 if (VKI_visible) 
 {
 var inputElemPos = VKI_findPos(VKI_target);
 VKI_keyboard.style.top = inputElemPos[1] - ((VKI_target.keyboardPosition == "fixed" && !VKI_isIE && !VKI_isMoz) ? VKI_scrollDist()[1] : 0) + VKI_target.offsetHeight + 3 + "px";
 VKI_keyboard.style.left = Math.min(VKI_innerDimensions()[0] - VKI_keyboard.offsetWidth - 15, inputElemPos[0]) + "px";
 }
}


/* ****************************************************************
* Close the keyboard interface
*/
function VKI_close() 
{
 if (VKI_visible) 
 {
 try 
 {
 VKI_keyboard.parentNode.removeChild(VKI_keyboard);
 } 
 catch (e) {}
 
 VKI_target.focus();
 //VKI_target = false;
 VKI_visible = false;
 }
}


/* ****************************************************************
* Build or rebuild the keyboard keys
*/
function VKI_buildKeys(kt) 
{
 if (!kt || !VKI_layout[kt])
 {
 kt = null; // assume phonetic
 return;
 }
 
 VKI_kt = kt; 
 VKI_shift = false; 
 VKI_capslock = false;
 VKI_alternate = false;
 VKI_dead = false;
// VKI_deadkeysOn = (VKI_layoutParameters[kt].DDK == null) ? false : VKI_keyboard.getElementsByTagName('label')[0].getElementsByTagName('input')[0].checked;

 var container = VKI_keyboard.tBodies[0].getElementsByTagName('div')[0]; // div with id='keyboardInputLayout'
 while (container.firstChild) // each child is a table representing one row of the virtual keyboard
 {
 container.removeChild(container.firstChild);
 }

 // for each row of the current virtual keyboard
 for (var x = 0, hasDeadKey = false, lyt; lyt = VKI_layout[kt][x++];) 
 {
 var table = document.createElement('table'); // each row of virtual keyboard is represented by a table
 table.cellSpacing = table.border = "0";
 if (lyt.length <= VKI_keyCenter) 
 table.className = "keyboardInputCenter"; // row with only spacebar and ALT key
 
 var tbody = document.createElement('tbody'); // each row of virtual keyboard is inside a <tbody>
 table.appendChild(tbody);
 
 var tr = document.createElement('tr'); // and the tbody has a single row
 tbody.appendChild(tr);
 
 // for each key in row
 for (var y = 0, lkey; lkey = lyt[y++];) 
 {
 var td = document.createElement('td');
 tr.appendChild(td);
 
 td.appendChild(document.createTextNode(lkey[0]));

 var className = [];
 // if dead keys are on and this key is a dead key, add "alive" to className array
 if (VKI_deadkeysOn)
 {
 for (key in VKI_deadkey)
 {
 if (key === lkey[0]) 
 { 
 className.push("alive"); 
 break; 
 }
 }
 }
 
 // if this is last key in row, add "last" to className array 
 if (lyt.length > VKI_keyCenter && y == lyt.length) 
 className.push("last");
 
 // if this is space bar, add "space" to className array
 if (lkey[0] == " ") 
 className.push("space");
 
 td.className = className.join(" "); // create string containing all selected class names sep'd by a blank

 td.VKI_clickless = 0;
 
 // add event handler that is called when user clicks key
 if (!td.click) 
 {
 td.click = function() 
 {
 var evt = this.ownerDocument.createEvent('MouseEvents');
 evt.initMouseEvent('click', true, true, this.ownerDocument.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
 this.dispatchEvent(evt);
 };
 }
 
 // add event handler that is called when user moves mouse over key. Will change background color.
 td.onmouseover = function() 
 {
 if (VKI_clickless) 
 {
 clearTimeout(VKI_clickless);
 VKI_clickless = setTimeout(function() { this.click(); }, VKI_clicklessDelay);
 }
 
 if (this.firstChild.nodeValue != "\xa0") 
 this.className += " hover";
 };
 
 // add event handler that is called when user moves mouse off of key. Will change background color back.
 td.onmouseout = function() 
 {
 if (VKI_clickless) 
 clearTimeout(VKI_clickless);
 this.className = this.className.replace(/ ?(hover|pressed)/g, "");
 };
 
 // add event handler that is called when user presses mouse button. 
 td.onmousedown = function() 
 {
 if (VKI_clickless) 
 clearTimeout(VKI_clickless);
 if (this.firstChild.nodeValue != "\xa0") 
 this.className += " pressed";
 };
 
 // add event handler that is called when user lets go of mouse button
 td.onmouseup = function() 
 {
 if (VKI_clickless) 
 clearTimeout(VKI_clickless);
 this.className = this.className.replace(/ ?pressed/g, "");
 };
 
 // turn off double click of mouse. 
 td.ondblclick = function() 
 { 
 return false; 
 };

 switch (lkey[1]) 
 {
 case "Caps":
 case "Shift":
 case "Alt":
 case "AltGr":
 td.onclick = 
 (function(type) 
 { 
 return function() { VKI_modify(type); return false; }; 
 }
 )(lkey[1]);
 break;
 
 case "Tab":
 td.onclick = function() { VKI_insert("\t"); return false; };
 break;
 
 case "Bksp":
 td.onclick = doBksp;
 break;
 
 case "Enter":
 td.onclick = function() 
 {
 if (VKI_target.nodeName != "TEXTAREA") 
 {
 VKI_close();
 this.className = this.className.replace(/ ?(hover|pressed)/g, "");
 } 
 else 
 VKI_insert("\n");
 return true;
 };
 break;

 default:
 if (VKI_layoutParameters[kt].phonetic)
 td.onclick = VKI_layoutParameters[kt].phf; // e.g. devAnalysis
 else
 td.onclick = characterHandler;
 }

 for (var z = 0; z < 4; z++)
 if (VKI_deadkey[lkey[z] = lkey[z] || "\xa0"]) 
 hasDeadKey = true;
 } // end of for each key in row
 
 container.appendChild(table); // add table contain keyboard row to div
 } // end for each row of current keyboard
 
 if (VKI_deadkeysElem != null)
 VKI_deadkeysElem.style.display = (!VKI_layoutParameters[kt].DDK && hasDeadKey) ? "inline" : "none";
} // end function VKI_buildKeys


/* Execute a backspace */
function doBksp() 
{ 
 VKI_target.focus();
 var rng = null;
 if (VKI_target.setSelectionRange) // Not IE
 {
 if (VKI_target.readOnly && VKI_isWebKit) 
 rng = [VKI_target.selStart || 0, VKI_target.selEnd || 0];
 else 
 rng = [VKI_target.selectionStart, VKI_target.selectionEnd];
 
 if (rng[0] < rng[1]) 
 rng[0]++;
 VKI_target.value = VKI_target.value.substr(0, rng[0] - 1) + VKI_target.value.substr(rng[1]);
 VKI_target.setSelectionRange(rng[0] - 1, rng[0] - 1);
 if (VKI_target.readOnly && VKI_isWebKit) 
 {
 var range = window.getSelection().getRangeAt(0);
 VKI_target.selStart = range.startOffset;
 VKI_target.selEnd = range.endOffset;
 }
 } 
 else if (VKI_target.createTextRange) // IE
 {
 try 
 {
 VKI_target.range.select();
 } 
 catch(e) 
 { 
 VKI_target.range = document.selection.createRange(); 
 }
 if (!VKI_target.range.text.length) 
 VKI_target.range.moveStart('character', -1);
 VKI_target.range.text = "";
 } 
 else 
 VKI_target.value = VKI_target.value.substr(0, VKI_target.value.length - 1);
 
 if (VKI_shift) 
 VKI_modify("Shift");
 
 if (VKI_alternate) 
 VKI_modify("AltGr");
 
 VKI_target.focus();
 
 return true;
}


function VKI_findPos(obj) 
{
 var curleft = curtop = 0;
 do 
 {
 curleft += obj.offsetLeft;
 curtop += obj.offsetTop;
 obj = obj.offsetParent;
 } while (obj);

 return [curleft, curtop];
}

function VKI_innerDimensions() 
{
 if (document.documentElement && document.documentElement.clientHeight) 
 return [document.documentElement.clientWidth, document.documentElement.clientHeight];
 else if (document.body)
 return [document.body.clientWidth, document.body.clientHeight];
 else
 return [0, 0];
}

function VKI_scrollDist() 
{
 var html = document.getElementsByTagName('html')[0];
 
 if (html.scrollTop && document.documentElement.scrollTop) 
 return [html.scrollLeft, html.scrollTop]; 
 else if (html.scrollTop || document.documentElement.scrollTop)
 return [html.scrollLeft + document.documentElement.scrollLeft, html.scrollTop + document.documentElement.scrollTop];
 else
 return [0, 0];
}

function VKI_getStyle(obj, styleProp) 
{
 var y = null;
 if (obj.currentStyle) 
 y = obj.currentStyle[styleProp];
 else if (window.getComputedStyle)
 y = window.getComputedStyle(obj, null)[styleProp];
 
 return y;
}

// There doesn't appear to be anyway to enable the things that are disabled here
function VKI_disableSelection(elem) 
{
 elem.onselectstart = function() { return false; };
 elem.unselectable = "on";
 elem.style.MozUserSelect = "none";
 elem.style.cursor = "default";
 if (window.opera) 
 elem.onmousedown = function() { return false; };
}


function addJavascript(jsname,pos) 
{
 var th = document.getElementsByTagName(pos)[0];
 var s = document.createElement('script');
 s.setAttribute('type','text/javascript');
 s.setAttribute('src',jsname);
 th.appendChild(s);
}


// This has timing problems
function scriptLoader()
{
 addJavascript("phoneticMapper.js", "head");
 addJavascript("vedatype.js", "head");
 addJavascript("slp01.js", "head"); 
}


function VKI_replace(obj, len, text)
{
 if (document.selection != null) // IE
 {
 var range = obj.range;
 range.moveStart('character', -len);
 range.collapse();
 range.moveEnd('character', len);
 range.select();
 range.text = text;
 range.select();
 VKI_saveRange(obj);
 }
 else if (obj.setSelectionRange != null) // Mozilla, Opera and Konqueror
 {
 var cp = VKI_getCaretPosition(obj); // ejf 'var'
 obj.value = obj.value.substr(0, cp-len) + text + obj.value.substr(cp);
 var newpos = cp - len + text.length;
 obj.setSelectionRange(newpos, newpos);
 obj.focus();
 }
}


function VKI_getKeyChar(evt)
{
 var keynum = 0;
 if (!isNaN(evt.charCode)) // Netscape
 keynum = evt.charCode;
 else if (evt.keyCode)
 keynum = evt.keyCode;
 
 return String.fromCharCode(keynum);
}

function VKI_lookupKeyHandler(evt, elem)
{
 var ch = VKI_getKeyChar(evt); 
 if (ch.charCodeAt(0) >= 0x20)
 {
 var mm = VKI_qwerty[ch]; // get what should be displayed
 var x = mm[0];
 var y = mm[1];
 var n = mm[2];
 if (evt.altKey || evt.ctrlKey)
 n += 2;
 ch = VKI_layout[VKI_kt][x][y][n];
 VKI_insert(ch);
 return false; // let Javascript know that we handled it.
 }
 else // control character, let browser handle it.
 return true;
}


// ch is character just typed
// idx is offset of caret in
// text which is the current value of the input area.
function VKI_devAnalysis_old(evt)
{
 // devanagari or roman transliteration display of phonetic input
 if (evt.ctrlKey || evt.altKey)
 return true; // tell browser to handle keystroke.
 var fromVirtualKeyboard = false;
 var rc = true; // browser handles keystroke
 var tagName = null;
 var el = null;
 var ch = null;
 
 // set ch to the character to work with
 if (document.selection) // IE
 {
 tagName = evt.srcElement.nodeName.toLowerCase();
 if (tagName == "input" || tagName == "textarea") // called from keypress event handler
 ch = VKI_getKeyChar(evt);
 else // probably called by clicking on a key defined in a td
 {
 el = evt.srcElement;
 if (tagName != "td")
 el = el.parentNode;
 fromVirtualKeyboard = true;
 ch = el.$keystroke;
 }
 }
 else // Firefox
 {
 if (evt instanceof MouseEvent)
 {
 fromVirtualKeyboard = true;
 tagName = evt.currentTarget.nodeName.toLowerCase();
 el = evt.currentTarget;
 if (tagName != "td")
 el = el.parentNode;
 ch = el.$keystroke;
 }
 else if (evt instanceof KeyboardEvent)
 ch = VKI_getKeyChar(evt); 
 else
 return rc; // hopefully we will never reach here. 
 }
 if (VKI_passThrough)
 {
 if (fromVirtualKeyboard)
 {
 VKI_insert(ch);
 return false;
 }
 else
 return true; // tell browser to handle keystroke
 }

 var idx = VKI_getCaretPosition(VKI_target);
 var text = VKI_target.value; //?? will this do a copy? Probably not since strings are immutable

 if (VKI_keymap.legalCharacter(ch))
 {
 if (VKI_viewAs == "roman")
 {
 var km = VKI_keymap.lookupKeystroke(ch, false);
 VKI_insert(km.encodingRoman);
 rc = false;
 }
 else
 {
 var replace = [true];
 var current = UnicodeLogic.getSyllable(text, idx - 1);
 var prevchar = idx > 0 ? text.charAt(idx - 1) : '\0';
 var newSyllable = VKI_keymap.getUnicode(current, prevchar, ch, replace);
 if (newSyllable != null) // if character was intercepted by keymap
 {
 if (replace[0]) // e.g., current ends with virama
 {
 if (current != null)
 VKI_replace(VKI_target, current.length, newSyllable);
 else
 VKI_replace(VKI_target, 1, newSyllable);
 }
 else
 {
 VKI_insert(newSyllable); 
 }

 rc = false; // let browser know we have handled keystroke 
 }
 else // do nothing, leave character as is.
 rc = true;
 }
 }
 else
 {
 if (fromVirtualKeyboard)
 VKI_insert(this.firstChild.nodeValue);
 VKI_currentCaretPosition++;
 rc = true; // tell browser to handle keystroke but doesn't matter if this was not called on a keypress
 }
 
 return rc;
}


function VKI_devAnalysis(evt)
{
 // devanagari or roman transliteration display of phonetic input
 if (evt.ctrlKey || evt.altKey)
 return true; // tell browser to handle keystroke.
 var fromVirtualKeyboard = false;
 var rc = true; // browser handles keystroke
 var tagName = null;
 var el = null;
 var ch = null;
 
 if (evt.type == "keypress") // called from keypress event handler
 ch = String.fromCharCode(evt.which); 
 else // user must have clicked mouse on virtual keyboard
 {
 fromVirtualKeyboard = true;
 el = evt.currentTarget;
 if (!el.$keystroke)
 el = el.parentNode;
 ch = el.$keystroke;
 }
 
 if (VKI_passThrough)
 {
 if (fromVirtualKeyboard)
 {
 VKI_insert(ch);
 return false;
 }
 else
 return true; // tell browser to handle keystroke
 }

 var idx = VKI_getCaretPosition(VKI_target);
 var text = VKI_target.value; //?? will this do a copy? Probably not since strings are immutable

 if (VKI_keymap.legalCharacter(ch))
 {
 if (VKI_viewAs == "roman")
 {
 var km = VKI_keymap.lookupKeystroke(ch, false);
 VKI_insert(km.encodingRoman);
 rc = false;
 }
 else
 {
 var replace = [true];
 var current = UnicodeLogic.getSyllable(text, idx - 1);
 var prevchar = idx > 0 ? text.charAt(idx - 1) : '\0'; 
/* ejf
 if ((current == null) ) {
         alert('dbg: ' + VKI_kt + "," + idx);
	 if((VKI_kt == 'it') && (idx > 1)){
	  current = text.substr(idx-2,idx);
	  alert('current changed to ' + current);
     }
 }
*/
 var newSyllable = VKI_keymap.getUnicode(current, prevchar, ch, replace);
 if (newSyllable != null) // if character was intercepted by keymap
 {
 if (replace[0]) // e.g., current ends with virama
 {
 if (current != null)
 VKI_replace(VKI_target, current.length, newSyllable);
 else
 VKI_replace(VKI_target, 1, newSyllable);
 }
 else
 {
 VKI_insert(newSyllable); 
 }

 rc = false; // let browser know we have handled keystroke 
 }
 else // do nothing, leave character as is.
 rc = true;
 }
 }
 else
 {
 if (fromVirtualKeyboard)
 VKI_insert(this.firstChild.nodeValue);
 VKI_currentCaretPosition++;
 rc = true; // tell browser to handle keystroke but doesn't matter if this was not called on a keypress
 }
 
 return rc;
}


function du(txt)
{
 var s = "";
 for (var i=0; i<txt.length; i++)
 {
 s += txt.charCodeAt(i);
 s += " ";
 }
 return s;
}


function convertNumberToHex(n)
{
 var hexArray = new Array( "0", "1", "2", "3", 
 "4", "5", "6", "7",
 "8", "9", "A", "B", 
 "C", "D", "E", "F" ); 

 var result = "";
 while (n > 0)
 {
 result = hexArray[n%16] + result;
 n = Math.floor(n/16);
 }
 
 return result 
}

function convertToHex(s)
{
 var result = "";
 for (var i=0; i<s.length; i++)
 {
 var hex = convertNumberToHex(s.charCodeAt(i));
 if (hex.length == 1)
 result += "\\u000";
 else if (hex.length == 2)
 result += "\\u00";
 else if (hex.length == 3)
 result += "\\u0";
 else
 result += "\\u";
 
 result += hex;
 } 
 
 return result; 
}

if (window.addEventListener)
{
 window.addEventListener('resize', VKI_position, false);
// window.addEventListener('load', VKI_buildKeyboardInputs, false);
}
else if (window.attachEvent)
{
 window.attachEvent('onresize', VKI_position);
// window.attachEvent('onload', VKI_buildKeyboardInputs);
}


// Keymap class (encoding --> either unicode or encodingRoman and is attached or not
function KeyMap(unicode, encodingRoman, encoding, attached)
{
 this.unicode = unicode;
 this.encodingRoman = encodingRoman;
 this.encoding = encoding;
 if (!attached)
 attached = false;
 this.attached = attached;
}



// Root class for all phonetic mappings
function PhoneticMapper(map)
{
 this.map = map;
}


PhoneticMapper.prototype.reverseMap = function(ch)
{
 for (var i =0; i<this.map.length; i++)
 {
 var km = this.map[i];
 if (km.unicode == ch)
 return km.encoding;
 }
 
 return '\u0000'; // should never reach here.
}

PhoneticMapper.prototype.legalCharacter = function(ch)
{
 for (var i =0; i<this.map.length; i++)
 {
 var km = this.map[i];
 if (km.encoding.indexOf(ch) !=-1)
 return true;
 }
 
 return false;
}


PhoneticMapper.prototype.lookupKeystroke = function(s, attached)
{
 if (!attached)
 attached = false;
 
 for (var i=0; i<this.map.length; i++)
 {
 var km = this.map[i];
 if (km.encoding == s && km.attached == attached)
 return km;
 }
 
 return null;
}

PhoneticMapper.prototype.getLayout = function() // should be overridden by actual keymap
{
 return null;
}


var Unicode = 
{
 A : '\u0905',
 Virama : '\u094D',
 H : '\u0939',
 Danda : '\u0964',
    DoubleDanda : '\u0965', // ejf
    Avagraha : '\u093D',
    Anusvara : '\u0902',
    Candrabindu : '\u0901'

};

var UnicodeType =
{
 Unknown : 0,
 DependentVowel : 1,
 IndependentVowel : 2,
 Consonent : 3,
 Punctuation : 4,
 VowelModifier : 5,
 Accent : 6,
 Other : 7
};

function UnicodeLogic()
{
}

UnicodeLogic.h = 
{
 '\u0901' : UnicodeType.VowelModifier,
 '\u0902' : UnicodeType.VowelModifier,
 '\u0903' : UnicodeType.VowelModifier,

 '\u0915' : UnicodeType.Consonent,
 '\u0916' : UnicodeType.Consonent,
 '\u0917' : UnicodeType.Consonent,
 '\u0918' : UnicodeType.Consonent,
 '\u0919' : UnicodeType.Consonent,
 '\u091A' : UnicodeType.Consonent,
 '\u091B' : UnicodeType.Consonent,
 '\u091C' : UnicodeType.Consonent,
 '\u091D' : UnicodeType.Consonent,
 '\u091E' : UnicodeType.Consonent,
 '\u091F' : UnicodeType.Consonent,
 '\u0920' : UnicodeType.Consonent,
 '\u0921' : UnicodeType.Consonent,
 '\u0922' : UnicodeType.Consonent,
 '\u0923' : UnicodeType.Consonent,
 '\u0924' : UnicodeType.Consonent,
 '\u0925' : UnicodeType.Consonent,
 '\u0926' : UnicodeType.Consonent,
 '\u0927' : UnicodeType.Consonent,
 '\u0928' : UnicodeType.Consonent,
 '\u0929' : UnicodeType.Consonent,
 '\u092A' : UnicodeType.Consonent,
 '\u092B' : UnicodeType.Consonent,
 '\u092C' : UnicodeType.Consonent,
 '\u092D' : UnicodeType.Consonent,
 '\u092E' : UnicodeType.Consonent,
 '\u092F' : UnicodeType.Consonent,
 '\u0930' : UnicodeType.Consonent,
 '\u0931' : UnicodeType.Consonent,
 '\u0932' : UnicodeType.Consonent,
 '\u0933' : UnicodeType.Consonent,
 '\u0934' : UnicodeType.Consonent,
 '\u0935' : UnicodeType.Consonent,
 '\u0936' : UnicodeType.Consonent,
 '\u0937' : UnicodeType.Consonent,
 '\u0938' : UnicodeType.Consonent,
 '\u0939' : UnicodeType.Consonent,
 '\u093A' : UnicodeType.Consonent,
 '\u093B' : UnicodeType.Consonent,
 '\u093C' : UnicodeType.Consonent,
 '\u093D' : UnicodeType.Consonent,
 '\u0958' : UnicodeType.Consonent,
 '\u0959' : UnicodeType.Consonent,

 '\u0904' : UnicodeType.IndependentVowel,
 '\u0905' : UnicodeType.IndependentVowel,
 '\u0906' : UnicodeType.IndependentVowel,
 '\u0907' : UnicodeType.IndependentVowel,
 '\u0908' : UnicodeType.IndependentVowel,
 '\u0909' : UnicodeType.IndependentVowel,
 '\u090A' : UnicodeType.IndependentVowel,
 '\u090B' : UnicodeType.IndependentVowel,
 '\u090C' : UnicodeType.IndependentVowel,
 '\u090D' : UnicodeType.IndependentVowel,
 '\u090E' : UnicodeType.IndependentVowel,
 '\u090F' : UnicodeType.IndependentVowel,
 '\u0910' : UnicodeType.IndependentVowel,
 '\u0911' : UnicodeType.IndependentVowel,
 '\u0912' : UnicodeType.IndependentVowel,
 '\u0913' : UnicodeType.IndependentVowel,
 '\u0914' : UnicodeType.IndependentVowel,

 '\u093E' : UnicodeType.DependentVowel,
 '\u093F' : UnicodeType.DependentVowel,
 '\u0940' : UnicodeType.DependentVowel,
 '\u0941' : UnicodeType.DependentVowel,
 '\u0942' : UnicodeType.DependentVowel,
 '\u0943' : UnicodeType.DependentVowel,
 '\u0944' : UnicodeType.DependentVowel,
 '\u0945' : UnicodeType.DependentVowel,
 '\u0946' : UnicodeType.DependentVowel,
 '\u0947' : UnicodeType.DependentVowel,
 '\u0948' : UnicodeType.DependentVowel,
 '\u0949' : UnicodeType.DependentVowel,
 '\u094A' : UnicodeType.DependentVowel,
 '\u094B' : UnicodeType.DependentVowel,
 '\u094C' : UnicodeType.DependentVowel,

 '\u094D' : UnicodeType.Punctuation, // virama

 '\u0951' : UnicodeType.Accent, // udatta
 '\u0952' : UnicodeType.Accent, // anudatta
 '\u0953' : UnicodeType.Accent, // grave accent
 '\u0954' : UnicodeType.Accent, // acute
 '\u0962' : UnicodeType.DependentVowel,
 '\u0963' : UnicodeType.DependentVowel
};


UnicodeLogic.getSyllable = function(text, idx)
{
 var n = idx;
 if (idx < 0 || idx >= text.length)
 return null;
 var ch = text.charAt(idx);
 if (UnicodeLogic.isConsonent(ch) || UnicodeLogic.isIndependentVowel(ch)) // note: virama will not precede a standalone vowel
 idx -= 1;
 else if (UnicodeLogic.isDependentVowel(ch))
 idx -= 2;

 if (idx < 0) // at very beginning
 return text.substr(0, n+1);

 if (text.charAt(idx) == Unicode.Virama) // include conjunct consonents, if any
 {
 while (idx > 0)
 {
 if (text.charAt(idx) == Unicode.Virama)
 idx -= 2;
 else
 break;
 }
 }

 if (n != idx)
 return text.substr(idx + 1, n - idx);
 else if (ch == Unicode.Danda)
 return Unicode.Danda;
 else
 return null; // probably punctuation or whitespace
}


UnicodeLogic.hasAspiration = function(ch)
{
 return ch == '\u0915' || // k
 ch == '\u0917' || // g
 ch == '\u091A' || // c
 ch == '\u091C' || // j 
 ch == '\u091F' || // T
 ch == '\u0921' || // D
 ch == '\u0924' || // t
 ch == '\u0926' || // d
 ch == '\u092A' || // p
 ch == '\u092C'; // b
}

UnicodeLogic.toAspirated = function (ch)
{
 return String.fromCharCode(ch.charCodeAt(0) + 1);
}
 
 
UnicodeLogic.isConsonent = function(ch)
{
 var ut = UnicodeLogic.h[ch];
 if (!ut)
 ut = UnicodeType.Unknown;
 return ut == UnicodeType.Consonent;
}

UnicodeLogic.isDependentVowel = function(ch)
{
 var ut = UnicodeLogic.h[ch];
 if (!ut)
 ut = UnicodeType.Unknown;
 
 return ut == UnicodeType.DependentVowel; 
}

UnicodeLogic.isIndependentVowel = function(ch)
{
 var ut = UnicodeLogic.h[ch];
 if (!ut)
 ut = UnicodeType.Unknown;
 
 return ut == UnicodeType.IndependentVowel; 
}

UnicodeLogic.isVowel = function(ch)
{
 return UnicodeLogic.isDependentVowel(ch) || UnicodeLogic.isDependentVowel(ch);
}

UnicodeLogic.isOther = function(ch)
{
 return !UnicodeLogic.isConsonent(ch) && !UnicodeLogic.isDependentVowel(ch) && !UnicodeLogic.isIndependentVowel(ch);
}


/************************************************
* SLP1 encoding
************************************************/
function SLP01() // extends PhoneticMapper
{
 var map = [ 
 new KeyMap("\u0901", "?", "MM", true), // Candrabindu
 new KeyMap("\u0902", "\u1E41", "M"), // Anusvara
 new KeyMap("\u0903", "\u1E25", "H"), // Visarga
 new KeyMap("\u1CF2", "\u1E96", "Z"), // jihvamuliya
 new KeyMap("\u1CF2", "h\u032C", "V"), // upadhmaniya
 new KeyMap("\u0905", "a", "a"), // a
 new KeyMap("\u0906", "\u0101", "A"), // long a
 new KeyMap("\u093E", null, "A", true), // long a attached
 new KeyMap("\u0907", "i", "i"), // i
 new KeyMap("\u093F", null, "i", true), // i attached
 new KeyMap("\u0908", "\u012B", "I"), // long i
 new KeyMap("\u0940", null, "I", true), // long i attached
 new KeyMap("\u0909", "u", "u"), // u
 new KeyMap("\u0941", null, "u", true), // u attached
 new KeyMap("\u090A", "\u016B", "U"), // long u
 new KeyMap("\u0942", null, "U", true), // long u attached
 new KeyMap("\u090B", "\u1E5B", "f"), // vocalic r
 new KeyMap("\u0943", null, "f", true), // vocalic r attached
 new KeyMap("\u0960", "\u1E5D", "F"), // long vocalic r
 new KeyMap("\u0944", null, "F", true), // long vocalic r attached
 new KeyMap("\u090C", "\u1E37", "x"), // vocalic l
 new KeyMap("\u0962", null, "x", true), // vocalic l attached
 new KeyMap("\u0961", "\u1E39", "X"), // long vocalic l
 new KeyMap("\u0963", null, "X", true), // long vocalic l attached
 new KeyMap("\u090F", "e", "e"), // e
 new KeyMap("\u0947", null, "e", true), // e attached
 new KeyMap("\u0910", "ai", "E"), // ai
 new KeyMap("\u0948", null, "E", true), // ai attached
 new KeyMap("\u0913", "o", "o"), // o
 new KeyMap("\u094B", null, "o", true), // o attached
 new KeyMap("\u0914", "au", "O"), // au
 new KeyMap("\u094C", null, "O", true), // au attached

 // velars
 new KeyMap("\u0915\u094D", "k", "k"), // k
 new KeyMap("\u0916\u094D", "kh", "K"), // kh
 new KeyMap("\u0917\u094D", "g", "g"), // g
 new KeyMap("\u0918\u094D", "gh", "G"), // gh
 new KeyMap("\u0919\u094D", "\u1E45", "N"), // velar n

 // palatals
 new KeyMap("\u091A\u094D", "c", "c"), // c
 new KeyMap("\u091B\u094D", "ch", "C"), // ch
 new KeyMap("\u091C\u094D", "j", "j"), // j
 new KeyMap("\u091D\u094D", "jh", "J"), // jh
 new KeyMap("\u091E\u094D", "\u00F1", "Y"), // palatal n

 // retroflex
 new KeyMap("\u091F\u094D", "\u1E6D", "w"), // retroflex t
 new KeyMap("\u0920\u094D", "\u1E6Dh", "W"), // retroflex th
 new KeyMap("\u0921\u094D", "\u1E0D", "q"), // retroflex d
 new KeyMap("\u0922\u094D", "\u1E0Dh", "Q"), // retroflex dh
 new KeyMap("\u0923\u094D", "\u1E47", "R"), // retroflex n

 // dental
 new KeyMap("\u0924\u094D", "t", "t"), // dental t
 new KeyMap("\u0925\u094D", "th", "T"), // dental th
 new KeyMap("\u0926\u094D", "d", "d"), // dental d
 new KeyMap("\u0927\u094D", "dh", "D"), // dental dh
 new KeyMap("\u0928\u094D", "n", "n"), // dental n

 // labials
 new KeyMap("\u092A\u094D", "p", "p"), // p
 new KeyMap("\u092B\u094D", "ph", "P"), // ph
 new KeyMap("\u092C\u094D", "b", "b"), // b
 new KeyMap("\u092D\u094D", "bh", "B"), // bh
 new KeyMap("\u092E\u094D", "m", "m"), // m

 // sibillants
 new KeyMap("\u0936\u094D", "\u015B", "S"), // palatal s
 new KeyMap("\u0937\u094D", "\u1E63", "z"), // retroflex s
 new KeyMap("\u0938\u094D", "s", "s"), // dental s
 new KeyMap("\u0939\u094D", "h", "h"), // h

 // semivowels
 new KeyMap("\u092F\u094D", "y", "y"), // y
 new KeyMap("\u0930\u094D", "r", "r"), // r
 new KeyMap("\u0932\u094D", "l", "l"), // l
 new KeyMap("\u0935\u094D", "v", "v"), // v


 // numerals
 new KeyMap("\u0966", "0", "0"), // 0
 new KeyMap("\u0967", "1", "1"), // 1
 new KeyMap("\u0968", "2", "2"), // 2
 new KeyMap("\u0969", "3", "3"), // 3
 new KeyMap("\u096A", "4", "4"), // 4
 new KeyMap("\u096B", "5", "5"), // 5
 new KeyMap("\u096C", "6", "6"), // 6
 new KeyMap("\u096D", "7", "7"), // 7
 new KeyMap("\u096E", "8", "8"), // 8
 new KeyMap("\u096F", "9", "9"), // 9

 // accents
 new KeyMap("\u0951", "|", "|"), // udatta
 new KeyMap("\u0952", "_", "_"), // anudatta
 new KeyMap("\u0953", null, "//"), // grave accent
 new KeyMap("\u0954", null, "\\"), // acute accent

 // miscellaneous
 new KeyMap("\u0933\u094D", "\u1E37", "L"), // retroflex l
 new KeyMap("\u093D", "'", "'"), // avagraha
 new KeyMap("\u0950", null, "om"), // om
 new KeyMap("\u0964", ".", ".") // single danda
 ];

 PhoneticMapper.call(this, map);
}

// Make SLP01 a subclass of PhoneticMapper
SLP01.prototype = new PhoneticMapper();
delete SLP01.prototype.map;
SLP01.prototype.constructor = SLP01;

// Define methods of SLP
SLP01.prototype.getUnicode = function(current, prevchar, ch, /*out*/replace)
{
 replace[0] = true;

 if (current == null)
 {
 replace[0] = false;
 if (!this.isVowel(ch))
 return this.lookupKeystroke(ch).unicode;
 else
 return this.lookupKeystroke(ch, false).unicode;
 }

 var last = -1;
 if (current.length > 0)
 last = current.length - 1;

 if (last != -1)
 {
 // handle special cases

 if ((ch == '|' || ch == '_'))
 {
 if (current.charAt(last) != Unicode.Virama)
 return current + this.lookupKeystroke(ch, false).unicode;
 else
 return current + ch;
 }
 else if (ch == '.' && current.charAt(last) == Unicode.Danda)
 return Unicode.DoubleDanda;

 // if current syllable ends in a virama
 if (current.charAt(last) == Unicode.Virama)
 {
 replace[0] = true;
 if (!this.isVowel(ch))
 return current + this.lookupKeystroke(ch).unicode;
 else
 {
 var s = null;
 km = this.lookupKeystroke(ch, true);
 if (km != null)
 s = km.unicode;
 else if (ch == 'a')
 s = ""; // force virama to be dropped.
 else
 s = this.lookupKeystroke(ch, false).unicode; // probably an 'a'
 return current.substr(0, current.length - 1) + s;
 }
 }
 else
 {
 replace[0] = false;
 result = this.lookupKeystroke(ch, false);
 if (result != null)
 return result.unicode;
 else
 return ch;
 }
 }

 // hope we never reach here.
 return null;
}

SLP01.prototype.isVowel = function (ch)
{
 ch = ch.toLowerCase();
 return ch == 'a' || ch == 'e' || ch == 'i' || ch == 'o' || ch == 'u' || ch == 'f' || ch == 'x';
}

SLP01.prototype.getLayout = function()
{
/*This must correspond to the table contained with the div with id 'alphabet' (see Default.aspx)*/
 var cells =
 [
 'a', 'A', 'i', 'I', 'u', 'U', // first row
 'f', 'F', 'x', 'X',
 'e', 'E', 'o', 'O',
 'M', 'H',
 'k', 'K', 'g', 'G', 'N', // velar
 'c', 'C', 'j', 'J', 'Y', // palatal
 'w', 'W', 'q', 'Q', 'R', // retroflex
 'L', 'l', // special retroflex
 't', 'T', 'd', 'D', 'n', // dental
 'p', 'P', 'b', 'B', 'm', // labial
 'y', 'r', 'l', 'v', // semivowel
 'S', 'z', 's', 'h', // sibillants
 'H', 'Z', 'V', 'M' // anusvara, visarga, etc.
 ];
 
 return cells;
}


/************************************************
* Kyoto-Harvard encoding
************************************************/
function KyotoHarvard() // extends PhoneticMapper
{
 var map = [ 
 new KeyMap("\u0901", "?", "", true), // Candrabindu
 new KeyMap("\u0902", "\u1E41", "M"), // Anusvara
 new KeyMap("\u0903", "\u1E25", "H"), // Visarga
 new KeyMap("\u1CF2", "\u1E96", "Z"), // jihvamuliya
 new KeyMap("\u1CF2", "h\u032C", "V"), // upadhmaniya
 new KeyMap("\u0905", "a", "a"), // a
 new KeyMap("\u0906", "\u0101", "A"), // long a
 new KeyMap("\u093E", null, "A", true), // long a attached
 new KeyMap("\u0907", "i", "i"), // i
 new KeyMap("\u093F", null, "i", true), // i attached
 new KeyMap("\u0908", "\u012B", "I"), // long i
 new KeyMap("\u0940", null, "I", true), // long i attached
 new KeyMap("\u0909", "u", "u"), // u
 new KeyMap("\u0941", null, "u", true), // u attached
 new KeyMap("\u090A", "\u016B", "U"), // long u
 new KeyMap("\u0942", null, "U", true), // long u attached
 new KeyMap("\u090B", "\u1E5B", "R"), // vocalic r
 new KeyMap("\u0943", null, "R", true), // vocalic r attached
 new KeyMap("\u0960", "\u1E5D", "RR"), // long vocalic r
 new KeyMap("\u0944", null, "RR", true), // long vocalic r attached
 new KeyMap("\u090C", "\u1E37", "L"), // vocalic l
 new KeyMap("\u0962", null, "L", true), // vocalic l attached
 new KeyMap("\u0961", "\u1E39", "LL"), // long vocalic l
 new KeyMap("\u0963", null, "", true), // long vocalic l attached
 new KeyMap("\u090F", "e", "e"), // e
 new KeyMap("\u0947", null, "e", true), // e attached
 new KeyMap("\u0910", "ai", "ai"), // ai
 new KeyMap("\u0948", null, "ai", true), // ai attached
 new KeyMap("\u0913", "o", "o"), // o
 new KeyMap("\u094B", null, "o", true), // o attached
 new KeyMap("\u0914", "au", "au"), // au
 new KeyMap("\u094C", null, "au", true), // au attached

 // velars
 new KeyMap("\u0915\u094D", "k", "k"), // k
 new KeyMap("\u0916\u094D", "kh", "kh"), // kh
 new KeyMap("\u0917\u094D", "g", "g"), // g
 new KeyMap("\u0918\u094D", "gh", "gh"), // gh
 new KeyMap("\u0919\u094D", "\u1E45", "G"), // velar n

 // palatals
 new KeyMap("\u091A\u094D", "c", "c"), // c
 new KeyMap("\u091B\u094D", "ch", "ch"), // ch
 new KeyMap("\u091C\u094D", "j", "j"), // j
 new KeyMap("\u091D\u094D", "jh", "jh"), // jh
 new KeyMap("\u091E\u094D", "\u00F1", "J"), // palatal n

 // retroflex
 new KeyMap("\u091F\u094D", "\u1E6D", "T"), // retroflex t
 new KeyMap("\u0920\u094D", "\u1E6Dh", "Th"), // retroflex th
 new KeyMap("\u0921\u094D", "\u1E0D", "D"), // retroflex d
 new KeyMap("\u0922\u094D", "\u1E0Dh", "Dh"), // retroflex dh
 new KeyMap("\u0923\u094D", "\u1E47", "N"), // retroflex n

 // dental
 new KeyMap("\u0924\u094D", "t", "t"), // dental t
 new KeyMap("\u0925\u094D", "th", "th"), // dental th
 new KeyMap("\u0926\u094D", "d", "d"), // dental d
 new KeyMap("\u0927\u094D", "dh", "dh"), // dental dh
 new KeyMap("\u0928\u094D", "n", "n"), // dental n

 // labials
 new KeyMap("\u092A\u094D", "p", "p"), // p
 new KeyMap("\u092B\u094D", "ph", "ph"), // ph
 new KeyMap("\u092C\u094D", "b", "b"), // b
 new KeyMap("\u092D\u094D", "bh", "bh"), // bh
 new KeyMap("\u092E\u094D", "m", "m"), // m

 // sibillants
 new KeyMap("\u0936\u094D", "\u015B", "z"), // palatal s
 new KeyMap("\u0937\u094D", "\u1E63", "S"), // retroflex s
 new KeyMap("\u0938\u094D", "s", "s"), // dental s
 new KeyMap("\u0939\u094D", "h", "h"), // h

 // semivowels
 new KeyMap("\u092F\u094D", "y", "y"), // y
 new KeyMap("\u0930\u094D", "r", "r"), // r
 new KeyMap("\u0932\u094D", "l", "l"), // l
 new KeyMap("\u0935\u094D", "v", "v"), // v


 // numerals
 new KeyMap("\u0966", "0", "0"), // 0
 new KeyMap("\u0967", "1", "1"), // 1
 new KeyMap("\u0968", "2", "2"), // 2
 new KeyMap("\u0969", "3", "3"), // 3
 new KeyMap("\u096A", "4", "4"), // 4
 new KeyMap("\u096B", "5", "5"), // 5
 new KeyMap("\u096C", "6", "6"), // 6
 new KeyMap("\u096D", "7", "7"), // 7
 new KeyMap("\u096E", "8", "8"), // 8
 new KeyMap("\u096F", "9", "9"), // 9

 // accents
 new KeyMap("\u0951", "|", "|"), // udatta
 new KeyMap("\u0952", "_", "_"), // anudatta
 new KeyMap("\u0953", null, "//"), // grave accent
 new KeyMap("\u0954", null, "\\"), // acute accent

 // miscellaneous
 new KeyMap("\u0933\u094D", "\u1E37", "L"), // retroflex l
 new KeyMap("\u093D", "'", "'"), // avagraha
 new KeyMap("\u0950", null, "om"), // om
 new KeyMap("\u0964", ".", ".") // single danda
 ];

 PhoneticMapper.call(this, map);
}

// Make KyotoHarvard a subclass of PhoneticMapper
KyotoHarvard.prototype = new PhoneticMapper();
delete KyotoHarvard.prototype.map;
KyotoHarvard.prototype.constructor = KyotoHarvard;

// Define methods of KyotoHarvard
KyotoHarvard.prototype.getUnicode = function(current, prevchar, ch, /*out*/replace)
{
 replace[0] = true;

 if (current == null)
 {
 replace[0] = false;
 if (!this.isVowel(ch))
 return this.lookupKeystroke(ch).unicode;
 else
 return this.lookupKeystroke(ch, false).unicode;
 }

 var last = -1;
 if (current.length > 0)
 last = current.length - 1;

 if (last != -1)
 {
 // handle special cases
 if ((ch == 'i' || ch == 'u') && UnicodeLogic.isConsonent(current.charAt(last)))
 return current + this.lookupKeystroke("a" + ch, true).unicode; // convert a to either ai or au
 else if ((ch == 'i' || ch == 'u') && current.charAt(last) == Unicode.A)
 return this.lookupKeystroke("a" + ch, false).unicode; // convert a to either ai or au
 else if (ch == 'h' && current.charAt(last) == Unicode.Virama && UnicodeLogic.hasAspiration(current.charAt(last - 1)))
 return current.substr(0, last - 1) + UnicodeLogic.toAspirated(current.charAt(last - 1)) + Unicode.Virama;
 else if ((ch == '|' || ch == '_'))
 {
 if (current.charAt(last) != Unicode.Virama)
 return current + this.lookupKeystroke(ch, false).unicode;
 else
 return current + ch;
 }
 else if (ch == '.' && current.charAt(last) == Unicode.Danda)
 return Unicode.DoubleDanda;
 else if (prevchar == Unicode.A && (ch == 'i' || ch == 'u'))
 return this.lookupKeystroke("a" + ch, false).unicode;

 // if current syllable ends in a virama
 if (current.charAt(last) == Unicode.Virama)
 {
 replace[0] = true;
 if (!this.isVowel(ch))
 return current + this.lookupKeystroke(ch).unicode;
 else
 {
 var s = null;
 var km = this.lookupKeystroke(ch, true);
 if (km != null)
 s = km.unicode;
 else if (ch == 'a')
 s = ""; // force virama to be dropped.
 else
 s = this.lookupKeystroke(ch, false).unicode; // probably an 'a'
 return current.substr(0, current.length-1) + s;
 }
 }
 else
 {
 replace[0] = false;
 var result = this.lookupKeystroke(ch, false);
 if (result != null)
 return result.unicode;
 else
 return ch.ToString();
 }
 }
 
 // hope we never reach here.
 return null;
}

KyotoHarvard.prototype.isVowel = function (ch)
{
 ch = ch.toLowerCase();
 return ch == 'a' || ch == 'e' || ch == 'i' || ch == 'o' || ch == 'u' || ch == 'q';
}

KyotoHarvard.prototype.getLayout = function()
{
/*This must correspond to the table contained with the div with id 'alphabet' (see Default.aspx)*/
 var cells =
 [
 'a', 'A', 'i', 'I', 'u', 'U', // first row
 'R', 'RR', 'L', 'LL',
 'e', 'ai', 'o', 'au',
 'M', 'H',
 'k', 'kh', 'g', 'gh', 'G', // velar
 'c', 'ch', 'j', 'jh', 'J', // palatal
 'T', 'Th', 'D', 'Dh', 'N', // retroflex
 'L', 'LL', // special retroflex
 't', 'th', 'd', 'dh', 'n', // dental
 'p', 'ph', 'b', 'bh', 'm', // labial
 'y', 'r', 'l', 'v', // semivowel
 'z', 'S', 's', 'h', // sibillants
 'H', 'Z', 'V', 'M' // anusvara, visarga, etc.
 ];
 
 return cells;
}

/************************************************
* Hyderabad-Tirupati
************************************************/
// this requires the file phoneticMapper.js which defines PhoneticMapper and KeyMap

function HyderabadTirupati() // extends PhoneticMapper
{
 var map = [ 
 new KeyMap("\u0901", "?", "z", true), // Candrabindu
 new KeyMap("\u0902", "\u1E41", "M"), // Anusvara
 new KeyMap("\u0903", "\u1E25", "H"), // Visarga
 new KeyMap("\u1CF2", "\u1E96", "Z"), // jihvamuliya
 new KeyMap("\u1CF2", "h\u032C", "V"), // upadhmaniya
 new KeyMap("\u0905", "a", "a"), // a
 new KeyMap("\u0906", "\u0101", "A"), // long a
 new KeyMap("\u093E", null, "A", true), // long a attached
 new KeyMap("\u0907", "i", "i"), // i
 new KeyMap("\u093F", null, "i", true), // i attached
 new KeyMap("\u0908", "\u012B", "I"), // long i
 new KeyMap("\u0940", null, "I", true), // long i attached
 new KeyMap("\u0909", "u", "u"), // u
 new KeyMap("\u0941", null, "u", true), // u attached
 new KeyMap("\u090A", "\u016B", "U"), // long u
 new KeyMap("\u0942", null, "U", true), // long u attached
 new KeyMap("\u090B", "\u1E5B", "q"), // vocalic r
 new KeyMap("\u0943", null, "q", true), // vocalic r attached
 new KeyMap("\u0960", "\u1E5D", "Q"), // long vocalic r
 new KeyMap("\u0944", null, "Q", true), // long vocalic r attached
 new KeyMap("\u090C", "\u1E37", "L"), // vocalic l
 new KeyMap("\u0962", null, "L", true), // vocalic l attached
 new KeyMap("\u0961", "\u1E39", "LY"), // long vocalic l
 new KeyMap("\u0963", null, "LY", true), // long vocalic l attached
 new KeyMap("\u090F", "e", "e"), // e
 new KeyMap("\u0947", null, "e", true), // e attached
 new KeyMap("\u0910", "ai", "E"), // ai
 new KeyMap("\u0948", null, "E", true), // ai attached
 new KeyMap("\u0913", "o", "o"), // o
 new KeyMap("\u094B", null, "o", true), // o attached
 new KeyMap("\u0914", "au", "O"), // au
 new KeyMap("\u094C", null, "O", true), // au attached

 // velars
 new KeyMap("\u0915\u094D", "k", "k"), // k
 new KeyMap("\u0916\u094D", "kh", "K"), // kh
 new KeyMap("\u0917\u094D", "g", "g"), // g
 new KeyMap("\u0918\u094D", "gh", "G"), // gh
 new KeyMap("\u0919\u094D", "\u1E45", "f"), // velar n

 // palatals
 new KeyMap("\u091A\u094D", "c", "c"), // c
 new KeyMap("\u091B\u094D", "ch", "C"), // ch
 new KeyMap("\u091C\u094D", "j", "j"), // j
 new KeyMap("\u091D\u094D", "jh", "J"), // jh
 new KeyMap("\u091E\u094D", "\u00F1", "F"), // palatal n

 // retroflex
 new KeyMap("\u091F\u094D", "\u1E6D", "t"), // retroflex t
 new KeyMap("\u0920\u094D", "\u1E6Dh", "T"), // retroflex th
 new KeyMap("\u0921\u094D", "\u1E0D", "d"), // retroflex d
 new KeyMap("\u0922\u094D", "\u1E0Dh", "D"), // retroflex dh
 new KeyMap("\u0923\u094D", "\u1E47", "N"), // retroflex n
 new KeyMap("\u0933\u094D", "\u1E37", "lY"), // retroflex l
 new KeyMap("\u0933\u094D\u0939\u094D", "\u1E37", "lYh"), // retroflex lh

 // dental
 new KeyMap("\u0924\u094D", "t", "w"), // dental t
 new KeyMap("\u0925\u094D", "th", "W"), // dental th
 new KeyMap("\u0926\u094D", "d", "x"), // dental d
 new KeyMap("\u0927\u094D", "dh", "X"), // dental dh
 new KeyMap("\u0928\u094D", "n", "n"), // dental n

 // labials
 new KeyMap("\u092A\u094D", "p", "p"), // p
 new KeyMap("\u092B\u094D", "ph", "P"), // ph
 new KeyMap("\u092C\u094D", "b", "b"), // b
 new KeyMap("\u092D\u094D", "bh", "B"), // bh
 new KeyMap("\u092E\u094D", "m", "m"), // m

 // sibillants
 new KeyMap("\u0936\u094D", "\u015B", "S"), // palatal s
 new KeyMap("\u0937\u094D", "\u1E63", "R"), // retroflex s
 new KeyMap("\u0938\u094D", "s", "s"), // dental s
 new KeyMap("\u0939\u094D", "h", "h"), // h

 // semivowels
 new KeyMap("\u092F\u094D", "y", "y"), // y
 new KeyMap("\u0930\u094D", "r", "r"), // r
 new KeyMap("\u0932\u094D", "l", "l"), // l
 new KeyMap("\u0935\u094D", "v", "v"), // v


 // numerals
 new KeyMap("\u0966", "0", "0"), // 0
 new KeyMap("\u0967", "1", "1"), // 1
 new KeyMap("\u0968", "2", "2"), // 2
 new KeyMap("\u0969", "3", "3"), // 3
 new KeyMap("\u096A", "4", "4"), // 4
 new KeyMap("\u096B", "5", "5"), // 5
 new KeyMap("\u096C", "6", "6"), // 6
 new KeyMap("\u096D", "7", "7"), // 7
 new KeyMap("\u096E", "8", "8"), // 8
 new KeyMap("\u096F", "9", "9"), // 9

 // accents
 new KeyMap("\u0951", "|", "|"), // udatta
 new KeyMap("\u0952", "_", "_"), // anudatta
 new KeyMap("\u0953", null, "//"), // grave accent
 new KeyMap("\u0954", null, "\\"), // acute accent

 // miscellaneous
 new KeyMap("\u0933\u094D", "\u1E37", "L"), // retroflex l
 new KeyMap("\u093D", "'", "'"), // avagraha
 new KeyMap("\u0950", null, "om"), // om
 new KeyMap("\u0964", ".", ".") // single danda
 ];

 PhoneticMapper.call(this, map);
}

// Make HyderabadTirupati a subclass of PhoneticMapper
HyderabadTirupati.prototype = new PhoneticMapper();
delete HyderabadTirupati.prototype.map;
HyderabadTirupati.prototype.constructor = HyderabadTirupati;

// Define methods of SLP
HyderabadTirupati.prototype.getUnicode = function(current, prevchar, ch, /*out*/replace)
{
 replace[0] = true;

 if (current == null)
 {
 replace[0] = false;
 if (!this.isVowel(ch))
 return this.lookupKeystroke(ch).unicode;
 else
 return this.lookupKeystroke(ch, false).unicode;
 }

 var last = -1;
 if (current.length > 0)
 last = current.length - 1;

 if (last != -1)
 {
 // handle special cases

 if ((ch == '|' || ch == '_'))
 {
 if (current.charAt(last) != Unicode.Virama)
 return current + this.lookupKeystroke(ch, false).unicode;
 else
 return current + ch;
 }
 else if (ch == '.' && current.charAt(last) == Unicode.Danda)
 return Unicode.DoubleDanda;
 else if (prevchar == Unicode.A && (ch == 'i' || ch == 'u'))
 return this.lookupKeystroke("a" + ch, false).unicode;

 // if current syllable ends in a virama
 if (current.charAt(last) == Unicode.Virama)
 {
 replace[0] = true;
 if (!this.isVowel(ch))
 return current + this.lookupKeystroke(ch).unicode;
 else
 {
 var s = null;
 km = this.lookupKeystroke(ch, true);
 if (km != null)
 s = km.unicode;
 else if (ch == 'a')
 s = ""; // force virama to be dropped.
 else
 s = this.lookupKeystroke(ch, false).unicode; // probably an 'a'
 return current.substr(0, current.length - 1) + s;
 }
 }
 else
 {
 replace[0] = false;
 result = this.lookupKeystroke(ch, false);
 if (result != null)
 return result.unicode;
 else
 return ch;
 }
 }

 // hope we never reach here.
 return null;
}

HyderabadTirupati.prototype.isVowel = function (ch)
{
 if (ch == 'L' || ch == 'LY')
 return true;
 else
 {
 ch = ch.toLowerCase();
 return ch == 'a' || ch == 'e' || ch == 'i' || ch == 'o' || ch == 'u' || ch == 'q' || ch == 'x';
 }
}

HyderabadTirupati.prototype.getLayout = function()
{
/*This must correspond to the table contained with the div with id 'alphabet' (see Default.aspx)*/
 var cells =
 [
 'a', 'A', 'i', 'I', 'u', 'U', // first row
 'q', 'Q', 'L', 'LY',
 'e', 'E', 'o', 'O',
 'M', 'H',
 'k', 'K', 'g', 'G', 'f', // velar
 'c', 'C', 'j', 'J', 'F', // palatal
 't', 'T', 'd', 'D', 'N', // retroflex
 'lY', 'lYh', // special retroflex
 'w', 'W', 'x', 'X', 'n', // dental
 'p', 'P', 'b', 'B', 'm', // labial
 'y', 'r', 'l', 'v', // semivowel
 'S', 'R', 's', 'h', // sibillants
 'H', 'Z', 'V', 'M' // anusvara, visarga, etc.
 ];
 
 return cells;
}

/************************************************
* ITrans
************************************************/
function ITrans() // extends PhoneticMapper
{
 var map = [ 
 new KeyMap("\u0901", "?", ".N", true), // Candrabindu (smile with a dot on top of it)
 new KeyMap("\u0902", "\u1E41", ".n"), // Anusvara
 new KeyMap("\u0902", "\u1E41", "M"), // Anusvara (alternate) 
 new KeyMap("\u0902", "\u1E41", ".m"), // Anusvara (alternate)
 new KeyMap("\u0903", "\u1E25", "H"), // Visarga
 new KeyMap("\u1CF2", "\u1E96", "Z"), // jihvamuliya
 new KeyMap("\u1CF2", "h\u032C", "V"), // upadhmaniya
 new KeyMap("\u0905", "a", "a"), // a
 new KeyMap("\u0906", "\u0101", "aa"), // long a
 new KeyMap("\u0906", "\u0101", "A"), // long a (alternate)
 new KeyMap("\u093E", null, "aa", true),// long a attached
 new KeyMap("\u093E", null, "A", true), // long a attached (alternate)
 new KeyMap("\u0907", "i", "i"), // i
 new KeyMap("\u093F", null, "i", true), // i attached
 new KeyMap("\u0908", "\u012B", "ii"), // long i
 new KeyMap("\u0908", "\u012B", "I"), // long i (alternate)
 new KeyMap("\u0940", null, "ii", true),// long i attached
 new KeyMap("\u0940", null, "I", true), // long i attached (alternate)
 new KeyMap("\u0909", "u", "u"), // u
 new KeyMap("\u0941", null, "u", true), // u attached
 new KeyMap("\u090A", "\u016B", "uu"), // long u
 new KeyMap("\u090A", "\u016B", "U"), // long u (alternate)
 new KeyMap("\u0942", null, "uu", true),// long u attached
 new KeyMap("\u0942", null, "U", true), // long u attached (alternate)
 new KeyMap("\u090B", "\u1E5B", "R^i"), // vocalic r
 new KeyMap("\u0943", null, "R^i", true), // vocalic r attached
 new KeyMap("\u0960", "\u1E5D", "R^I"), // long vocalic r
 new KeyMap("\u0944", null, "R^I", true), // long vocalic r attached
 new KeyMap("\u090C", "\u1E37", "L^i"), // vocalic l
 new KeyMap("\u0962", null, "L^i", true), // vocalic l attached
 new KeyMap("\u0961", "\u1E39", "L^I"), // long vocalic l
 new KeyMap("\u0963", null, "L^I", true), // long vocalic l attached
 new KeyMap("\u090F", "e", "e"), // e
 new KeyMap("\u0947", null, "e", true), // e attached
 new KeyMap("\u0910", "ai", "ai"), // ai
 new KeyMap("\u0948", null, "ai", true), // ai attached
 new KeyMap("\u0913", "o", "o"), // o
 new KeyMap("\u094B", null, "o", true), // o attached
 new KeyMap("\u0914", "au", "au"), // au
 new KeyMap("\u094C", null, "au", true), // au attached

 // velars
 new KeyMap("\u0915\u094D", "k", "k"), // k
 new KeyMap("\u0916\u094D", "kh", "kh"), // kh
 new KeyMap("\u0917\u094D", "g", "g"), // g
 new KeyMap("\u0918\u094D", "gh", "gh"), // gh
 new KeyMap("\u0919\u094D", "\u1E45", "~N"), // velar n
 new KeyMap("~", "~", "~"), // ejf

 // palatals
 new KeyMap("\u091A\u094D", "c", "ch"), // c
 new KeyMap("\u091B\u094D", "ch", "Ch"), // ch
 new KeyMap("\u091C\u094D", "j", "j"), // j
 new KeyMap("\u091D\u094D", "jh", "jh"), // jh
 new KeyMap("\u091E\u094D", "\u00F1", "~n"), // palatal n

 // retroflex
 new KeyMap("\u091F\u094D", "\u1E6D", "T"), // retroflex t
 new KeyMap("\u0920\u094D", "\u1E6Dh", "Th"), // retroflex th
 new KeyMap("\u0921\u094D", "\u1E0D", "D"), // retroflex d
 new KeyMap("\u0922\u094D", "\u1E0Dh", "Dh"), // retroflex dh
 new KeyMap("\u0923\u094D", "\u1E47", "N"), // retroflex n

 // dental
 new KeyMap("\u0924\u094D", "t", "t"), // dental t
 new KeyMap("\u0925\u094D", "th", "th"), // dental th
 new KeyMap("\u0926\u094D", "d", "d"), // dental d
 new KeyMap("\u0927\u094D", "dh", "dh"), // dental dh
 new KeyMap("\u0928\u094D", "n", "n"), // dental n

 // labials
 new KeyMap("\u092A\u094D", "p", "p"), // p
 new KeyMap("\u092B\u094D", "ph", "ph"), // ph
 new KeyMap("\u092C\u094D", "b", "b"), // b
 new KeyMap("\u092D\u094D", "bh", "bh"), // bh
 new KeyMap("\u092E\u094D", "m", "m"), // m

 // semivowels
 new KeyMap("\u092F\u094D", "y", "y"), // y
 new KeyMap("\u0930\u094D", "r", "r"), // r
 new KeyMap("\u0932\u094D", "l", "l"), // l
 new KeyMap("\u0935\u094D", "v", "v"), // v
 new KeyMap("\u0935\u094D", "v", "w"), // v (alternate)

 // sibillants
 new KeyMap("\u0936\u094D", "\u015B", "z"), // palatal s
 new KeyMap("\u0937\u094D", "\u1E63", "Sh"), // retroflex s
 new KeyMap("\u0938\u094D", "s", "s"), // dental s
 new KeyMap("\u0939\u094D", "h", "h"), // h


 // numerals
 new KeyMap("\u0966", "0", "0"), // 0
 new KeyMap("\u0967", "1", "1"), // 1
 new KeyMap("\u0968", "2", "2"), // 2
 new KeyMap("\u0969", "3", "3"), // 3
 new KeyMap("\u096A", "4", "4"), // 4
 new KeyMap("\u096B", "5", "5"), // 5
 new KeyMap("\u096C", "6", "6"), // 6
 new KeyMap("\u096D", "7", "7"), // 7
 new KeyMap("\u096E", "8", "8"), // 8
 new KeyMap("\u096F", "9", "9"), // 9

 // accents
 new KeyMap("\u0951", "|", "|"), // udatta
 new KeyMap("\u0952", "_", "_"), // anudatta
 new KeyMap("\u0953", null, "//"), // grave accent
 new KeyMap("\u0954", null, "\\"), // acute accent

 // miscellaneous
 new KeyMap("\u0933\u094D", "\u1E37", "L"), // retroflex l
 new KeyMap("\u093D", "'", ".a"), // avagraha
 new KeyMap("\u0950", null, "om"), // om
 new KeyMap("\u0964", ".", ".") // single danda
 ];

 PhoneticMapper.call(this, map);
}
// Make ITrans a subclass of PhoneticMapper
ITrans.prototype = new PhoneticMapper();
delete ITrans.prototype.map;
ITrans.prototype.constructor = ITrans;

// Define methods of ITrans
ITrans.prototype.getUnicode = function(current, prevchar, ch, /*out*/replace)
{
// alert("getUnicode: " + current + "," + prevchar + "," + ch + "," + replace);
 replace[0] = true;

 if (current == null)
 {
 replace[0] = false;
 if (!this.isVowel(ch))
 return this.lookupKeystroke(ch).unicode;
 else
 return this.lookupKeystroke(ch, false).unicode;
 }

 var last = -1;
 if (current.length > 0)
 last = current.length - 1;

 if (last != -1)
 {
 // handle special cases
 if ((ch == 'i' || ch == 'u') && UnicodeLogic.isConsonent(current.charAt(last)))
 return current + this.lookupKeystroke("a" + ch, true).unicode; // convert a to either ai or au
 else if ((ch == 'i' || ch == 'u') && current.charAt(last) == Unicode.A)
 return this.lookupKeystroke("a" + ch, false).unicode; // convert a to either ai or au
 else if (ch == 'h' && current.charAt(last) == Unicode.Virama && UnicodeLogic.hasAspiration(current.charAt(last - 1)))
 return current.substr(0, last - 1) + UnicodeLogic.toAspirated(current.charAt(last - 1)) + Unicode.Virama;
 else if ((ch == '|' || ch == '_'))
 {
 if (current.charAt(last) != Unicode.Virama)
 return current + this.lookupKeystroke(ch, false).unicode;
 else
 return current + ch;
 }
 else if (ch == '.' && current.charAt(last) == Unicode.Danda)
 return Unicode.DoubleDanda;
 else if (prevchar == Unicode.A && (ch == 'i' || ch == 'u'))
 return this.lookupKeystroke("a" + ch, false).unicode;
 if (ch == 'a' && prevchar == Unicode.Danda)return Unicode.Avagraha; // ejf
 if (ch == 'n' && prevchar == Unicode.Danda)return Unicode.Anusvara; // ejf
 if (ch == 'm' && prevchar == Unicode.Danda)return Unicode.Anusvara; // ejf
 if (ch == 'N' && prevchar == Unicode.Danda)return Unicode.Candrabindu; // ejf
 //    alert("chk ~N:" );
 if (ch == 'N' && prevchar == '~'){
      var ans = this.lookupKeystroke("~N", true).unicode;
//     alert('chk ~N:' + ans);
  return ans; // ejf
 }
 // if current syllable ends in a virama
 if (current.charAt(last) == Unicode.Virama)
 {
 replace[0] = true;
 if (!this.isVowel(ch))
 return current + this.lookupKeystroke(ch).unicode;
 else
 {
 var s = null;
 var km = this.lookupKeystroke(ch, true);
 if (km != null)
 s = km.unicode;
 else if (ch == 'a')
 s = ""; // force virama to be dropped.
 else
 s = this.lookupKeystroke(ch, false).unicode; // probably an 'a'
 return current.substr(0, current.length-1) + s;
 }
 }
 else
 {
 replace[0] = false;
 var result = this.lookupKeystroke(ch, false);
 if (result != null)
 return result.unicode;
 else
 return ch.ToString();
 }
 }
 
 // hope we never reach here.
 return null;
}

ITrans.prototype.isVowel = function (ch)
{
 ch = ch.toLowerCase();
 return ch == 'a' || ch == 'e' || ch == 'i' || ch == 'o' || ch == 'u' || ch == 'q';
}

ITrans.prototype.getLayout = function()
{
/*This must correspond to the table contained with the div with id 'alphabet' (see Default.aspx)*/
 var cells =
 [
 'a', 'aa', 'i', 'ii', 'u', 'uu', // first row
 'R^i', 'R^I', 'L^i', 'L^I',
 'e', 'ai', 'o', 'au',
 '.n', 'H',
 'k', 'kh', 'g', 'gh', '~N', // velar
 'ch', 'Ch', 'j', 'jh', '~n', // palatal
 'T', 'Th', 'D', 'Dh', 'N', // retroflex
 'L^i', 'L^I', // special retroflex
 't', 'th', 'd', 'dh', 'n', // dental
 'p', 'ph', 'b', 'bh', 'm', // labial
 'y', 'r', 'l', 'v', // semivowel
 'z', 'Sh', 's', 'h', // sibillants
 'H', 'Z', 'V', '.n' // anusvara, visarga, etc.
 ];
 
 return cells;
}


/************************************************
* Velthuis
************************************************/
function Velthuis() // extends PhoneticMapper
{
 var map = [ 
 new KeyMap("\u0901", "MM", true), // Candrabindu
 new KeyMap("\u0902", "M"), // Anusvara
 new KeyMap("\u0903", "H"), // Visarga
 new KeyMap("\u0905", "a"), // a
 new KeyMap("\u0906", "A"), // long a
 new KeyMap("\u093E", "A", true), // long a attached
 new KeyMap("\u0907", "i"), // i
 new KeyMap("\u093F", "i", true), // i attached
 new KeyMap("\u0908", "I"), // long i
 new KeyMap("\u0940", "I", true), // long i attached
 new KeyMap("\u0909", "u"), // u
 new KeyMap("\u0941", "u", true), // u attached
 new KeyMap("\u090A", "U"), // long u
 new KeyMap("\u0942", "U", true), // long u attached
 new KeyMap("\u090B", "q"), // vocalic r
 new KeyMap("\u0943", "q", true), // vocalic r attached
 new KeyMap("\u0960", "Q"), // long vocalic r
 new KeyMap("\u0944", "Q", true), // long vocalic r attached
 new KeyMap("\u090C", "lq"), // vocalic l
 new KeyMap("\u0962", "lq", true), // vocalic l attached
 new KeyMap("\u0961", "lQ"), // long vocalic l
 new KeyMap("\u0963", "lQ", true), // long vocalic l attached
 new KeyMap("\u090F", "e"), // e
 new KeyMap("\u0947", "e", true), // e attached
 new KeyMap("\u0910", "ai"), // ai
 new KeyMap("\u0948", "ai", true), // ai attached
 new KeyMap("\u0913", "o"), // o
 new KeyMap("\u094B", "o", true), // o attached
 new KeyMap("\u0914", "au"), // au
 new KeyMap("\u094C", "au", true), // au attached

 // velars
 new KeyMap("\u0915\u094D", "k"), // k
 new KeyMap("\u0916\u094D", "kh"), // kh
 new KeyMap("\u0917\u094D", "g"), // g
 new KeyMap("\u0918\u094D", "gh"), // gh
 new KeyMap("\u0919\u094D", "z"), // velar n

 // palatals
 new KeyMap("\u091A\u094D", "c"), // c
 new KeyMap("\u091B\u094D", "ch"), // ch
 new KeyMap("\u091C\u094D", "j"), // j
 new KeyMap("\u091D\u094D", "jh"), // jh
 new KeyMap("\u091E\u094D", "x"), // palatal n

 // retroflex
 new KeyMap("\u091F\u094D", "T"), // retroflex t
 new KeyMap("\u0920\u094D", "Th"), // retroflex th
 new KeyMap("\u0921\u094D", "D"), // retroflex d
 new KeyMap("\u0922\u094D", "Dh"), // retroflex dh
 new KeyMap("\u0923\u094D", "N"), // retroflex n

 // dental
 new KeyMap("\u0924\u094D", "t"), // dental t
 new KeyMap("\u0925\u094D", "th"), // dental th
 new KeyMap("\u0926\u094D", "d"), // dental d
 new KeyMap("\u0927\u094D", "dh"), // dental dh
 new KeyMap("\u0928\u094D", "n"), // dental n

 // labials
 new KeyMap("\u092A\u094D", "p"), // p
 new KeyMap("\u092B\u094D", "ph"), // ph
 new KeyMap("\u092C\u094D", "b"), // b
 new KeyMap("\u092D\u094D", "bh"), // bh
 new KeyMap("\u092E\u094D", "m"), // m

 // sibillants
 new KeyMap("\u0936\u094D", "f"), // palatal s
 new KeyMap("\u0937\u094D", "S"), // retroflex s
 new KeyMap("\u0938\u094D", "s"), // dental s
 new KeyMap("\u0939\u094D", "h"), // h

 // semivowels
 new KeyMap("\u092F\u094D", "y"), // y
 new KeyMap("\u0930\u094D", "r"), // r
 new KeyMap("\u0932\u094D", "l"), // l
 new KeyMap("\u0935\u094D", "v"), // v


 // numerals
 new KeyMap("\u0966", "0"), // 0
 new KeyMap("\u0967", "1"), // 1
 new KeyMap("\u0968", "2"), // 2
 new KeyMap("\u0969", "3"), // 3
 new KeyMap("\u096A", "4"), // 4
 new KeyMap("\u096B", "5"), // 5
 new KeyMap("\u096C", "6"), // 6
 new KeyMap("\u096D", "7"), // 7
 new KeyMap("\u096E", "8"), // 8
 new KeyMap("\u096F", "9"), // 9

 // accents
 new KeyMap("\u0951", "|"), // udatta
 new KeyMap("\u0952", "_"), // anudatta
 new KeyMap("\u0953", "//"), // grave accent
 new KeyMap("\u0954", "\\"), // acute accent

 // miscellaneous
 new KeyMap("\u0933\u094D", "L"), // retroflex l
 new KeyMap("\u093D", "'"), // avagraha
 new KeyMap("\u0950", "om"), // om
 new KeyMap("\u0964", ".") // single danda
 ];

 PhoneticMapper.call(this, map);
}

// Make Velthuis a subclass of PhoneticMapper
Velthuis.prototype = new PhoneticMapper();
delete Velthuis.prototype.map;
Velthuis.prototype.constructor = Velthuis;

// Define methods of Velthuis
Velthuis.prototype.getUnicode = function(current, prevchar, ch, /*out*/replace)
{
 replace[0] = true;

 if (current == null)
 {
 replace[0] = false;
 if (!this.isVowel(ch))
 return this.lookupKeystroke(ch).unicode;
 else
 return this.lookupKeystroke(ch, false).unicode;
 }

 var last = -1;
 if (current.length > 0)
 last = current.length - 1;

 if (last != -1)
 {
 // handle special cases
 if ((ch == 'i' || ch == 'u') && UnicodeLogic.isConsonent(current.charAt(last)))
 return current + this.lookupKeystroke("a" + ch, true).unicode; // convert a to either ai or au
 else if ((ch == 'i' || ch == 'u') && current.charAt(last) == Unicode.A)
 return this.lookupKeystroke("a" + ch, false).unicode; // convert a to either ai or au
 else if (ch == 'h' && current.charAt(last) == Unicode.Virama && UnicodeLogic.hasAspiration(current.charAt(last - 1)))
 return current.substr(0, last - 1) + UnicodeLogic.toAspirated(current.charAt(last - 1)) + Unicode.Virama;
 else if ((ch == '|' || ch == '_'))
 {
 if (current.charAt(last) != Unicode.Virama)
 return current + this.lookupKeystroke(ch, false).unicode;
 else
 return current + ch;
 }
 else if (ch == '.' && current.charAt(last) == Unicode.Danda)
 return Unicode.DoubleDanda;
 else if (prevchar == Unicode.A && (ch == 'i' || ch == 'u'))
 return this.lookupKeystroke("a" + ch, false).unicode;

 // if current syllable ends in a virama
 if (current.charAt(last) == Unicode.Virama)
 {
 replace[0] = true;
 if (!this.isVowel(ch))
 return current + this.lookupKeystroke(ch).unicode;
 else
 {
 var s = null;
 var km = this.lookupKeystroke(ch, true);
 if (km != null)
 s = km.unicode;
 else if (ch == 'a')
 s = ""; // force virama to be dropped.
 else
 s = this.lookupKeystroke(ch, false).unicode; // probably an 'a'
 return current.substr(0, current.length-1) + s;
 }
 }
 else
 {
 replace[0] = false;
 var result = this.lookupKeystroke(ch, false);
 if (result != null)
 return result.unicode;
 else
 return ch.ToString();
 }
 }
 
 // hope we never reach here.
 return null;
}

Velthuis.prototype.isVowel = function (ch)
{
 ch = ch.toLowerCase();
 return ch == 'a' || ch == 'e' || ch == 'i' || ch == 'o' || ch == 'u' || ch == 'q';
}


/************************************************
* Vedatype
************************************************/
function Vedatype() // extends PhoneticMapper
{
 var map = [ 
 new KeyMap("\u0901", "?", "MM", true), // Candrabindu
 new KeyMap("\u0902", "\u1E41", "M"), // Anusvara
 new KeyMap("\u0903", "\u1E25", "H"), // Visarga
 new KeyMap("\u1CF2", "\u1E96", "Z"), // jihvamuliya
 new KeyMap("\u1CF2", "h\u032C", "V"), // upadhmaniya
 new KeyMap("\u0905", "a", "a"), // a
 new KeyMap("\u0906", "\u0101", "A"), // long a
 new KeyMap("\u093E", null, "A", true), // long a attached
 new KeyMap("\u0907", "i", "i"), // i
 new KeyMap("\u093F", null, "i", true), // i attached
 new KeyMap("\u0908", "\u012B", "I"), // long i
 new KeyMap("\u0940", null, "I", true), // long i attached
 new KeyMap("\u0909", "u", "u"), // u
 new KeyMap("\u0941", null, "u", true), // u attached
 new KeyMap("\u090A", "\u016B", "U"), // long u
 new KeyMap("\u0942", null, "U", true), // long u attached
 new KeyMap("\u090B", "\u1E5B", "q"), // vocalic r
 new KeyMap("\u0943", null, "q", true), // vocalic r attached
 new KeyMap("\u0960", "\u1E5D", "Q"), // long vocalic r
 new KeyMap("\u0944", null, "Q", true), // long vocalic r attached
 new KeyMap("\u090C", "\u1E37", "lq"), // vocalic l
 new KeyMap("\u0962", null, "lq", true), // vocalic l attached
 new KeyMap("\u0961", "\u1E39", "lQ"), // long vocalic l
 new KeyMap("\u0963", null, "lQ", true), // long vocalic l attached
 new KeyMap("\u090F", "e", "e"), // e
 new KeyMap("\u0947", null, "e", true), // e attached
 new KeyMap("\u0910", "ai", "ai"), // ai
 new KeyMap("\u0948", null, "ai", true), // ai attached
 new KeyMap("\u0913", "o", "o"), // o
 new KeyMap("\u094B", null, "o", true), // o attached
 new KeyMap("\u0914", "au", "au"), // au
 new KeyMap("\u094C", null, "au", true), // au attached

 // velars
 new KeyMap("\u0915\u094D", "k", "k"), // k
 new KeyMap("\u0916\u094D", "kh", "kh"), // kh
 new KeyMap("\u0917\u094D", "g", "g"), // g
 new KeyMap("\u0918\u094D", "gh", "gh"), // gh
 new KeyMap("\u0919\u094D", "\u1E45", "z"), // velar n

 // palatals
 new KeyMap("\u091A\u094D", "c", "c"), // c
 new KeyMap("\u091B\u094D", "ch", "ch"), // ch
 new KeyMap("\u091C\u094D", "j", "j"), // j
 new KeyMap("\u091D\u094D", "jh", "jh"), // jh
 new KeyMap("\u091E\u094D", "\u00F1", "x"), // palatal n

 // retroflex
 new KeyMap("\u091F\u094D", "\u1E6D", "T"), // retroflex t
 new KeyMap("\u0920\u094D", "\u1E6Dh", "Th"), // retroflex th
 new KeyMap("\u0921\u094D", "\u1E0D", "D"), // retroflex d
 new KeyMap("\u0922\u094D", "\u1E0Dh", "Dh"), // retroflex dh
 new KeyMap("\u0923\u094D", "\u1E47", "N"), // retroflex n

 // dental
 new KeyMap("\u0924\u094D", "t", "t"), // dental t
 new KeyMap("\u0925\u094D", "th", "th"), // dental th
 new KeyMap("\u0926\u094D", "d", "d"), // dental d
 new KeyMap("\u0927\u094D", "dh", "dh"), // dental dh
 new KeyMap("\u0928\u094D", "n", "n"), // dental n

 // labials
 new KeyMap("\u092A\u094D", "p", "p"), // p
 new KeyMap("\u092B\u094D", "ph", "ph"), // ph
 new KeyMap("\u092C\u094D", "b", "b"), // b
 new KeyMap("\u092D\u094D", "bh", "bh"), // bh
 new KeyMap("\u092E\u094D", "m", "m"), // m

 // sibillants
 new KeyMap("\u0936\u094D", "\u015B", "f"), // palatal s
 new KeyMap("\u0937\u094D", "\u1E63", "S"), // retroflex s
 new KeyMap("\u0938\u094D", "s", "s"), // dental s
 new KeyMap("\u0939\u094D", "h", "h"), // h

 // semivowels
 new KeyMap("\u092F\u094D", "y", "y"), // y
 new KeyMap("\u0930\u094D", "r", "r"), // r
 new KeyMap("\u0932\u094D", "l", "l"), // l
 new KeyMap("\u0935\u094D", "v", "v"), // v


 // numerals
 new KeyMap("\u0966", "0", "0"), // 0
 new KeyMap("\u0967", "1", "1"), // 1
 new KeyMap("\u0968", "2", "2"), // 2
 new KeyMap("\u0969", "3", "3"), // 3
 new KeyMap("\u096A", "4", "4"), // 4
 new KeyMap("\u096B", "5", "5"), // 5
 new KeyMap("\u096C", "6", "6"), // 6
 new KeyMap("\u096D", "7", "7"), // 7
 new KeyMap("\u096E", "8", "8"), // 8
 new KeyMap("\u096F", "9", "9"), // 9

 // accents
 new KeyMap("\u0951", "|", "|"), // udatta
 new KeyMap("\u0952", "_", "_"), // anudatta
 new KeyMap("\u0953", null, "//"), // grave accent
 new KeyMap("\u0954", null, "\\"), // acute accent

 // miscellaneous
 new KeyMap("\u0933\u094D", "\u1E37", "L"), // retroflex l
 new KeyMap("\u093D", "'", "'"), // avagraha
 new KeyMap("\u0950", null, "om"), // om
 new KeyMap("\u0964", ".", ".") // single danda
 ];

 PhoneticMapper.call(this, map);
}

// Make Vedatype a subclass of PhoneticMapper
Vedatype.prototype = new PhoneticMapper();
delete Vedatype.prototype.map;
Vedatype.prototype.constructor = Vedatype;

// Define methods of Vedatype
Vedatype.prototype.getUnicode = function(current, prevchar, ch, /*out*/replace)
{
 replace[0] = true;

 if (current == null)
 {
 replace[0] = false;
 if (!this.isVowel(ch))
 return this.lookupKeystroke(ch).unicode;
 else
 return this.lookupKeystroke(ch, false).unicode;
 }

 var last = -1;
 if (current.length > 0)
 last = current.length - 1;

 if (last != -1)
 {
 // handle special cases
 if ((ch == 'i' || ch == 'u') && UnicodeLogic.isConsonent(current.charAt(last)))
 return current + this.lookupKeystroke("a" + ch, true).unicode; // convert a to either ai or au
 if ((ch == 'ai' || ch == 'au'))
 {
 if (last >= 0)
 {
 if (current.charAt(last) == Unicode.Virama)
 return current.substr(0, last) + this.lookupKeystroke(ch, true).unicode; // use attached version of vowel
 else if (UnicodeLogic.isVowel(current[last]))
 return current + this.lookupKeystroke(ch, false).unicode; // use attached version of vowel
 }
 else
 return this.lookupKeystroke(ch, false).unicode;
 }
 else if ((ch == 'i' || ch == 'u') && current.charAt(last) == Unicode.A)
 return this.lookupKeystroke("a" + ch, false).unicode; // convert a to either ai or au
 else if (ch == 'h' && current.charAt(last) == Unicode.Virama && UnicodeLogic.hasAspiration(current.charAt(last - 1)))
 return current.substr(0, last - 1) + UnicodeLogic.toAspirated(current.charAt(last - 1)) + Unicode.Virama;
 else if ((ch == '|' || ch == '_'))
 {
 if (current.charAt(last) != Unicode.Virama)
 return current + this.lookupKeystroke(ch, false).unicode;
 else
 return current + ch;
 }
 else if (ch == '.' && current.charAt(last) == Unicode.Danda)
 return Unicode.DoubleDanda;
 else if (prevchar == Unicode.A && (ch == 'i' || ch == 'u'))
 return this.lookupKeystroke("a" + ch, false).unicode;

 // if current syllable ends in a virama
 if (current.charAt(last) == Unicode.Virama)
 {
 replace[0] = true;
 if (!this.isVowel(ch))
 return current + this.lookupKeystroke(ch).unicode;
 else
 {
 var s = null;
 var km = this.lookupKeystroke(ch, true);
 if (km != null)
 s = km.unicode;
 else if (ch == 'a')
 s = ""; // force virama to be dropped.
 else
 s = this.lookupKeystroke(ch, false).unicode; // probably an 'a'
 return current.substr(0, current.length-1) + s;
 }
 }
 else
 {
 replace[0] = false;
 var result = this.lookupKeystroke(ch, false);
 if (result != null)
 return result.unicode;
 else
 return ch.ToString();
 }
 }
 
 // hope we never reach here.
 return null;
}

Vedatype.prototype.isVowel = function (ch)
{
 ch = ch.toLowerCase();
 return ch == 'a' || ch == 'e' || ch == 'i' || ch == 'o' || ch == 'u' || ch == 'q';
}

Vedatype.prototype.getLayout = function()
{
/*This must correspond to the table contained with the div with id 'alphabet' (see Default.aspx)*/
 var cells =
 [
 'a', 'A', 'i', 'I', 'u', 'U', // first row
 'q', 'Q', 'lq', 'lQ',
 'e', 'ai', 'o', 'au',
 'M', 'H',
 'k', 'kh', 'g', 'gh', 'z', // velar
 'c', 'ch', 'j', 'jh', 'x', // palatal
 't', 'th', 'd', 'dh', 'N', // retroflex
 'L', 'l', // special retroflex
 't', 'th', 'd', 'dh', 'n', // dental
 'p', 'ph', 'b', 'ph', 'm', // labial
 'y', 'r', 'l', 'v', // semivowel
 'f', 'S', 's', 'h', // sibillants
 'H', 'Z', 'V', 'M' // anusvara, visarga, etc.
 ];
 
 return cells;
}


/******************************************
* Functions to manage the alphabet grid
*******************************************/
 var currentKeyMap = null;
 
/**
 * From "Javascript: The Definitive Guide" 5th edition by David Flanagan. Chapter 17
 * The drag() function is designed to be called
 * from an onmousedown event handler. Subsequent mousemove events will
 * move the specified element. A mouseup event will terminate the drag.
 * If the element is dragged off the screen, the window does not scroll.
 * This implementation works with both the DOM Level 2 event model and the
 * IE event model.
 * 
 * Arguments:
 *
 * elementToDrag: the element that received the mousedown event or
 * some containing element. It must be absolutely positioned. Its 
 * style.left and style.top values will be changed based on the user's
 * drag.
 *
 * event: the Event object for the mousedown event.
 **/


 function drag(elementToDrag, event) 
 {
 if (!event)
 event = window.event;
 var startX = event.clientX, startY = event.clientY; 
 var origX = elementToDrag.offsetLeft, origY = elementToDrag.offsetTop;
 var deltaX = startX - origX, deltaY = startY - origY;
 if (document.addEventListener) // DOM Level 2 event model
 { 
 document.addEventListener("mousemove", moveHandler, true);
 document.addEventListener("mouseup", upHandler, true);
 }
 else if (document.attachEvent) // IE 5+ Event Model
 { 
 elementToDrag.setCapture();
 elementToDrag.attachEvent("onmousemove", moveHandler);
 elementToDrag.attachEvent("onmouseup", upHandler);
 elementToDrag.attachEvent("onlosecapture", upHandler);
 }
 else // IE 4 Event Model
 { 
 var oldmovehandler = document.onmousemove; // used by upHandler() 
 var olduphandler = document.onmouseup;
 document.onmousemove = moveHandler;
 document.onmouseup = upHandler;
 }

 // We've handled this event. Don't let anybody else see it. 
 if (event.stopPropagation) event.stopPropagation(); // DOM Level 2
 else event.cancelBubble = true; // IE

 // Now prevent any default action.
 if (event.preventDefault) event.preventDefault(); // DOM Level 2
 else event.returnValue = false; // IE

 /**
 * This is the handler that captures mousemove events when an element
 * is being dragged. It is responsible for moving the element.
 **/
 function moveHandler(e) 
 { // ejf Nov 4, 2010. Now the virtual doesn't go off to the left or top
 // It can still go off the bottom or right. 
 if (!e) e = window.event; // IE Event Model
 var xnew = (e.clientX - deltaX); var ynew = (e.clientY - deltaY);
 if ((xnew > 0) && (ynew > 0)) {
 elementToDrag.style.left = (e.clientX - deltaX) + "px";
 elementToDrag.style.top = (e.clientY - deltaY) + "px";
 
 if (e.stopPropagation) e.stopPropagation(); // DOM Level 2
 else e.cancelBubble = true; // IE
 }
 }
 
 /**
 * This is the handler that captures the final mouseup event that
 * occurs at the end of a drag.
 **/
 function upHandler(e) 
 {
 if (!e) e = window.event; // IE Event Model
 if (document.removeEventListener) // DOM event model
 { 
 document.removeEventListener("mouseup", upHandler, true);
 document.removeEventListener("mousemove", moveHandler, true);
 }
 else if (document.detachEvent) // IE 5+ Event Model
 { 
 elementToDrag.detachEvent("onlosecapture", upHandler);
 elementToDrag.detachEvent("onmouseup", upHandler);
 elementToDrag.detachEvent("onmousemove", moveHandler);
 elementToDrag.releaseCapture();
 }
 else // IE 4 Event Model
 { 
 document.onmouseup = olduphandler;
 document.onmousemove = oldmovehandler;
 }

 // And don't let the event propagate any further.
 if (e.stopPropagation) e.stopPropagation(); // DOM Level 2
 else e.cancelBubble = true; // IE
 }
 }


 function positionHighlight(x, y, w, h)
 {
 var d = $("divHighlight");
 d.style.left = x;
 d.style.top = y;
 d.style.width = w;
 d.style.height = h;
 d.style.position ="absolute";
 }
 
 function displayValue(val)
 {
 alert(du(val));
 }

 function find()
 {
 var img = $("imgText");
 $("divHighlight").style.display="block";
 var el = $("txt1");
 var x = findPosX(img);
 var y = findPosY(img);
 $("txtUnicode").value = convertToHex(el.value);
 if (el.value == '\u0915\u0941\u0930\u094D\u0935\u0928\u094D') 
 positionHighlight(x+103, y+8, 52, 42);
 else if (el.value == '\u092A\u094D\u0930\u0928\u0947\u092E\u0939\u0947')
 positionHighlight(x+296, y+103, 81, 39);
 else
 {
 alert('not found');
 $("divHighlight").style.display="none";
 }
 }
 function coord()
 {
 var el = $("imgText");
 var x = findPosX(el);
 var y = findPosY(el);
 alert((event.x - x) + ", " + (event.y - y));
 }
 
 function setKeyMapping(km)
 {
 currentKeyMap = km;
 switch (km)
 {
 case "vedatype":
 VKI_keymap = new Vedatype();
 break;
 case "slp1":
 VKI_keymap = new SLP01();
 break;
 case "vt":
 VKI_keymap = new Velthuis();
 break;
 case "hk":
 VKI_keymap = new KyotoHarvard();
 break;
 case "wx":
 VKI_keymap = new HyderabadTirupati();
 break;
 case "pf": // Peter Freund
 VKI_keymap = new Vedatype();
 break;
 case "it": // ITrans
 keymap = new ITrans();
 break;
 default:
 VKI_keymap = new SLP01();
 break;
 }
 }
 
 function showPreferences()
 {
 VKI_close();
 var w = window.open("preferences.htm", "Preferences",
 "location=no,resizable=no,menubar=no,left=100,top=100,width=700,height=450,scrollbars=no", false);
// w.document.write(buildEncodingTable());
// w.document.close();
 }
 
 function buildEncodingTable()
 {
 var slp = new SLP01();
 var vt = new Vedatype();
 var hk = new KyotoHarvard();
 var ht = new HyderabadTirupati();
 var s = "<table border='1'>";
 s += "<tr><th>unicode</th><th>SLP01</th><th>Hyderabad-Tirupati</th><th>Kyoto-Harvard</th><th>Vedatype</th></tr>";
 for (var i=0; i<slp.map.length; i++)
 {
 if (!slp.map[i].attached)
 {
 s += "<tr><td>";
 s += slp.map[i].unicode;
 s += "</td><td>";
 s += slp.map[i].encoding;
 s += "</td><td>";
 s += ht.map[i].encoding;
 s += "</td><td>";
 s += hk.map[i].encoding;
 s += "</td><td>";
 s += vt.map[i].encoding;
 s += "</td></tr>"; 
 }
 }
 s += "</table>";
 
 return s;
 }

// findPosX and findPosY are from //www.sitepoint.com/forums/showthread.php?t=620402
 function findPosX(obj) 
 {
 var curleft = 0;
 if (obj.offsetParent) 
 {
 while (1) 
 {
 curleft+=obj.offsetLeft;
 if (!obj.offsetParent)
 break;
 obj=obj.offsetParent;
 }
 } 
 else if (obj.x)
 curleft+=obj.x;
 return curleft;
 }

 function findPosY(obj) 
 {
 var curtop = 0;
 if (obj.offsetParent) 
 {
 while (1) 
 {
 curtop+=obj.offsetTop;
 if (!obj.offsetParent)
 break;
 obj=obj.offsetParent;
 }
 } 
 else if (obj.y)
 curtop+=obj.y;
 return curtop;
 }

// Cookie functions from //www.quirksmode.org/js/cookies.html
 function createCookie(name,value,days) 
 {
 var expires = null;
 VKI_state[name] = value;
 if (days) 
 {
 var date = new Date();
 date.setTime(date.getTime()+(days*24*60*60*1000));
 expires = "; expires="+date.toGMTString();
 }
 else
 expires = "";
 
 document.cookie = name+"="+value+expires+"; path=/";
 }

 function readCookie(name) 
 {
 var nameEQ = name + "=";
 var ca = document.cookie.split(';');
 for(var i=0;i < ca.length;i++) 
 {
 var c = ca[i];
 while (c.charAt(0)==' ') 
 {
 c = c.substring(1,c.length);
 }
 if (c.indexOf(nameEQ) == 0) 
 return c.substring(nameEQ.length,c.length);
 }
 return null;
 }

 function eraseCookie(name) 
 {
 createCookie(name,"",-1);
 }

 function loadOrCreateCookie(h, name, value)
 {
 h[name] = readCookie(name);
 if (h[name] == null)
 createCookie(name, value);
 }

 function loadCookies(h)
 {
 loadOrCreateCookie(h, "inputType", "phonetic");
 loadOrCreateCookie(h, "phoneticInput", "slp1");
 loadOrCreateCookie(h, "unicodeInput", "devInscript");
 loadOrCreateCookie(h, "viewAs", "deva");
 loadOrCreateCookie(h, "serverOptions", "deva");
 loadOrCreateCookie(h, "tabNames", "MW");
 loadOrCreateCookie(h, "sAccent", "stdd");
 loadOrCreateCookie(h,"listOptions","hierarchical");
 }
 
 
 function setCookies(h)
 {
 createCookie("inputType", h["inputType"], 365);
 createCookie("phoneticInput", h["phoneticInput"], 365);
 createCookie("unicodeInput", h["unicodeInput"], 365);
 createCookie("viewAs", h["viewAs"], 365);
 createCookie("serverOptions", h["serverOptions"], 365);
 createCookie("tabNames", h["tabNames"], 365);
 createCookie("sAccent", h["sAccent"], 365);
 createCookie("listOptions",h["listOptions"],365);
 }
 
 function VKI_load()
 {
 loadCookies(VKI_state);
 setKeyMapping(VKI_state["phoneticInput"]);
 var kt = VKI_initializeViewState();
 VKI_buildAlphabetSkeleton(document.getElementsByTagName("html")[0]);
 VKI_buildKeyboardInputs(kt);
 } 
function VKI_initializeViewState()        //REB20101126 moved from VKI_load so functionality is also available from VKI_buildKeyboardInputs()
 {
 var kt;
 var type = VKI_state["inputType"];
 if (type == "phonetic")
 {
     kt = VKI_state["phoneticInput"];
     VKI_viewAs = VKI_state["viewAs"];
     VKI_passThrough = VKI_viewAs == "phonetic";
 }
 else if (type == "unicode")
 {
     kt = VKI_state["unicodeInput"];
     VKI_viewAs = null;
     VKI_passThrough = true;
 }
 return kt;
 }
 
 
 function VKI_buildAlphabetSkeleton(obj)
 {
 var div = document.createElement("div");
 obj.appendChild(div);
 div.id = 'alphabet';
 div.style.display = "none";
 
 // Create table for drag bar and an X (to close alphabet grid)
 var table = document.createElement("table");
 div.appendChild(table);
 table.id = 'topbar';
 
 var tbody = document.createElement("tbody");
 table.appendChild(tbody);
 
 var tr = document.createElement("tr");
 tbody.appendChild(tr);
 
 // The drag bar
 var th = document.createElement("th");
 tr.appendChild(th);
 th.width = 340;
 th.style.backgroundColor = "red";
 th.style.cursor = "pointer";
 //ejf th.title = "Move mouse to drag window";
 var node = document.createTextNode("..Drag Bar..");
 th.appendChild(node);
 
 //ejf start
 th.onmousedown = function(event){drag(VKI_keyboard, event)}
 // create the "clear" button (same code as in buildVirtualKeyboard)
 th = document.createElement("th");
 tr.appendChild(th);
 var clearer = document.createElement('span');
 th.appendChild(clearer);
 th.style.cursor = "pointer";
 clearer.id = "keyboardInputClear";
 clearer.appendChild(document.createTextNode("Clear"));
 clearer.title = "Clear this input";
 //clearer.onmousedown = function() { this.className = "pressed"; };
 //clearer.onmouseup = function() { this.className = ""; };
 th.onmouseover = function() { this.style.backgroundColor = "lightgrey"; }; // ejf
 th.onmouseout = function() { this.style.backgroundColor = "white"; }; // ejf
 clearer.onclick = function() 
 {
 VKI_target.value = "";
 VKI_target.focus();
 return false;
 };
 //ejf end
 
 // The "X"
 th = document.createElement("th");
 tr.appendChild(th);
 th.id = "closeWindow";
 th.style.cursor = "pointer";
 //ejf start
 node = document.createTextNode("X");
 th.appendChild(node);
 th.onmouseover = function() { this.style.backgroundColor = "lightgray"; }; // ejf
 th.onmouseout = function() { this.style.backgroundColor = "white"; }; // ejf
 th.onclick = function() { VKI_close(); };
 th.title = "Close this window";
 // ejf end
 
 // Create table for alphabet grid 

 var columns = 
 [ {num: 6, margin:"0px"}, // a - U
 {num: 4, margin:"52px"}, // f - X
 {num: 4, margin:"52px"}, // e - O
 {num: 2, margin:"103px"}, // M, H
 {num: 5, margin:"27px"}, // k - N
 {num: 5, margin:"27px"}, // c - Y
 {num: 5, margin:"27px"}, // w - R
 {num: 2, margin:"129px"}, // L, l
 {num: 5, margin:"27px"}, // t - n
 {num: 5, margin:"27px"}, // p - m
 {num: 4, margin:"52px"}, // y - v
 {num: 4, margin:"52px"}, // S - h
 {num: 4, margin:"52px"} // H - M
 ];
 
 for (var i = 0; i<columns.length; i++)
 {
 table = document.createElement("table");
 div.appendChild(table);
 
 if (i == 0)
 table.className = "alphacomplete";
 else
 table.className = "alphanotop";
 
 if (columns[i].margin != 0)
 table.style.marginLeft = columns[i].margin;

 tbody = document.createElement("tbody");
 table.appendChild(tbody);

 tr = document.createElement("tr");
 tbody.appendChild(tr);
 for (var j = 0; j<columns[i].num; j++)
 { 
 var td = document.createElement("td");
 tr.appendChild(td); 
 }
 } 
 }

 function setKeyMapping(km)
 {
 currentKeyMap = km;
 switch (km)
 {
 case "vedatype":
 VKI_keymap = new Vedatype();
 break;
 case "slp1":
 VKI_keymap = new SLP01();
 break;
 case "vt":
 VKI_keymap = new Velthuis();
 break;
 case "hk":
 VKI_keymap = new KyotoHarvard();
 break;
 case "wx":
 VKI_keymap = new HyderabadTirupati();
 break;
 case "pf": // Peter Freund
 VKI_keymap = new Vedatype();
 break;
 case "it": // ITrans
 VKI_keymap = new ITrans();
 break;
 default:
 VKI_keymap = new SLP01();
 break;
 }
 }
 
/******************************************
* Function to do code-spotting
*******************************************/
 function find()
 {
 var img = $("imgText");
 $("divHighlight").style.display="block";
 var el = $("txt1");
 var x = findPosX(img);
 var y = findPosY(img);
 $("txtUnicode").value = convertToHex(el.value);
 if (el.value == '\u0915\u0941\u0930\u094D\u0935\u0928\u094D') 
 positionHighlight(x+103, y+8, 52, 42);
 else if (el.value == '\u092A\u094D\u0930\u0928\u0947\u092E\u0939\u0947')
 positionHighlight(x+296, y+103, 81, 39);
 else
 {
 alert('not found');
 $("divHighlight").style.display="none";
 }
 }
 function coord()
 {
 var el = $("imgText");
 var x = findPosX(el);
 var y = findPosY(el);
 alert((event.x - x) + ", " + (event.y - y));
 }
 
// findPosX and findPosY are from //www.sitepoint.com/forums/showthread.php?t=620402
 function findPosX(obj) 
 {
 var curleft = 0;
 if (obj.offsetParent) 
 {
 while (1) 
 {
 curleft+=obj.offsetLeft;
 if (!obj.offsetParent)
 break;
 obj=obj.offsetParent;
 }
 } 
 else if (obj.x)
 curleft+=obj.x;
 return curleft;
 }

 function findPosY(obj) 
 {
 var curtop = 0;
 if (obj.offsetParent) 
 {
 while (1) 
 {
 curtop+=obj.offsetTop;
 if (!obj.offsetParent)
 break;
 obj=obj.offsetParent;
 }
 } 
 else if (obj.y)
 curtop+=obj.y;
 return curtop;
 }
