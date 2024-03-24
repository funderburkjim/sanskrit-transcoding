<?php
// Dec 16, 2012: ejf modified 
// Sep 24, 2012: ejf modified for sanskrit1d
// Oct 25, 2012: ejf reorganized code. 
//  Note that the sqlite initialization is not really used, as
//  sqlite databases are accessed via shell command 'sqlite3' 
//  sanskrit_connect_mysql() is re-written to be consistent with
//  Code automatically initializes the database
// Perl version as exemplified in
// //sanskrit1d.ccv.brown.edu/cgi-skt/Funderburk/test/mysqltest3.pl?key=rAma
 global $sanskrit_host,$sanskrit_user,$sanskrit_password,$sanskrit_database;
 global $sanskrit_database_sqlite,$sanskrit_sqlite_ref;
 // sanskrit1d_init_sqlite();
 sanskrit_mysql_init();
 require_once('transcoder.php');
function sanskrit1d_init_sqlite() {
 global $sanskrit_host,$sanskrit_user,$sanskrit_password,$sanskrit_database;
 global $sanskrit_database_sqlite,$sanskrit_sqlite_ref;
 $sanskrit_host="localhost";
 $sanskrit_user="root";
 $sanskrit_password="";
 $sanskrit_database="sanskrit";
 $sanskrit_database_sqlite = realpath("../sqlite/sanskrit.sqlite");
}
function sanskrit_mysql_init() {
 global $sanskrit_host,$sanskrit_user,$sanskrit_password,$sanskrit_database;
// online constants at Cologne
 $sanskrit_host="mysql:sanskrit-lexicon";
 $sanskrit_user="sanskrit-lexicon:mysql.rrz.uni-koeln.de";
 $sanskrit_password="IwdsgmVns";
 $sanskrit_database="sanskrit-lexicon";
}

function sanskrit_mysql_connect($db) {
 // if $db is null, use $sanskrit_database
 global $sanskrit_host,$sanskrit_user,$sanskrit_password,$sanskrit_database;
$link = mysql_connect($sanskrit_host,$sanskrit_user,$sanskrit_password);
if (!$link) {
 print "Could not connect to mysql server.<br/>\n";
 print "mysql error = " . mysql_error() . "<br/>\n";
 print "Check htdocs/sanskrit/php/utilities.php for correct values of " .
        '$sanskrit_host, $sanskrit_user, $sanskrit_password' . "<br/>\n";
 return $link;
}
 if(!$db) {$db = $sanskrit_database;}
 $db_selected = mysql_select_db($db);
 if (!$db_selected) {
  print "database $db not found<br/>\n";
  echo "mysql error = " . mysql_error() . " <br/>\n";
  return FALSE;
 }
 return $link;
}
function unused_sanskrit_connect() {
 // not used on sanskrit1d
 return unused_sanskrit_connect_sqlite();
}

function unused_sanskrit_connect_sqlite() {
 // not used on sanskrit1d
 global $sanskrit_database_sqlite,$sanskrit_sqlite_ref;
// The functional interface to sqlite3 in php requires 
// php version 5.4 or higher.
// sanskrit1d has version 5.3.3.
// Thus, this connection function only establishes the 
// sqlite database name.
 $sanskrit_sqlite_ref= sqlite_open($sanskrit_database_sqlite,0666,$error);
 if (! $sanskrit_sqlite_ref) {
  echo "sanskrit_connect_sqlite: ERROR opening $sanskrit_database_sqlite\n";
 }
  return $sanskrit_sqlite_ref;
}

?>
