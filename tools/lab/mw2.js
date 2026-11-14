// node mw.js engine.js sfLevel ms pairsStart pairsN out.json  (FHK vs app's Stockfish wasm)
const {Worker}=require('worker_threads');const fs=require('fs');
const [Ef,LV,MS,P0,PN,OUT]=process.argv.slice(2);const E=require(Ef);const WW=process.env.WASM?require(__dirname+'/fhkw.js').create(E,process.env.WASM,19):null;if(WW&&process.env.NET)WW.loadNet(process.env.NET);const OP=require(__dirname+'/openings.json');
function sf(){const w=new Worker(__dirname+'/shim.js',{workerData:__dirname+'/../../engine/sf-worker.js'});let waiter=null;
 w.on('message',m=>{m=String(m);if(waiter&&waiter.re.test(m)){const x=waiter;waiter=null;x.res(m);}});
 const cmd=(c,re)=>new Promise(res=>{if(re)waiter={re,res};w.postMessage(c);if(!re)res();});return {w,cmd};}
(async()=>{const s=sf();await s.cmd('uci',/uciok/);await s.cmd('setoption name Skill Level value '+LV);const res=[];const pgn=[];
 for(let i=+P0;i<+P0+ +PN;i++)for(const meW of [true,false]){await s.cmd('ucinewgame');await s.cmd('isready',/readyok/);
  const pos=new E.Position(OP[i%OP.length]);const S=process.env.WASM?(()=>{const w=WW;w.clear();return w;})():new E.Searcher(19);const H={};let r=null,ply=0;const sans=[];
  while(true){const L=pos.legalMoves();if(!L.length){r=pos.inCheck()?(pos.side===0?0:1):0.5;break;}
   const k=pos.fen().split(' ').slice(0,4).join(' ');H[k]=(H[k]||0)+1;if(H[k]>=3||pos.half>=100||pos.insufficient()||ply>300){r=0.5;break;}
   let u;if((pos.side===0)===meW){u=pos.uci(S.go(pos,{time:+MS}).move);}else{await s.cmd('position fen '+pos.fen());const l=await s.cmd('go movetime '+MS,/^bestmove/);u=l.split(' ')[1];}
   const m=pos.parseUci(u);sans.push(pos.san(m));pos.make(m);ply++;}
  const my=r===0.5?0.5:(meW?r:1-r);res.push(my);pgn.push(`[FEN "${OP[i%OP.length]}"]\n[White "${meW?'FHK':'SF L'+LV}"]\n[Black "${meW?'SF L'+LV:'FHK'}"]\n[Result "${r===0.5?'1/2-1/2':r?'1-0':'0-1'}"]\n\n${sans.join(' ')}\n`);
  fs.writeFileSync(OUT,JSON.stringify(res));fs.writeFileSync(OUT+'.pgn',pgn.join('\n'));}
 console.log('FHK score',res.reduce((a,b)=>a+b,0),'/',res.length);process.exit(0);})();
