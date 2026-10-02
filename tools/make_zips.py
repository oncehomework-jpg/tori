"""GitHub 웹 업로드용 zip (한 번에 100개 미만): python3 tools/make_zips.py v4.2 출력폴더
각 zip은 'upload-1of4' 같은 폴더 하나로 풀린다. 그 폴더 안의 파일·assets 폴더를 전부 끌어놓으면 된다."""
import os, sys, zipfile
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
ver, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
root = ['index.html', 'sw.js', 'manifest.json', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png']
assets = ['assets/' + f for f in sorted(os.listdir('assets'))]
items = root + assets; parts = [items[i:i + 99] for i in range(0, len(items), 99)]
# 맥에서 풀 때 'assets 2'처럼 이름이 바뀌지 않게, zip마다 자기 폴더(upload-1of4 등) 안에 담는다.
# 올릴 때는 그 폴더를 열고 안의 것을 전부 끌어놓는다.
for i, p in enumerate(parts, 1):
    top = f'upload-{i}of{len(parts)}'
    with zipfile.ZipFile(f'{out}/JW-Diary-{ver}-{i}of{len(parts)}.zip', 'w', zipfile.ZIP_DEFLATED) as z:
        for f in p: z.write(f, f'{top}/{f}')
print([len(p) for p in parts])
