<html>
<head>
 <title>Transcoderjs-test 5</title>
 <script type="text/javascript" src="../../js/jquery-1.8.2.min.js"></script>
 <script type="text/javascript" src="jquery.cookie.js"></script>
 <script type="text/javascript" src="transcoder3.js"></script>
 <script type="text/javascript" src="transcoderJson.js"></script>
 <script type="text/javascript" src="transcoderfield1.js"></script>
 <script type="text/javascript" src="test5.js"></script>
<script>

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
