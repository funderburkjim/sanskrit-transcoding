<?php
// Sep 24, 2012: ejf modified for sanskrit1d
 global $sanskrit_host,$sanskrit_user,$sanskrit_password,$sanskrit_database;
 global $sanskrit_database_sqlite,$sanskrit_sqlite_ref;
 sanskrit_init();
 require_once('transcoder.php');
function sanskrit_init() {
 global $sanskrit_host,$sanskrit_user,$sanskrit_password,$sanskrit_database;
 global $sanskrit_database_sqlite,$sanskrit_sqlite_ref;
 $sanskrit_host="localhost";
 $sanskrit_user="root";
 $sanskrit_password="";
 $sanskrit_database="sanskrit";
 $sanskrit_database_sqlite = realpath("../sqlite/sanskrit.sqlite");
}
function sanskrit_connect() {
 // not used on sanskrit1d
 return sanskrit_connect_sqlite();
}
function sanskrit_connect_sqlite() {
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
function sanskrit_connect_mysql() {
 global $sanskrit_host,$sanskrit_user,$sanskrit_password,$sanskrit_database;
$link = mysql_connect($sanskrit_host,$sanskrit_user,$sanskrit_password);
if (!$link) {
 print "Could not connect to mysql server.<br/>\n";
 print "mysql error = " . mysql_error() . "<br/>\n";
 print "Check htdocs/sanskrit/php/utilities.php for correct values of " .
        '$sanskrit_host, $sanskrit_user, $sanskrit_password' . "<br/>\n";
 return $link;
}
 $db_selected = mysql_select_db($sanskrit_database);
 if (!$db_selected) {
  print "database $sanskrit_database not found<br/>\n";
  echo "mysql error = " . mysql_error() . " <br/>\n";
  echo "Please use init_sanskrit.php to create database <br/>\n";
  echo "Then rerun init_monier.php <br/>\n";
  return FALSE;
 }
 return $link;
}
?>
