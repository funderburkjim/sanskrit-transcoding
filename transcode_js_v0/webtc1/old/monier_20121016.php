<?php
//sanskrit/monier/disp2/monier.php
//ejf 11-04-2009
//ejf 11-09-2010
//ejf 09-24-2012  modified for sanskrit1d
//ejf 10-11-2012  modified to support just one style, 'keyboard'.
//  I think the other style (translit,filter) is old, and not needed.
// connecting, selecting database
$dir = dirname(__FILE__); //directory containing this php file
require_once('../utilities/utilities.php');
// reuse the standard monier display
include("../webtc/monierdisp.php");
// use relative pathnames for the sqlite databases (see $db=.. below)
// interpret GET parameters.
// 'key'
$keyin = $_GET['key'];
if (! $keyin) {$keyin='a';};
// new style
 list($filter ,$filterin ) = getParameters_keyboard();


$keyin1 = preprocess_unicode_input($keyin,$filterin);
$key = transcoder_processString($keyin1,$filterin,"slp1");

$meta = "<META HTTP-EQUIV=\"Content-Type\" CONTENT=\"text/html; charset=utf-8\">";
echo "$meta\n";
//echo "<p>DBG: keyin=$keyin, filter=$filter, filterin=$filterin, keyin1=$keyin1, key=$key</p>";
// Establish some sqlite parameters
$cmd = "sqlite3";
$sep = '{sqlite3}';

//$sql = "select * from `mwkeys` where `key`=\"$key\"";
//$result=mysql_query($sql) or die('mysql query failed: ' . mysql_error());
//while ($line = mysql_fetch_array($result,MYSQL_ASSOC)) {
$db = "../sqlite/mwkeys.sqlite";
$sql = "select * from mwkeys where key='$key'";
$cmd1 = "$cmd -separator $sep $db \"$sql\"";
$ans = shell_exec($cmd1);
$results = preg_split('/\n/',$ans);
// get $keydata1 from $key using mwkeys table
$keydata1 = '';
foreach($results as $line) {
 list($key1,$lnum1,$data1) = preg_split("/$sep/",$line);
 if ($key1 == $key) {
  $keydata1 = $data1;
 }
}
$matches=array();
$nmatches=0;
if ($keydata1 != '') {
 $recs=preg_split('/;/',$keydata1);
 foreach ($recs as $rec) {
  list($hcode,$L1,$L2) = preg_split('/,/',$rec);
  $db = "../sqlite/sanskrit.sqlite";
  $sql="select * from monier where  $L1 <= lnum and lnum <= $L2  order by lnum";
  $cmd1 = "$cmd -separator $sep $db \"$sql\"";
  $ans = shell_exec($cmd1);
  $results = preg_split('/\n/',$ans);
  foreach($results as $line) {
   list($key1,$lnum1,$data1) = preg_split("/$sep/",$line);
   $matches[$nmatches]=$data1;
   $nmatches++;
  }
 } 
}


if ($nmatches == 0) {
 echo "<h2>not found: $keyin1</h2>\n";
 exit;
}

$table = monierDisplay($key,$matches,$filter );
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
function getParameters_keyboard() {
//inputType = $_GET['inputType'];
//unicodeInput = $_GET['unicodeInput'];
 $phoneticInput = $_GET['phoneticInput'];
 $serverOptions = $_GET['serverOptions'];
 $viewAs = $_GET['viewAs'];
 // deduce filter  and filterin  from the above
 $filterin = getParameters_keyboard_helper($viewAs,$phoneticInput);
 $filter = getParameters_keyboard_helper($serverOptions,$phoneticInput);
 return array($filter ,$filterin );
}
function getParameters_keyboard_helper($type,$phoneticInput) {
 if ($type == 'deva') {return $type;}
 if ($type == 'roman') {return $type;}
 if ($type == 'phonetic') {
  if ($phoneticInput == 'slp1') {return $phoneticInput;}
  if ($phoneticInput == 'hk') {return $phoneticInput;}
//  if ($phoneticInput == 'it') {return $phoneticInput;}
  if ($phoneticInput == 'it') {return 'itrans';}
  if ($phoneticInput == 'wx') {return $phoneticInput;}
 }
 // default: 
 return "slp1";
}
?>
