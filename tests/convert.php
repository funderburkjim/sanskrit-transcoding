<?php
require_once('../transcoder.php');
transcoder_set_dir('../transcoder');
$dir1 = transcoder_get_dir();
echo "transcoder directory = $dir1\n";

$filein = $argv[1];
$fileout = $argv[2];
$tranin = $argv[3];
$tranout = $argv[4];

$fp = fopen($filein,"r") or die ("cannot open $filein\n");
$fpout = fopen ($fileout,"w") or die("cannot open $fileout\n");
$n=0;
$nout=0;
$ntext=0;
 while (!feof($fp)) {
  $x = fgets($fp);
  $x = trim($x);
  if ($x == '') {continue;}
  $n++; 
  if (! preg_match('/^([^ ]+) (.+)$/',$x,$matches)) {
   echo "line $n is unknown line: '$x'\n";
   exit(1);
  }
  $head = $matches[1];
  $body = $matches[2];
  // Smith seems to use the vertical bar '|' to inhibit sandhi.
  $body = preg_replace('/\|/',' # ',$body); 
  $body = preg_replace('/ +/',' ',$body);
  $body1 = transcoder_processString($body,$tranin,$tranout);

  $y = "$head $body1";
  fwrite($fpout,"$y\n");
//  if ($n > 100) {break;}
}
fclose ($fp);
fclose($fpout);
echo "$n lines converted\n";
?>
