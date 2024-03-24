/* this can be run from the chrome browswer console.
   It assumes that transcoder1.js is in the context.
   The function simply iterates over a desired set of
   (existing) transcoder files, calls fsminit for each.
   Then, it writes out transcoder.fsmarr in Json format.
   Once done, the console.log output can be selected, copied,
   and pasted into a file, which probably should be saved as
   UTF-8.
   Step-by-step instructions:
   1. Open the url in the Chrome browser:
   //sanskrit1d.ccv.brown.edu/Sanskrit/Funderburk/monier/webtc5wa/transcoderjs/test2.php
   2. Open the developer tools of Chrome
   3. Change any desired transcoder xml files in directory:
      /data/apache/htdocs/Sanskrit/Funderburk/monier/utilities/transcoder/
   4. copy the following two javascript functions.
      Note: The 'fromslp1Arr' and 'toslp1Arr' may adjusted to limit the
      amount of output from step 6.
   5. Open the 'Console' of the developer tools,
      and paste the (adjusted) functions into the console; press return
      so they are compiled.
   6. enter 'initTranscoderJson()' into the console.  This will 
      display selected JSON objects in the console window.
   7. select and copy from the console window the new Json objects;
      open (in a text editor) the transcoderJson.js file, and paste
      as required.
    
   Note on cache:  If you do several iterations of the transcoder files,
     you may need to empty the 'cache' of the Chrome browser. Choose 'History'
     then click 'Clear all browsing data', check 'Empty the cache' and
     click 'Clear browsing data'.

   Note on xml errors:  If the transcoder xml file has errors, the 
    process fails silently (UGH!).
*/
function initTranscoderJson_Helper(from,to) {
    transcoder.fsminit(from,to);
    var key = from + "_" + to;
    console.log("transcoder.fsmarr['" + key + "']=");
    console.log(JSON.stringify(transcoder.fsmarr[key]));
    console.log(";");
}
function initTranscoderJson() {
    var fromslp1Arr = ["deva","roman","hk","itrans","wx"];
    var toslp1Arr = ["hk","itrans","wx"];
    var i;
    for(i=0;i<fromslp1Arr.length;i++) {
	initTranscoderJson_Helper("slp1",fromslp1Arr[i]);
    }
    for (i=0;i<toslp1Arr.length;i++) {
	initTranscoderJson_Helper(toslp1Arr[i],"slp1");
    }
}
