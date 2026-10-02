"""검사: python3 tools/check.py
- assets 참조 파일이 다 있는지 / 안 쓰는 파일이 있는지
- 버전(APP_VER)과 sw.js CACHE 이름이 같은지
- (node가 있으면) <script> 문법 검사"""
import re, os, json, subprocess, shutil, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
s = open('index.html', encoding='utf-8').read(); w = open('sw.js', encoding='utf-8').read()
refs = set(re.findall(r'assets/([A-Za-z0-9_.-]+)', s + w)); files = set(os.listdir('assets'))
print('없는 파일:', sorted(refs - files) or '없음'); print('안 쓰는 파일:', sorted(files - refs) or '없음')
v = re.search(r"APP_VER=\{v:'(v[0-9.]+)'", s).group(1); c = re.search(r"jw-diary-(v[0-9.]+)", w).group(1)
print('버전', v, '/ sw CACHE', c, '→', '같음' if v == c else '다름! sw.js CACHE를 고치세요')
if shutil.which('node'):
    sc = re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>', s, re.S)
    js = "const sc=JSON.parse(require('fs').readFileSync(0,'utf8'));sc.forEach((c,i)=>{try{new Function(c);console.log(i+': 문법 OK')}catch(e){console.log(i+': 오류 '+e.message);process.exitCode=1}})"
    r = subprocess.run(['node', '-e', js], input=json.dumps(sc), text=True, capture_output=True); print(r.stdout.strip() or r.stderr)
else:
    print('node가 없어 문법 검사는 건너뜀 (브라우저에서 new Function으로 검사)')
