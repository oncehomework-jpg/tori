"""로컬 검사: python3 tools/check.py (참조 파일·버전·JavaScript 문법).
사용하지 않는 사진은 앨범의 동적 참조일 수 있으므로 삭제하지 않습니다.
"""
import re, json, subprocess, shutil, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
index = (ROOT/'index.html').read_text()
worker = (ROOT/'sw.js').read_text()
game = (ROOT/'assets/tori-mahjong-game.html').read_text()
refs = set(re.findall(r'assets/([A-Za-z0-9_.-]+)', index+worker))
refs.update(re.findall(r'(?:src=\"|url\([\"\']?)([A-Za-z0-9_.-]+\.(?:js|woff2))', game))
missing = sorted(n for n in refs if not (ROOT/'assets'/n).is_file())
print('없는 파일:', missing or '없음')
version = re.search(r"APP_VER=\{v:'(v[0-9.]+)'", index).group(1)
cache = re.search(r"jw-diary-(v[0-9.]+)", worker).group(1)
print('앱 / 캐시 버전:', version, cache)
failed = bool(missing) or version != cache
if not shutil.which('node'):
    print('node가 없어 JavaScript 문법 검사를 완료하지 못했습니다.'); sys.exit(1)
blocks=[]
for name, html in [('index.html',index),('assets/tori-mahjong-game.html',game)]:
    for i, code in enumerate(re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>', html,re.S)):
        if code.strip(): blocks.append([f'{name} script {i}',code])
blocks += [(str(p.relative_to(ROOT)),p.read_text()) for p in [ROOT/'sw.js',ROOT/'assets/tori-mahjong-content.js']]
js="const fs=require('fs');for(const [name,code] of JSON.parse(fs.readFileSync(0,'utf8'))){try{new Function(code);console.log(name+': OK')}catch(e){console.error(name+': '+e.message);process.exitCode=1}}"
r=subprocess.run(['node','-e',js],input=json.dumps(blocks),text=True,capture_output=True)
print(r.stdout.strip()); print(r.stderr.strip()) if r.stderr else None
sys.exit(1 if failed or r.returncode else 0)
