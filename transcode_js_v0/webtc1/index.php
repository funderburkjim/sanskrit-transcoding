<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "//www.w3.org/TR/html4/loose.dtd">
<html>
<!-- monier/webtc5/index.php Sep 26, 2012 ejf on sanskrit1d server
 Oct 11, 2012 ejf adjust to just handle 'keyboard' parameter selection.
     The dual methods were done in a very confusing manner, and are believed
     to be unneeded.
     Also removed function updatePreferencesCount and variable
     SLPreferencesAccessCount, as these are believed to be unused 
     Moved keyboard_HandleChar function, and its attachment to #key1 to
     main.js.
     Removed 'GET' logic. So this program has no restful interface.
-->
 <head>
  <META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=utf-8">
  <title>Monier Williams Online 2012</title>
  <link rel="stylesheet" type="text/css" href="../webtc1/main.css" />
  <link rel="stylesheet" type="text/css" href="../webtc1/keyboard.css"/>
  <style type="text/css">
 </style>

  <script type="text/javascript" src="../js/jquery.min.js"></script>
  <script type="text/javascript" src="../webtc1/transcoderjs/transcoder3.js"> </script>
  <script type="text/javascript" src="../webtc1/transcoderjs/transcoderJson.js"> </script>

  <script type="text/javascript" src="../webtc1/transcoderfield_VKI.js"> </script>
  <script type="text/javascript" src="../webtc1/keyboard.js"></script>
  <script type="text/javascript" src="../webtc1/main.js"> </script>

 </head>
 <body>
 <div id="dictid">
  
     <img id="unilogo" src="../images/cologne_univ_seal.gif"
           alt="University of Cologne" width="60" height="60" />
      <span class="dictname">Monier Williams Sanskrit-English Dictionary</span>
      <img id="shield" src="../images/brown_seal.jpg"
           alt="Brown University" width="40" height="60" />
      <span class="dictname" style="position:absolute; left:500px">
           </span>
  
 </div>
 <div id="dictnav">
 <ul class="nav"
   <li class="nav">
     <a class="nav" href="../webtc1/help/help.html" target="output">Help</a>
   </li>
<!--
   <li class="nav">
     &nbsp;<a class="nav" href="abbr.html" target="output">Abbreviations</a>
   </li>
-->
   <li class="nav">
    &nbsp;<a class="nav" href="../webtc1/email.html" target="output">Corrections</a>
   </li>
 <li class="nav"><a class="nav" href="../mwquery/index.php"  target="_blank">Advanced Search</a></li>
   <li class="nav">
    &nbsp;
    <a class="nav" href="//www.sanskrit-lexicon.uni-koeln.de/index.html" target="_top">Home</a>
   <!--
     <a href="//www.sanskritlibrary.org" target="_top">Home</a>
    -->
   </li> 
 </ul>
 </div>


<div id="preferences">
<input type='button' id='preferenceBtn'  value='Preferences' style='position:relative; bottom: 5px;' />
&nbsp;&nbsp;
<textarea id='key1' name='TEXTAREA'  rows='1' cols='20' onkeydown='keyboard_HandleChar(event);'></textarea>
&nbsp;
<script type="text/javascript">
 function keyboard_HandleChar(event) {
 //console.log('keyboard_handleChar:',event.keyCode);
 if (event.keyCode != 13) return;
 getWord_keyboard(false,false); //chg1
 if (event.stopPropagation) 
  event.stopPropagation();
 else event.cancelBubble = true;
 if (event.preventDefault) event.preventDefault();
 else event.returnValue = false;
 }
</script>

<a class="nav" href="comments.html" target="_top">Comments</a>
</div>

<div id="disp">
</div>
<div id="displist" class="displist">
</div>
</body>
</html>
