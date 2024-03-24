02-03-2024
Files downloaded from scans/MWScan/2013/web directory at Cologne server.
2013_utilities.zip  a zip of 2013/web/utilities
2013_webtc1.zip     a zip of 2013/web/webtc1

The files in webtc1/transcoderjs/ directory may provide a
js version of the cdsl transcoding.
----------------------------------------
# modify transcoderjs/createJson.php so it runs in current environment
/c/xampp/php/php.exe createJson1.php temp_createJson1.txt

diff temp_createJson1.txt transcoderjs/transcoderJson.js | wc -l
# 0 --

----------------------------------------
transcoderJson.js has
transcoder.fsmarr['from_to']=...
where from = slp1 and to = deva, roman,hk,itrans,wx
      from = hk, itrans, wx and to = slp1

We want to extend this at least to from=deva and to=slp1

/c/xampp/php/php.exe createJson2.php transcoderJson2.js
 However, this does not parse 'deva_slp1.xml' !

Why?  Necessary to examine utilities/transcoder.php

transcoder.processString('मन्','deva','slp1') -> mn  (ERROR)
# change deva_slp1.xml:
cp utilities/transcoder/deva_slp1.xml utilities/transcoder/temp_deva_slp1a.xml  # save copy of this
# get current (02-04-2024) version
$ cp /c/xampp/htdocs/cologne/csl-websanlexicon/v02/makotemplates/web/utilities/transcoder/deva_slp1.xml utilities/transcoder/deva_slp1.xml
# this change still leaves a problem
# Revert
cp utilities/transcoder/deva_slp1.xml utilities/transcoder/deva_slp1_web.xml
cp utilities/transcoder/temp_deva_slp1a.xml utilities/transcoder/temp_deva_slp1
.xml

# revision to transcoder.php so that createJson2.php generates proper Json.
#   With this revision, transcoder_processString does NOT work quite right.
test1.html Uses transoder3.js and transcoderJson2.js

# Revision to transcoder3.js .
Now deva_slp1 conversion seems to work
# Only known deficiency:  accents.  Possibly this could be resolved
# by further modificationo of transcoder3.js, to be in compliance with
# The problem is believed to be old versions (accent-before vowel) used
#  in utilities/transcoder/slp1_deva.xml and deva_slp1.xml

NOTE: createJson
-----------------------------------------------------------
02-07-2024  try to get an 'accent' version
---
Use current transcoding xml files
mkdir utilities_accent
cp utilities/transcoder.php utilities_accent/transcoder.php

cp -r /c/xampp/htdocs/cologne/csl-apidev/utilities/transcoder utilities_accent/

cp  createJson1.php createJson1_accent.php
# edit createJson1_accent.php :
#   1. use utilities_accent
#   2. Change json so line-break at '{' -- this is temporary
--

# make 
/c/xampp/php/php.exe createJson1_accent.php transcoderJson2_accent.js

--
cp transcoder3.js transcoder3_accent.js

cp test1.html test1_accent.html
# Edit test1_accent.html - it uses
 

WARNING: utilities/transcoder.php has been modified so that
JSON is created 'properly' (namely so it outputs utf8 and not bytes)
  With this change, the fsmarr is properly executed by transcoder3.js.
  
However, the function transcoder_processString does NOT work properly
 with the altered fsm.


TODO: PWG devanagari representation of accents
  This is in slp1_deva1.xml.
  However, there is currently no deva1_slp1.xml
TODO: shrink size of transcoderJson2_accent.js by
  shortening key names. Then make transcoder3_accent.js consistent with this.

