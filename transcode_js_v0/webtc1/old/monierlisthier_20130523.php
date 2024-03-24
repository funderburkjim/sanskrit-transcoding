<?php
//sanskrit/monier/disp2/monierlist.php
//ejf 11-16-2010
// connecting, selecting database
//ejf 09-24-2012  modified for sanskrit1d. Use sqlite databases
//ejf 10-11-2012  Assume 'keyboard' types of input parameters.
//ejf April, 2013  listhierskip, and some minor alterations
require_once('../utilities/utilities.php');
require_once('../webtc/dal_mysql.php');
require_once('listhierskip.php');  //Apr 2013
//require_once('../webtc/dal_sqlite.php');
// interpret GET parameters.
// 'key'
//echo "<p>monierlisthier...</p>";
$keyin = $_GET['key'];
if (! $keyin) {$keyin = $argv[1];}
if (! $keyin) {$keyin='a';};
// for safety, limit # chars in keyin
$mkeylen=500;
if (strlen($keyin) > $mkeylen) {
// echo strlen($keyin) .  " is length of $keyin\n";
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
 //$filter = transcoder_standardize_filter($filter1);
 //$filterin = transcoder_standardize_filter($filterin1);

$keyin1 = preprocess_unicode_input($keyin,$filterin);
$key = transcoder_processString($keyin1,$filterin,"slp1");
//echo "<p>DBG(HIER):keyboard=$keyboard, keyin = $keyin, filter = $filter, filterin = $filterin, keyin1 = $keyin1, key = $key</p>\n";
//echo "<p>key = $key</p>\n";
//echo "keyin = $keyin1, key = $key\n";
$meta = "<META HTTP-EQUIV=\"Content-Type\" CONTENT=\"text/html; charset=utf-8\">";
echo "$meta\n";
// step 1: get a match for key
$matches = match_key($key);
list($key1,$lnum1,$data1) = $matches[0];
//echo "<p>key1=$key1, lnum1=$lnum1</p>\n";
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

// step 3 format listmatches
$i=0;
$table="";
$spcchar = "&nbsp;";
$spcchar = ".";
while($i < count($listmatches)) {
 list($code,$key2,$lnum2,$data2) = $listmatches[$i];
 $hom2=get_hom($data2);
 if ($i == 0) {
  //  put 'upward button'
  $spc="&nbsp;&nbsp;";
  $out1 = "$spc<a  onclick='getWordlistUp_keyboard(\"<SA>$key2</SA>\");'><span style='$c'>&#x25B2;</span></a><br/>\n";  
  $table .= $out1;
 }
 $i++;
 if ($code == 0) {$c="color:teal";}
 else {$c="color:black";}
 // Apr 7, 2013.  Color Supplement records 
 if (preg_match('/<L supL="/',$data2,$matches)) {
  $c = "color:red";
 }
 if (preg_match('/<L revL="/',$data2,$matches)) {
  $c = "color:green";
 }

 if (preg_match('/^<H([2])/',$data2,$matches)) {
  $spc="$spcchar";
 }else if(preg_match('/^<H([3])/',$data2,$matches)) {
  $spc="$spcchar$spcchar";
 }else if(preg_match('/^<H([4])/',$data2,$matches)) {
  $spc="$spcchar$spcchar$spcchar";
 }else {
  $spc="";
 }
 if ($hom2 != "") {
  $hom2=" <span style=\"color:red; font-size:smaller\">$hom2</span>";
 }
 // Apr 10, 2013. key2show: 
 $key2show=$key2;
 if (False) { //dbg
 if (preg_match('/^<(H.[BC])>/',$data2,$matches)) {
  $temp = $matches[1];
  $key2show = "($key2show):$temp";
 }
 }
 // Apr 14, 2013: xtraskip
 $xtraskip='';
 if(listhierskip_lnum($lnum2)) {
  $xtraskip='<span style="font-size:smaller; color:blue;"> (skip)</span>';
 }
 $out1 = "$spc<a  onclick='getWordAlt_keyboard(\"<SA>$key2</SA>\");'><span style='$c'><SA>$key2show</SA></span>$hom2</a>$xtraskip<br/>\n";

 $table .= $out1;
 if ($i == count($listmatches)) {
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
 return array($filter ,$filterin );
}
function getParameters_keyboard_helper($type,$phoneticInput) {
 if ($type == 'deva') {return $type;}
 if ($type == 'roman') {return $type;}
 if ($type == 'phonetic') {
  if ($phoneticInput == 'slp1') {return $phoneticInput;}
  if ($phoneticInput == 'hk') {return $phoneticInput;}
  //if ($phoneticInput == 'it') {return $phoneticInput;}
  if ($phoneticInput == 'it') {return 'itrans';}
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
  $key2 = substr($key1,0,$n1);
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
// $nmatches = count($matches);
// echo "chk2: $key, $nmatches\n";
 return $matches;
}
function list1a($key) {
// first exact match
$recarr = dal_monier1($key);
$matches=array();
$nmatches=0;
$more=True;
foreach($recarr as $rec) {
 if ($more) {
  list($key1,$lnum1,$data1) = $rec;
  // Apr 14, 2013.  Do not consider the listhierskip records
  if (listhierskip_lnum($lnum1)) { continue;}
  $matches[0]=$rec;
  $more=False;
 }
}
/* commented out, Apr 14
if (count($recarr) > 0) {
   $matches[0]=$recarr[0]; 
}
*/
return $matches;
 }
function list1b($key) {
// first  partial match
//$recarr = dal_mwkeys3($key); // records LIKE key%
$recarr = dal_monier3($key); // records LIKE key%
$matches=array();
$nmatches=0;
$keylen = strlen($key);
$more=true;
foreach($recarr as $rec) {
 if ($more) {
  list($key1,$lnum1,$data1) = $rec;
  // Apr 14, 2013.  Do not consider the listhierskip records
  if (listhierskip_lnum($lnum1)) { continue;}
  $keylen1 = strlen($key1);
  if (($keylen1 >= $keylen) && (substr($key1,0,$keylen) == $key)) {
   $matches[$nmatches]=$rec;
   $nmatches++;
   $more=false;
  }
 }
}
return $matches;
}

function list_prev($key0,$lnum0,$nprev) {
$ans = array();
if ($nprev <= 0) {return $ans;}
$max = 5 * $nprev;  // 5 is somewhat arbitrary.
$recarr = dal_monier4a($lnum0,$max);
// 1. get records to be displayed
$matches = list_filter($lnum0,$recarr);
// 2. get the last $nprev records for return
$nmatches = count($matches);
if ($nmatches == 0) {return $ans;}
if ($nprev <= $nmatches) {
 $n1 = $nprev;
}else {
 $n1 = $nmatches;
}
// we retrieved in descending order. Now, we get back to ascending order
$j=$n1-1;
for($i=0;$i<$n1;$i++) {
 $x = $matches[$j];
 $ans[]=$x;
 $j--;
}
return $ans;
}
function list_next($key0,$lnum0,$n0) {
$ans = array();
if ($n0 <= 0) {return $ans;}
// next $n0 different keys
$max = 5 * $n0;  // 5 is somewhat arbitrary.
$recarr = dal_monier4b($lnum0,$max);
// 1. get records to be displayed
$matches = list_filter($lnum0,$recarr);
// 2. get the last $nprev records for return
$nmatches = count($matches);

if ($nmatches == 0) {return $ans;}
if ($n0 <= $nmatches) {
 $n1 = $n0;
}else {
 $n1 = $nmatches;
}
for($i=0;$i<$n1;$i++) {
 $x = $matches[$i];
 $ans[]=$x;
}
return $ans;
}
function list_filter($lnum0,$recarr) {
// This variant matches on key+hom
$matches=array();
$recarr0 = dal_monier2($lnum0,$lnum0); 
if (count($recarr0) != 1) {return $matches;} // should not happen
// Apr 6, 2013. Changed $recarr[0] to $recarr0[0] in next.
list($key0,$lnum0a,$data0)=$recarr0[0];  
$keyhom0 = get_keyhom($key0,$data0);
$keyhom = '';
foreach($recarr as $rec) {
  list($key1,$lnum1,$data1) = $rec;
  if (!preg_match('/^<H[1-4][BC]?>/',$data1)) {continue;}
  // Apr. 10, 2013. Don't show H.[BC]
  if (preg_match('/^<H[1-4][BC]>/',$data1)) {continue;}
  
  $keyhom1 = get_keyhom($key1,$data1);
  if ($keyhom1 == $keyhom){continue;}
  // Apr 13, 2013 commented out next line. Consider example avata
  // if ($keyhom1 == $keyhom0) {continue;}
  // found a new one
  $matches[]=$rec;
  $keyhom = $keyhom1; 
}
return $matches;
}
function get_keyhom($key,$data){
$hom = get_hom($data);
return "$key+$hom";
}
function get_hom($data) {
$hom="";
if (preg_match('|<hom>(.*?)</hom>.*?</h>|',$data,$matches)) {
 $hom = $matches[1];
}
return $hom;
}
function list_filter_v0($lnum0,$recarr) {
// The original version
$matches=array();
$recarr0 = dal_monier2($lnum0,$lnum0); 
if (count($recarr0) != 1) {return $matches;} // should not happen
list($key0,$lnum0a,$data0)=$recarr[0];
$key = '';
foreach($recarr as $rec) {
  list($key1,$lnum1,$data1) = $rec;
  if (!preg_match('/^<H[1-4][BC]?>/',$data1)) {continue;}
  if ($key1 == $key){continue;}
  if ($key1 == $key0) {continue;}
  // found a new one
  $matches[]=$rec;
  $key = $key1; 
}
return $matches;
}
function list_center($key1,$lnum1,$data1,$nprev,$nnext) {
$listmatches = array();
$matches1 = list_prev($key1,$lnum1,$nprev);
$matches2 = list_next($key1,$lnum1,$nnext);
$nmatches1 = count($matches1);
$nmatches2 = count($matches2);
// handle special cases
$i=0;
while($i < count($matches1)) {
 list($key2,$lnum2,$data2) = $matches1[$i];
 $listmatches[]=array(-1,$key2,$lnum2,$data2);
 $i++;
}
 $listmatches[]=array(0,$key1,$lnum1,$data1);
$i=0;
while($i < count($matches2)) {
 list($key2,$lnum2,$data2) = $matches2[$i];
 $listmatches[]=array(1,$key2,$lnum2,$data2);
 $i++;
}
return $listmatches;
}

?>
