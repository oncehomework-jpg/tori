"""아이콘 확인용 시트: cd tools/icons && python3 sheet.py sp2a A EMOJI_A out.html"""
import sys,importlib
sys.path.insert(0,'.')
from sprites import PAL_NEW
mod=importlib.import_module(sys.argv[1]);D=getattr(mod,sys.argv[2]);E=getattr(mod,sys.argv[3])
PAL={'k':'#4a3423','w':'#fffaf0','s':'#efe0bf','o':'#e9893c','D':'#7a4a25','R':'#ef8b7b','P':'#e0788f','Y':'#d99a2b','U':'#a9ceef','c':'#fffaf0','b':'#e8c48c','d':'#a26a37','r':'#d9574a','y':'#f4c542','g':'#6fa845','p':'#f6a8b8','u':'#6aa0dc'};PAL.update(PAL_NEW)
def svg(rows):
    r=''.join(f"<rect x='{x}' y='{y}' width='1' height='1' fill='{PAL.get(c,PAL['k'])}'/>" for y,row in enumerate(rows) for x,c in enumerate(row) if c!='.')
    return f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' shape-rendering='crispEdges' width='64' height='64'>{r}</svg>"
inv={}
for e,n in E.items(): inv.setdefault(n,[]).append(e)
cells=''.join(f"<div style='text-align:center;font:11px sans-serif;background:#f6ecd8;padding:3px'>{svg(v)}<br>{n} {''.join(inv.get(n,[]))}</div>" for n,v in D.items())
open(sys.argv[4],'w').write(f"<!doctype html><meta charset=utf-8><body style='margin:0;display:grid;grid-template-columns:repeat(8,1fr);gap:2px'>{cells}</body>")
