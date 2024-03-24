<?php
//sanskrit/monier/disp2/monierlist.php
//ejf 11-17-2010: uses mwkeys database.  Assumes it is sorted in
// Sanskrit alphabetical order.
//ejf 09-24-2012  modified for sanskrit1d. Use sqlite databases
//ejf 10-11-2012  Only one input parameter style supported, for keyboard.
require_once('../utilities/utilities.php');
// interpret GET parameters.
// 'key'
$keyin = $_GET['key'];
//echo "real keyin = '$keyin'<br/>\n";
if (! $keyin) {$keyin = $argv[1];}
if (! $keyin) {$keyin='a';};
// for safety, limit # chars in keyin
$mkeylen=500; // needs to be large for unicode
if (strlen($keyin) > $mkeylen) {
//echo "changed keyin from '$keyin' to 'a'<br/>\n";
 $keyin = 'a';
}

// direction: either 'UP', 'DOWN', or 'CENTER' (default)
$direction = $_GET['direction'];
if(!$direction) {$direction = $argv[2];}
if (($direction != 'UP') && ($direction != 'DOWN')) {
 $direction = 'CENTER';
}
// Two 'styles' are supported, as determined by presence (or absence) of
//  'keyboard'
$keyboard = $_GET['keyboard'];
 // new style
 list($filter ,$filterin ) = getParameters_keyboard();
// $filter = transcoder_standardize_filter($filter1);
// $filterin = transcoder_standardize_filter($filterin1);

if (false ) { // dbg
 echo "keyboard = $keyboard<br/>";
 echo "filter = $filter<br/>";
 echo "filterin = $filterin<br/>";
}
$keyin1 = preprocess_unicode_input($keyin,$filterin);
$key = transcoder_processString($keyin1,$filterin,"slp1");
//echo "keyin = $keyin, filterin = $filterin, keyin1 = $keyin1, key = $key\n";
//echo "<p>DBG:keyboard=$keyboard<br> keyin = $keyin<br> filter = $filter<br> filterin = $filterin<br> keyin1 = $keyin1<br> key = $key</p>\n";
$meta = "<META HTTP-EQUIV=\"Content-Type\" CONTENT=\"text/html; charset=utf-8\">";
echo "$meta\n";
// step 1: get a match for key
$matches = match_key($key);
list($key1,$lnum1,$data1) = $matches[0];
//echo "key1=$key1\n"; exit;
// step 2:  get several keys preceding and several keys following $key1
$nprev=12;
$nnext=12;
if ($direction == 'UP') {
 $listmatches = list_center($key1,$lnum1,$data1,$nprev+$nnext,0);
}else if ($direction == 'DOWN') {
 $listmatches = list_center($key1,$lnum1,$data1,0,$nprev+$nnext);
}else {
 $listmatches = list_center($key1,$lnum1,$data1,$nprev,$nnext);
}
//echo "direction = $direction<br/>";

// step 3 format listmatches
$i=0;
$table="";
$nmatches = count($listmatches);
//echo "monierlist: listmatches has $nmatches entries<br/>";
while($i < $nmatches) {
 list($code,$key2,$lnum2,$data2) = $listmatches[$i];
// echo "$key2,$lnum2,$data2\n";
 $spc2='';
 if ($i == 0) {
  //  put 'upward button'
  $spc="&nbsp;&nbsp;";
  $out1 = "$spc<a  onclick='getWordlistUp_keyboard(\"<SA>$key2</SA>\");'><span style='$c'>&#x25B2;</span></a><br/>\n";  
  $table .= $out1;
 }
 $i++;
 if ($code == 0) {$c="color:teal";}
 else {$c="color:black";}
 $spc="";
 $out1 = "$spc<a  onclick='getWordAlt_keyboard(\"<SA>$key2</SA>\");'><span style='$c'><SA>$key2</SA></span></a>$spc2<br/>\n";

 $table .= $out1;
 if ($i == $nmatches) {
  //  put 'downward button'
  $spc="&nbsp;&nbsp;";
  $out1 = "$spc<a  onclick='getWordlistDown_keyboard(\"<SA>$key2</SA>\");'><span style='$c'>&#x25BC;</span></a><br/>\n";  
  $table .= $out1;
 }

}
// spit it out
$table1 = transcoder_processElements($table,"slp1",$filter,"SA");
echo $table1;
exit;
function preprocess_unicode_input($x,$filterin) {
 // when a unicode form is input in the citation field, for instance
 // rAma (where the unicode roman for 'A' is used), then,
 // the value present as 'keyin' is 'r%u0101ma' (a string with 9 characters!).
 // The transcoder functions assume a true unicode string, so keyin must be
 // altered.  This is what this function aims to accomplish.
 $hex = "0123456789abcdefABCDEF";
 $x1 = $x;
 if ($filterin == 'roman') {
  $x1 = preg_replace("/\xf1/","%u00f1",$x);
 }
 $ans = preg_replace_callback("/(%u)([$hex][$hex][$hex][$hex])/",
     "preprocess_unicode_callback_hex",$x1);
 return $ans;
}
function preprocess_unicode_callback_hex($matches) {
 $x = $matches[2]; // 4 hex digits
 $y = unichr(hexdec($x));
 return $y;
}
function getParameters_orig() {
 $filter0 = $_GET['filter'];
 $filterin0 = $_GET['transLit']; 
 if (!$filter0) {$filter0 = "SLP2SLP";}
 if (!$filterin0) {$filterin0 = "SLP2SLP";}
 return array($filter0,$filterin0);
}
function getParameters_keyboard() {
//inputType = $_GET['inputType'];
//unicodeInput = $_GET['unicodeInput'];
 $phoneticInput = $_GET['phoneticInput'];
 $serverOptions = $_GET['serverOptions'];
 $viewAs = $_GET['viewAs'];
 // deduce filter  and filterin  from the above
 $filterin = getParameters_keyboard_helper($viewAs,$phoneticInput);
 $filter = getParameters_keyboard_helper($serverOptions,$phoneticInput);
 if (false) { // dbg
  echo "getParameters_keyboard: phoneticInput = $phoneticInput <br/>";
  echo "getParameters_keyboard: serverOptions = $serverOptions <br/>";
  echo "getParameters_keyboard: viewAs = $viewAs <br/>";
  echo "getParameters_keyboard: filterin = $filterin <br/>";
  echo "getParameters_keyboard: filter = $filter <br/>";
 }
 return array($filter ,$filterin );
}
function getParameters_keyboard_helper($type,$phoneticInput) {
 if ($type == 'deva') {return $type;}
 if ($type == 'roman') {return $type;}
 if ($type == 'phonetic') {
  if ($phoneticInput == 'slp1') {return $phoneticInput;}
  if ($phoneticInput == 'hk') {return $phoneticInput;}
  if ($phoneticInput == 'it') {return 'itrans';}
  //if ($phoneticInput == 'it') {return $phoneticInput;}
  if ($phoneticInput == 'wx') {return $phoneticInput;}
 }
 // default: 
 return "slp1";
}
function match_key($key) {
 // this function 'guaranteed' to return an array with one entry
$matches = list1a($key);
$nmatches = count($matches);
//echo "chk1: $key, $nmatches\n";
if ($nmatches != 1) {
 $key1 = $key;
 $nmatches=0;
 $n1 = strlen($key1);
 while (($nmatches == 0) && ($n1 > 0)) {
  $key2 = substr($key,0,$n1);
  $matches = list1b($key2);
  $nmatches = count($matches);
  if ($nmatches == 0) {$n1--;}
 } 
}
if ($nmatches == 0) {
 $key = "a"; // sure to match
 $key1 = $key;
 $nmatches=0;
 $n1 = strlen($key1);
 while (($nmatches == 0) && ($n1 > 0)) {
  $key2 = substr($key,0,$n1);
  $matches = list1b($key2);
  $nmatches = count($matches);
  if ($nmatches == 0) {$n1--;}
 } 
}
 return $matches;
}
function list1a($key) {
// first exact match
$cmd = "sqlite3";
$sep = '{sqlite3}';
$db = "../sqlite/mwkeys.sqlite";
$sql = "select * from mwkeys where key = '$key'";
$cmd1 = "$cmd -separator $sep $db \"$sql\"";
$ans = shell_exec($cmd1);
$results = preg_split('/\n/',$ans);
$matches=array();
$nmatches=0;
$keylen = strlen($key);
$more=true;
foreach($results as $line) {
 if ($more) {
  list($key1,$lnum1,$data1) = preg_split("/$sep/",$line);
  if ($key1 == $key) {
   // why is this necessary (maybe case different, but matches anyway?)
   $matches[$nmatches]=array($key1,$lnum1,$data1);
   $nmatches++;
   $more=false;
  }
 }
}
return $matches;
}
function list1b($key) {
// first  partial match
$cmd = "sqlite3";
$sep = '{sqlite3}';
$db = "../sqlite/mwkeys.sqlite";
$sql = "select * from mwkeys where key LIKE '$key%'";
//$sql = "select * from `mwkeys` where `key` LIKE \"$key%\"";
$cmd1 = "$cmd -separator $sep $db \"$sql\"";
$ans = shell_exec($cmd1);
$results = preg_split('/\n/',$ans);
$matches=array();
$nmatches=0;
$keylen = strlen($key);
$more=true;
foreach($results as $line) {
 if ($more) {
  list($key1,$lnum1,$data1) = preg_split("/$sep/",$line);
  $keylen1 = strlen($key1);
  if (($keylen1 >= $keylen) && (substr($key1,0,$keylen) == $key)) {
   $matches[$nmatches]=array($key1,$lnum1,$data1);
   $nmatches++;
   $more=false;
  }
 }
}
return $matches;
}
function list_center($key0,$lnum0,$data0,$nprev,$nnext) {
$lnum1 = $lnum0 - $nprev;
$lnum2 = $lnum0 + $nnext;
if (false) { // dbg
 echo "list_center: key0=$key0<br/>";
 echo "list_center: lnum0=$lnum0<br/>";
 echo "list_center: data0=$data0<br/>";
 echo "list_center: nprev=$nprev<br/>";
 echo "list_center: nnext=$nnext<br/>";
 echo "list_center: lnum1=$lnum1<br/>";
 echo "list_center: lnum2=$lnum2<br/>";
}
$cmd = "sqlite3";
$sep = '{sqlite3}';
$db = "../sqlite/mwkeys.sqlite";
$sql = "select * from mwkeys where ('$lnum1' <= lnum) AND (lnum <= '$lnum2') order by lnum";
//$sql = "select * from `mwkeys` where (\"$lnum1\" <= `lnum`)AND (`lnum` <= \"$lnum2\") order by `lnum`";
$cmd1 = "$cmd -separator $sep $db \"$sql\"";
$ans = shell_exec($cmd1);
$results = preg_split('/\n/',$ans);
$matches=array();
$nmatches=0;
foreach($results as $line) {
 $line=trim($line);
 if ($line == ''){continue;}
 list($key3,$lnum3,$data3) = preg_split("/$sep/",$line);
 if ($lnum3 == $lnum0) {$code = 0;}
 else {$code=1;}
 $matches[]=array($code,$key3,$lnum3,$data3);
}
return $matches;
}

?>
