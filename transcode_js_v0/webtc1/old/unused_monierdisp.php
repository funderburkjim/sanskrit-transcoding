<?php
//sanskrit/monier/disp2/monierdisp.php
//ejf 11-05-2009
//The main function monierDisplay constructs an HTML table from
// an array of MW data elements.
// Each of the MW data elements is a string which is valid XML.
// The XML is processed using the XML Parser routines (see PHP documentation)

$parentEl;
$row;
$row1;
$pagecol = "";
$true = 1;
$false = 0;
$dbg = $false;
$inSanskrit=$false;
$noLit = "off";
$noParen = "off";
$dispfilter="";
$inlex = $false;
$invlex = $false;
$inParen = 0;
$inBracket = 0;
$msc = $false; # when a semicolon should break the record
$inas1 = $false; #in <as1><s>x</s></as1>
$inkey2;
$inls = $false;
$lsrow;
$lsparentEl;
$lsExpandCode;
$lsExpandFlag;
$greek;

$dbg=$false;
if ($dbg == $true) { // testing
$matches=array(
'<H1><h><hc3>112</hc3><key1>agAra</key1><hc1>1</hc1><key2>agAra</key2></h><body> <p><c>rarely</c>~<s>as</s>~,~<lex type="hwalt">m.</lex></p> <lex>n.</lex> <c>house_,_apartment</c> <p><b><cf/>~<s>AgAra</s></b></p>. </body><tail><MW>000545</MW> <pc>4,3</pc> <L>842</L></tail></H1>'

);
$key="a";
//echo "input=\n" . $matches[0] . "<br>\n";
$result=monierDisplay($key,$matches,"");
echo "result=\n" .$result . "\n";
exit;
}
$dbg=$false;
function monierDisplay($key,$matches,$filterin) {
 global $row,$row1,$pagecol,$true,$false,$inSanskrit,$dbg;
 global $inlex,$invlex,$inParen,$inBracket,$msc,$inas1,$inkey2;
 global $inls,$lsrow,$lsparentEl,$lsExpandCode,$lsExpandFlag,$parentEl;
 global $noLit;
 global $greek;
 global $dispfilter;
 $noLit="off";
 $dispfilter = $filterin;
// echo "<p>filter = $dispfilter</p>";
 $table = "";
//   Rarely, two vowels occur consecutively (e.g. afRin).
//   These don't print properly in devanagari.
 $key = preg_replace('/([aAiIuIfFxXeEoO])([aAiIuIfFxXeEoO])/',"\\1 \\2",$key); 
 $table = "<h1>&nbsp;<SA>$key</SA></h1>\n";
 $Westlinks = Westergaard_links($key);
 $Whitlinks = Whitney_links($key);
 $table .= $Westlinks;
 if ($Westlinks != '') {$table .= "<br/>";}
 $table .= $Whitlinks;

 $table .= "<table class='display'>\n";
 $ntot = count($matches);
 $i = 0;
//echo "ntot=$ntot<br>\n";
 while($i<$ntot) {
  $linein=$matches[$i];
  $line=$linein;
  if ($dbg == $true) {
   echo "<!--line $i = $line -->\n";
  }
  $line=trim($line);
  // initialize Greek data and counter
  $greek = initGreek($line);
  $line=line_adjust($line);
  if ($noLit == "off"){
   $line = line_adjust1($line);
  }
  $row = "";
  $row1 = "";
  if (preg_match('/<msc\/>/',$line)) {
   $msc = $true;
   $row="<p>";
  } else {
   $msc = $false;
  }
  $inSanskrit=$false;
  $inlex = $false;
  $invlex = $false;
  $inParen = 0;
  $inBracket = 0;
  $inkey2 = $false;
  if ($dbg == $true) {echo "<!--begin parse $i=\n$line\n\n-->";}
  $p = xml_parser_create();
  xml_set_element_handler($p,'sthndl','endhndl');
  xml_set_character_data_handler($p,'chrhndl');
  xml_parser_set_option($p,XML_OPTION_CASE_FOLDING,FALSE);
  if (!xml_parse($p,$line)) {
//   sprintf("XML error: %s ",
//                    xml_error_string(xml_get_error_code($p)));
   $row1 = "Error";
   $line=$linein;
   $line = preg_replace('/</','&lt;',$line);
   $line = preg_replace('/>/','&gt;',$line);
   $row = $line;
//   echo "Error from parser line $i. <br>";
//   echo "<pre><!--$line--></pre><br>";
//   die("goodbye");
  }
  xml_parser_free($p);
  if ($dbg == $true) {echo "<!--after line, row1=$row1\n\nrow=$row1\n\n-->";}
  $table .= "<tr><td class='display' valign=\"top\"><b>$row1</b></td>\n";

  if ($msc == $true){
   $row .= "</p>";
  }
  $table .= "<td class='display' valign=\"top\">$row</td></tr>\n";
  $i++;
 }
 $table .= "</table>\n";
 return $table;
}
function line_adjust($line) {
 global $pagecol;
 $line = preg_replace('/<mscverb\/>/','',$line);
 $line = preg_replace('/<hc1>.*<\/hc1>/','',$line);
 $line = preg_replace('/<hc3>.*<\/hc3>/','',$line);
 $line = preg_replace('/<MW>.*<\/MW>/','',$line);
 $line = preg_replace('/<pc>Page(.*)<\/pc>/',"<pc>\\1</pc>",$line);
 // anything between <h> elt. and <body> element is 'extra'
 $line = preg_replace('/<\/h>.+<body>/','</h><body>',$line);
 if (preg_match('/<pc>(.*)<\/pc>/',$matches)){
  if($pagecol == $matches[1]){
   $line = preg_replace('/<pc>(.*)<\/pc>/','',$line);
  }else {$pagecol = $matches[1];}
 }
 $line = preg_replace('/_/',' ',$line);
 $line = preg_replace('/~/',' ',$line);
 if (preg_match('/<H.A>/',$line)) {
  $line = preg_replace('/<\/?H.A>/','',$line);
  $line = preg_replace('/<h>.*<\/h>/','',$line);
  $line = preg_replace('/<AE>.*<\/AE>/','',$line);
  $line = preg_replace('/<lex *type="inh">.*?<\/lex>/','',$line);
  $line = "<entry>" . $line . "</entry>";
 }else {
  $line = preg_replace('/(<\/key2>.*)<hom>(.)<\/hom><\/h>/',"\\1<hhom>\\2</hhom></h>",$line);
 }
 // Abbreviated English (normally) appears as "_<abE>xxx</abE>xxxyyy"
 // change such things to "xxxyyy"
 // There are 15022 of these. Before them we have
 // [-_. ] followed by [a-zA-Z] then 0 or more of [a-zA-Z0-9].
 $line = preg_replace('/<abE>.*?<\/abE>/','',$line);
 // new code, as of 4-12-2008
 $line = preg_replace('/<as0[^<]*<\/as0>/','',$line);
 $line = preg_replace('/<asp0[^<]*<\/asp0>/','',$line);
 // 20080104  omit display of elements pertaining to parenthetical head words
 $line = preg_replace('/<ORSL>.*?<\/ORSL>/','',$line);
 $line = preg_replace('/<dL>.*?<\/dL>/','',$line);
 $line = preg_replace('/<\/?phw>/','',$line);
 $line = preg_replace('/<shortlong\/>/','',$line);
 // 20080415. Make some things abbreviations that are not
 // explicitly coded as such.
 $line = preg_replace('/<qv\/>/','<ab>q.v.</ab>',$line);
 $line = preg_replace('/([^a-zA-Z0-9])N[.]/','\\1<ab>N.</ab>',$line);
 $line = preg_replace('/<cf\/>/','<ab>cf.</ab>',$line);
 $line = preg_replace('/<pcol>p[.] ([0-9]+) , col[.] ([0-9]+)<\/pcol>/',
  '<pcol>\\1,\\2</pcol>',$line);
 return $line;
}
function sthndl($xp,$el,$attribs) {
 global $row,$row1,$pagecol,$true,$false,$inSanskrit,$noParen;
 global $inlex,$invlex,$inParen,$inBracket,$msc,$inas1,$inkey2;
 global $inls,$lsrow,$lsparentEl,$lsExpandCode,$lsExpandFlag,$parentEl;
//echo "el=$el\n";
if (preg_match('/^p[1-9]?$/',$el)) {
 $inParen = $inParen + 1;
 if ($noParen == "off"){
  $row .= "(";
 }
} else if (preg_match('/^b[1-9]?$/',$el)) {
 $inBracket = $inBracket + 1;
 if ($noParen == "off"){
  $row .= "[";
 }
} else if (($noParen == "off") ||
  (($noParen == "on")&&(0 == $inParen)&&(0 == $inBracket))) {
  if ($el == "q") {
   $row .= "'";
  } else if (preg_match('/^H.+$/',$el)) {
   $row1 .= "($el)";
  } else if ($el == "root") {
   if ($inkey2 == $false){
   $row .= " &#x221a;"; //" &reg;";
   } else {
   $row1 .= " &#x221a;";  //" &reg;";
   }
  } else if (($el == "srs") || ($el == "srs1")){
   if ($inkey2 == $false){
   $row .= "<font color=\"red\">*</font>";
   } else {
   $row1 .= "<font color=\"red\">*</font>";
   }
  } else if (($el == "sr1")|| ($el == "sr")){
   if ($inkey2 == $false){
   $row .= "<font color=\"red\">&deg;</font>";
   } else {
   $row1 .= "<font color=\"red\">&deg;</font>";
   }
  } else if ($el == "fs") {
   $row .= "<font color=\"red\">&divide;</font>";
  } else if ($el == "s")  {
   $inSanskrit = $true;
  } else if ($el == "key2"){
   $inkey2 = $true;
  } else if ($el == "key1"){
  } else if ($el == "ls"){
   $inls=$true;
  } else if ($el == "to"){
  } else if ($el == "etym"){
  } else if ($el == "hhom"){
  } else if ($el == "hom"){
  } else if ($el == "ns"){
  } else if ($el == "pc"){
  } else if ($el == "lex"){
   $inlex=$true;
  }else if ($el == "vlex"){
   $invlex=$true;
  }  else if ($el == "vlex"){
  } else if (preg_match('/^p[1-9]?$/',$el)) {
  } else if (preg_match('/^c[1-9]?$/',$el)) {
  } else if (preg_match('/^b[1-9]?$/',$el)) {
  } else if ($el == "entry"){
  } else if ($el == "h"){
  } else if ($el == "body"){
  } else if ($el == "tail"){
  } else if ($el == "mul"){
  } else if ($el == "mat"){
  } else if ($el == "vhead"){
  } else if ($el == "bot"){
  } else if ($el == "bio"){
  } else if ($el == "amp"){
   $row .= " &amp; ";
  } else if (($el == "etc") || ($el == "etc1") || ($el == "etcetc")){
   $row .= "<font size=\"-1\"> &amp;c </font>";
  } else if ($el == "see"){
   $row .= "<font color=\"purple\">&raquo;</font>";
  } else if ($el == "eq"){
   $row .= "<font color=\"purple\">=</font>";
  } else if ($el == "L"){
  } else if ($el == "ab"){
  } else if ($el == "as1"){
   $inas1 = $true;
  } else if ($el == "as0"){
  } else if ($el == "asp0"){
  } else if ($el == "Qas0"){
  } else if ($el == "Qasp0"){
  } else if ($el == "Qasl0"){
  } else if ($el == "cf"){
   $row .= "<font color=\"purple\">&raquo;</font>";
  } else if ($el == "msc"){
   $row .= "<font color=\"purple\">&nbsp;;&nbsp;</font></p><p>";
  } else if ($el == "quote") {
   $row .= "&quot;";
  } else {
  }
}
  $parentEl = $el;
}
function endhndl($xp,$el) {
// echo "endhndl, $el, $inSanskrit\n";
 global $row,$row1,$pagecol,$true,$false,$inSanskrit,$noParen;
 global $inlex,$invlex,$inParen,$inBracket,$msc,$inas1,$inkey2;
 global $inls,$lsrow,$lsparentEl,$lsExpandCode,$lsExpandFlag,$parentEl;
  if (preg_match('/^p[1-9]?$/',$el)) {
   if ($noParen == "off") {
   $row .= ")";
   }
   $inParen = $inParen - 1;
  } else if (preg_match('/^b[1-9]?$/',$el)){
   if ($noParen == "off") {
   $row .= "]";
   }
   $inBracket = $inBracket - 1;
  }
  $parentEl = "";
  if ($el == "s") {
   $inSanskrit = $false;
  } else if ($el == "lex") {
   $inlex = $false;
  } else if ($el == "ls") {
   $inls = $false;
  } else if ($el == "vlex") {
   $invlex = $false;
  } else if ($el == "key2") {
   $inkey2 = $false;
  } else if ($el == "as1"){
   $inas1 = $false;
  } else if ($el == "as0"){
  } else if ($el == "asp0"){
  } else if ($el == "Qas0"){
  } else if ($el == "Qasp0"){
  } else if ($el == "Qasl0"){
  }else if ($el == "quote") {
   $row .= "&quot;";
  }
}
function chrhndl($xp,$data) {
 global $row,$row1,$pagecol,$true,$false,$inSanskrit,$noParen;
 global $inlex,$invlex,$inParen,$inBracket,$msc,$inas1,$inkey2;
 global $inls,$lsrow,$lsparentEl,$lsExpandCode,$lsExpandFlag,$parentEl;
 global $noLit;
  if (($noParen == "on") && ((0 < $inParen)||(0 < $inBracket))){
   return;
  }
  if ($parentEl == "gk") {
   $row .= displayGreek($data);
   return;
  }
  if ($inSanskrit == $true) {
   // print accents as '/'.
//   if ($filter == "SktDevaUnicode"){
//   $data =preg_replace('/\//<\/SA>\/<SA>/g;
//   }
   if ($inas1 == $true){
   $row .= "<font color=\"teal\"><SA>$data</SA></font>";
   } else if ($inls == $true) {
   $row .= "<font color=\"gray\" size=\"-1\"><SA>$data</SA></font>";
   } else {
   $row .= "<font color=\"blue\"><SA>$data</SA></font>";
   }
  } else if ($inkey2 == $true) {
   if ($parentEl == "hom") {
   $row1 .= "<font color=\"blue\">&nbsp;$data</font>";   
   } else {
   $row1 .= "&nbsp;<font color=\"blue\"><SA>$data</SA></font>";
   }
  } else if (preg_match('/Qas[pl]?0/',$parentEl)) {
  } else if (preg_match('/as[pl]?0/',$parentEl)) {
  } else if ($parentEl == "key1"){ // nothing printed
  } else if ($inls == "$true"){
   if ($noLit == "off"){
   if ($parentEl == "ab") {
    $tran = getABdata($data);
    if ($tran == "") {
    $row .= "<font color=\"gray\" size=\"-1\">$data</font>";
    }else {
    $row .= "<span title=\"$tran\" class=\"ab\">";
    $row .= "<font color='#004400' size=\"-1\">$data</font>";
    $row .= "</span>";
    }
   }else {
    $data1 = $data;
    $data1 =preg_replace('/[{]/','<',$data1);
    $data1 =preg_replace('/[}]/','>',$data1);
    $row .= "<font color='#004400' size=\"-1\">$data1</font>";
   }
   }
  } else if ($parentEl == "etym"){
   $row .= "<font color=\"brown\">$data</font>";
  } else if ($parentEl == "hhom") {
   $row1 .= "<font color=\"red\">&nbsp;$data</font>";
  } else if ($parentEl == "hom") {
   $row .= "<font color=\"red\">&nbsp;$data</font>";
  } else if ($parentEl == "pc") {
   $hrefdata = getHrefPage($data);
   $row1 .= "<font size=\"-1\"> [p= $hrefdata]</font>";
  } else if ($parentEl == "pcol") {
   $hrefdata = getHrefPage($data);
   $row .= "<font size=\"-1\"> [p= $hrefdata]</font>";
  } else if ($parentEl == "L") {
   $row1 .= "<font size=\"-1\"> [L=$data]</font>";
  } else if (($inlex == $true)|| ($invlex == $true)) {
   $tran = getABdata($data);
   if ($tran == "") {
   $row .= "<em>$data</em>";
   }else {
   $row .= "<em title=\"$tran\">";
   $row .= "<font color='#004400'>";   
   $row .= "$data";
   $row .= "</font>";
   $row .= "</em>";
   }
  } else if ($parentEl == "bot"){
   $row .= "<font color=\"brown\" size=\"-1\">$data</font>";
  } else if ($parentEl == "bio"){
   $row .= "<font color=\"brown\" size=\"-1\">$data</font>";
  } else if ($parentEl == "ab") {
   $tran = getABdata($data);
   if ($tran == "") {
   $row .= "<font size='-1'>$data</font>";
   }else {
   $row .= "<span  title=\"$tran\">";
   $row .= "<font size='-1' color='#006600'>";
   $row .= "$data";
   $row .= "</font>";
   $row .= "</span>";
   }
  } else if ($parentEl == "quote") {
   $row .= "$data";
  } else if (0 < $inParen){
   if ($noParen == "off"){$row .= $data;}
  } else if (0 < $inBracket){
   if ($noParen == "off"){$row .= $data;}
  } else if (preg_match('/c[1-9]?/',$parentEl)){
 $row .= $data;
  } else if ($parentEl == "") {
   $row .= "$data";
  } else if (($parentEl == "h")||($parentEl == "body") ||($parentEl == "tail")) {
   $row .= "$data";
  } else if ($parentEl == "ns") {
   $row .= "<font color=\"orange\">{$data};</font>";
  } else {
   $row .= "$data";
  }
}
function getHrefPage($data) {
 // this is incomplete, compared to online version.
 // no access to underlying scanned images available.
 $ans="";
 $lnums = preg_split('/,/',$data);
// $serve = "/cgi-bin/monier/serveimg.pl";
// $dir = dirname(__FILE__); //directory containing this php file
// $dir = preg_replace('/^.*docs\//','',$dir);
// $webdir = '//www.sanskrit-lexicon.uni-koeln.de/' . $dir;
// $serve = $webdir . "/serveimg.php";
// $serve = "serveimg.php"; //relative address
 $serve = "/monier/webtc5/serveimg.php"; //relative address
// echo "<p>dbg: dir = $dir</p>";
 foreach($lnums as $lnum) {
  if ($ans == "") {
//   $ans=$lnum;
   $hrefcur = getHrefPage1($lnum);
   $args="file=$hrefcur";
   $ans = "<a href='$serve?$args' target='_Blank'>$lnum</a>";
  }else {
   $ans .= ",$lnum";
  }
 }
 return $ans;
}
function getHrefPage1($lnum) {
    $dir = dirname(__FILE__); //directory containing this php file
    $dirdocs = preg_replace('/docs\/.*$/','docs/',$dir);
    $filename=$dirdocs . "scans/MWScan/mwfiles.txt";
    $fp = fopen($filename,"r");
    if (!$fp) {
	return "$lnum";
    } 
    $line = matchmwpage($fp,$lnum);
    fclose($fp);
    if ($line) {
     $anscur = "/scans/MWScan/MWScanjpg/$line.jpg";
      return $anscur;
     }
     return "$lnum";
}
function matchmwpage($fp,$lnum) {
    $regexp = "mw0*$lnum-";
    $line=fgets($fp);
    while (!($line===FALSE)) {
	$line = trim($line);
	if (preg_match("/$regexp/",$line)) {
	    return $line;
	}
	if (($lnum >= 1308) && ($line == ("mw" . $lnum))) {
	    // 2010-01-23: Add logic for the Additions page names,
	    // which have the form mwxxxx (eq mw1309)
	    return $line;
	}
	$line=fgets($fp);
    }
    return FALSE;
}

function getABdata($key) {
 global $dispfilter;
 // abbreviation tool tips.
 $ans="";
 $sql="select * from `mwab` where `id`=\"$key\"";
 $result=mysql_query($sql);
 if ($line = mysql_fetch_array($result,MYSQL_ASSOC)) {
  $key1 = $line['key'];
  $data = $line['data'];
  if (preg_match('/<disp>(.*?)<\/disp>/',$data,$matches)) {
   $ans = $matches[1];
//   if (($dispfilter == "") || ($dispfilter == "SLP2HK") ||($dispfilter == "SLP2ITRANS")) {
   if (($dispfilter != 'deva') && ($dispfilter != 'roman')) {
	$ans = preg_replace('/<s>/','<SA>',$ans);
	$ans = preg_replace('/<\/s>/','</SA>',$ans);
   }
  }
 }
 return $ans;
}
function Westergaard_links($key) {
    $ans = "";
    $href0="//www.sanskrit-lexicon.uni-koeln.de/scans/MWScan/Westergaard/disp/index.php";
    $sql = "select * from `westmwtab` where `key`=\"$key\" order by `data`";
    $result=mysql_query($sql);
    while ($line = mysql_fetch_array($result,MYSQL_ASSOC)) {
     $key1 = $line['key'];
     $lnum1 = $line['lnum'];
     $data1 = $line['data'];
     if ($key1 != $key) {continue;}
     // data1 is of form x.y (section.root)
     if (!preg_match('/^([0-9]+)/',$data1,$matches)) {continue;}
     $section = $matches[1];
     $href = "$href0" . "?section=$section";
     $elt = "<a href='$href' target='_Westergaard'>$data1</a>";
     if ($ans != "") {$ans .= ", ";}
     $ans .= $elt;
    }
    if ($ans != "") {
	$ans = "<em>Westergaard Dhatupatha links:</em> " . $ans;
    }
    return $ans;
}
function Whitney_links($key) {
    $ans = "";
    $href0="//www.sanskrit-lexicon.uni-koeln.de/scans/KALEScan/WRScan/disp2/index.php";
    $sql = "select * from `whitmwtab` where `key`=\"$key\" order by `data`";
    $result=mysql_query($sql);
    while ($line = mysql_fetch_array($result,MYSQL_ASSOC)) {
     $key1 = $line['key'];
     $lnum1 = $line['lnum'];
     $data1 = $line['data'];
     if ($key1 != $key) {continue;}
     // data1 is of form whitkey whitpage
     if (!preg_match('/^([^ ]+) +([0-9]+)$/',$data1,$matches)) {continue;}
     $whitkey = $matches[1];
     $whitpage = $matches[2];
     $href = "$href0" . "?page=$whitpage";
     $elt = "<a href='$href' target='_Whitney'>$whitkey</a>";
     if ($ans != "") {$ans .= ", ";}
     $ans .= $elt;
    }
    if ($ans != "") {
	$ans = "<em>Whitney Roots links:</em> " . $ans;
    }
    return $ans;
}
function initGreek($line) {
    $ans = array();
    if (!preg_match('/<L>(.*?)<\/L>/',$line,$matches)) {
	return $ans;
    }
    $L = $matches[1];
    $sql="select * from `mwgreek` where `lnum`=\"$L\"";
    $result=mysql_query($sql);
    if(! ($line = mysql_fetch_array($result,MYSQL_ASSOC))) {
     return $ans;
    }
    $lnum1 = $line['lnum'];
    $data1 = $line['data'];
    $ans = preg_split('/<gk>/',$data1);
//    echo "<p>dbg: initGreek: data1 = $data1</p>, count=" . count($ans);
    return $ans;
}
function  displayGreek($greekNum) {
    // uses global $greek
   global $greek;
    $ans="";
    if (! $greek) {return $ans;}
    $ngreek = count($greek);
    if ($ngreek == 0) {return $ans;}
    if (! preg_match('/^[1-9]$/',$greekNum))  {return $ans;}
    $greekNum--;
    if (($greekNum < 0) or ($ngreek <= $greekNum))  {return $ans;}
    $greekElt = $greek[$greekNum];
    if ((! $greekElt) or ($greekElt == '')) {return $ans;}
    // $greekElt has three parts, separated by <e>
    list($beta,$url,$utf) = preg_split('/<e>/',$greekElt);
    $hrefperseus="//www.perseus.tufts.edu/hopper/morph?la=greek&l=" .
	$url;
    $ans = "<a target='perseus' href='$hrefperseus'><span class='greek'>$utf</span></a>";
    return $ans;
}
function getLSdata($lskey) {
    global $dispfilter;
    $ans=" $lskey ??";
    $sql = "select * from `linkmwauthorities` where `key`=\"$lskey\"";
    $more = 1;
    $result=mysql_query($sql);
    while ($line = mysql_fetch_array($result,MYSQL_ASSOC)) {
     $key1 = $line['key'];
     $lnum1 = $line['lnum'];
     $data1 = $line['data'];
     //data1 is key into mwauthorities tablex
     $filter1 = $dispfilter;
     if (!$dispfilter  ) {
       $filter1 = "SLP2SLP";
     }else if ($dispfilter == 'deva') {
       $filter1 = "SktDevaUnicode";
     }else if ($dispfilter == 'hk') {
       $filter1 = "SLP2HK";
     }else if ($dispfilter == 'it') {
       $filter1 = "SLP2ITRANS";
     }else if ($dispfilter == 'roman') {
       $filter1 = "SktRomanUnicode";
     }else  {
       $filter1 = "SLP2SLP";
     }

     if (($more == 1) and ($key1 == $lskey)) {
       $more = 0;
       $file = "mwauth_$filter1.html";
       $lskey1 = preg_replace('/[.]/','_',$lskey);
       $file1 = "$file#" . "record_$lskey1";
       // {} are used instead of <>; the <> are returned in chrhdl.
       $ans = "{a href='javascript:winls(\"$file\",\"record_$lskey1\")'} $lskey {/a}";
      }
    } 
    return $ans;
}
function line_adjust1($line) {
    return preg_replace_callback('/<ls>([A-Z][A-Za-z0-9]*[.])+/',
      "line_adjust1_callback",$line);
}
function line_adjust1_callback($matches) {
 $match = $matches[0];
 $lskey = preg_replace('/^<ls>/','',$match);

 $lsdata = getLSdata($lskey);
 return "<ls>" . $lsdata;
}

?>
