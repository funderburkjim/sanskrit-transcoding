// monier/alt-main.js
// Oct 11, 2012. Revised to use jQuery for Ajax and DOM
// Removed 'queryInputChar' function (formerly used as keydown handler)
// Removed standard_input
// Oct 15, 2012.  Modified to work with transcoderjs.
jQuery(document).ready(function(){ 
 theTranscoderField = new TranscoderField('key1',keydown_return);
 win_ls=null;
 VKI.transcoderInit();
 jQuery('#disp').html("");
});
VKI.transcoderInit = function() {
 VKI.transcoderField = theTranscoderField; // add new attribute to VKI.
 jQuery('#key1').attr('class','keyboardInput'); // needs to precede VKI.load!
 VKI.load();
 transcoderChange(); // install the in/out preferences initialized by VKI.load
 jQuery('#disp').html("");
 //jQuery('#key1').keydown(keyboard_HandleChar);
 jQuery('#preferenceBtn').click(preferenceBtnFcn);
};

function preferenceBtnFcn(event) {
    showPreferences(); // from keyboard.js
}
function transcoderChange() {
 // Get inval/outval parms from VKI.state via the cookies
 // Note that 'inputType' should be 'phonetic' for the logic to work.
 // At the moment (Oct 15, 2012) the 
 // Note of Oct 16, 2012.  This function is called by
 // (a) the 'ready' function
 // (b) the 'okBtn' function in preferences.htm
  var inputType = readCookie("inputType"); 
  var phoneticInput = readCookie("phoneticInput"); 
  var viewAs = readCookie("viewAs");
 /*
  var inputType = VKI.state.inputType;
  var phoneticInput = VKI.state.phoneticInput;
  var viewAs = VKI.state.viewAs;
 */
  var inval = phoneticInput;
  if (inval == 'it') {inval = 'itrans';}
  var outval = viewAs;
  if ((inputType == 'phonetic') && (outval == 'phonetic')) {
      outval = inval;
  }
  //console.log('transcoderChange: ',inputType,viewAs,inval,outval);
  theTranscoderField.transCoderChange(inval,outval);
}

var requests = new Array();
var requestsActive = new Array();

for (var i=0;i<2;i++) {
try {
  requests[i] = new XMLHttpRequest();
} catch (trymicrosoft) {
  try {
    requests[i] = new ActiveXObject("Msxml2.XMLHTTP");
  } catch (othermicrosoft) {
    try {
      requests[i] = new ActiveXObject("Microsoft.XMLHTTP");
    } catch (failed) {
      requests[i] = null;
    }
  }
}

    if (requests[i] == null){
  alert("Error creating request object!");
    }
 requestsActive[i]=false;
}
//alert("have set requests");
var getlistFlag = false;
function keydown_return() {
 getWord_keyboard(false,false); 
}
 function unused_keyboard_HandleChar(event) {
 // Handler for keydown event
 // presumably, if RETURN key not pressed, next statement passes along
 // the keystroke to some other handler (e.g. that of VKI_devanalysis).
 
 if (event.keyCode != 13) return;
 getWord_keyboard(false,false); 
 // not sure why this stuff here
 if (event.stopPropagation) 
  event.stopPropagation();
 else event.cancelBubble = true;
 if (event.preventDefault) event.preventDefault();
 else event.returnValue = false;
 }

function getWordAlt_keyboard(keyserver) {
 // might be a problem if view differs from server/display
//    document.getElementById("key1").value = keyserver; //chg1
    getWord_keyboard("NO",keyserver);  //chg1
}
function getWordlist_keyboard() {
    var url =   keyboard_parms(false,true);
//    alert("getWordlist_keyboard: url="+url);
    getWordlist_main(url);
}
function getWordlistUp_keyboard(keyserver) {
    var url =    keyboard_parms(keyserver,true) + 
              "&direction=UP";
    getWordlist_main(url);
}
function getWordlistDown_keyboard(keyserver) {
    var url =  keyboard_parms(keyserver,true) + 
              "&direction=DOWN";
    getWordlist_main(url);
}
function getWord_keyboard(listFlag,keyserver) {
    var url =  keyboard_parms(keyserver,false); //chg1
    //console.log('getWord_keyboard: url=',url);
    getWord_main(url);
    if(listFlag == "NO") {
    getlistFlag = false;
    }else {
     getlistFlag = true;
     getWordlist_keyboard();
    }
}
function getWord_main(url) {
     //console.log('getWord_main:',url);
    try {
  requests[0].open("GET", url, true);
    requests[0].onreadystatechange = updateDisp;
    requests[0].send(null);
    requestsActive[0]=true;
    jQuery('#disp').html("");
    } catch (failed){
	alert("getWord_main error");
    }
}
function getWordlist_main(url) {
  requests[1].open("GET", url, true);
    requests[1].onreadystatechange = updateDisplist;
    requests[1].send(null);
    requestsActive[1]=true;
    document.getElementById("displist").innerHTML = '';
//    '<p>working...</p>' ;
}
function keyboard_parms(keyserver,listurlFlag) {  
    var word,inputType,unicodeInput,phoneticInput,viewAs,serverOptions;
    if (keyserver) {
     // 'keyserver' is a word passed as a parameter when the user
     //  clicks on a 'list' word.  In this case the 'viewAs' parameter
     //  has the value of the 'serverOptions' parameter
     word = keyserver;
     inputType = readCookie("inputType");
     unicodeInput = readCookie("unicodeInput");
     phoneticInput = readCookie("phoneticInput");
     viewAs = readCookie("viewAs");
     serverOptions = readCookie("serverOptions");
     viewAs = serverOptions;
    }else {
     word = document.getElementById("key1").value;
     inputType = readCookie("inputType");
     unicodeInput = readCookie("unicodeInput");
     phoneticInput = readCookie("phoneticInput");
     viewAs = readCookie("viewAs");
     serverOptions = readCookie("serverOptions");
     // serverOptions = viewAs;  // Nov. 22, 2010
    }
    var url;
    if (listurlFlag) {
     var listOptions = readCookie("listOptions");
     if (listOptions == 'hierarchical') {
  	url = "../webtc1/monierlisthier.php";
     }else {
	url = "../webtc1/monierlist.php"; // alphabetical
     }
    }else { // should be an error condition!
	url = "../webtc1/monier.php";
    }
   var ans = 
   url + 
   "?key=" +escape(word) + 
   "&keyboard=" +escape("yes") +
   "&inputType=" +escape(inputType) +
   "&unicodeInput=" +escape(unicodeInput) +
   "&phoneticInput=" +escape(phoneticInput) +
   "&serverOptions=" +escape(serverOptions) +
   "&viewAs=" + escape(viewAs);
    return ans;
}

function updateDisp() {
  if (requests[0].readyState == 4) {
   requestsActive[0]=false;
   if (requests[0].status == 200) {
       
    var response = requests[0].responseText;
    var ansEl = document.getElementById("disp");
//    alert('data ready for display...' + response);
    ansEl.innerHTML = response;
     
     // kick off the next ajax request
 //debug      if(getlistFlag){getWordlist_keyboard();}    
//    return;
  } else {
    alert("Error! Request status is " + requests[0].status);
  }
 }
}
function updateDisplist() {
  if (requests[1].readyState == 4) {
   requestsActive[1]=false;
   if (requests[1].status == 200) {
    var response = requests[1].responseText;
    var ansEl = document.getElementById("displist");
//    alert('data ready for display...' + response);
    ansEl.innerHTML = response;
//    return;
  } else {
    alert("Error! Request status is " + requests[1].status);
  }
 }
}
function winls(url,anchor) {
// Called by a link made by monierdisp.php
 var url1 = '../mwauth/'+url+'#'+anchor;
 win_ls = window.open(url1,
    "winls", "width=520,height=210,scrollbars=yes");
 win_ls.focus();
}