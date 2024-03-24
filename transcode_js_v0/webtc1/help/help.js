// monier/alt-main.js
var request = null;
try {
  request = new XMLHttpRequest();
} catch (trymicrosoft) {
  try {
    request = new ActiveXObject("Msxml2.XMLHTTP");
  } catch (othermicrosoft) {
    try {
      request = new ActiveXObject("Microsoft.XMLHTTP");
    } catch (failed) {
      request = null;
    }
  }
}

if (request == null)
  alert("Error creating request object!");
var requestActive=false;
var win_ls=null;
var getlistFlag = false;
function loadFcn() {
 document.getElementById("disp").innerHTML = "";
    getPage('helpmain.html');
}
function getPage(url) {
  request.open("GET", url, true);
    request.onreadystatechange = updateDisp;
    request.send(null);
    requestActive=true;
    document.getElementById("disp").innerHTML = 
	''; //'<p>working...</p>' ;
}

function updateDisp() {
  if (request.readyState == 4) {
   requestActive=false;
   if (request.status == 200) {
    var response = request.responseText;
    var ansEl = document.getElementById("disp");
//    alert('data ready for display...' + response);
    ansEl.innerHTML = response;
   } else {
    alert("Error! Request status is " + request.status);
  }
 }
}