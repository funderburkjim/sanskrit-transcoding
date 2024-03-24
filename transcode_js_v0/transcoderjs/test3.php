<html>
	<head>
		<title>Transcoder js - test 3</title>
		<script type="text/javascript" src="../../js/jquery-1.8.2.min.js"></script>
		<script type="text/javascript" src="transcoder1.js"></script>
		<script type="text/javascript" src="transcoderfield.js"></script>
	<!-- <script type="text/javascript" src="sprintf-0.6.js"></script> -->
<script>
jQuery(document).ready(function(){ 
    // Establish the server directory containing the transcoder xml files
    transcoder.dir = "../../utilities/transcoder/";
    // Note: with keydown, only upper case characters returned!!
    // Thankfully, keypress doesn't do this. However, 'keypress' does not
    // pass thru backspace and delete keys!!
    theTranscoderField = new TranscoderField('key',getWord); // name of input field
    // install 'transcoderChange' when the user elements for selecting the
    // input and output encodings change
    jQuery('#transLit').change(transcoderChange);
    jQuery('#filter').change(transcoderChange);
    // initialize transcoder for the current settings.
    transcoderChange();
    theTranscoderField.debugid = 'slptxt'; // for debugging
});
</script>
<script>

function transcoderChange() {
 // references various things pertaining to this page.
 var inval = jQuery('#transLit').val();
 var outval = jQuery('#filter').val();
 jQuery('#inval').val(inval);
 jQuery('#outval').val(outval);
 theTranscoderField.transCoderChange(inval,outval);
 jQuery('#slptxt').val('');
}
function getWord() {
 console.log('getWord: citation ready to process');
 console.log('slptxt=',theTranscoderField.slptxt);
 console.log('from=',theTranscoderField.tcFrom,', to=',theTranscoderField.tcTo);
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
 output_option("wx","Hyderabad-Tirupati",$init);
?>
    </select>
   </td>
   <td>output:
    <select name="filter" id="filter">
<?php
global $inithash;
$init = $inithash['filter'];
output_option("deva","Devanagari Unicode",$init);
output_option("roman","Roman Unicode",$init);
 output_option("hk","Kyoto-Harvard",$init);
 output_option("slp1","SLP1",$init);
 output_option("itrans","ITRANS",$init);
  output_option("wx","Hyderabad-Tirupati",$init);
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
