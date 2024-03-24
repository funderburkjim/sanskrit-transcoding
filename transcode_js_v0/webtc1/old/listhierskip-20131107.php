<?php
// listhierskip.php  ejf  Apr 14, 2013
// May 23, 2013. Refactored to use 'type' attribute of 'see' element.

function listhierskip_data($data) {
 // Return Boolean. True if <see type="nonhier"/> is part of $data
 if (preg_match('|<see type="nonhier"/>|',$data)) {
  return True;
 }else {
  return False;
 }
}
?>
