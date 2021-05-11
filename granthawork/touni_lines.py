
import sys
import codecs
import unicodedata
import re
if __name__ == "__main__":
 filein=sys.argv[1]
 fileout=sys.argv[2]
 with codecs.open(filein,"r","utf-8") as f:
  lines = [x.rstrip('\r\n') for x in f]
 
 with codecs.open(fileout,"w","utf-8") as f:
  n = 0
  for iline,line in enumerate(lines):
   jline=iline+1
   words = re.split(r' +',line)
   for iword,word in enumerate(words):
    jword = iword+1
    f.write('line %d, word %s---------------------------------------\n'% (jline,jword))
    for i,c in enumerate(word):
     ic = i + 1
     try:
      name=unicodedata.name(c)
     except:
      name='UNKNOWN'
     out = '%02d %04x %s' %(ic,ord(c),name)
     f.write(out+'\n')
    f.write('\n') # extra blank line at end of word

 print(len(lines),'lines and ',n,'characters written to',fileout)

