# stdin: lines "RESULT\tMOVETEXT" (lichess PGN with [%eval]); stdout: fen - - 0 1;res;score_stm;1
import sys,re,random,chess
K=int(sys.argv[1]) if len(sys.argv)>1 else 8
random.seed(int(sys.argv[2]) if len(sys.argv)>2 else 1)
tok=re.compile(r'(\d+\.(?:\.\.)?)|\{([^}]*)\}|(\S+)')
ev=re.compile(r'\[%eval (-?\d+(?:\.\d+)?)\]')
RES={'1-0':1.0,'0-1':0.0,'1/2-1/2':0.5}
out=sys.stdout; ng=0
for line in sys.stdin:
  try:
    r,mt=line.rstrip('\n').split('\t',1)
    if r not in RES: continue
    res=RES[r]; b=chess.Board(); cand=[]; moves=[]; evals=[]
    for m in tok.finditer(mt):
      if m.group(3):
        s=m.group(3)
        if s in RES or s=='*': break
        s=s.rstrip('?!')
        moves.append(s); evals.append(None)
      elif m.group(2) is not None and moves:
        e=ev.search(m.group(2))
        if e: evals[-1]=float(e.group(1))
    for i,s in enumerate(moves):
      b.push_san(s)
      e=evals[i]
      if e is None or i<8 or i+1>=len(moves): continue
      if b.is_check() or abs(e)>30: continue
      nxt=b.parse_san(moves[i+1].rstrip('?!'))
      if b.is_capture(nxt) or nxt.promotion: continue
      cand.append((b.board_fen()+(' w' if b.turn else ' b'),int(e*100*0.65*(1 if b.turn else -1))))
    for f,sc in random.sample(cand,min(K,len(cand))):
      out.write('%s - - 0 1;%.1f;%d;1\n'%(f,res,sc))
    ng+=1
  except Exception:
    continue
sys.stderr.write('games %d\n'%ng)
