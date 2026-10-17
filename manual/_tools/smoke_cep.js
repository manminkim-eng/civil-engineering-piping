// 스모크: 로드 · 콘솔 오류 · 우수 · 오수 계산 · A4 · 가로 넘침 · 매뉴얼 버튼 (1440 · 390)
const {chromium}=require('playwright');const {setup,server}=require('./serve.js');const path=require('path');
const out=process.argv[2]||'/tmp';
(async()=>{const repo=path.resolve(__dirname,'../..');const srv=await server(repo,8915);const b=await chromium.launch();const R=[];
for(const w of [1440,390]){const ctx=await b.newContext({viewport:{width:w,height:900},serviceWorkers:'block'});await setup(ctx);const pg=await ctx.newPage();const errs=[];
 pg.on('pageerror',e=>errs.push('PE '+e.message));pg.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push('CE '+m.text())});
 await pg.goto('http://127.0.0.1:8915/index.html');await pg.waitForFunction(()=>window.CEPENG,null,{timeout:20000});await pg.waitForTimeout(600);
 await pg.evaluate(()=>{document.getElementById('uw-ref').value='대전';uwRefApply();calcUW();});await pg.waitForTimeout(300);
 const uw=await pg.evaluate(()=>{const r=UW.result;return {I:+r.I,dn:r.dn,Q:+r.Qcap.toFixed(4),V:+(+r.V).toFixed(2),vOk:r.vOk,min:r.minDN}});
 await pg.screenshot({path:out+'/uw_'+w+'.png',fullPage:true});
 await pg.evaluate(()=>{showTab('tab-sw',document.querySelectorAll('.tb')[1]);calcSW();});await pg.waitForTimeout(300);
 const sw=await pg.evaluate(()=>{const r=SW.result;return {pop:r.pop,dn:r.dn,Q:+r.Qcap.toFixed(5),V:+(+r.V).toFixed(2),vOk:r.vOk,min:r.minDN}});
 await pg.screenshot({path:out+'/sw_'+w+'.png',fullPage:true});
 await pg.evaluate(()=>{showTab('tab-report',document.querySelectorAll('.tb')[2]);});await pg.waitForTimeout(500);
 await pg.screenshot({path:out+'/a4_'+w+'.png',fullPage:true});
 const a4=await pg.evaluate(()=>({rows:document.querySelectorAll('#a4-content .a4-tbl tbody tr').length,kds:document.getElementById('a4-content').innerText.includes('KDS 61 40 00'),old:/주택건설기준|Talbot/.test(document.getElementById('a4-content').innerText)}));
 const ov=await pg.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 const man=await pg.evaluate(()=>{const a=document.getElementById('mm-manual-btn');return a?a.parentElement.className+'|'+getComputedStyle(a).color+'|'+getComputedStyle(a).marginLeft:null});
 R.push({w,uw,sw,a4,ov,man,errs});await ctx.close();}
console.log(JSON.stringify(R,null,1));await b.close();srv.close();})();
