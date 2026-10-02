import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();errs=[]
        pg=await (await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2)).new_page()
        pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto('file:///tmp/work/preview.html#date=2026-10-01T12:00:00');await pg.wait_for_timeout(1500)
        await pg.evaluate("document.getElementById('splash')&&document.getElementById('splash').click()");await pg.wait_for_timeout(400)
        await pg.evaluate("S.album=[];save();go('pet')");await pg.wait_for_timeout(300)
        print('빈 앨범:',await pg.evaluate("[document.querySelectorAll('.alb .ph').length,document.querySelectorAll('.alb .ph.lock').length,!!document.querySelector('.albnav'),document.querySelector('#albc h2').innerText]"))
        await pg.evaluate("document.getElementById('tako')&&(document.getElementById('tako').style.display='none');document.querySelector('#albc').scrollIntoView()");await pg.screenshot(path='/mnt/user-data/outputs/preview_album_empty.png')
        # 3장 보유
        await pg.evaluate("S.album=['gyaru1','whisky1','tako','cats1'];albGo(0)");await pg.wait_for_timeout(200)
        print('4장:',await pg.evaluate("[document.querySelectorAll('.alb .ph').length,!!document.querySelector('.albnav'),document.querySelector('#albc h2').innerText]"))
        await pg.evaluate("S.album=['gyaru1','whisky1','tako','cats1','vet1','nap'];albGo(1)");await pg.wait_for_timeout(200)
        print('6장 2페이지:',await pg.evaluate("[document.querySelectorAll('.alb .ph').length,document.querySelector('.albpg').innerText]"))
        await pg.evaluate("S.album=Object.keys(PH);albGo(0)");await pg.wait_for_timeout(1500)
        print('전부:',await pg.evaluate("[document.querySelector('#albc h2').innerText,document.querySelector('.albpg').innerText,Object.keys(PH).length]"))
        await pg.evaluate("document.querySelector('#albc').scrollIntoView()");await pg.screenshot(path='/mnt/user-data/outputs/preview_album_full.png')
        print('imgs loaded:',await pg.evaluate("[...document.querySelectorAll('.alb img')].map(i=>i.naturalWidth>0)"))
        await pg.evaluate("phOpen('gyaru1')");await pg.wait_for_timeout(500);await pg.screenshot(path='/mnt/user-data/outputs/preview_photo_gyaru.png')
        print(errs);await b.close()
asyncio.run(main())
