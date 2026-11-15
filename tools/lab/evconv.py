# stdin: lichess_db_eval.jsonl (decompressed). argv: maxLines. stdout: fen - - 0 1;0.5;score_stm(scaled);1
import sys,json
N=int(sys.argv[1]); n=0
out=sys.stdout
for l in sys.stdin:
  n+=1
  if n>N: break
  try:
    j=json.loads(l); ev=max(j['evals'],key=lambda e:e['depth'])
    if ev['depth']<20: continue
    pv=ev['pvs'][0]
    if 'cp' not in pv: continue
    mv=pv['line'].split()[0]; fen=j['fen']; parts=fen.split(); bd={}
    for r,row in enumerate(parts[0].split('/')):
      f=0
      for c in row:
        if c.isdigit(): f+=int(c)
        else: bd[(f,r)]=c; f+=1
    fr=(ord(mv[0])-97,8-int(mv[1])); to=(ord(mv[2])-97,8-int(mv[3])); pc=bd.get(fr,'')
    if len(mv)>4 or to in bd or (pc in 'pP' and fr[0]!=to[0]): continue
    sc=pv['cp'] if parts[1]=='w' else -pv['cp']
    out.write('%s 0 1;0.5;%d;1\n'%(fen,int(sc*0.65)))
  except Exception: pass
