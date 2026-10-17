// 토목배관(단지내 우수·오수 배관 산정) 매뉴얼 화면 캡처 — usage: node capture_cep.js <repoDir> <outDir>
// 규격: 1440×900 · DSF 1.25 (영상용 좁은 화면: MM_VW=720 MM_VH=1280 MM_DSF=2) · serviceWorkers block · _marks.json · _example.json
const {chromium}=require(process.env.MM_PW||'playwright');const fs=require('fs');const path=require('path');const {setup,server}=require('./serve');
const repo=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]);fs.mkdirSync(out,{recursive:true});
const VW=+(process.env.MM_VW||1440),VH=+(process.env.MM_VH||900),DSF=+(process.env.MM_DSF||1.25),PORT=8977;
const HIDE='#pwa-install-banner,#sw-update-bar,.toast,#fab-group,.bottom-bar{display:none!important} *{animation:none!important;transition:none!important} .main-wrap{padding-bottom:20px!important}';
const HELP=`window.__vis=e=>e&&e.getClientRects().length>0;
window.__find=sel=>{
 if(sel.startsWith('card:')){const t=sel.slice(5);return [...document.querySelectorAll('.card')].find(c=>__vis(c)&&c.querySelector('.card-tit')&&c.querySelector('.card-tit').textContent.includes(t))||null;}
 if(sel.startsWith('fg:')){const t=sel.slice(3);return [...document.querySelectorAll('.fgrp')].find(g=>__vis(g)&&g.querySelector('.flbl')&&g.querySelector('.flbl').textContent.includes(t))||null;}
 if(sel.startsWith('crow:')){const t=sel.slice(5);return [...document.querySelectorAll('.crow')].find(g=>__vis(g)&&g.textContent.includes(t))||null;}
 if(sel.startsWith('nth:')){const [q,i]=sel.slice(4).split('|');return [...document.querySelectorAll(q)].filter(__vis)[+i]||null;}
 for(const s of sel.split(',')){const e=[...document.querySelectorAll(s)].find(__vis);if(e)return e;}return null;};
window.__tab=i=>showTab(['tab-uw','tab-sw','tab-report'][i],document.querySelectorAll('.tb:not(.tb-manual)')[i]);
window.__uwA=()=>{resetUW();document.getElementById('uw-ref').value='대전';uwRefApply();calcUW();};
window.__uwB=()=>{__uwA();document.getElementById('uw-basis').value='drain';calcUW();};
window.__swA=()=>{resetSW();calcSW();};
window.__swB=()=>{__swA();document.getElementById('sw-slope').value='200';calcSW();};
window.__guide=t=>{if(!_guideOpen)toggleGuide();switchGuideTab(t);};`;
const UWA="__tab(0);__uwA();__swA();__tab(0)";
const SHOTS=[
 {id:'s01_overview',pre:UWA+";window.scrollTo(0,0)",clip:'viewport',m:[['nth:.tb|0','탭 3개'],['#mm-manual-btn','📘 매뉴얼'],['.sum-bar','요약 바'],['nth:#tab-uw .card|0','입력'],['#uw-result-panel .result-hero','결과']]},
 {id:'s02_header',clip:'.hdr-shell',m:[['.hdr-h1','도구 이름 · Ver-5.1'],['#mm-manual-btn','📘 매뉴얼 — 탭 막대 끝'],['.hdr-right','KDS 61 40 00 · 61 10 00 (2025. 10. 1.)'],['.tab-bar-inner','탭 3개']]},
 {id:'s03_uw_rain',clip:'card:1. 지역 및 강우',m:[['fg:관경 · 유속 판정','판정 기준 — 공공관로 / 배수설비'],['fg:참고 지점','참고 지점 — 대전 · 임실'],['fg:재현기간','재현기간 — 지선 10년'],['fg:도달시간','도달시간 t'],['#uw-ref-note','참고 표 값'],['fg:강우강도 I','강우강도 I 입력']]},
 {id:'s04_uw_basin',clip:'card:2. 유역 및 지표',m:[['fg:유역면적','유역면적 A'],['fg:유출계수 C','유출계수 C'],['fg:구배 경사','관로 경사'],['fg:여유율','여유율 (MANMIN)'],['fg:관 재질','관 재질'],['fg:Manning n','조도계수 n — KDS 표준']]},
 {id:'s05_uw_seg',pre:"uwSetMode('multi');uwAddSeg()",clip:'card:3. 배관 구간',post:"uwSetMode('single');uwSegs=uwSegs.slice(0,1);document.getElementById('uw-seg-badge').textContent='구간 1개';uwRenderSegs();__uwA()",m:[['.pipe-toggle','단일 · 다중 구간'],['nth:#uw-segs-wrap .seg-row|0','구간명 · 길이 · 유역'],['#uw-multi-btns','구간 추가']]},
 {id:'s06_uw_hero',clip:'#uw-result-panel .result-hero',to:'#uw-result-panel .stat-grid',m:[['#uw-result-panel .rh-num','추천 관경 DN 450'],['nth:#uw-result-panel .sbox|3','설계유량'],['nth:#uw-result-panel .sbox|4','계획유량 유속'],['nth:#uw-result-panel .sbox|5','계획유량 수심비']]},
 {id:'s07_uw_dn',clip:'card:관경별 만류 통수능',m:[['#uw-result-panel .pc-rec','추천 — 만류 ≥ 설계유량'],['nth:#uw-result-panel .pc-dim|0','최소관경부터 비교']]},
 {id:'s08_uw_steps',clip:'card:계산 과정 (합리식)',m:[['crow:② 계획우수량','합리식 Q = C·I·A/360'],['crow:④ 최소관경','최소관경 — 근거 조항'],['crow:⑤','만류 통수능 ≥ 설계유량'],['crow:⑥','계획유량 유속 판정']]},
 {id:'s09_uw_drain',pre:"__uwB()",clip:'#uw-result-panel .result-hero',to:'#uw-result-panel .nb.amber',post:"__uwA()",m:[['#uw-result-panel .rh-label','배수설비 기준'],['#uw-result-panel .nb.amber','유속 1.5 m/s 초과 — 검토']]},
 {id:'s10_sw_qty',pre:"__tab(1)",clip:'card:1. 계획 오수량',m:[['fg:계획 세대','세대 수'],['fg:세대당 인원','세대당 인원'],['fg:1인1일최대','1인1일최대오수량'],['fg:시간변동계수','시간변동계수 1.3 ~ 1.8'],['fg:지하수량','지하수량 ≤ 20 %'],['fg:일평균','일평균 / 일최대']]},
 {id:'s11_sw_cond',clip:'card:2. 배관 설계 조건',m:[['fg:관경 · 유속 판정','판정 기준 · 국지 150'],['fg:관 경사','관 경사'],['fg:Manning n','조도계수 0.011'],['fg:계획하수량 여유율','여유율 (1.1(5))'],['fg:단면 산정','만류 단면']]},
 {id:'s12_sw_hero',clip:'#sw-result-panel .result-hero',to:'#sw-result-panel .stat-grid',m:[['#sw-result-panel .rh-num','추천 관경 DN 200'],['nth:#sw-result-panel .sbox|1','계획1일최대'],['nth:#sw-result-panel .sbox|2','계획시간최대'],['nth:#sw-result-panel .sbox|4','계획유량 유속']]},
 {id:'s13_sw_steps',clip:'card:계산 과정 (계획오수량)',m:[['crow:② 계획1일최대','지하수량 포함'],['crow:④ 설계유량','여유율'],['crow:⑤ 최소관경','최소관경 근거'],['crow:⑦','유속 판정']]},
 {id:'s14_sw_low',pre:"__swB()",clip:'#sw-result-panel .result-hero',to:'#sw-result-panel .nb.amber',post:"__swA()",m:[['#sw-result-panel .rh-note','1/200 — 유속 미달'],['#sw-result-panel .nb.amber','경사 상향 · 시점부 5 ‰']]},
 {id:'s15_a4bar',pre:"__tab(2);window.scrollTo(0,0)",wait:900,clip:'viewport',m:[['.a4-export-bar','A4 출력 막대'],['.mm-btn-print','인쇄 · PDF'],['#btn-jpg','JPG 저장']]},
 {id:'s16_a4page',clip:'#a4-content',m:[]},
 {id:'s17_help_formula',pre:"__guide('formula')",wait:500,fixed:true,clip:'#guide-panel',m:[]},
 {id:'s18_help_law',pre:"__guide('law')",wait:300,fixed:true,clip:'#guide-panel',m:[]},
 {id:'s19_help_design',pre:"__guide('design')",wait:300,fixed:true,clip:'#guide-panel',m:[]},
 {id:'s20_help_pipe',pre:"__guide('pipe')",wait:400,fixed:true,clip:'#guide-panel',post:"toggleGuide();__tab(0)",m:[]},
];
(async()=>{
 const s=await server(repo,PORT);const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:VW,height:VH},deviceScaleFactor:DSF,serviceWorkers:'block',locale:'ko-KR'});await setup(ctx);
 const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('dialog',d=>{errs.push('dialog '+d.message());d.dismiss();});
 await pg.goto(`http://127.0.0.1:${PORT}/index.html`);await pg.waitForFunction(()=>window.CEPENG);await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(1200);
 await pg.addStyleTag({content:HIDE});await pg.evaluate(HELP);await pg.evaluate("document.getElementById('uw-date').value='2026-10-17';document.getElementById('sw-date').value='2026-10-17';");await pg.waitForTimeout(300);
 const meta={};
 for(const S of SHOTS){
  if(S.pre){try{await pg.evaluate(S.pre);}catch(e){errs.push(S.id+' pre '+e.message);}}
  await pg.evaluate("document.getElementById('uw-date').value='2026-10-17';document.getElementById('sw-date').value='2026-10-17';");
  await pg.waitForTimeout(S.wait||450);
  if(S.clip!=='viewport'&&!S.fixed){await pg.evaluate(c=>{const e=__find(c);if(e){window.scrollTo(0,e.getBoundingClientRect().top+scrollY-40);}},S.clip);await pg.waitForTimeout(350);}
  const info=await pg.evaluate(({S,VW,VH})=>{
   const abs=e=>{const r=e.getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,w:r.width,h:r.height};};
   let clip;
   if(S.clip==='viewport'){clip={x:0,y:scrollY,width:VW,height:VH};}
   else{const el=__find(S.clip);if(!el)return {err:'clip '+S.clip};const a=abs(el);const P=S.fixed?0:10;clip={x:Math.max(0,a.x-P),y:Math.max(0,a.y-P),width:a.w+2*P,height:a.h+2*P};
     if(S.to){const t=__find(S.to);if(t){const r=abs(t);clip.height=r.y+r.h+P-clip.y;}}}
   const marks=[];(S.m||[]).forEach(([sel,label],i)=>{const e=__find(sel);if(!e){marks.push({n:i+1,label,miss:sel});return;}const a=abs(e);
     marks.push({n:i+1,label,x:+((a.x-clip.x)/clip.width*100).toFixed(2),y:+((a.y-clip.y)/clip.height*100).toFixed(2),w:+(Math.min(a.w,clip.x+clip.width-a.x)/clip.width*100).toFixed(2),h:+(Math.min(a.h,clip.y+clip.height-a.y)/clip.height*100).toFixed(2)});});
   return {clip,marks};},{S,VW,VH});
  if(info.err){errs.push(S.id+' '+info.err);continue;}
  const c=info.clip;const cl={x:Math.max(0,c.x),y:Math.max(0,c.y),width:Math.min(c.width,VW-Math.max(0,c.x)),height:c.height};
  if(S.clip==='viewport'){await pg.screenshot({path:path.join(out,S.id+'.png'),clip:{x:0,y:0,width:VW,height:VH}});}
  else if(S.fixed){const sy=await pg.evaluate(()=>scrollY),sx=await pg.evaluate(()=>scrollX);await pg.screenshot({path:path.join(out,S.id+'.png'),clip:{x:Math.max(0,c.x-sx),y:Math.max(0,c.y-sy),width:Math.min(c.width,VW),height:Math.min(c.height,VH-Math.max(0,c.y-sy))}});}
  else{await pg.screenshot({path:path.join(out,S.id+'.png'),clip:cl,fullPage:true});}
  meta[S.id]={w:Math.round(cl.width),h:Math.round(Math.min(cl.height,S.fixed?VH:1e9)),marks:info.marks};
  if(S.post){try{await pg.evaluate(S.post);}catch(e){errs.push(S.id+' post '+e.message);}await pg.waitForTimeout(300);}
 }
 const EX=await pg.evaluate(()=>{const pk=r=>({dn:r.dn,min:r.minDN,minRule:r.minRule,Q:r.Q,Qcap:r.Qcap,Qfull:r.Qfull,V:r.V,f:r.f,vOk:r.vOk,vLow:r.vLow,vHigh:r.vHigh,capOk:r.capOk});
  const o={};__uwA();o.uwA=Object.assign(pk(UW.result),{I:UW.result.I,A:UW.result.A,C:UW.result.C});__uwB();o.uwB=pk(UW.result);
  __swA();o.swA=Object.assign(pk(SW.result),{pop:SW.result.pop,qday:SW.result.qday,qhr:SW.result.qhr});__swB();o.swB=pk(SW.result);
  const d=CEPENG.sw({units:200,ppu:2.5,wpd:250,gw:10,peakf:1.5,avg:.75,slope:100,n:.011,margin:10,basis:'drain'});o.swDrain=pk(d);
  __uwA();__swA();return o;});
 fs.writeFileSync(path.join(out,'_example.json'),JSON.stringify(EX,null,1));
 const mctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,serviceWorkers:'block',isMobile:true,hasTouch:true,locale:'ko-KR'});await setup(mctx);
 const mp=await mctx.newPage();await mp.goto(`http://127.0.0.1:${PORT}/index.html`);await mp.waitForFunction(()=>window.CEPENG);await mp.waitForTimeout(1200);await mp.addStyleTag({content:HIDE});await mp.evaluate(HELP);
 await mp.screenshot({path:path.join(out,'s21_mobile_main.png')});meta['s21_mobile_main']={w:390,h:844,marks:[]};
 await mp.evaluate(UWA);await mp.waitForTimeout(500);await mp.evaluate(()=>{const e=document.querySelector('#uw-result-panel .result-hero');window.scrollTo(0,e.getBoundingClientRect().top+scrollY-12);});await mp.waitForTimeout(400);
 await mp.screenshot({path:path.join(out,'s22_mobile_result.png')});meta['s22_mobile_result']={w:390,h:844,marks:[]};
 const mob=await mp.evaluate(()=>({page:document.documentElement.scrollWidth,vw:innerWidth}));
 fs.writeFileSync(path.join(out,'_marks.json'),JSON.stringify(meta,null,1));
 const miss=[];Object.entries(meta).forEach(([k,v])=>v.marks.forEach(m=>{if(m.miss)miss.push(k+':'+m.miss);else if(m.x<0||m.y<0||m.x+m.w>100.5||m.y+m.h>100.5||m.w<=0||m.h<=0)miss.push(k+':OUT '+m.label+' '+m.x+','+m.y+','+m.w+','+m.h);}));
 console.log(JSON.stringify({mobile:mob,sizes:Object.fromEntries(Object.entries(meta).map(([k,v])=>[k,v.w+'x'+v.h])),miss,errs:errs.slice(0,15)},null,1));
 await b.close();s.close();
})();
