# -*- coding: utf-8 -*-
"""토목배관 v5.1.0 독립 검증 — KDS 61 40 00 · 61 10 00 (2025-10-01) 규칙을 파이썬으로 따로 옮겨
   index.html 에 내장된 CEPENG(node 실행)과 무작위 · 경계값 입력으로 대조한다.
   실행: python3 manual/_tools/verify_cep.py index.html [N] [--inject]"""
import sys, json, math, random, re, subprocess, os, tempfile
SRC = open(sys.argv[1], encoding='utf-8').read()
N = int([a for a in sys.argv[2:] if a.isdigit()][0]) if any(a.isdigit() for a in sys.argv[2:]) else 20000
DN = [100,150,200,250,300,350,400,450,500,600,700,800,900,1000,1100,1200]

def full(dn, n, sl):
    D = dn/1000; A = math.pi*D*D/4; R = D/4; V = (1/n)*R**(2/3)*(1/sl)**0.5
    return A*V, V
def part(dn, n, sl, f):
    D = dn/1000; th = 2*math.acos(1-2*f); A = D*D/8*(th-math.sin(th)); P = D*th/2
    V = (1/n)*(A/P)**(2/3)*(1/sl)**0.5
    return A*V, V
def depth(Q, dn, n, sl):
    if Q <= 0: return (0.0, 0.0)
    if part(dn, n, sl, 0.938)[0] < Q: return None
    lo, hi = 1e-6, 0.938
    for _ in range(80):
        m = (lo+hi)/2
        if part(dn, n, sl, m)[0] < Q: lo = m
        else: hi = m
    f = (lo+hi)/2
    return (f, part(dn, n, sl, f)[1])
def vr(kind, basis):        # 1.3(1)① · 1.3(2)① / 15.2(3)
    if basis == 'drain': return (0.6, 1.5)
    return (0.8, 3.0) if kind == 'uw' else (0.6, 3.0)
def min_uw(basis, A):       # 2.3(2) / 표 1.15.2
    if basis != 'drain': return 250
    m2 = A*10000
    return 100 if m2 < 200 else 150 if m2 < 600 else 200 if m2 < 1200 else 250
def min_sw(basis, pop, qd, l150):   # 2.3(1)·(3) / 표 1.15.1 · 1.15.3
    if basis != 'drain': return 150 if l150 else 200
    a = 100 if pop <= 150 else 150 if pop <= 300 else 200 if pop <= 600 else 250
    if qd >= 1000: b = 200 if qd < 2000 else 250 if qd < 4000 else 300 if qd < 6000 else 350
    elif pop > 1000: b = 150
    else: b = 0
    return max(a, b)
def pick(Qc, mn, n, sl):
    for d in DN:
        if d >= mn and full(d, n, sl)[0] >= Qc: return d
    return DN[-1]
def judge(kind, basis, Qc, Qv, mn, n, sl):
    d = pick(Qc, mn, n, sl); dp = depth(Qv, d, n, sl); lo, hi = vr(kind, basis)
    V = dp[1] if dp else None
    return {'dn': d, 'vOk': V is not None and lo <= V <= hi, 'V': V}
def uw(p):
    Q = p['C']*p['I']*p['A']/360; Qc = Q*(1+p['sf']/100)
    j = judge('uw', p['basis'], Qc, Q, min_uw(p['basis'], p['A']), p['n'], p['slope']); j['Q'] = Qc; return j
def sw(p):
    pop = p['units']*p['ppu']; qd = pop*p['wpd']*(1+p['gw']/100)/1000; Q = qd/24*p['peakf']/3600; Qc = Q*(1+p['margin']/100)
    j = judge('sw', p['basis'], Qc, Q, min_sw(p['basis'], pop, qd, p['local150']), p['n'], p['slope']); j['Q'] = Qc; return j

def cases(N):
    random.seed(20261017); C = []
    edgesA = [0.0199, 0.02, 0.0599, 0.06, 0.1199, 0.12, 0.5, 2.0]
    edgesPop = [150, 151, 300, 301, 600, 601, 1000, 1001, 4000]
    for i in range(N):
        b = random.choice(['public', 'drain'])
        if i % 2 == 0:
            A = random.choice(edgesA) if random.random() < .3 else round(random.uniform(0.005, 5), 4)
            C.append(('uw', {'I': round(random.uniform(20, 300), 1), 'C': round(random.uniform(.2, .95), 2), 'A': A,
                             'slope': random.choice([50, 75, 100, 150, 200, 300]), 'n': random.choice([.011, .013, .015]),
                             'sf': random.choice([0, 10, 20, 30]), 'basis': b}))
        else:
            ppu = random.choice([1, 2.5, 3])
            pop = random.choice(edgesPop) if random.random() < .3 else random.randint(5, 30000)
            C.append(('sw', {'units': pop/ppu, 'ppu': ppu, 'wpd': random.choice([180, 200, 230, 250, 300]), 'gw': random.choice([0, 10, 20]),
                             'peakf': random.choice([1.3, 1.5, 1.8]), 'avg': .75, 'slope': random.choice([50, 100, 150, 200, 300]),
                             'n': random.choice([.011, .013]), 'margin': random.choice([0, 10, 50, 100]), 'basis': b, 'local150': random.random() < .3}))
    return C

def run_js(C):
    eng = re.search(r'/\* CEPENG v[\s\S]*?\}\)\(typeof window!==\'undefined\'\?window:globalThis\);', SRC).group(0)
    js = 'var window={};' + eng + '\nconst E=window.CEPENG;const C=' + json.dumps(C) + ';\nconsole.log(JSON.stringify(C.map(([k,p])=>{const r=E[k](p);return {dn:r.dn,vOk:r.vOk,Q:r.Qcap,V:r.V};})));'
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f: f.write(js); fn = f.name
    out = subprocess.run(['node', fn], capture_output=True, text=True); os.unlink(fn)
    return json.loads(out.stdout)

def compare(C, J):
    mis = []
    for (k, p), j in zip(C, J):
        r = uw(p) if k == 'uw' else sw(p)
        bad = r['dn'] != j['dn'] or r['vOk'] != j['vOk'] or abs(r['Q']-j['Q']) > 1e-9*max(1, r['Q'])
        if r['V'] is not None and j['V'] is not None and abs(r['V']-j['V']) > 1e-6: bad = True
        if (r['V'] is None) != (j['V'] is None): bad = True
        if bad: mis.append((k, p, r, j))
    return mis

C = cases(N); J = run_js(C); mis = compare(C, J)
res = {'cases': len(C), 'mismatch': len(mis), 'examples': [str(m)[:300] for m in mis[:3]]}
if '--inject' in sys.argv:
    inj = {}
    o_vr, o_mu, o_ms, o_full = vr, min_uw, min_sw, full
    tests = [
        ('우수 유속 하한 0.6(공공)', lambda: globals().__setitem__('vr', lambda k, b: (0.6, 1.5) if b == 'drain' else (0.6, 3.0))),
        ('우수 최소관경 200(공공)', lambda: globals().__setitem__('min_uw', lambda b, A: 200 if b != 'drain' else o_mu(b, A))),
        ('오수 표 1.15.1 300명 → 200', lambda: globals().__setitem__('min_sw', lambda b, pop, qd, l: (200 if (b == 'drain' and 150 < pop <= 300) else o_ms(b, pop, qd, l)))),
        ('조도 무시 n 고정 0.013', lambda: globals().__setitem__('full', lambda dn, n, sl: o_full(dn, 0.013, sl))),
    ]
    for name, apply in tests:
        apply(); m = compare(C, J); inj[name] = {'mismatch': len(m), 'caught': len(m) > 0}
        globals().update({'vr': o_vr, 'min_uw': o_mu, 'min_sw': o_ms, 'full': o_full})
    res['inject'] = inj
print(json.dumps(res, ensure_ascii=False, indent=1))
