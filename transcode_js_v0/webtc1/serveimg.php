<?php
// serveimg.php: adapted from /cgi/monier/serveimg.pl Nov 10, 2010

$filename = $_GET['file'] ;
list($fileprev,$filenext)=getfiles($filename);
$HEADER='<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
   "//www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">';
$HEADER .= 
  '<html xmlns="//www.w3.org/1999/xhtml" lang="en" xml:lang="en">';
$HEADER .= '<head>';
$HEADER .= '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=utf-8">' . "\n";
$HEADER .= '<title>Cologne Scan</title>';
 
$HEADER .= "<link rel='stylesheet' type='text/css' href=\"/css/monier_serveimg.css\" />";
$HEADER .= "</head><body>\n";
echo $HEADER ;
echo "<img src=\"$filename\" />";
echo "<div id='pagenav'>\n";
genDisplayFile("&lt;",$fileprev);
genDisplayFile("&gt;",$filenext);
echo "</div>\n";
echo "</body></html>\n";
exit;
function getfiles($matchin) {
    if (!($matchin)) {
	return array(0,0);
    }
    if (!preg_match('/^(.*?)\/([^\/.]*)[.](.*?)$/',$matchin,$matches)) {
	return array(0,0);
    }
    $dir = $matches[1];
    $match = $matches[2];
    $sfx = $matches[3];
    $dirthis = dirname(__FILE__); //directory containing this php file
    $dirdocs = preg_replace('/docs\/.*$/','docs/',$dirthis);
    $filename=$dirdocs . "scans/MWScan/mwfiles.txt";
    $fp = fopen($filename,"r");
    if (!$fp) {
	return array(0,0);
    } 
    $prev=0;
    $next=0;
    $line=fgets($fp);
    $more = 1;
    while (($line)&& ($more == 1)) {
	$line = trim($line);
	if ($line == $match) {
	    $next=fgets($fp);
	    $next = trim($next);
	    $more = 0;
	    if (!($next)) {
		$next=0;
	    }
	} else {
	    $prev=$line;
	    $line=fgets($fp);
	}
    }
    fclose($fp);
    if ($more == 1) {
	return array(0,0);
    }
    $prev = "$dir/$prev.$sfx";
    $next = "$dir/$next.$sfx";
    return array($prev,$next);
}
function genDisplayFile($text,$file) {
//    $server = realpath(__FILE__);  // this file
//    $href = "/cgi-bin/monier/serveimg.pl?file=$file";
    $server = "serveimg.php"; // relative web address
    $href = $server . "?file=$file";
    $a = "<a href='$href' class='nppage'><span class='nppage1'>$text</span>&nbsp;</a>";
   echo "$a\n";
}
?>
