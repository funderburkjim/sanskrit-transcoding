#-*- coding:utf-8 -*-
"""convert_grantha.py
"""
from __future__ import print_function

import sys,re,codecs
import transcoder
transcoder.transcoder_set_dir('transcoder')
transcode = transcoder.transcoder_processString  # convenience

def parse_filename(filein):
 tranin_known = ['slp1','roman','hk']
 m = re.search(r'^(.*)_(.*)[.]txt$',filein)
 if m:
  pfx,tranin = (m.group(1),m.group(2))
 if (not m) or (tranin not in tranin_known):
  endings = ['_%s.txt' %t for t in tranin_known]
  print("filein error: require filename ending in one of %s" %endings)
  exit(1)
 return pfx,tranin

def generate_text(lines,tranout,classname,filein_pfx,title):
 fileout = "%s_%s.txt" %(filein_pfx,classname)
 with codecs.open(fileout,"w","utf-8") as f:
  f.write(title+'\n')
  for x in lines:
   y = transcode(x,'slp1',tranout)
   f.write(y+'\n')
 print('%s lines written to %s' %(len(lines),fileout))

styles={
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
 color:teal;
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
 font-family: devanagari; 
}
   """
 
}
def generate_html_head(tranout,classname,filein_pfx):
 parts=re.split(r'/',filein_pfx)
 fileshow = parts[-1]
 style = styles[classname]
 outlinestr="""<html>
<head>
<title>%s:%s</title>
<meta charset="UTF-8">
<style>
%s
</style>
</head>
""" %(fileshow,classname,style)
 outlines = outlinestr.splitlines()
 return outlines
def generate_html(lines,tranout,classname,filein_pfx,title):
 # lines assumed coded in slp1
 fileout = "%s_%s.html" %(filein_pfx,classname)
 head = generate_html_head(tranout,classname,filein_pfx)
 def oneline(x):
  y = transcode(x,'slp1',tranout)
  z = "<span class='%s'>%s</span><br/>" %(classname,y)
  return z
 linesout = [oneline(x) for x in lines]
 titleline = ['<H2>%s</H2>' % title]
 body = ['<body>'] + titleline + linesout + ['</body>']
 tail = ['</html>']

 outlines = head + body + tail
 with codecs.open(fileout,"w","utf-8") as f:
  for y in outlines:
   f.write(y+'\n')
 print('%s lines written to %s' %(len(outlines),fileout))

if __name__ == "__main__":
 filein = sys.argv[1]
 filein_pfx,tranin = parse_filename(filein)
   
 with codecs.open(filein,'r','utf-8') as f:
  linesin0 = [x.rstrip('\r\n').rstrip() for x in f]
 title = linesin0[0]
 linesin = linesin0[1:]
 # get lines_slp1 from tranin and linesin
 if tranin == 'slp1':
  lines_slp1 = linesin
 else:
  lines_slp1 = []
  for x in linesin:
   line = transcode(x,tranin,'slp1')
   lines_slp1.append(line)
  # also, write lines_slp1
  fileout = '%s_slp1.txt' % filein_pfx
  with codecs.open(fileout,"w","utf-8") as f:
   f.write(title+'\n')
   for x in lines_slp1:
    f.write(x + '\n')
  print('%s lines written to %s' %(len(lines_slp1),fileout))
 # generate text files:
 parmout = [
  # (tranout, classname = fileoutsfx)
  ('grantha2','grantha'),
  ('grantha2','grantha-sd'),
  ('grantha3','grantha7'),
  ('deva','deva')
 ]
 # get different versions of text files
 for tranout, classname in parmout:
  generate_text(lines_slp1,tranout,classname,filein_pfx,title)
 # different versions of html files
 for tranout, classname in parmout:
  generate_html(lines_slp1,tranout,classname,filein_pfx,title)

