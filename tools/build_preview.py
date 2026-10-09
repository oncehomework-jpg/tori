"""미리보기 만들기: python3 tools/build_preview.py index.html preview.html
- 사진(assets/)을 data URI로 넣어 파일 하나로 열 수 있게 함
- 저장소(localStorage)는 메모리로 대체, tools/preview_seed.json 상태로 시작 (도토리 300개)
- 주소 끝에 #date=2026-12-25T21:00:00 처럼 붙이면 그 날짜·시간으로 흉내냄
- LIGHT=1 이면 큰 사진(ph-*) 대신 같은 사진의 작은 썸네일(pt-*)을 넣어 가볍게(파일 보내기 30MB 제한용, v8.1)"""
import re, base64, os, sys, json
src, dst = sys.argv[1], sys.argv[2]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = os.path.join(ROOT, 'assets') + '/'
h = open(src, encoding='utf-8').read()
mt = {'.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.otf': 'font/otf', '.woff2': 'font/woff2'}
names = sorted(set(re.findall(r'assets/([A-Za-z0-9_.-]+\.(?:webp|png|svg|otf|woff2))', h)))
game = open(A+'tori-mahjong-game.html',encoding='utf-8').read()
game=game.replace('<script src="tori-mahjong-content.js"></script>', '<script>'+open(A+'tori-mahjong-content.js',encoding='utf-8').read()+'</script>')
for fn in ['font-galmuri11.woff2','font-galmuri11-bold.woff2']:
    game=game.replace(fn,'data:font/woff2;base64,'+base64.b64encode(open(A+fn,'rb').read()).decode())
game_uri='data:text/html;base64,'+base64.b64encode(game.encode()).decode()
h=h.replace('assets/tori-mahjong-game.html#',game_uri+'#')
out = h
LIGHT = os.environ.get('LIGHT') == '1'
for n in names:
    f = n
    if LIGHT and n.startswith('ph-'):
        key = n[3:].rsplit('-', 1)[0]
        pt = [x for x in os.listdir(A) if x.startswith('pt-' + key + '-')]
        if pt: f = pt[0]
    b = open(A + f, 'rb').read()
    out = out.replace('assets/' + n, 'data:%s;base64,%s' % (mt[os.path.splitext(n)[1]], base64.b64encode(b).decode()))
out = re.sub(r"<script>if\('serviceWorker' in navigator.*?</script>", "", out, flags=re.S)
seed = json.load(open(os.path.join(ROOT, 'tools', 'preview_seed.json'), encoding='utf-8'))
shim = """<script>(function(){const m={};const st={getItem:k=>k in m?m[k]:null,setItem:(k,v)=>{m[k]=String(v)},removeItem:k=>{delete m[k]},clear:()=>{for(const k in m)delete m[k]},key:i=>Object.keys(m)[i]||null,get length(){return Object.keys(m).length}};
try{Object.defineProperty(window,'localStorage',{value:st,configurable:true});}catch(e){}
const p=new URLSearchParams(location.hash.slice(1)).get('date');
if(p){const off=Date.parse(p+'+09:00')-Date.now(),R=Date;window.Date=class extends R{constructor(...a){a.length?super(...a):super(R.now()+off)}static now(){return R.now()+off}};}
st.setItem('jw_diary_v1',%s);})();</script>""" % json.dumps(json.dumps(seed, ensure_ascii=False), ensure_ascii=False)
out = out.replace('<head>', '<head>' + shim, 1)
open(dst, 'w', encoding='utf-8').write(out)
print('%.1f MB, 사진 %d개' % (len(out) / 1e6, len(names)))
