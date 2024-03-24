<?php
/*
createJson2.php Feb 4, 2024.
  deva_slp1
createJson.php  ejf Oct 23, 2012
This php program can be used to create the transcoderJson.js using
transcoder xml inputs.
Usage:  php createJson.php <output>
Example: php createJson.php transcoderJson.js
The output file created is javascript code, consisting of a sequence:
transcoder.fsmarr['<from>_<to>']=
{...  } // JSON literal
;
The JSON literals are constructed using the php version of transcoder.
The particular <from>_<to> are specified in the code, and could of 
course be altered.
Only the original form of the transcoder xml files is supported by this
version of transcoder.

*/
// step 0: set up transcoder
$dir = dirname(__FILE__); //directory containing this php file
require_once('utilities/transcoder.php');  // 02-03-2024

$filename = $argv[1];
$fp = fopen($filename,"w") or die("Cannot open $filename\n");
initTranscoderJson($fp);
fclose($fp);
exit(0);

function initTranscoderJson_Helper($from,$to,$fp) {
    global $transcoder_fsmarr;
    transcoder_fsm($from,$to);
    $key = $from . "_" . $to;
    fwrite($fp,"transcoder.fsmarr['" . $key . "']=" );
    fwrite($fp,"\n");
    $fsm = $transcoder_fsmarr[$key];
    // This form requires  php version 5.4
    // $json = json_encode($fsm,JSON_UNESCAPED_UNICODE);
    $json = json_encode($fsm);
    fwrite($fp,$json);
    fwrite($fp,"\n");
    fwrite($fp,";");
    fwrite($fp,"\n");
}
function initTranscoderJson($fp) {
    $fromslp1Arr = array("deva","roman","hk","itrans","wx");
    $toslp1Arr = array("hk","itrans","wx");
    for($i=0;$i<count($fromslp1Arr);$i++) {
	initTranscoderJson_Helper("slp1",$fromslp1Arr[$i],$fp);
    }
    for ($i=0;$i<count($toslp1Arr);$i++) {
	initTranscoderJson_Helper($toslp1Arr[$i],"slp1",$fp);
    }
   initTranscoderJson_Helper("deva","slp1",$fp);
   check();
}
function check() {
 $x = "राम";
 $y = transcoder_processString($x,"deva","slp1");
 print("check $x => $y\n");
 $x = "rAma";
 $y = transcoder_processString($x,"slp1","deva");
 print("check $x => $y\n");
}
?>
