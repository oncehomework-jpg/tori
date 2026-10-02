"""공유 링크(클로드 아티팩트)용 페이지 만들기: python3 tools/make_artifact.py index.html out.html
doctype/html/head/body 제거, manifest·아이콘 링크 제거, 서비스워커 제거, .app padding-top 0, 미리보기 상태로 시작.
사진은 페이지에 넣지 않음 → 아티팩트를 올릴 때 assets/ 파일을 같은 경로로 함께 올린다(한 번에 255개까지라 두 번에 나눔)."""
import re, sys, json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
h = open(sys.argv[1], encoding='utf-8').read()
seed = json.load(open(os.path.join(ROOT, 'tools', 'preview_seed.json'), encoding='utf-8'))
shim = """<script>(function(){const m={};const st={getItem:k=>k in m?m[k]:null,setItem:(k,v)=>{m[k]=String(v)},removeItem:k=>{delete m[k]},clear:()=>{for(const k in m)delete m[k]},key:i=>Object.keys(m)[i]||null,get length(){return Object.keys(m).length}};
try{Object.defineProperty(window,'localStorage',{value:st,configurable:true});}catch(e){}
const p=new URLSearchParams(location.hash.slice(1)).get('date');
if(p){const off=Date.parse(p+'+09:00')-Date.now(),R=Date;window.Date=class extends R{constructor(...a){a.length?super(...a):super(R.now()+off)}static now(){return R.now()+off}};}
st.setItem('jw_diary_v1',%s);})();</script>""" % json.dumps(json.dumps(seed, ensure_ascii=False), ensure_ascii=False)
def sub1(pat, new, flags=0):
    global h
    h2, n = re.subn(pat, lambda m: new, h, count=1, flags=flags); assert n == 1, pat; h = h2
sub1(r'<!doctype[^>]*>\s*', '', re.I)
sub1(r'<html[^>]*>\s*', '')
sub1(r'<head>', shim)
sub1(r'<link rel="manifest" href="manifest.json">\s*', '')
sub1(r'<link rel="icon" type="image/png" href="icon-192.png">\s*', '')
sub1(r"<script>if\('serviceWorker' in navigator.*?</script>", '', re.S)
h = re.sub(r'</?head>|<body[^>]*>|</body>|</html>', '', h)
sub1(re.escape('.app{max-width:480px;margin:0 auto;min-height:100%;padding-top:env(safe-area-inset-top,0px)}'), '.app{max-width:480px;margin:0 auto;min-height:100%;padding-top:0}')
if '<title>JW Diary</title>' not in h: h = '<title>JW Diary</title>\n' + h
open(sys.argv[2], 'w', encoding='utf-8').write(h); print('ok', len(h))
