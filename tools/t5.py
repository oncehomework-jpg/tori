import asyncio, json
from playwright.async_api import async_playwright
async def run(pg,js): return await pg.evaluate(js)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); errs=[]
        async def newpage(hash=''):
            ctx=await b.new_context(viewport={'width':390,'height':844}); pg=await ctx.new_page()
            pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)))
            await pg.goto('file:///tmp/work/preview.html'+hash); await pg.wait_for_timeout(1200)
            await pg.evaluate("document.getElementById('splash')&&document.getElementById('splash').click()"); await pg.wait_for_timeout(400); return pg
        pg=await newpage()
        # 상자: 124개, 사진 24, n 정렬, 전부 열기
        r=await run(pg,"""()=>{const ph=MS.filter(m=>(m.fx||'').startsWith('photo:'));S.fed=9000;S.acorns=50;let guard=0;
          while(guard++<400){const v=msVis();const nx=v.find(m=>!S.claimed.includes(m.n));if(!nx)break;claim(nx.n);}
          return {total:MS.length,photos:ph.length,claimed:S.claimed.length,album:S.album.length,vis:msVis().length,coupons:S.coupons.length,titles:S.titles.length,seasonalNames:MS.filter(m=>/크리스마스|벚꽃|설날|추석|할로윈|새해/.test(m.name)).map(m=>m.name)}}""")
        print('chest',r)
        await run(pg,"closeM();go('pet')"); await pg.wait_for_timeout(500)
        print('album cells',await run(pg,"document.querySelectorAll('.alb .ph').length+'/'+document.querySelectorAll('.alb .ph img').length"))
        await pg.evaluate("document.querySelector('.alb')&&document.querySelector('.alb').scrollIntoView()"); await pg.screenshot(path='/mnt/user-data/outputs/preview_album.png')
        await run(pg,"phOpen('rocker')");await pg.wait_for_timeout(300);await pg.screenshot(path='/mnt/user-data/outputs/preview_photo.png');await run(pg,"closeM()")
        # 대화
        await run(pg,"go('home')");await pg.wait_for_timeout(300)
        print('chatb',await run(pg,"!!document.querySelector('.chatb')"))
        await run(pg,"chatOpen()");await pg.wait_for_timeout(200);await pg.screenshot(path='/mnt/user-data/outputs/preview_chat1.png')
        await run(pg,"chatPick(0)");await pg.wait_for_timeout(200);await pg.screenshot(path='/mnt/user-data/outputs/preview_chat2.png')
        # 질문
        a0=await run(pg,"S.acorns");await run(pg,"tqOpen()");await pg.wait_for_timeout(200);await pg.screenshot(path='/mnt/user-data/outputs/preview_tq.png')
        r=await run(pg,"(()=>{const a=S.acorns;tqPick(1);const g=S.acorns-a;tqPick(2);const g2=S.acorns-a;tqDiary();return {g,g2,diary:(S.diary||[]).find(x=>x.d===todayStr())}})()")
        print('tq',r)
        # 만담 전 종류
        r=await run(pg,"""(()=>{const o={};for(const k of Object.keys(MD)){closeM();mandam(k);o[k]=mdL.length;while(mdI<mdL.length-1){mdI++;mdShow();}}return o})()""");print('mandam',r)
        await run(pg,"closeM();mandam('mj')");await pg.wait_for_timeout(200);await run(pg,"mdI=2;mdShow()");await pg.screenshot(path='/mnt/user-data/outputs/preview_mandam.png')
        # 질문 은행 검증
        print('tqbank',await run(pg,"TQ.length+' '+TQ.every(q=>q[1].length===4)"))
        # 컨텍스트별 대화 뽑기
        r=await run(pg,"""(()=>{const seen=new Set();for(let i=0;i<400;i++)seen.add(chPick()[0]);return seen.size})()""");print('chat variety',r)
        print('ERR',errs)
        # 히어로: 벚꽃 4/3, 12/23, 12/24, 6/10
        for d,exp in [('2027-04-03','sak'),('2027-04-04','sak'),('2026-12-23','gin'),('2026-12-24','xme'),('2027-04-08','normal-ish'),('2027-04-03T14:00:00','sak')]:
            pg2=await newpage('#date='+d if 'T' in d else '#date='+d+'T14:00:00')
            r=await run(pg2,"({k:heroKey(),tag:dayTag()})");print(d,r)
            if d=='2027-04-03T14:00:00' or d=='2026-12-23':
                await pg2.screenshot(path=f'/mnt/user-data/outputs/preview_hero_{d[:10]}.png')
            await pg2.context.close()
        print('ERR',errs)
        await b.close()
asyncio.run(main())
