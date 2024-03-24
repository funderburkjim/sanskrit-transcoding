function getWord() {
  var word = "";
  if (document.getElementById("key").value) {
    word = document.getElementById("key").value;
  }
  if ((word.length < 1)) {
   alert('Please specify a citation.');
   return;
  }
  
  var filter = document.getElementById("filter").value;
  var transLit = document.getElementById("transLit").value;
    var ans = "filter="+filter + ", transLit="+transLit + "<br/>";
    jQuery('#ContentArea').html(ans);
}

function queryInputChar(e){
var keynum;
var keychar;
var numcheck;

if(window.event) // IE
{
keynum = e.keyCode;
}
else if(e.which) // Netscape/Firefox/Opera
{
keynum = e.which;
}
/*
if (keynum) {} else{
alert ("keynum = " + keynum);
}
*/
keychar = String.fromCharCode(keynum);
if ((keynum == 10) || (keynum == 13)) { // newline or return
 getWord();
 return (1 == 1);
}
return keychar;
}

