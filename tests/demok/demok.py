"""demok.py
  Python example of transcoding
  
"""
import sys,codecs,re
import unicodedata
#sys.path.append('../')
import transcoder
#transcoder.transcoder_set_dir('../transcoder');
transcoder.transcoder_set_dir('')
def convert4(datain,fileout,tranin,tranout):
 body = datain
 body1 = transcoder.transcoder_processString(body,tranin,tranout)
 with codecs.open(fileout,"w",'utf-8') as f:
  f.write('%s\n' % body1)
 #y = "%s %s" % (head,body1)
 #fpout.write("%s\n" % y)
 #fp.close()
 #fpout.close()
 print "fileout=",fileout

def output(f,tranin,tranout,body):
  body1 = transcoder.transcoder_processString(body,tranin,tranout)
  f.write('%4s: %s\n' %(tranin,body))
  f.write('%s %s\n' % (tranout,body1))
  outarr = [repr(c) for c in body1]
  out = ' '.join(outarr)
  f.write('unic: %s\n'%out)
  names = [unicodedata.name(c) for c in body1]
  out = ','.join(names)
  f.write('    : %s\n'%out)
  f.write('\n')
   
#-----------------------------------------------------
if __name__=="__main__":
 body = "01 Bramati"
 body = """k ka ki kz"""

 fileout = "demok.txt"
 with codecs.open(fileout,"w",'utf-8') as f:
  for b in body.split(' '):
   output(f,'slp1','deva',b)
 
