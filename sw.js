// 서비스워커 v12
// - 앱 파일(index.html 등): 저장본을 바로 보여주고, 뒤에서 조용히 새 버전을 확인해요 (바뀐 게 없으면 다시 받지 않아요).
// - assets/ 그림·폰트: 파일 이름에 고유 번호가 있어서, 한 번 저장하면 계속 저장본을 써요.
// - 새 버전을 받으면 다음에 앱을 켤 때 적용돼요.
// - CDN 폰트/CSS: 한 번 받으면 저장본을 써요.
const CACHE = 'jw-diary-v9.0';
// 토리 알림(v5.1): 앱이 적어 둔 상태(tori-state 캐시)를 보고, 폰이 깨워 줄 때(periodicsync) 하루 한 번만 알림
const STATE = 'tori-state', STATE_URL = 'tori-state.json';
const SHELL = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];
const ASSETS = ['assets/tori-mahjong-game.html','assets/font-galmuri11.woff2','assets/font-galmuri11-bold.woff2','assets/font-galmuri14.woff2','assets/pt-cats1-4fa6f397.webp', 'assets/pt-whisky1-4abf9780.webp', 'assets/pt-cupnood1-c8f827db.webp', 'assets/pt-vet1-dead8ffc.webp', 'assets/pt-yakitori1-f98e7344.webp', 'assets/pt-yakiniku1-bf1cd9cb.webp', 'assets/pt-izakaya1-2cf7a0e2.webp', 'assets/pt-netflix1-2ad4a450.webp', 'assets/pt-babytouch1-bc06e433.webp', 'assets/pt-ramen1-b043f5e3.webp', 'assets/pt-ramenya1-2dbeb740.webp', 'assets/pt-yarn1-136f5d46.webp', 'assets/pt-yeonggwang1-9b7ccbf2.webp', 'assets/pt-ragdoll1-ea4a92fb.webp', 'assets/pt-stock1-d0c37720.webp', 'assets/pt-cats2-3257670e.webp', 'assets/pt-hike1-cbe437ba.webp', 'assets/pt-mochi1-f3001d9b.webp', 'assets/pt-babyrab1-0c865227.webp', 'assets/pt-pirate1-5e626785.webp', 'assets/pt-full1-bc4806ff.webp', 'assets/pt-tarot1-56fe59fa.webp', 'assets/pt-babyham1-cf7568fb.webp', 'assets/pt-spirit1-66f5b4cd.webp', 'assets/pt-takoyaki1-233a4397.webp', 'assets/pt-gyaru1-98f351e6.webp', 'assets/pt-bath1-41c9595f.webp', 'assets/pt-vet2-eb066b75.webp', 'assets/pt-sleep1-4e4c2894.webp', 'assets/pt-whisky2-d084f355.webp', 'assets/pt-jeonju1-7c2b71b0.webp', 'assets/pt-cats3-f80afd16.webp', 'assets/pt-cupnood2-696ac66b.webp', 'assets/pt-babytouch2-93dd805a.webp', 'assets/pt-yarn2-501228df.webp', 'assets/pt-vet3-eb933a8b.webp', 'assets/pt-yakitori2-fb8b8a35.webp', 'assets/pt-modernb-1c658903.webp', 'assets/pt-youtube-0b5ef899.webp', 'assets/pt-yakiniku2-e90cb4c4.webp', 'assets/pt-otaku-531e93e7.webp', 'assets/pt-bubble-5024c36a.webp', 'assets/pt-cats4-93b5738b.webp', 'assets/pt-park-d345adac.webp', 'assets/pt-whisky3-92000b23.webp', 'assets/pt-izakaya2-6d770fa4.webp', 'assets/pt-netflix2-a47581af.webp', 'assets/pt-evening-7f9b93ef.webp', 'assets/pt-ramen2-ba8b2edc.webp', 'assets/pt-ramenya2-4059132b.webp', 'assets/pt-steam-08bd1623.webp', 'assets/pt-gwangju-053cbb4c.webp', 'assets/pt-yeonggwang2-8eaa217e.webp', 'assets/pt-ragdoll2-a97fd100.webp', 'assets/pt-stock2-e5264658.webp', 'assets/pt-snack-c555ecc5.webp', 'assets/pt-hike2-1cd2f4cb.webp', 'assets/pt-modernc-423797eb.webp', 'assets/pt-ski-a8447e01.webp', 'assets/pt-tarot2-64e67362.webp', 'assets/pt-cupnood3-d33f31d1.webp', 'assets/pt-vet4-ff50d843.webp', 'assets/pt-cats5-30f2c99a.webp', 'assets/pt-babytouch3-003092f8.webp', 'assets/pt-yarn3-ce96daf8.webp', 'assets/pt-whisky4-5236be8c.webp', 'assets/pt-mochi2-6100564c.webp', 'assets/pt-babyrab2-545854c7.webp', 'assets/pt-pirate2-3dbdf36b.webp', 'assets/pt-full2-d33c34bb.webp', 'assets/pt-babyham2-07a11f14.webp', 'assets/pt-spirit2-c0b529bd.webp', 'assets/pt-takoyaki2-c35cd331.webp', 'assets/pt-gyaru2-7bec9d69.webp', 'assets/pt-cats6-d90079ba.webp', 'assets/pt-bath2-f780c1e4.webp', 'assets/pt-vet5-ac1aa6e8.webp', 'assets/pt-sleep2-89d587a9.webp', 'assets/pt-yakitori3-1e24382c.webp', 'assets/pt-yakiniku3-d7993d26.webp', 'assets/pt-jeonju2-01946096.webp', 'assets/pt-izakaya3-4d9022a1.webp', 'assets/pt-netflix3-9d1ac065.webp', 'assets/pt-ramen3-3cee110d.webp', 'assets/pt-ramenya3-5886c150.webp', 'assets/pt-yeonggwang3-41a78730.webp', 'assets/pt-ragdoll3-94d5bcb4.webp', 'assets/pt-stock3-b4c18e3b.webp', 'assets/pt-cupnood4-3e091146.webp', 'assets/pt-hike3-a9725c83.webp', 'assets/pt-whisky5-2525e12c.webp', 'assets/pt-tarot3-7954d79f.webp', 'assets/pt-cats7-f7899485.webp', 'assets/pt-babytouch4-a7802acf.webp', 'assets/pt-yarn4-bb938a41.webp', 'assets/pt-vet6-42326c4f.webp', 'assets/pt-tako-82dfc24a.webp', 'assets/pt-straw1-f7c63095.webp', 'assets/pt-rabbit-d9e35dc5.webp', 'assets/pt-gold-7d5e6a33.webp', 'assets/pt-mjdai-774aa06a.webp', 'assets/pt-nap-ee6b0b9c.webp', 'assets/pt-paint-5b9aceec.webp', 'assets/pt-cradle-19aa2bb9.webp', 'assets/pt-hedge-7e3bd7fd.webp', 'assets/pt-rocker-69190a2a.webp', 'assets/pt-picin-26f56afb.webp', 'assets/pt-creampj-45c765b6.webp', 'assets/pt-mjmas-9134ddc3.webp', 'assets/pt-cheek-104107f9.webp', 'assets/pt-mouse-d111a13a.webp', 'assets/pt-jam-f13d7b97.webp', 'assets/pt-ringhand-3902543a.webp', 'assets/pt-straw2-6c6a673b.webp', 'assets/pt-picout-0ad8c5c5.webp', 'assets/pt-pinkpj-91c1837d.webp', 'assets/pt-dojo-94aaee23.webp', 'assets/pt-palm-91df6990.webp', 'assets/pt-beanie-c0fa148f.webp', 'assets/pt-onehand-808d6a0d.webp', 'assets/pt-twohands-b1e88546.webp', 'assets/h-sak1-c9f98bc2.webp', 'assets/h-sak2-8cbfabb0.webp', 'assets/h-gin-65a8a199.webp', 'assets/acorn-b36eb3dc.webp', 'assets/bgp-mj-2ab0b6c4.svg', 'assets/bgp-gt-7f400697.svg', 'assets/bgp-dc-68bd9e14.svg', 'assets/tako-8ee4b489.png', 'assets/bgp-acorn-e00e25e2.svg', 'assets/bgp-hamster-ba695d42.svg', 'assets/bgp-tako-4a7b1249.svg', 'assets/bgp-star-3316b1dd.svg', 'assets/splash-bg-3fd97eee.svg', 'assets/angry-929b1262.webp', 'assets/avatar-ea043fd6.png', 'assets/band-11d3ff4c.webp', 'assets/band2-6fc815d8.webp', 'assets/band3-3e51a3f3.webp', 'assets/bday-67a8a96e.webp', 'assets/bg-1c4696a1.webp', 'assets/bg2-d4ac6c28.webp', 'assets/buff-88500d47.webp', 'assets/down-7a38a337.webp', 'assets/ex-ad4a1bab.webp', 'assets/ex2-c53f86a8.webp', 'assets/full-d7142b38.webp', 'assets/h-chu-e2e379ff.webp', 'assets/h-hal-0d4d0ca8.webp', 'assets/h-nyd-654cd4a8.webp', 'assets/h-nye-a795bbe9.webp', 'assets/h-pep-4ae0dd48.webp', 'assets/h-val-e4da064e.webp', 'assets/h-xme-220e1e02.webp', 'assets/h-xma-1809e243.webp', 'assets/h-xmp-eb999c9f.webp', 'assets/hero-65a66c99.webp', 'assets/hungry-fe9efdfd.webp', 'assets/joy-f902ed27.webp', 'assets/jwpixel-5b68f342.otf', 'assets/mj-2c04eba8.webp', 'assets/pat-186a397a.webp', 'assets/sad-bfd4ec53.webp', 'assets/sad2-2b3aac96.webp', 'assets/sea0a-a07eaec5.webp', 'assets/sea0b-27cc4fc7.webp', 'assets/sea1a-05cd6e8d.webp', 'assets/sea1b-8361ec96.webp', 'assets/sea2a-c1caae0d.webp', 'assets/sea2b-407de940.webp', 'assets/sea3a-d3ed21ef.webp', 'assets/sea3b-743f914c.webp', 'assets/sleep-be0f8a26.webp', 'assets/sleep2-2ad1857d.webp', 'assets/sulk-3f66326c.webp', 'assets/tired-3c72403d.webp', 'assets/tori-face-76ee5c37.png', 'assets/pt-n001-16a220a8.webp', 'assets/pt-n002-4b08dcc9.webp', 'assets/pt-n003-8ddd6ac9.webp', 'assets/pt-n004-ea3936c2.webp', 'assets/pt-n005-e77868de.webp', 'assets/pt-n006-78004777.webp', 'assets/pt-n007-b6c4c9ab.webp', 'assets/pt-n008-dd38a5ff.webp', 'assets/pt-n009-6ba83924.webp', 'assets/pt-n010-256e02f0.webp', 'assets/pt-n011-dd1952de.webp', 'assets/pt-n012-1840413e.webp', 'assets/pt-n013-fc1f63a8.webp', 'assets/pt-n014-bee2f332.webp', 'assets/pt-n015-e32b6e86.webp', 'assets/pt-n016-7e21958a.webp', 'assets/pt-n017-fdb0f893.webp', 'assets/pt-n018-6d43bd37.webp', 'assets/pt-n019-b318a966.webp', 'assets/pt-n020-0fc24e93.webp', 'assets/pt-n021-5892a030.webp', 'assets/pt-n022-64bbbec7.webp', 'assets/pt-n023-cfddfebf.webp', 'assets/pt-n024-935f61ba.webp', 'assets/pt-n025-ea094acd.webp', 'assets/pt-n026-a5276f0d.webp', 'assets/pt-n027-46edde67.webp', 'assets/pt-n028-4fca0b59.webp', 'assets/pt-n029-3984d1f8.webp', 'assets/pt-n030-e9693bd6.webp', 'assets/pt-n031-872e6220.webp', 'assets/pt-n032-4e7c63f2.webp', 'assets/pt-n033-55704c7d.webp', 'assets/pt-n034-03c4f62d.webp', 'assets/pt-n035-1c28adfa.webp', 'assets/pt-n036-fcaaf2ff.webp', 'assets/pt-n037-a02160b6.webp', 'assets/pt-n038-a05e4748.webp', 'assets/pt-n039-aa9190c0.webp', 'assets/pt-n040-c0090c91.webp', 'assets/pt-n041-27d164b1.webp', 'assets/pt-n042-7a9abb79.webp', 'assets/pt-n043-82d4826f.webp', 'assets/pt-n044-84bbcffc.webp', 'assets/pt-n045-2ee35cb4.webp', 'assets/pt-n046-92c6eb8e.webp', 'assets/pt-n047-07b81173.webp', 'assets/pt-n048-c28bacef.webp', 'assets/pt-n049-506c0c99.webp', 'assets/pt-n050-030dc150.webp', 'assets/pt-n051-d31f13ff.webp', 'assets/pt-n052-a33af3ba.webp', 'assets/pt-n053-2be082e3.webp', 'assets/pt-n054-a3997261.webp', 'assets/pt-n055-bac87e80.webp', 'assets/pt-n056-ace12f57.webp', 'assets/pt-n057-8e583fd7.webp', 'assets/pt-n058-c158bb21.webp', 'assets/pt-n059-5ff64cd8.webp', 'assets/pt-n060-7b78346c.webp', 'assets/pt-n061-2dc6b9c3.webp', 'assets/pt-n062-47dd903a.webp', 'assets/pt-n063-492f2a5a.webp', 'assets/pt-n064-31ade5c6.webp', 'assets/pt-n065-6fb9c2ec.webp', 'assets/pt-n066-e444037d.webp', 'assets/pt-n067-c7251a8b.webp', 'assets/pt-n068-16af411f.webp', 'assets/pt-n069-8eef4360.webp', 'assets/pt-n070-3722c580.webp', 'assets/pt-n071-1cd3be8b.webp', 'assets/pt-n072-2c0e91ad.webp', 'assets/pt-n073-5c2b0ccf.webp', 'assets/pt-n074-6d8be0ca.webp', 'assets/pt-n075-21fdb57d.webp', 'assets/pt-n076-1ee853e0.webp', 'assets/pt-n077-17b0bef9.webp', 'assets/pt-n078-5162bf5b.webp', 'assets/pt-n079-fc87e856.webp', 'assets/pt-n080-cd9674ae.webp', 'assets/pt-n081-7ee2bccd.webp', 'assets/pt-n082-5f96cf76.webp', 'assets/pt-n083-309ab66b.webp', 'assets/pt-n084-2f06cfe9.webp', 'assets/pt-n085-5fc2a67b.webp', 'assets/pt-n086-eb274487.webp', 'assets/pt-n087-5a1b8ced.webp', 'assets/pt-n088-913dd873.webp', 'assets/pt-n089-415d6563.webp', 'assets/pt-n090-57122f47.webp', 'assets/pt-n091-d7442f57.webp', 'assets/pt-n092-de134f1b.webp', 'assets/pt-n093-e4165912.webp', 'assets/pt-n094-3c80b5be.webp', 'assets/pt-n095-74afc5ac.webp', 'assets/pt-n096-d9ef6504.webp', 'assets/pt-n097-4ca546cb.webp', 'assets/pt-n098-eb056d3c.webp', 'assets/pt-n099-b05ce1ee.webp', 'assets/pt-n100-8e17dd24.webp', 'assets/pt-n101-7fc889e4.webp', 'assets/pt-n102-5f4e05ab.webp', 'assets/pt-n103-9ad66a96.webp', 'assets/pt-n104-358bf849.webp', 'assets/pt-n105-cce05081.webp', 'assets/pt-n106-04789d03.webp', 'assets/pt-n107-92995e70.webp', 'assets/pt-n108-9b56367c.webp', 'assets/pt-n109-0c79d307.webp', 'assets/pt-n110-37f56880.webp', 'assets/pt-n111-5caab72a.webp', 'assets/pt-n112-71bc14a6.webp', 'assets/pt-n113-192a5803.webp', 'assets/pt-n114-99454be0.webp', 'assets/pt-n115-ac370be1.webp', 'assets/pt-n116-903fd9bc.webp', 'assets/pt-n117-e35749c7.webp', 'assets/pt-n118-d9d56c0a.webp', 'assets/pt-n119-5257dd19.webp', 'assets/pt-n120-3693575e.webp', 'assets/pt-n121-635e221e.webp', 'assets/pt-n122-6265005b.webp', 'assets/pt-n123-d972184f.webp', 'assets/pt-n124-9df7e053.webp', 'assets/pt-n125-b4b51655.webp', 'assets/pt-n126-6d3754df.webp', 'assets/pt-n127-295f8658.webp', 'assets/pt-n128-4b547f41.webp', 'assets/pt-n129-34b77fd1.webp', 'assets/pt-n130-f16f93ef.webp', 'assets/pt-n131-92e8683e.webp', 'assets/pt-n132-807dc3f9.webp', 'assets/pt-n133-fc0b626c.webp', 'assets/pt-n134-643ca65b.webp', 'assets/pt-n135-f54255f6.webp', 'assets/pt-n136-ed07979f.webp', 'assets/pt-n137-2e363421.webp', 'assets/pt-n138-c5c3a230.webp', 'assets/pt-n139-5cc8f310.webp', 'assets/pt-n140-56315147.webp', 'assets/pt-n141-91698397.webp', 'assets/pt-n142-c55e011e.webp', 'assets/pt-n143-0fa2cb8a.webp', 'assets/pt-n144-b5a1a549.webp', 'assets/pt-n145-b60aa08c.webp', 'assets/pt-n146-395231a4.webp', 'assets/pt-n147-d5d65bb3.webp', 'assets/pt-n148-90776f37.webp', 'assets/pt-n149-e6e89ea8.webp', 'assets/pt-n150-b1c8054a.webp'];

self.addEventListener('install', e => {
  // 파일 하나가 없어도 설치가 통째로 실패하지 않게, 파일별로 따로 저장해요.
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(SHELL.concat(ASSETS).map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== STATE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const keep = (req, res) => {
  if (res && (res.ok || res.type === 'opaque')) {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
  }
  return res;
};

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const same = url.origin === self.location.origin;

  // 외부(CDN) 파일, 그리고 assets/ 안의 파일: 저장본이 있으면 그대로 사용
  if (!same || /\/assets\//.test(url.pathname)) {
    e.respondWith(
      caches.match(req, { ignoreSearch: same && url.pathname.endsWith('/tori-mahjong-game.html') }).then(r => r || fetch(req).then(res => keep(req, res)).catch(() => Response.error()))
    );
    return;
  }

  // 내 앱 파일: 저장본 먼저 + 뒤에서 확인(변경 없으면 서버가 304로 답해서 다시 받지 않아요)
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(cached => {
      const net = fetch(req.url, { cache: 'no-cache' }).then(res => {
        if (res && res.ok) {
          const same304 = cached && cached.headers.get('etag') && cached.headers.get('etag') === res.headers.get('etag');
          if (!same304) keep(req, res.clone());
        }
        return res;
      });
      if (cached) {
        e.waitUntil(net.catch(() => {}));
        return cached;
      }
      return net.catch(() => (req.mode === 'navigate' ? caches.match('index.html') : Response.error()));
    })
  );
});

const pick = a => a[Math.floor(Math.random() * a.length)];
async function toriCheck() {
  const c = await caches.open(STATE), r = await c.match(STATE_URL);
  if (!r) return;
  const st = await r.json();
  if (!st.on) return;
  const now = Date.now(), k = new Date(now + 9 * 36e5), h = k.getUTCHours(), td = k.toISOString().slice(0, 10), n = st.name || '토리';
  if (h < 9 || h >= 22 || st.notiD === td) return;            // 밤에는 조용히, 하루 한 번만
  const away = (now - (st.last || now)) / 36e5;
  let body = '';
  if (away >= 48) body = pick([n + '가 진우를 기다리고 있어요… 찍찍 🐹', '진우야, 보고 싶어! ' + n + '가 볼주머니에 도토리 모아 뒀어 🌰']);
  else if (st.freeD !== td && h >= 12) body = pick([n + ' 배고파요! 밥 주러 와 줄래? 🍚', '꼬르륵… ' + n + '가 밥을 기다려요 🐹', '오늘 ' + n + ' 밥 아직이에요! 찍찍 🍚']);
  else if (away >= 20) body = pick([n + '가 오늘 진우 얘기 듣고 싶대요 🐹', '찍찍! 오늘 하루 어땠어? ' + n + '한테 들려줘 🌙']);
  if (!body) return;
  st.notiD = td;
  await c.put(STATE_URL, new Response(JSON.stringify(st), { headers: { 'Content-Type': 'application/json' } }));
  await self.registration.showNotification(n, { body, icon: 'icon-192.png', tag: 'tori' });
}
self.addEventListener('periodicsync', e => { if (e.tag === 'tori') e.waitUntil(toriCheck().catch(() => {})); });
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(l => {
    for (const w of l) if ('focus' in w) return w.focus();
    return clients.openWindow('./');
  }));
});
