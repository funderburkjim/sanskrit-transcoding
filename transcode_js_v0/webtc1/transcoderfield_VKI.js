/* transcoderfield_VKI.js
 ejf. Oct 10, 2012
 installs a text input field for automatic translation of phonetic input.
 uses transcoder1.js
 uses jQuery.js
 Usage: The user will create a new object with the TranscoderField constructor:
   var myField = new TranscoderField(<id>,<action>);
   where <id> is the 'id' of a DOM input text field and
     <action> is a function (with no parameters) that is activated if the
     user presses the 'enter' key in the 'id' field.
     e.g. 
   var myField = new TranscoderField('key',myAction);
   function myAction() {alert('whatever');}

 When the user enters text into the 'id' field, the keystrokes are
 processed by routines in the myField object and saved in the
 internal variable myField.slptxt; what appears in the 'id' field is
 transcoder.processString(myField.slptxt,myField.tcFrom,myField.tcTo).
 Note that it is the user's responsibility to set the 'tcFrom' and 'tcTo'
 variables, which may be done by myField.transCoderChange(myfrom,myto),
 where 'myfrom' and 'myto' are determined in some manner from the 
 user interface.
 ejf Oct 15, 2012
   Adjust to work with keyboard.js.
     In this version, the constructor does NOT attach handlers for keydown and
     select events; rather, the 'install' method does this.
     There is an additional method 'addtxt' (for use with clicking the virtual 
     board) which processes incremental txt.
*/
// TranscoderField  object. Uses jQuery
var TranscoderField = function(id,returnCallback) {
 var thisobj = this; 
 // the id of the text field into which transformed keystrokes placed
 // the 'keydown', and 'select' events of DOM element 'id' are handled by
 // this TranscoderField object.
 this.id=id;  
 // tcFrom, tcTo are the transcoder parameters used to transform keystrokes.
 // The client must arrange to set these parameters.
 this.tcFrom = 'slp1';
 this.tcTo = 'slp1';
 // slptxt is an internal field, keeps the keystrokes of the user
 this.slptxt = ''; 
 // function called upon 'enter' key
 this.returnCallback = returnCallback; 
 this.debugid = ''; // if non-blank, the id of a text field used for debugging
 this.transform = function(txt) {
 // convert txt using transcoder, based on 'tcFrom', 'tcTo'.
 var from1 = thisobj.tcFrom;
 var to = thisobj.tcTo;
 var out = txt;
 if (from1 == to) {
     return out;
 }
 if (from1 != 'slp1') {
  // first, transform 'from1' -> slp1
  out = transcoder.processString(txt,from1,'slp1');
 }
 // now, from slp1 to 'to'
 out = transcoder.processString(out,'slp1',to);
 return out;
};
 this.keydown = function(evt) {
 //console.log(this);
 // assume keydown event handler.  Assume this event has been sanitized
 // by jQuery. The character code returned is always upper case, so the
 // shift key must be examined to detect the case of the character.
 // The keydown event also passes such keys as the backspace and delete
 // keys, which the keypress event does not pass.
 // This routine handles many events, but will not handle some events,
 // such as changing the insertion point, selecting and clearing, etc.
 // See //www.javascripter.net/faq/keycodes.htm for keycode information
 
 var ch = String.fromCharCode(evt.keyCode);
 var keynum = evt.which;
 // handle 'enter' or 'return' key
 if ((keynum == 10) || (keynum == 13)) {
  // newline, enter.
  // call the 'getWord' function. Here, just do an alert
  thisobj.returnCallback();
  return false;
 }
 if (thisobj.tcFrom == thisobj.tcTo)  {
     // let browser handle everything but return
     return true; 
 }
 if (evt.altKey){
  //return true; // tell browser to handle keystroke.
  return false; // browser ignores 
 }
 // cmdKey is for Mac. Trick from StackOverflow web site.
 // probably depends on jQuery event normalization.
 var cmdkey = evt.metaKey && ! evt.ctrlKey; 
 if (evt.ctrlKey || cmdkey){
  if (ch == 'A') {
   // Ctrl-a selects all text. Use the idiom that this means to remove
   // Other combinations, such as for pasting, are disabled.
   thisobj.select();
   return false; // browser ignores
  }
  if ((ch == 'X') || (ch == 'C') || (ch=='V')) {
   // disable cut, copy, paste
   return false; // browser ignores
  }
  return true; // browser processes (e.g. C-N for new window)
 }
 var isShift = evt.shiftKey 
 //console.log('keyCode=',evt.keyCode,' keynum=',keynum,', isShift=',isShift);
 var slptxt = thisobj.slptxt;
 if ((keynum == 46)|| (keynum == 8)){
  // delete and backspace
  // remove just the last character
   slptxt = slptxt.replace(/.$/,"");
 }else if ((65<=keynum) && (keynum<=90)){
  // A-Z
  if (!isShift) {
   // keynum returns the upper case of alphabetic characters
   // We assume that if the shift key is not down, then the
   // intended character is lower case
    ch = ch.toLowerCase();
  }
  slptxt += ch; // append current character to slptxt
 }else if (ch == ' ') {
  slptxt += ch; // append current character to slptxt
 }else if ((keynum == 54) && isShift) {
  // shifted '6'. This character used in ITRANS
  ch = '^';
  slptxt += ch; 
 }else if ((keynum == 190) && !isShift){
  // period. A danda; also used in ITRANS
  ch = '.';
  slptxt += ch; 
 }else if ((keynum == 192) && isShift){
  // shifted back-quote = tilda. Used in Itrans
  ch = '~';
  slptxt += ch; 
 }else {
  // ignore this character
  return false; 
 }
 thisobj.slptxt = slptxt;
 // for debugging, display spltxt in the 'slptxt' text field
 if (thisobj.debugid != '') {
  jQuery('#' + thisobj.debugid).val(slptxt);
 }
 // transform slptxt, and put it in the field of this object
 var newkey = thisobj.transform(slptxt);
 jQuery('#' + thisobj.id).val(newkey);
 return false;
 };
 this.addtxt = function(ch) {
  // ch is some txt
  var slptxt = thisobj.slptxt;
  slptxt += ch;
  thisobj.slptxt = slptxt;
  // for debugging, display spltxt in the 'slptxt' text field
  if (thisobj.debugid != '') {
   jQuery('#' + thisobj.debugid).val(slptxt);
  }
  // transform slptxt, and put it in the field of this object
  var newkey = thisobj.transform(slptxt);
  jQuery('#' + thisobj.id).val(newkey);
 };
 this.transCoderChange = function(inval,outval) {
  thisobj.tcFrom = inval;
  thisobj.tcTo = outval;
  thisobj.slptxt = '';
  jQuery('#' + thisobj.id).val("");
 };
 this.clear = function() {
  // blank the fields
  thisobj.slptxt = '';
  jQuery('#' + thisobj.id).val("");  
  if (thisobj.debugid != '') {
   jQuery('#' + thisobj.debugid).val("");
  }
 };
 this.select = function() {
  // A selection blanks the field, except when there is no translation
   if (thisobj.tcFrom == thisobj.tcTo)  {
     // let browser handle this
     return true; 
   }
   thisobj.clear();
 };
 this.install = function () {
  //   console.log('transcoderfield.install called');
  // final initialization to occur for the object
  // 1 bind the keydown event handler of the 'id' DOM object
  // to the keydown method of this object
  // Oct 16, 2012. Discovered it is necessary to first unbind the
  // event handlers for keydown and select.  Otherwise, there is
  // repetition of the keydown events; not sure why this happens; 
  // there are multiple  keydown handlers?
  var id = thisobj.id;
  jQuery('#' + id).unbind('keydown');
  jQuery('#' + id).unbind('select');
  //  initialize the text of the 'id' object.
  jQuery('#' + id).val("");
  // 4 optionally initialize text of the 'debug' object
  if (thisobj.debugid != '') {
   jQuery('#' + thisobj.debugid).val("");
  }
  // 3 bind the 'select' handlers
  jQuery('#' + id).keydown(thisobj.keydown); 
  jQuery('#' + id).select(thisobj.select); 
 };
}
