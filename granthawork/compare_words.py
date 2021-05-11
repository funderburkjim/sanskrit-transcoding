#-*- coding:utf-8 -*-
"""compare_words.py
 usage: python make_compare.py xxx/filein xxx/fileout
 The input file must be in a subdirectory of this  directory
 The input file is expected to have a title line, then a list of words 
  on each following line.
"""
from __future__ import print_function

import sys,re,codecs
#sys.path.append('../')
import transcoder
transcoder.transcoder_set_dir('transcoder')
transcode = transcoder.transcoder_processString  # convenience

styles_dict={
 'grantha':
   """
@font-face { 
 src: url('../granthafonts/e-Grantamil.ttf');
 font-family: grantamil;
/*https://web.archive.org/web/20070506074247/http://www.uni-hamburg.de/Wiss/FB/10/IndienS/Kniprath/INDOLIPI/Indolipi.htm
*/
}
.grantha {
 color:teal;
 font-size:20px;
 font-weight: normal; 
 font-family: grantamil;
}
   """,

 'grantha-sd':
   """
@font-face { 
 src: url('../granthafonts/e-Grantamil-sd.ttf');
 font-family: grantamil-sd;
/*$ wget --no-check-certificate https://sanskritdocuments.org/css/fonts/e-Grantamil.ttf*/
}
.grantha-sd {
 color:teal;
 font-size:20px;
 font-weight: normal; 
 font-family: grantamil-sd;
}
   """,

 'grantha7':
   """
@font-face { 
 src: url('../granthafonts/e-Grantamil 7.ttf');
 font-family: grantamil7;
/*https://www.aai.uni-hamburg.de/indtib/studium/materialien.html

*/
}
.grantha7 {
 color:red;
 font-size:20px;
 font-weight: normal; 
 font-family: grantamil7; 
}
   """,

 'deva':
   """
@font-face { 
 src: url('../granthafonts/siddhanta.ttf');
 font-family: devanagari;
}
.deva {
 color:teal;
 font-size:20px;
 font-weight: normal; 
 /*font-family: devanagari; */
}
  """,
 'slp1':
 """
.slp1 {
 color:black;
 font-size:20px;
 font-weight: normal; 
}
   """
 
}
def generate_html_head(parmout,filein_pfx):
 parts=re.split(r'/',filein_pfx)
 fileshow = parts[-1]
 outarr_str = """<html>
<head>
<title>%s</title>
<meta charset="UTF-8">
"""%filein_pfx
 head_arr = outarr_str.splitlines()
 style_arr = ['<style>']
 for tranout,classname in parmout:
  style_str = styles_dict[classname]
  arr = style_str.splitlines()
  style_arr = style_arr + arr
 # other styling
 style_arr = style_arr + ['td,th {text-align:center}']
 style_arr = style_arr + ['</style>']
 outlines = head_arr + style_arr + ['</head>']
 return outlines

def get_ngram_letters():
 # sanskrit alphabet in slp1 transliteration
 s='aAiIuUfFxXeEoOMHkKgGNcCjJYwWqQRtTdDnpPbBmyrlvSzsh'
 ans=[]
 ixcon = 999
 for ix,x in enumerate(list(s)):
  if x in ['M','H']:
   y='a'+x
   ixcon = ix
  elif ix > ixcon:
   y = x + 'a'  # show consonants with vowel 'a'
  else:
   y=x
  ans.append(y)
 return ans

def html_row(transcodings,indx):
 ans = '<tr>'
 ans = ans + ("<td>%s</td>" % indx)
 for x,tranout,classname in transcodings:
  y = "<span class='%s'>%s</span>" % (classname,x)
  z = "<td>%s</td>" % y
  ans = ans + z
 ans = ans + '</tr>'
 return ans

def get_tablehead(parmout):
 ans=['<table border="1">','<tr>']
 # index in first column
 n = 1
 ans = ans + ["<th>index</th>"]
 for tranout,classname in parmout:
  x = "<th>%s</th>" %classname
  ans = ans + [x]
 ans = ans + ['</tr>']
 return ans

def read_input(filein):
 with codecs.open(filein,"r","utf-8") as f:
  lines = [x.rstrip('\r\n') for x in f]
 title = lines[0]
 words = lines[1:]
 return title,words

def get_htitle(filein):
 parts = re.split(r'/',filein)
 x = parts[-1]
 htitle = re.sub(r'[.].*$','',x)
 return htitle

if __name__ == "__main__":
 filein = sys.argv[1]
 fileout=sys.argv[2]
 title,words = read_input(filein)
 """
 ngram_letters = get_ngram_letters()
 with codecs.open(filein,"w","utf-8") as f:
  f.write('alphabet\n')
  for n in ngram_letters:
   f.write(n + '\n')
 exit(0)
 
 ngram_letters = get_ngram_letters()
 ngrams = ngram_letters
 """

 parmout = [
  # (tranout, classname = fileoutsfx)
  ('slp1','slp1'),
  ('grantha2','grantha'),
  ('grantha2','grantha-sd'),
  ('grantha3','grantha7'),
  ('deva','deva')
 ]
 tranin = 'slp1'
 outarr = []
 htitle = get_htitle(filein)
 outarr = generate_html_head(parmout,htitle)
 title = "<H2>%s</H2>" % title
 outarr = outarr + [title]
 outarr = outarr +  get_tablehead(parmout)
 for ix,x in enumerate(words):
  transcodings = [(transcode(x,tranin,tranout),tranout,classname) for tranout,classname in parmout]
  tablerow = html_row(transcodings,ix+1)
  outarr = outarr + [tablerow]
 outarr = outarr + ['</table>']
 outarr = outarr + ['</body>','</html>']
 with codecs.open(fileout,"w","utf-8") as f:
  for out in outarr:
   f.write(out + '\n')
