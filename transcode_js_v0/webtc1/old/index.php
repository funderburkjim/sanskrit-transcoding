<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "//www.w3.org/TR/html4/loose.dtd">
<html>
<!-- monier/webtc5/index.php Sep 26, 2012 ejf on sanskrit1d server
-->
 <head>
  <META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=utf-8">
  <title>Monier Williams Online 2011</title>
  <link rel="stylesheet" type="text/css" href="main.css" />
  <link rel="stylesheet" type="text/css" href="keyboard.css"/>
  <style type="text/css">
.keyboardInput {
 font-size: 16px;
 overflow:hidden;
 line-height:140%;
}
 </style>

  <script type="text/javascript" src="main.js"> </script>
  <script type="text/javascript" src="../js/jquery.min.js"></script>
  <script type="text/javascript" src="keyboard.js"></script>
  <script type="text/javascript">
	$(function(){
  	// Document is ready
  	VKI.load();
        loadFcn(); // in main.js
	});    				
 </script>
 <script type="text/javascript">
	// The preferencesAccessCount can be used to prevent caching
	var SLPreferencesAccessCount = 0;
	function updatePreferencesCount()
	{
		SLPreferencesAccessCount++;
	}
 </script>
<script type="text/javascript">
 function keyboard_HandleChar(event) {
 if (event.keyCode != 13) return;
 getWord_keyboard(false,false); //chg1
 if (event.stopPropagation) 
  event.stopPropagation();
 else event.cancelBubble = true;
 if (event.preventDefault) event.preventDefault();
 else event.returnValue = false;
 }
</script>

 </head>
 <body>
 <div id="dictid">
  
     <img id="unilogo" src="../images/cologne_univ_seal.gif"
           alt="University of Cologne" width="60" height="60" />
      <span class="dictname">Monier Williams Sanskrit-English Dictionary</span>
      <img id="shield" src="../images/brown_seal.jpg"
           alt="Brown University" width="40" height="60" />
      <span class="dictname" style="position:absolute; left:500px">
           (sanskritlibrary.org)</span>
  
 </div>
 <div id="dictnav">
 <ul class="nav"
   <li class="nav">
     <a class="nav" href="help/help.html" target="output">Help</a>
   </li>
<!--
   <li class="nav">
     &nbsp;<a class="nav" href="abbr.html" target="output">Abbreviations</a>
   </li>
-->
   <li class="nav">
    &nbsp;<a class="nav" href="email.html" target="output">Corrections</a>
   </li>
 <li class="nav"><a class="nav" href="../mwquery/index.php"  target="_blank">Advanced Search</a></li>
   <li class="nav">
    &nbsp;
    <!--<a class="nav" href="//www.sanskrit-lexicon.uni-koeln.de/index.html
       target="_top">
    -->
     <a href="//www.sanskritlibrary.org" target="_top">Home</a>
   </li> 
 </ul>
 </div>
<div id="citinput">
<span>citation:&nbsp;</span>
<?php
 $init=$_GET['key'];
 echo '<input type="text" name="key" size="20" id="key" ';
 if (!($init)) {
  $init = "";
 }
 echo "value=\"$init\"";
 echo 'onkeypress="return queryInputChar(event);" />' . "\n";
?>
</div>

<div id="inputsel">
<?php
 $init=$_GET['translit'];
 translit_selection($init);
?>
</div>
<div id="preferences">
<?php
 $translit_kb=$_GET['translit'];
 $filter_kb=$_GET['filter'];
 preference_selection_kb($translit_kb,$filter_kb);
?>
</div>

<div id="searchbtndiv">
 <input type="button" onclick="getWord();" value="Search" id="searchbtn" />
</div>
<div id="outputsel">
<?php
 $init=$_GET['filter'];
 filter_selection($init);
?>
</div>
<div id="disp">
</div>
<div id="displist" class="displist">
</div>
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
function translit_selection($init){
 echo "input:&nbsp;\n";
 echo '<select name="transLit" id="transLit">' . "\n";
 
 if (preg_match('/^SLP/',$init)) {
  $init="SLP2SLP";
 }
 output_option("HK","Harvard-Kyoto",$init);
 output_option("SLP2SLP","SLP1",$init);
 output_option("ITRANS","ITRANS",$init);
 output_option("SktRomanUnicode","Roman Unicode",$init);
 output_option("SktDevaUnicode","Devanagari Unicode",$init);
 echo "</select>\n";
}
function filter_selection($init) {
 echo "output:\n";
 echo '<select name="filter" id="filter">' . "\n";
 if (! $init) {
  $init="SktDevaUnicode";
 }else if ($init == "SLP2SLP") {
  $init="";
 }else if ($init == "HK") {
  $init = "SLP2HK";
 }else if ($init == "IRANS") {
  $init = "SLP2ITRANS";
 }
 output_option("SktDevaUnicode","Devanagari Unicode",$init);
 output_option("SLP2HK","Kyoto-Harvard",$init);
 output_option("","SLP1",$init);
 output_option("SLP2ITRANS","ITRANS",$init);
 output_option("SktRomanUnicode","Roman Unicode",$init);
// output_option("SktRomanCSX","Roman CSX",$init);
// output_option("SktRomanManjushreeCSX","Roman Manjushree CSX",$init);
  echo "</select>\n";
}
function preference_selection_kb($translit0,$filter0) {
 $msg='Hello';
 $x = "<textarea id='key1' name='TEXTAREA' class='keyboardInput' rows='1' cols='20' onkeydown='keyboard_HandleChar(event);'></textarea>";

 $y = "<input type='button' onclick='updatePreferencesCount(); showPreferences()' value='Preferences' style='position:relative; bottom: 5px;' />";
 echo "$y\n";
 echo "&nbsp;&nbsp;\n";
 echo "$x\n";
 $x = '&nbsp;<a class="nav" href="comments.html" target="_top">Comments</a>';
 echo "$x\n";
// $x = "<input id='key1a' type='text' class='keyboardInput' size='20' />";
// echo "$x\n";
}
?>
