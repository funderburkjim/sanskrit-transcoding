
nala-slp.txt is a coding of the story of nala derived from the 
Mahabharata coded by John Smith, and converted by ejf to slp1 transliteration.

The convert programs provide examples of how to use the transcoder modules,
for php and python.


The two programs convert.php and convert.py are functionally identical.
They take an input (such as nala-slp.txt) and an output file name, and
an input and output encoding.  The input file is parsed and the 
Sanskrit part of each line is converted to an output form using the
given input and output encodings.  Note that not an input/output pair of
encodings should be represented by a file in <input>_<output>.xml in the
transcoding directory.

If one wanted to transcode from, say, roman to devanagari, then this would
need to be done in two applications of convert; first from roman to
slp1 and then from slp1 to devanagari.

A good test is whether a 'round-trip' of two encodings returns a copy of
the original file.
For examples,  here is a round-trip slp1-deva-slp1, using the
php transcoder:

php convert.php nala-slp.txt nala-deva.txt slp1 deva
php convert.php nala-deva.txt nala-slp-fromdeva.txt deva slp1 
# no difference expected
diff  nala-slp-fromdeva.txt nala-slp.txt  

And, here is the same round-trip test using convert.py.

python convert.py nala-slp.txt nala-deva-py.txt slp1 deva
python convert.py nala-deva-py.txt nala-slp-fromdeva-py.txt deva slp1
# no difference expected
diff nala-slp-fromdeva-py.txt nala-slp.txt #
