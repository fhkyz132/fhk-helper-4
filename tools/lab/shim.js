const {parentPort,workerData}=require('worker_threads');
global.self=global;global.postMessage=m=>parentPort.postMessage(m);global.importScripts=()=>{};
global.location={href:'file:///x'};
parentPort.on('message',m=>{if(global.onmessage)global.onmessage({data:m});else if(self.onmessage)self.onmessage({data:m});});
require(workerData);
