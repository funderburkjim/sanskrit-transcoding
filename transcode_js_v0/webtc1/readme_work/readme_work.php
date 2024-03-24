<?php
 $filename=$argv[1];
 $fp = fopen($filename,"r"); // monier.xml
 if (!$fp) {
  echo "ERROR: Could not open $filename<br/>\n";
  exit;
 }
 $filetab = $argv[2];  //monier_input.txt

 $fpout = fopen($filetab,"w");
 if (!$fpout) {
  echo "ERROR: Could not open $filetab<br/>\n";
  exit;
 }

$n=0;
 while (!feof($fp)) {
  $line = fgets($fp);
  $line = trim($line);
  if (preg_match('/^<(H.*?)>.*?<key1>(.*?)<\/key1>.*<L.*?>(.*?)<\/L>/',$line,$matches)){
   $H = $matches[1];
   $key1=$matches[2];
   $L=$matches[3];
   $n++;
   $nstr = sprintf('%03d',$n);
   fwrite($fpout,"$nstr       $H,$key1,$L\n");
  }else {
   echo "skipping line: $line\n";
  }
 }
 fclose($fp);
 fclose($fpout);
 echo "$n records created in $filetab<br/>\n";
exit;
?>
