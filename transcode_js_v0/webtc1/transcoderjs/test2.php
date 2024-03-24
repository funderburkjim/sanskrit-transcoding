<html>
	<head>
		<title>Transcoder js - test 2</title>
		<script type="text/javascript" src="../../js/jquery-1.8.2.min.js"></script>
		<script type="text/javascript" src="transcoder1.js"></script>
		<script type="text/javascript" src="test2.js"></script>
	<!-- <script type="text/javascript" src="sprintf-0.6.js"></script> -->
<script>
jQuery(document).ready(function(){ 
    // Open a transcoder  file
    transcoder.dir = "../../utilities/transcoder/";
    // Note: with keydown, only upper case characters returned!!
    // Thankfully, keypress doesn't do this. However, 'keypress' does not
    // pass thru backspace and delete keys!!
    jQuery('#key').keydown(citation_keydown);    
    
    jQuery('#transLit').change(transLitFunction);
    jQuery('#filter').change(filterFunction);
    transLitFunction();
    filterFunction();
});
function transLitFunction() {
 jQuery('#inval').val(jQuery('#transLit').val());
}
function filterFunction() {
 jQuery('#outval').val(jQuery('#filter').val());
}
function citation_keydown(evt) {
 // assume keydown event handler.  Assume this event has been sanitized
 // by jQuery. The character code returned is always upper case, so the
 // shift key must be examined to detect the case of the character.
 // The keydown event also passes such keys as the backspace and delete
 // keys, which the keypress event does not pass.
 // This routine handles many events, but will not handle some events,
 // such as changing the insertion point, selecting and clearing, etc.
 // See //www.javascripter.net/faq/keycodes.htm for keycode information
 
 if (evt.ctrlKey || evt.altKey){
  //return true; // tell browser to handle keystroke.
  return false; // browser ignores - thus pasting text, e.g., is disabled.
 }
 // 
 var ch = String.fromCharCode(evt.keyCode);
 var keynum = evt.which;
 var isShift = evt.shiftKey 
 console.log('keyCode=',evt.keyCode,' keynum=',keynum,', isShift=',isShift);
 //alert('isShift = ' + isShift);
 if ((keynum == 10) || (keynum == 13)) {
  // call the 'getWord' function. Here, just do an alert
  alert('citation ready to process');
  return false;
 }
 var slptxt = jQuery('#slptxt').val();
 //console.log('slptxt starts as ',slptxt);
 if ((keynum == 46)|| (keynum == 8)){
  // delete and backspace
  // remove previous character from slptxt
  // $("#myselect :selected").text();
  var id = evt.target.id; // the id of this keydown event we are in
  var sel = jQuery("#" + id + " :selected").text();
  console.log('id=',id,', sel=',sel);
  if (sel == '') {
   // remove just the last character
   slptxt = slptxt.replace(/.$/,"");
  }else {
   // remove ALL the characters. This may be a non-standard behavior
   slptxt = '';
  }
 }else if ((65<=keynum) && (keynum<=90)){
  // A-Z
  if (!isShift) {
    ch = ch.toLowerCase();
  }
/* This doesn't work
 else if ( ch.toUpperCase() === ch && ch.toLowerCase() !== ch && !isShift )  {
   // caps lock is on. From stackoverflow.com
   alert('cap locks, shift= ' + isShift);
   ch = ch.toUpperCase();
  }
*/
  slptxt += ch; // append current character to slptxt
 }else if ((keynum == 54) && isShift) {
  // shifted '6'
  ch = '^';
  slptxt += ch; 
 }else if ((keynum == 190) && !isShift){
  // period
  ch = '.';
  slptxt += ch; 
 }else if ((keynum == 192) && isShift){
  // shifted back-quote = tilda
  ch = '~';
 }else {
  // ignore this character
  return false; 
 }
 //console.log('slptxt changes to ',slptxt);
 jQuery('#slptxt').val(slptxt);
 var newkey = citationTransform(slptxt);
 jQuery('#key').val(newkey);
 return false;
}
function citationTransform (txt) {
 // convert txt using transcoder, based on 'inval' and 'outval'
 // This may be viewed as a limitation of the transcoder files.
 var from1 = jQuery('#inval').val();
 var to = jQuery('#outval').val();
 var out = txt;
 
 if (from1 != 'slp1') {
  // first, transform 'from1' -> slp1
  out = transcoder.processString(txt,from1,'slp1');
 }
 // now, from slp1 to 'to'
 out = transcoder.processString(out,'slp1',to);
 return out;
}
</script>
	</head>
	<body>
	
  <table width="100%" cellpadding="5">
   <tr>
   <td>citation:&nbsp;
<?php
global $inithash;
 $init=$inithash['word'];
 $init="";
 echo '<input type="text" name="key" size="20" id="key" ';
 echo "value=\"$init\"" . "/>";
// echo 'onkeypress="return queryInputChar(evt);" />' . "\n";
?>
   </td>
   <td>input:&nbsp;
    <select name="transLit" id="transLit">
<?php
global $inithash;
 $init=$inithash['translit'];
 output_option("hk","Kyoto-Harvard",$init);
 output_option("slp1","SLP1",$init);
 output_option("itrans","ITRANS",$init);
?>
    </select>
   </td>
   <td>output:
    <select name="filter" id="filter">
<?php
global $inithash;
$init = $inithash['filter'];
output_option("deva","Devanagari Unicode",$init);
 output_option("hk","Kyoto-Harvard",$init);
 output_option("slp1","SLP1",$init);
 output_option("itrans","ITRANS",$init);
 output_option("roman","Roman Unicode",$init);
//  output_option("SktRomanCSX","Roman CSX",$init);
// output_option("SktRomanManjushreeCSX","Roman Manjushree CSX",$init);
?>
    </select>
   </td>
 </tr>
 <tr>
 <td>slptxt:&nbsp;<input type="text" name="slptxt" size="20" id="slptxt"
			 value="" readonly="readonly"/>
 </td>
 <td>inval:&nbsp;<input name="inval" id="inval" readonly="readonly"/></td>
 <td>outval:&nbsp;<input name="outval" id="outval" readonly="readonly"/></td>
 </tr>
</table>
	</body>
</html>

<?php
 function output_option ($value,$display,$initvalue) {
  echo "  <option value='$value'";
  if ($initvalue == $value) {
   echo " selected='selected'";
  }
  echo ">$display</option>\n";
}
?>
