<?php
// listhierskip.php  ejf  Apr 14, 2013
global $listhierskip_hash;
listhierskip_init();
function listhierskip_init() {
 global $listhierskip_hash;
 $filein1 = "listhierskip.txt";
 $lines = file($filein1,FILE_IGNORE_NEW_LINES);
 $listhierskip_hash=array();
 $nlines = count($lines);
 //echo "<p>debug: $filein1 has $nlines lines</p>";
 foreach($lines as $line) {
  $line=trim($line);
  if($line == ''){continue;}
  $parts = preg_split('|,|',$line);
  $L=$parts[0];
  $listhierskip_hash[$L]=true;
 }
}

function listhierskip_lnum($lnum) {
 global $listhierskip_hash;
 $L = listhierskip_trim_lnum($lnum);
 return $listhierskip_hash[$L];
}
function listhierskip_trim_lnum($x) {
 // x assumed a string, which is an LNUM, possibly with gratuitous trailing 0
 if(!preg_match('|[.]|',$x)) {return $x;}
 $x = preg_replace('|0+$|','',$x);
 $x = preg_replace('|[.]$|','',$x);
 return $x;
}

?>
