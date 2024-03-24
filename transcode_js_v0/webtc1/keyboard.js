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
 /* ejf Oct 8, 2012
  1. Change to have one global variable, 'VKI'. This minimizes the clutter of global namespace.
     All the VKI_x are changed to attributes of VKI, e.g., VKI.x
     Analogous changes are made in preferences.htm.
     Note 1: Required to change 'var VKI.x = ' to 'VKI.x ='
     Note 2: Required to change 'function VKI.f(parms)' to 'VKI.f = function(parms)'
     Note 3: Required to change VKI_load() to VKI.load() in index.php
     Note 4: We see 'this.VKI.x' in two spots.  Replace with 'VKI.x'
     Note 5: One instance of 'self.VKI.x', change to 'VKI.x'
     Note 6: in function VKI.attachKeyboard, insert 'elem.VKI = VKI'.
     Note 7: There are many instances of window.VKI.  In Javascript console, I determined that
             this is identical to VKI.  Why is window.VKI used?
     Note 8: There is one instance of td.VKI.clickless;  
             (in fcn VKI.buildKeys). ??
	     Oct 16, 2012. This causes a problem when preferences changes
	     to unicode.  Note the change
  ejf Oct 10, 2012
   Separated VKI.devAnalysis into two parts, and reformatted to so it is
   more readable
  ejf Oct 15, 2012
   Changed phonetic input to use transcoder.
   Additional js required: (in transcoderjs directory)
    transcoder3.js
    transcoderJson.js
   A variant of transcoderfield is tailored to interact with keyboard.js
    transcoderfield_VKI.js
   Logic changes:
    do NOT bind VKI.devAnalysis to the 'keypress' event; rather, 
    bind the keydown event to transcoderField.  
    
 */
/*************** Global variables **********************/
VKI = {}; 
VKI.keymap = null; // this must be initialized by web page
VKI.currentCaretPosition = 0;
VKI.showVersion = true;
VKI.version = "1.27"; // will be displayed in lower right corner of virtual keyboard if VKI.showVersion is true
VKI.target = null; // is text box or textarea that is associated with the virtual keyboard
VKI.visible = false; // set to true when user clicks virtual keyboard icon (see VKI.imageURI below)
VKI.shift = false; // set to true if a Shift key is typed (and then set back to false after next character is typed)
VKI.capslock = false; // toggled when Caps Lock ("Caps") key is toggled
VKI.alternate = false; // set to true if an Alt key is typed (and then set back to false after next character is typed)
VKI.dead = null; // set to a typed dead key
VKI.deadkeysOn = false; // this is the initial value of the dead keys checkbox in upper left corner of virtual keyboard.
VKI.deadkeysElem = null; // will point to dead keys checkbox
VKI.keyboard = null; // the virtual keyboard, initialized for each type of keyboard.
VKI.keymapTable = null; // used for the sanskrit grid.
VKI.topbar = null; // used for the sanskrit grid.
VKI.closer = null; // used for the sanskrit grid.
VKI.kt = "devInscript"; // Default keyboard layout
VKI.clearPasswords = false; // Clear password fields on focus
//VKI.imageURI = "//www.language.brown.edu/Sanskrit/software/keyboard/keyboard.png";
//VKI.imageURI = "//sanskrit1.ccv.brown.edu/tomcat/sl/keyboard.png"; // Aug 19, 2012 from Ralph Bunker
VKI.imageURI = "../webtc1/keyboard.png"; // This is a copy of the above on the Cologne system.
VKI.clickless = false; // if set to true then if mouse if over key for VKI.clicklessDelay milliseconds, key will fire
VKI.clicklessDelay = 500; // see comment on VKI.clickless above
VKI.keyCenter = 3; // the keys of any row with <= VKI.keyCenter keys will be centered. Used for last row which contains space bar and Alt key
VKI.passThrough = false; // if true then do not process phonetic keystrokes.
VKI.viewAs = null; // how the user wants to view the phonetic input
VKI.state = {}; // hash table containing cookie state
VKI.isIE = /*@cc_on!@*/false;
VKI.isIE6 = /*@if(@_jscript_version == 5.6)!@end@*/false;
VKI.isIElt8 = /*@if(@_jscript_version < 5.8)!@end@*/false;
VKI.isMoz = (navigator.product == "Gecko");
VKI.isWebKit = RegExp("KHTML").test(navigator.userAgent); // Safari uses WebKit Open Source project //webkit.org/
/* ***** Create keyboards ************************************** */
VKI.layout = {}; // an associative array containing keyboard layouts
VKI.layoutParameters = {}; // an associative array containing parameters for a layout. The current parameters are
 // DDK - (if true, no dead key checkbox will be displayed)
 // phonetic - (if true then context analysis (see phf) will be done before inserting a character
 // phf - a function that analyzes the context before inserting the character
VKI.type = {} // either initial default type or last type used for control (obj->VKI.kt) 
VKI.caret = {} // keep track of the cursor location for each control

VKI.qwerty = {
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

VKI.layout["trnRoman"] = [ // US Standard Keyboard with some additional diacritics for transliteration
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


VKI.layout["devInscript"] = [ // Devanagari
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
VKI.layoutParameters.devInscript = {DDK : true}; // disable dead keys
 
VKI.layout["devQWERTY"] = [ // Devanagari
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
VKI.layoutParameters.devQWERTY = {DDK : false, phonetic : false};

// Telugu Inscript
VKI.layout["telInscript"] = [ // Telugu
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
VKI.layoutParameters.telInscript = {DDK : true}; // disable dead keys

VKI.deadkey = {}; // no dead keys for now
 
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
VKI.buildKeyboardInputs = function(kt) 
{
 VKI.close();
 VKI.initializeViewState();        //REB20101126
 VKI.kt = kt;
 // make sure that each layout in VKI.layout has an object defined in VKI.layoutParameters
 for (var layoutName in window.VKI.layout)
 {
 if (!VKI.layoutParameters[layoutName])
 VKI.layoutParameters[layoutName] = {}; // all parameters will be default parameters
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
 VKI.type[ex.id] = kt; // this will be keyboard that onkeypress will use.
 VKI.attachKeyboard(ex);
 }
 }
 }

 /* ***** Build the keyboard interface (except for the keys) ************************** */
 if (VKI.layout[VKI.kt])
 VKI.buildVirtualKeyboard(kt); 
 else
 VKI.buildKeymapTable(kt);
} // end of function VKI.buildKeyboardInputs


VKI.buildKeymapTable = function(kt)
{
 if (VKI.keymapTable == null) // load first time, since next time will come from another window.
 VKI.keymapTable = document.getElementById("alphabet");
 VKI.keyboard = VKI.keymapTable;
 
 VKI.keyboard.style.backgroundColor = "white";
 
 if (VKI.topbar == null)
 VKI.topbar = $("topbar"); 
 var topbar = VKI.topbar;
 topbar.onmousedown = function (event) {drag(VKI.keyboard, event);}
 
 if (VKI.closer == null)
 VKI.closer = $("#closeWindow"); 
 var closer = VKI.closer[0];
 closer.onclick = function() { VKI.close(); };
 closer.title = "Close this window";
 closer.onmouseover = function() { this.style.backgroundColor = "gray"; };
 closer.onmouseup = function() { this.style.backgroundColor = "white"; };

 var tds = VKI.keyboard.getElementsByTagName("td");
 var cell = VKI.keymap.getLayout();
 for (var i=0; i<tds.length; i++)
 {
 var km = VKI.keymap.lookupKeystroke(cell[i], false)
 if (km == null)
 {
 alert(cell[i] + " not found in VKI.buildKeymapTable.");
 continue;
 }
 
 var td = tds[i]; // get next cell
 $(td).unbind("click");
 $(td).bind("click", function(evt) {return VKI.devAnalysis(evt)}); // use jQuery to get a browser independant event
 // add event handler to handle request of user to type a character
 //td.onclick = VKI.dispatchKey();
 
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


VKI.buildVirtualKeyboard = function(kt)
{
 VKI.keyboard = document.createElement('table');
 VKI.keyboard.id = "keyboardInputMaster";
 VKI.keyboard.dir = "ltr";
 VKI.keyboard.cellSpacing = window.VKI.keyboard.border = "0";

 // the header of table will have list of virtual keyboards, the dead keys checkbox, the clear and close buttons 
 var thead = document.createElement('thead');
 VKI.keyboard.appendChild(thead);
 
 var tr = document.createElement('tr');
 thead.appendChild(tr);
 
 var th = document.createElement('th');
 tr.appendChild(th); 

 var kbtype = document.createTextNode("drag bar");
 th.style.backgroundColor = "red";
 th.style.textAlign = "center";
 th.appendChild(kbtype);
 th.onmousedown = function(event){drag(VKI.keyboard, event)}
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
 VKI.target.value = "";
 VKI.target.focus();
 return false;
 };

 td.appendChild(createXButton(td));

 // this the rest of the virtual keyboard which will be filled in later with actual keys
 var tbody = document.createElement('tbody');
 VKI.keyboard.appendChild(tbody);

 tr = document.createElement('tr');
 tbody.appendChild(tr);

 td = document.createElement('td');
 tr.appendChild(td);

 td.colSpan = "2";
 var div = document.createElement('div');
 td.appendChild(div);

 div.id = "keyboardInputLayout";
 if (window.VKI.showVersion) 
 {
 div = document.createElement('div');
 td.appendChild(div);

 var ver = document.createElement('var');
 div.appendChild(ver);

 ver.appendChild(document.createTextNode("v" + window.VKI.version));
 }
 
 VKI.buildKeys(kt); // fill in virtual keyboard with default layout (VKI.kt)
 VKI.disableSelection(VKI.keyboard); // force user to activate it.
}

function createXButton()
{
 var closer = document.createElement('span');
 
 closer.id = "keyboardInputClose";
 closer.appendChild(document.createTextNode('X'));
 closer.title = "Close this window";
 closer.onmousedown = function() { this.className = "pressed"; };
 closer.onmouseup = function() { this.className = ""; };
 closer.onclick = function() { VKI.close(); };
 
 return closer;
}

// attach the keyboard to object elem
VKI.attachKeyboard = function(elem) 
{
 //if (elem.VKI.attached) 
 // return false;
    elem.VKI = VKI; // ejf, so elem.VKI.xx works properly
 var keybut = document.createElement('img');
 //keybut.src = this.VKI.imageURI;
 keybut.src = VKI.imageURI;
 keybut.alt = "Keyboard interface";
 keybut.className = "keyboardInputInitiator";
 keybut.title = "Display graphical keyboard interface";
 keybut.elem = elem;
 keybut.onclick = function() { 
  //self.VKI.show(this.elem); 
  VKI.show(this.elem); 
 }; 
 
 if (elem.VKI.attached)
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
 elem.VKI.attached = true;
 
 // This is a phonetic keyboard, so add keypress handler to element that is getting the keyboard.
 //if (VKI.layoutParameters[VKI.kt].phf)
 if (VKI.layout[VKI.kt] == null) {  
     VKI.transcoderField.install(); // ejf
/* these not required when using
 $(elem).unbind('keypress');
 $(elem).bind('keypress', function(evt) {return VKI.devAnalysis(evt)});
*/
 } else {
  elem.onkeypress = VKI.lookupKey(elem);
 }
 elem.onfocus = VKI.setCurrentTarget;
 elem.onmouseup = VKI.saveRange;
 elem.onkeyup = VKI.saveRange;
 
// if (this.VKI.isIE) 
 if (VKI.isIE) 
 {
 // guarantee that the range property of the textarea or textbox will reflect the current selection
 // if did document.selection.createRange() in VKI.insert instead, the selection would probably be the td that was clicked!
 elem.onclick = elem.onselect = elem.onkeyup = function(e) 
 {
 if ((e || event).type != "keyup" || !this.readOnly)
 this.range = document.selection.createRange();
 };
 }
}

// this function is called when either user clicks mouse in target or moves cursor with arrow keys
VKI.saveRange = function(obj)
{
 if (obj == null)
 obj = this;
 if (document.selection != null)
 obj.range = document.selection.createRange().duplicate();
}

// obj is either a text box (input type='text') or a textarea
VKI.getCaretPosition = function(obj)
{
 var caretPosition = 0;
 if (obj.setSelectionRange != null) // Mozilla, Opera and Konqueror
 {
 if (obj.readOnly && VKI.isWebKit) // it is so easy if it is not IE!!
 caretPosition = obj.selStart || 0;
 else 
 caretPosition = obj.selectionStart;
 } 
 else
 {
 if (obj.range != null) // see VKI.saveRange()
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


VKI.setCurrentTarget = function()
{
 VKI.target = this;
}

VKI.lookupKey = function(elem)
{
 if (document.selection) // if IE
 return function () {return VKI.lookupKeyHandler(event, elem)}; 
 else
 return function (evt) {return VKI.lookupKeyHandler(evt, elem)};
}


// define event handler for virtual keyboards that need no character analysis
function characterHandler() 
{ 
 if (window.VKI.deadkeysOn && window.VKI.dead) // if a dead key has previously been typed
 {
 if (window.VKI.dead != this.firstChild.nodeValue) // and this is not the key that represents the dead key
 {
 for (key in window.VKI.deadkey) // search the deadkey hash table for the previously entered dead key
 {
 if (key == window.VKI.dead) // if this is it
 {
 // since this function is called by an onclick attribute and was dynamically assigned, "this" points to td object that was clicked
 if (this.firstChild.nodeValue != " ") // this is key that was clicked after the dead key was clicked
 {
 for (var z = 0, rezzed = false, dk; dk = window.VKI.deadkey[key][z++];) 
 {
 if (dk[0] == this.firstChild.nodeValue) // if typed key found in list attached to dead key
 {
 window.VKI.insert(dk[1]); // insert the dead key modification (instead of the key that was typed)
 rezzed = true;
 break;
 }
 }
 } 
 else // if typed key is blank, just display the dead key
 {
 window.VKI.insert(VKI.dead);
 rezzed = true;
 } 
 break;
 }
 } // end of search the deadkey hash table for the previously entered dead key
 } // end if current key is not the previously typed dead key
 else 
 rezzed = true; // no dead key processing needed
 } // if a dead key has previously been typed
 
 VKI.dead = null; // force user to type a dead key again
 
 // If no insertion done above (rezzed=false) and the clicked key is not blank
 // If key is a dead key, set VKI.dead to it. Otherwise display key
 if (!rezzed && this.firstChild.nodeValue != "\xa0") 
 {
 if (VKI.deadkeysOn) 
 {
 for (key in VKI.deadkey) 
 {
 if (key == this.firstChild.nodeValue) 
 {
 VKI.dead = key;
 obj.className += " dead";
 if (VKI.shift) 
 VKI.modify("Shift");
 if (VKI.alternate) 
 VKI.modify("AltGr");
 break;
 }
 }
 if (!VKI.dead) 
 VKI.insert(this.firstChild.nodeValue);
 } // if dead keys on 
 else 
 VKI.insert(this.firstChild.nodeValue); // insert key without modification
 }

 VKI.modify("");
 return false; // to be sure that click is not further acted upon.
}


/* ****************************************************************
* Controls modifier keys
*/
VKI.modify = function(type) 
{
 if (VKI.kt == null)
 return; // phonetic does not have a virtual keyboard
 // toggle the control key
 switch (type) 
 {
 case "Alt":
 case "AltGr": VKI.alternate = !VKI.alternate; break;
 case "Caps": VKI.capslock = !VKI.capslock; break;
 case "Shift": VKI.shift = !VKI.shift; break;
 } 
 
 var vchar = 0;
 if (!VKI.shift != !VKI.capslock) // if both shift and capslock key are not on
 vchar += 1; // use uppercase version of key

 var tables = VKI.keyboard.getElementsByTagName('table');
 for (var x = 0; x < tables.length; x++) 
 {
 var tds = tables[x].getElementsByTagName('td');
 for (var y = 0; y < tds.length; y++) 
 {
 var className = [];
 var lkey = VKI.layout[VKI.kt][x][y]; // get array [x, X, alt x, alt X]

 if (tds[y].className.indexOf('hover') > -1) 
 className.push("hover");

 // decide how to modify appearance of keys
 switch (lkey[1]) 
 {
 case "Alt":
 case "AltGr":
 if (VKI.alternate) 
 className.push("dead");
 break;
 
 case "Shift":
 if (VKI.shift) 
 className.push("dead");
 break;
 
 case "Caps":
 if (VKI.capslock) 
 className.push("dead");
 break;
 
 case "Tab": 
 case "Enter": 
 case "Bksp": 
 break;
 
 default:
 if (type) 
 tds[y].firstChild.nodeValue = lkey[vchar + ((VKI.alternate && lkey.length == 4) ? 2 : 0)];
 
 if (VKI.deadkeysOn) 
 {
 var chr = tds[y].firstChild.nodeValue;
 if (VKI.dead) 
 {
 if (chr == VKI.dead) 
 className.push("dead");
 
 for (var z = 0; z < VKI.deadkey[VKI.dead].length; z++) 
 {
 if (chr == VKI.deadkey[VKI.dead][z][0]) 
 {
 className.push("target");
 break;
 }
 }
 }
 
 for (key in VKI.deadkey)
 {
 if (key === chr) 
 { 
 className.push("alive"); 
 break; 
 }
 }
 } // 
 } // end switch statement

 if (y == tds.length - 1 && tds.length > VKI.keyCenter) 
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
VKI.insert = function(text) 
{
 VKI.target.focus();
 var rng = null;
 if (typeof VKI.target.maxlength == "undefined" || VKI.target.maxlength < 0 || VKI.target.value.length < VKI.target.maxlength) 
 { // current length of field is less than maxlength
 if (VKI.target.setSelectionRange) // Mozilla, Opera and Konqueror
 {
 if (VKI.target.readOnly && VKI.isWebKit) 
 rng = [VKI.target.selStart || 0, VKI.target.selEnd || 0];
 else 
 rng = [VKI.target.selectionStart, VKI.target.selectionEnd];
 
 VKI.target.value = VKI.target.value.substr(0, rng[0]) + text + VKI.target.value.substr(rng[1]);
 if (text == "\n" && window.opera)
 rng[0]++;
 VKI.target.setSelectionRange(rng[0] + text.length, rng[0] + text.length); // collapse selection to caret
 if (VKI.target.readOnly && VKI.isWebKit) 
 {
 var range = window.getSelection().getRangeAt(0);
 VKI.target.selStart = range.startOffset;
 VKI.target.selEnd = range.endOffset;
 }
 } // end if Mozilla 
 else if (VKI.target.createTextRange != null) // IE
 {
 VKI.target.range.text = text;
 VKI.target.range.collapse(true);
 VKI.target.range.select();
 } // end if IE 
 else // don't try to insert, just append 
 VKI.target.value += text;
 
 if (VKI.shift) 
 VKI.modify("Shift");
 if (VKI.alternate) 
 VKI.modify("AltGr");
 VKI.target.focus();
 VKI.saveRange(VKI.target);
 } // end if max length not exceeded. 
 else if (VKI.target.createTextRange && VKI.target.range)
 VKI.target.range.select();
}


/* ****************************************************************
* Show the keyboard interface
*/
VKI.show = function(elem) 
{
 if (elem) // elem is not null
 {
 VKI.target = elem;
 if (VKI.visible != elem) // if it is not already visible
 {
 if (VKI.isIE) 
 {
 if (!VKI.target.range) 
 {
 VKI.target.range = VKI.target.createTextRange();
 VKI.target.range.moveStart('character', VKI.target.value.length);
 } 
 VKI.target.range.select();
 }
 
 try 
 { 
 VKI.keyboard.parentNode.removeChild(VKI.keyboard); 
 } 
 catch (e) {}
 
 if (VKI.clearPasswords && VKI.target.type == "password") 
 VKI.target.value = "";

 elem = VKI.target;
 VKI.target.keyboardPosition = "absolute";
 do 
 {
 if (VKI.getStyle(elem, "position") == "fixed") 
 {
 VKI.target.keyboardPosition = "fixed";
 break;
 }
 elem = elem.offsetParent;
 } while (elem);

 document.body.appendChild(VKI.keyboard);
 VKI.keyboard.style.top = VKI.keyboard.style.right = VKI.keyboard.style.bottom = VKI.keyboard.style.left = "auto";
 VKI.keyboard.style.position = VKI.target.keyboardPosition;
 VKI.keyboard.style.display = "block"; // in case display is "none"

 VKI.visible = VKI.target;
 VKI.position();
 VKI.target.focus();
 } // end if not already visible 
 else 
 VKI.close();
 } // end elem is not null
}



/* ****************************************************************
* Position the keyboard
*
*/
VKI.position = function() 
{
 if (VKI.visible) 
 {
 var inputElemPos = VKI.findPos(VKI.target);
 VKI.keyboard.style.top = inputElemPos[1] - ((VKI.target.keyboardPosition == "fixed" && !VKI.isIE && !VKI.isMoz) ? VKI.scrollDist()[1] : 0) + VKI.target.offsetHeight + 3 + "px";
 VKI.keyboard.style.left = Math.min(VKI.innerDimensions()[0] - VKI.keyboard.offsetWidth - 15, inputElemPos[0]) + "px";
 }
}


/* ****************************************************************
* Close the keyboard interface
*/
VKI.close = function() 
{ 
 if (VKI.visible) 
 {
 try 
 {
 VKI.keyboard.parentNode.removeChild(VKI.keyboard);
 } 
 catch (e) {}
 
 VKI.target.focus();
 //VKI.target = false;
 VKI.visible = false;
 }
}


/* ****************************************************************
* Build or rebuild the keyboard keys
*/
VKI.buildKeys = function(kt) 
{
 if (!kt || !VKI.layout[kt])
 {
 kt = null; // assume phonetic
 return;
 }
 
 VKI.kt = kt; 
 VKI.shift = false; 
 VKI.capslock = false;
 VKI.alternate = false;
 VKI.dead = false;
// VKI.deadkeysOn = (VKI.layoutParameters[kt].DDK == null) ? false : VKI.keyboard.getElementsByTagName('label')[0].getElementsByTagName('input')[0].checked;

 var container = VKI.keyboard.tBodies[0].getElementsByTagName('div')[0]; // div with id='keyboardInputLayout'
 while (container.firstChild) // each child is a table representing one row of the virtual keyboard
 {
 container.removeChild(container.firstChild);
 }

 // for each row of the current virtual keyboard
 for (var x = 0, hasDeadKey = false, lyt; lyt = VKI.layout[kt][x++];) 
 {
 var table = document.createElement('table'); // each row of virtual keyboard is represented by a table
 table.cellSpacing = table.border = "0";
 if (lyt.length <= VKI.keyCenter) 
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
 if (VKI.deadkeysOn)
 {
 for (key in VKI.deadkey)
 {
 if (key === lkey[0]) 
 { 
 className.push("alive"); 
 break; 
 }
 }
 }
 
 // if this is last key in row, add "last" to className array 
 if (lyt.length > VKI.keyCenter && y == lyt.length) 
 className.push("last");
 
 // if this is space bar, add "space" to className array
 if (lkey[0] == " ") 
 className.push("space");
 
 td.className = className.join(" "); // create string containing all selected class names sep'd by a blank

 //td.VKI.clickless = 0;
 VKI.clickless = 0; // changed Oct 16, 2012. See Note 8 at top
 
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
 if (VKI.clickless) 
 {
 clearTimeout(VKI.clickless);
 VKI.clickless = setTimeout(function() { this.click(); }, VKI.clicklessDelay);
 }
 
 if (this.firstChild.nodeValue != "\xa0") 
 this.className += " hover";
 };
 
 // add event handler that is called when user moves mouse off of key. Will change background color back.
 td.onmouseout = function() 
 {
 if (VKI.clickless) 
 clearTimeout(VKI.clickless);
 this.className = this.className.replace(/ ?(hover|pressed)/g, "");
 };
 
 // add event handler that is called when user presses mouse button. 
 td.onmousedown = function() 
 {
 if (VKI.clickless) 
 clearTimeout(VKI.clickless);
 if (this.firstChild.nodeValue != "\xa0") 
 this.className += " pressed";
 };
 
 // add event handler that is called when user lets go of mouse button
 td.onmouseup = function() 
 {
 if (VKI.clickless) 
 clearTimeout(VKI.clickless);
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
 return function() { VKI.modify(type); return false; }; 
 }
 )(lkey[1]);
 break;
 
 case "Tab":
 td.onclick = function() { VKI.insert("\t"); return false; };
 break;
 
 case "Bksp":
 td.onclick = doBksp;
 break;
 
 case "Enter":
 td.onclick = function() 
 {
 if (VKI.target.nodeName != "TEXTAREA") 
 {
 VKI.close();
 this.className = this.className.replace(/ ?(hover|pressed)/g, "");
 } 
 else 
 VKI.insert("\n");
 return true;
 };
 break;

 default:
 if (VKI.layoutParameters[kt].phonetic)
 td.onclick = VKI.layoutParameters[kt].phf; // e.g. devAnalysis
 else
 td.onclick = characterHandler;
 }

 for (var z = 0; z < 4; z++)
 if (VKI.deadkey[lkey[z] = lkey[z] || "\xa0"]) 
 hasDeadKey = true;
 } // end of for each key in row
 
 container.appendChild(table); // add table contain keyboard row to div
 } // end for each row of current keyboard
 
 if (VKI.deadkeysElem != null)
 VKI.deadkeysElem.style.display = (!VKI.layoutParameters[kt].DDK && hasDeadKey) ? "inline" : "none";
} // end function VKI.buildKeys


/* Execute a backspace */
function doBksp() 
{ 
 VKI.target.focus();
 var rng = null;
 if (VKI.target.setSelectionRange) // Not IE
 {
 if (VKI.target.readOnly && VKI.isWebKit) 
 rng = [VKI.target.selStart || 0, VKI.target.selEnd || 0];
 else 
 rng = [VKI.target.selectionStart, VKI.target.selectionEnd];
 
 if (rng[0] < rng[1]) 
 rng[0]++;
 VKI.target.value = VKI.target.value.substr(0, rng[0] - 1) + VKI.target.value.substr(rng[1]);
 VKI.target.setSelectionRange(rng[0] - 1, rng[0] - 1);
 if (VKI.target.readOnly && VKI.isWebKit) 
 {
 var range = window.getSelection().getRangeAt(0);
 VKI.target.selStart = range.startOffset;
 VKI.target.selEnd = range.endOffset;
 }
 } 
 else if (VKI.target.createTextRange) // IE
 {
 try 
 {
 VKI.target.range.select();
 } 
 catch(e) 
 { 
 VKI.target.range = document.selection.createRange(); 
 }
 if (!VKI.target.range.text.length) 
 VKI.target.range.moveStart('character', -1);
 VKI.target.range.text = "";
 } 
 else 
 VKI.target.value = VKI.target.value.substr(0, VKI.target.value.length - 1);
 
 if (VKI.shift) 
 VKI.modify("Shift");
 
 if (VKI.alternate) 
 VKI.modify("AltGr");
 
 VKI.target.focus();
 
 return true;
}


VKI.findPos = function(obj) 
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

VKI.innerDimensions = function() 
{
 if (document.documentElement && document.documentElement.clientHeight) 
 return [document.documentElement.clientWidth, document.documentElement.clientHeight];
 else if (document.body)
 return [document.body.clientWidth, document.body.clientHeight];
 else
 return [0, 0];
}

VKI.scrollDist = function() 
{
 var html = document.getElementsByTagName('html')[0];
 
 if (html.scrollTop && document.documentElement.scrollTop) 
 return [html.scrollLeft, html.scrollTop]; 
 else if (html.scrollTop || document.documentElement.scrollTop)
 return [html.scrollLeft + document.documentElement.scrollLeft, html.scrollTop + document.documentElement.scrollTop];
 else
 return [0, 0];
}

VKI.getStyle = function(obj, styleProp) 
{
 var y = null;
 if (obj.currentStyle) 
 y = obj.currentStyle[styleProp];
 else if (window.getComputedStyle)
 y = window.getComputedStyle(obj, null)[styleProp];
 
 return y;
}

// There doesn't appear to be anyway to enable the things that are disabled here
VKI.disableSelection = function(elem) 
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


VKI.replace = function(obj, len, text)
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
 VKI.saveRange(obj);
 }
 else if (obj.setSelectionRange != null) // Mozilla, Opera and Konqueror
 {
 var cp = VKI.getCaretPosition(obj); // ejf 'var'
 obj.value = obj.value.substr(0, cp-len) + text + obj.value.substr(cp);
 var newpos = cp - len + text.length;
 obj.setSelectionRange(newpos, newpos);
 obj.focus();
 }
}


VKI.getKeyChar = function(evt)
{
 var keynum = 0;
 if (!isNaN(evt.charCode)) // Netscape
 keynum = evt.charCode;
 else if (evt.keyCode)
 keynum = evt.keyCode;
 
 return String.fromCharCode(keynum);
}

VKI.lookupKeyHandler = function(evt, elem)
{
 var ch = VKI.getKeyChar(evt); 
 if (ch.charCodeAt(0) >= 0x20)
 {
 var mm = VKI.qwerty[ch]; // get what should be displayed
 var x = mm[0];
 var y = mm[1];
 var n = mm[2];
 if (evt.altKey || evt.ctrlKey)
 n += 2;
 ch = VKI.layout[VKI.kt][x][y][n];
 VKI.insert(ch);
 return false; // let Javascript know that we handled it.
 }
 else // control character, let browser handle it.
 return true;
}


// ch is character just typed
// idx is offset of caret in
// text which is the current value of the input area.
// ejf: Oct 11, 2012.  Separate VKI.devAnalysis into two parts
// ejf: Oct 15, 2012. devAnalysis now only responds to 'click' event.
VKI.devAnalysis = function(evt){
 // devanagari or roman transliteration display of phonetic input
    if (evt.type == "click"){
   // user must have clicked mouse on virtual keyboard
   return VKI.devAnalysis_keyboard(evt);
  }
}
VKI.devAnalysis_keyboard = function(evt) {
// fromVirtualKeyboard = true;

 // devanagari or roman transliteration display of phonetic input
 var rc = true; // browser handles keystroke
 var tagName = null;
 var el = null;
 var ch = null;
 
 el = evt.currentTarget;
 if (!el.$keystroke) {
    el = el.parentNode;
 }
 ch = el.$keystroke;
 VKI.transcoderField.addtxt(ch);
}

VKI.devAnalysis_old = function(evt){ 
 // NOT USED (Oct 15, 2012)
 // devanagari or roman transliteration display of phonetic input
  if (evt.type == "keypress"){
    // called from keypress event handler
   return VKI.devAnalysis_keypress_old(evt);
  }else {
   // user must have clicked mouse on virtual keyboard
   return VKI.devAnalysis_keyboard_old(evt);
  }
}

VKI.devAnalysis_keypress_old = function(evt){
// NOT USED (Oct 15, 2012)
//  var fromVirtualKeyboard = false;
 var rc = true; // browser handles keystroke
 if (evt.ctrlKey || evt.altKey) {
   return rc; 
 }
 if (VKI.passThrough) {
  return rc;
 }
 var tagName = null;
 var el = null;
 var ch = String.fromCharCode(evt.which); 
 var idx = VKI.getCaretPosition(VKI.target);
 //?? will this do a copy? Probably not since strings are immutable
 var text = VKI.target.value; 
 if (VKI.keymap.legalCharacter(ch)) {
  if (VKI.viewAs == "roman") {
   var km = VKI.keymap.lookupKeystroke(ch, false);
   VKI.insert(km.encodingRoman);
   rc = false;
  }else {
   //viewas = "deva"
   var replace = [true];
   var current = UnicodeLogic.getSyllable(text, idx - 1);
   var prevchar = idx > 0 ? text.charAt(idx - 1) : '\0'; 
   var newSyllable = VKI.keymap.getUnicode(current, prevchar, ch, replace);
   if (newSyllable != null) { 
    // if character was intercepted by keymap
    if (replace[0]) {
     // e.g., current ends with virama
     if (current != null){
      VKI.replace(VKI.target, current.length, newSyllable);
     }else{
      VKI.replace(VKI.target, 1, newSyllable);
     }
    }else {
     VKI.insert(newSyllable); 
    }
    rc = false; // let browser know we have handled keystroke 
   }else {
    // do nothing, leave character as is.
    rc = true;
   }
  }
 } else {
  // not a legal character
  VKI.currentCaretPosition++;
  rc = true; 
 } 
 return rc;
}

VKI.devAnalysis_keyboard_old = function(evt) {
// fromVirtualKeyboard = true;

 // devanagari or roman transliteration display of phonetic input
 var rc = true; // browser handles keystroke
 var tagName = null;
 var el = null;
 var ch = null;
 
 el = evt.currentTarget;
 if (!el.$keystroke) {
    el = el.parentNode;
 }
 ch = el.$keystroke;
 if (VKI.passThrough){
  VKI.insert(ch);
  return false;
 }
    console.log('(VKI.devAnalysis_keyboard): ch=',ch);
 var idx = VKI.getCaretPosition(VKI.target);
 //?? will this do a copy? Probably not since strings are immutable
 var text = VKI.target.value; 

 if (VKI.keymap.legalCharacter(ch)) {
  if (VKI.viewAs == "roman") {
   var km = VKI.keymap.lookupKeystroke(ch, false);
   VKI.insert(km.encodingRoman);
   rc = false;
  } else {
   var replace = [true];
   var current = UnicodeLogic.getSyllable(text, idx - 1);
   var prevchar = idx > 0 ? text.charAt(idx - 1) : '\0'; 
   var newSyllable = VKI.keymap.getUnicode(current, prevchar, ch, replace);
   if (newSyllable != null)  {
    // if character was intercepted by keymap
    if (replace[0]) {
     // e.g., current ends with virama
     if (current != null)  {
      VKI.replace(VKI.target, current.length, newSyllable);
     }else {
      VKI.replace(VKI.target, 1, newSyllable);
     }
    } else {
     VKI.insert(newSyllable); 
    }
    rc = false; // let browser know we have handled keystroke 
   } else  {
   // do nothing, leave character as is.
     rc = true;
   }
  }
 } else {
  VKI.insert(this.firstChild.nodeValue);
  VKI.currentCaretPosition++;
  // do nothing, leave character as is.
  rc = true; 
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
 window.addEventListener('resize', VKI.position, false);
// window.addEventListener('load', VKI.buildKeyboardInputs, false);
}
else if (window.attachEvent)
{
 window.attachEvent('onresize', VKI.position);
// window.attachEvent('onload', VKI.buildKeyboardInputs);
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
 VKI.keymap = new Vedatype();
 break;
 case "slp1":
 VKI.keymap = new SLP01();
 break;
 case "vt":
 VKI.keymap = new Velthuis();
 break;
 case "hk":
 VKI.keymap = new KyotoHarvard();
 break;
 case "wx":
 VKI.keymap = new HyderabadTirupati();
 break;
 case "pf": // Peter Freund
 VKI.keymap = new Vedatype();
 break;
 case "it": // ITrans
 keymap = new ITrans();
 break;
 default:
 VKI.keymap = new SLP01();
 break;
 }
 }
 
 function showPreferences()
 {
 VKI.close();
 /* for debugging, allow regular browser window 
     var w = window.open("preferences.htm", "Preferences","",false);
 */
/* original */
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
 VKI.state[name] = value;
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
// for some reason, the cookies had a string value of 'undefined',
// so the check that cookie was undefined did not work.
 var temp = readCookie(name);
     if ((!temp)||(temp === 'undefined')) {
         createCookie(name, value);
     }else {
	 h[name]=temp;
     }
 }
function old_loadOrCreateCookie(h, name, value)
 {
  h[name] = readCookie(name);
  if (h[name] == null) {
   createCookie(name, value);
  }
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
 
 VKI.load = function()
 {
 loadCookies(VKI.state);
 setKeyMapping(VKI.state["phoneticInput"]);
 var kt = VKI.initializeViewState();
 VKI.buildAlphabetSkeleton(document.getElementsByTagName("html")[0]);
 VKI.buildKeyboardInputs(kt);
 } 
VKI.initializeViewState = function()        //REB20101126 moved from VKI.load so functionality is also available from VKI.buildKeyboardInputs()
 {
 var kt;
 var type = VKI.state["inputType"];
 if (type == "phonetic")
 {
     kt = VKI.state["phoneticInput"];
     VKI.viewAs = VKI.state["viewAs"];
     VKI.passThrough = VKI.viewAs == "phonetic";
 }
 else if (type == "unicode")
 {
     kt = VKI.state["unicodeInput"];
     VKI.viewAs = null;
     VKI.passThrough = true;
 }
 return kt;
 }
 
 
 VKI.buildAlphabetSkeleton = function(obj)
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
 th.onmousedown = function(event){drag(VKI.keyboard, event)}
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
 VKI.target.value = "";
 VKI.target.focus();
// handle coordination with transcoderField, if phonetic input
 //console.log('clearer.onclick: ',VKI.state,VKI.state['inputType']);
 if (VKI.state['inputType']=='phonetic') {
	 VKI.transcoderField.clear();
 }
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
 th.onclick = function() { VKI.close(); };
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
 VKI.keymap = new Vedatype();
 break;
 case "slp1":
 VKI.keymap = new SLP01();
 break;
 case "vt":
 VKI.keymap = new Velthuis();
 break;
 case "hk":
 VKI.keymap = new KyotoHarvard();
 break;
 case "wx":
 VKI.keymap = new HyderabadTirupati();
 break;
 case "pf": // Peter Freund
 VKI.keymap = new Vedatype();
 break;
 case "it": // ITrans
 VKI.keymap = new ITrans();
 break;
 default:
 VKI.keymap = new SLP01();
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
