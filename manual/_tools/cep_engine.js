/* CEPENG v5.1.0 — 단지내 우수·오수 배관 산정 엔진 (순수 함수 · DOM 의존 없음)
   근거: KDS 61 40 00 관로시설 설계기준(2025-10-01) · KDS 61 10 00 하수도설계 일반사항(2025-10-01) — kcsc.re.kr 원문 대조 2026-10-17
   · 1.2(1) Manning 식 · 1.2(2)② 조도계수(철근콘크리트관 · 도관 0.013 / 경질염화비닐관 · 강화플라스틱복합관 0.011)
   · 1.2(2)④ 원형거는 만류로 단면 결정 · 1.1(5) 오수관로 여유율
   · 공공관로 기준 : 1.3 유속(오수 0.6~3.0 · 우수 0.8~3.0 m/s) · 2.3 최소관경(오수 200(초기관로 국지 150) · 우수 250 mm)
   · 배수설비 기준 : 15.2(2) 표 1.15.1~1.15.3 최소관경 · 15.2(3) 유속 0.6~1.5 m/s
   · KDS 61 10 00 1.7.2 계획오수량 — 지하수량 ≤ 1인1일최대오수량 20 % · 일평균 70~80 % · 시간최대 1.3~1.8배
   · KDS 61 10 00 1.5.1 합리식 · 최소 설계빈도 지선관로 10년 */
(function(root){
  var DN=[100,150,200,250,300,350,400,450,500,600,700,800,900,1000,1100,1200];
  function n0(v,d){v=+v;return isFinite(v)?v:d;}
  function full(dn,n,slope){var D=dn/1000,A=Math.PI*D*D/4,R=D/4,S=1/slope,V=(1/n)*Math.pow(R,2/3)*Math.sqrt(S);return {Q:A*V,V:V,A:A,R:R};}
  function part(dn,n,slope,f){var D=dn/1000,th=2*Math.acos(1-2*f),A=D*D/8*(th-Math.sin(th)),P=D*th/2,R=A/P,S=1/slope,V=(1/n)*Math.pow(R,2/3)*Math.sqrt(S);return {Q:A*V,V:V,A:A,R:R};}
  var FMAX=0.938;
  /* 계획유량 Q 가 흐를 때의 수심비 f · 유속 V (부분만류, 이분법) — Q 가 최대 통수능을 넘으면 null */
  function depth(Q,dn,n,slope){
    if(!(Q>0))return {f:0,V:0};
    if(part(dn,n,slope,FMAX).Q<Q)return null;
    var lo=1e-6,hi=FMAX;for(var i=0;i<80;i++){var m=(lo+hi)/2;if(part(dn,n,slope,m).Q<Q)lo=m;else hi=m;}
    var f=(lo+hi)/2;return {f:f,V:part(dn,n,slope,f).V};
  }
  function vrange(kind,basis){if(basis==='drain')return [0.6,1.5];return kind==='uw'?[0.8,3.0]:[0.6,3.0];}
  /* 최소관경 — 배수설비 표 1.15.2(배수면적) / 공공관로 2.3(2) */
  function minUW(basis,areaHa){
    if(basis!=='drain')return {dn:250,rule:'KDS 61 40 00 2.3(2) 우수관로 250 mm 표준'};
    var m2=areaHa*10000;
    if(m2<200)return {dn:100,rule:'표 1.15.2 배수면적 200 ㎡ 미만 100 mm 이상'};
    if(m2<600)return {dn:150,rule:'표 1.15.2 배수면적 600 ㎡ 미만 150 mm 이상'};
    if(m2<1200)return {dn:200,rule:'표 1.15.2 배수면적 1,200 ㎡ 미만 200 mm 이상'};
    return {dn:250,rule:'표 1.15.2 1,200 ㎡ 이상 — 관의 지름 또는 개수를 늘림(MANMIN: 200 다음 규격 250 mm 이상 + 수리계산)'};
  }
  /* 최소관경 — 배수설비 표 1.15.1(배수인구) · 1.15.3(배수량) / 공공관로 2.3(1)·(3) */
  function minSW(basis,pop,qday,local150){
    if(basis!=='drain')return local150?{dn:150,rule:'KDS 61 40 00 2.3(3) 초기관로 국지 150 mm(장래 증가 없음)'}:{dn:200,rule:'KDS 61 40 00 2.3(1) 오수관로 200 mm 표준'};
    var a,ra;
    if(pop<=150){a=100;ra='표 1.15.1 배수인구 150명 이하 100 mm 이상';}
    else if(pop<=300){a=150;ra='표 1.15.1 배수인구 300명 이하 150 mm 이상';}
    else if(pop<=600){a=200;ra='표 1.15.1 배수인구 600명 이하 200 mm 이상';}
    else if(pop<=1000){a=250;ra='표 1.15.1 배수인구 1,000명 이하 250 mm 이상';}
    else {a=250;ra='표 1.15.1 범위(1,000명) 초과 — 표 1.15.3 배수량 기준 병행';}
    var b=0,rb='';
    if(qday>=1000){ if(qday<2000){b=200;rb='표 1.15.3 배수량 2,000 ㎥/일 미만 200 mm 이상';} else if(qday<4000){b=250;rb='표 1.15.3 배수량 4,000 ㎥/일 미만 250 mm 이상';} else if(qday<6000){b=300;rb='표 1.15.3 배수량 6,000 ㎥/일 미만 300 mm 이상';} else {b=350;rb='표 1.15.3 6,000 ㎥/일 이상 — 지름 또는 개수 증가(MANMIN: 300 다음 규격)';} }
    else if(pop>1000){b=150;rb='표 1.15.3 배수량 1,000 ㎥/일 미만 150 mm 이상';}
    return b>a?{dn:b,rule:rb}:{dn:a,rule:ra};
  }
  function pick(Qcap,minDN,n,slope){
    for(var i=0;i<DN.length;i++){if(DN[i]<minDN)continue;if(full(DN[i],n,slope).Q>=Qcap)return {dn:DN[i],over:false};}
    return {dn:DN[DN.length-1],over:true};
  }
  function judge(kind,basis,Qcap,Qv,minDN,n,slope){
    var p=pick(Qcap,minDN,n,slope),fu=full(p.dn,n,slope),d=depth(Qv,p.dn,n,slope),vr=vrange(kind,basis);
    var V=d?d.V:null;
    return {dn:p.dn,over:p.over,Qfull:fu.Q,Vfull:fu.V,ratio:Qcap/fu.Q,f:d?d.f:null,V:V,vr:vr,
      capOk:!p.over&&Qcap<=fu.Q+1e-12,vLow:V!==null&&V<vr[0],vHigh:V!==null&&V>vr[1],
      vOk:V!==null&&V>=vr[0]&&V<=vr[1]};
  }
  /* 우수 — 합리식 Q = C·I·A/360 (A: ha) · 단면은 만류 통수능 ≥ 계획우수량 × (1 + 여유율) · 유속은 계획우수량 수심에서 */
  function uw(p){
    var I=n0(p.I,0),C=n0(p.C,0),A=n0(p.A,0),slope=n0(p.slope,150),n=n0(p.n,0.013),sf=n0(p.sf,0)/100,basis=p.basis==='drain'?'drain':'public';
    function one(A){var Q=C*I*A/360,Qc=Q*(1+sf),m=minUW(basis,A),j=judge('uw',basis,Qc,Q,m.dn,n,slope);j.A=A;j.Q=Q;j.Qcap=Qc;j.minDN=m.dn;j.minRule=m.rule;return j;}
    var r=one(A);r.I=I;r.C=C;r.slope=slope;r.n=n;r.sf=sf;r.basis=basis;
    r.segs=(p.segs||[]).map(function(s){var o=one(n0(s.A,A));o.name=s.name;o.len=s.len;return o;});
    return r;
  }
  /* 오수 — 계획1일최대 = 인구 × (1인1일최대 + 지하수량) · 시간최대 = 1일최대/24 × 변동계수 · 단면은 만류 ≥ 시간최대 × (1 + 여유율) */
  function sw(p){
    var units=n0(p.units,0),ppu=n0(p.ppu,0),wpd=n0(p.wpd,250),gw=n0(p.gw,0)/100,pk=n0(p.peakf,1.5),avg=n0(p.avg,0.75),
        slope=n0(p.slope,150),n=n0(p.n,0.011),mg=n0(p.margin,0)/100,basis=p.basis==='drain'?'drain':'public',l150=!!p.local150;
    function one(units){var pop=units*ppu,qd=pop*wpd*(1+gw)/1000,qh=qd/24*pk,Q=qh/3600,Qc=Q*(1+mg),m=minSW(basis,pop,qd,l150),j=judge('sw',basis,Qc,Q,m.dn,n,slope);
      j.units=units;j.pop=pop;j.qday=qd;j.qavg=qd*avg;j.qhr=qh;j.Q=Q;j.Qcap=Qc;j.minDN=m.dn;j.minRule=m.rule;return j;}
    var r=one(units);r.ppu=ppu;r.wpd=wpd;r.gw=gw;r.peakf=pk;r.avg=avg;r.slope=slope;r.n=n;r.margin=mg;r.basis=basis;r.local150=l150;
    r.segs=(p.segs||[]).map(function(s){var o=one(n0(s.units,units));o.name=s.name;o.len=s.len;return o;});
    return r;
  }
  /* 참고 지점 강우강도 — 사용자 참고자료(강우강도식 매개변수산출.xls · IDF-64bit.xls) 지속기간별 표 · 지속기간 사이는 log-log 보간 */
  var REF={"대전":{"code":133,"t":[5,10,15,20,30,40,50,60,90,120],"I":{"5":[154.32,123.89,105.15,92.83,77.33,67.68,60.92,55.83,45.74,39.49],"10":[169.45,137.16,116.89,103.59,86.91,76.52,69.22,63.69,52.63,45.7],"20":[183.95,149.91,128.04,113.78,95.99,84.93,77.14,71.22,59.29,51.71],"30":[192.34,157.16,134.54,119.77,101.3,89.8,81.69,75.52,63.06,55.12],"50":[202.7,166.21,142.59,127.18,107.91,95.91,87.42,80.95,67.82,59.41]}},
           "임실":{"code":244,"t":[5,10,15,20,30,40,50,60,90,120],"I":{"5":[317.06,178.8,128.98,103.64,77.82,64.46,56.12,50.32,39.87,33.96],"10":[395.29,214.68,150.16,118.56,87.67,72.34,63.02,56.64,45.29,38.89],"20":[470.25,249.34,170.43,132.8,97.11,79.93,69.68,62.75,50.55,43.69],"30":[513.32,269.34,182.05,140.93,102.48,84.25,73.48,66.24,53.58,46.45],"50":[567.25,294.11,196.65,151.25,109.33,89.72,78.24,70.58,57.27,49.82]}}};
  function refI(st,T,t){var s=REF[st];if(!s)return null;var row=s.I[String(T)];if(!row)return null;var ts=s.t;t=Math.max(ts[0],Math.min(ts[ts.length-1],+t));
    for(var i=0;i<ts.length-1;i++){if(t<=ts[i+1]){var a=Math.log(ts[i]),b=Math.log(ts[i+1]),w=(Math.log(t)-a)/(b-a);return Math.exp(Math.log(row[i])+(Math.log(row[i+1])-Math.log(row[i]))*w);}}
    return row[row.length-1];}
  var API={VER:'5.1.0',DN:DN,full:full,part:part,depth:depth,vrange:vrange,minUW:minUW,minSW:minSW,uw:uw,sw:sw,REF:REF,refI:refI};
  if(typeof module!=='undefined'&&module.exports)module.exports=API;
  root.CEPENG=API;
})(typeof window!=='undefined'?window:globalThis);
