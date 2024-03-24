/* test5.js  used with test5.php */
jQuery(document).ready(function(){ 
    // Note: with keydown, only upper case characters returned!!
    // Thankfully, keypress doesn't do this. However, 'keypress' does not
    // pass thru backspace and delete keys!!
    // attach handler to 'key' element, and a callback for 'return'
    theTranscoderField = new TranscoderField('key',getWord); 
    // install 'transcoderChange' when the user elements for selecting the
    // input and output encodings change
    jQuery('#transLit').change(transcoderChange);
    jQuery('#filter').change(transcoderChange);
    cookieUpdate(false);  // for initializing cookie
    // initialize transcoder for the current settings.
    transcoderChange();
    theTranscoderField.debugid = 'slptxt'; // for debugging
});
function transcoderChange() {
 // references various things pertaining to this page.
 var inval = jQuery('#transLit').val();
 var outval = jQuery('#filter').val();
 jQuery('#inval').val(inval);
 jQuery('#outval').val(outval);
 theTranscoderField.transCoderChange(inval,outval);
 jQuery('#slptxt').val('');
 cookieUpdate(true);
}
function getWord() {
 console.log('getWord: citation ready to process');
 console.log('slptxt=',theTranscoderField.slptxt);
 console.log('from=',theTranscoderField.tcFrom,', to=',theTranscoderField.tcTo);
}

function cookieUpdate(flag) {
 // cookie named mwio for holding transLit and filter values
 var cookieName = 'mwio';
 var cookieOptions = {expires: 365, path:'/'}; // 365 days
 var cookieValue = jQuery.cookie(cookieName);
 if (cookieValue == ",") {
     cookieValue = null;
 }
 if ((! cookieValue) || flag ) {
  //alert('initializing cookievalue');
   cookieValue = jQuery('#transLit').val()+ "," + jQuery('#filter').val();
 }else {
  //alert('cookieValue = ' + cookieValue);
 }
 jQuery.cookie(cookieName,cookieValue,cookieOptions);
 cookieValue = jQuery.cookie(cookieName);
 var values = cookieValue.split(",");
 //alert('cookieUpdate: values=' + values);
 jQuery('#transLit').attr('value',values[0]);
 jQuery('#filter').attr('value',values[1]);
 jQuery('#inval').attr('value',values[0]);
 jQuery('#outval').attr('value',values[1]);
};
