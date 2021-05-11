
import sys
import codecs
import unicodedata
if __name__ == "__main__":
 filein=sys.argv[1]
 fileout=sys.argv[2]
 with codecs.open(filein,"r","utf-8") as f:
  text = f.read()
 
 with codecs.open(fileout,"w","utf-8") as f:
  n = 0
  for i,c in enumerate(text):
   try:
    name=unicodedata.name(c)
   except:
    name='UNKNOWN'
   out = '%02d %04x %s' %(i,ord(c),name)
   #print(out)
   n = n + 1
   f.write(out+'\n')
 print(len(text),n,'characters written to',fileout)

