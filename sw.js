// 서비스워커 v12
// - 앱 파일(index.html 등): 저장본을 바로 보여주고, 뒤에서 조용히 새 버전을 확인해요 (바뀐 게 없으면 다시 받지 않아요).
// - assets/ 그림·폰트: 파일 이름에 고유 번호가 있어서, 한 번 저장하면 계속 저장본을 써요.
// - 새 버전을 받으면 다음에 앱을 켤 때 적용돼요.
// - CDN 폰트/CSS: 한 번 받으면 저장본을 써요.
const CACHE = 'jw-diary-v5.5';
// 토리 알림(v5.1): 앱이 적어 둔 상태(tori-state 캐시)를 보고, 폰이 깨워 줄 때(periodicsync) 하루 한 번만 알림
const STATE = 'tori-state', STATE_URL = 'tori-state.json';
const SHELL = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];
const ASSETS = ['assets/pt-cats1-4fa6f397.webp', 'assets/pt-whisky1-4abf9780.webp', 'assets/pt-cupnood1-c8f827db.webp', 'assets/pt-vet1-dead8ffc.webp', 'assets/pt-yakitori1-f98e7344.webp', 'assets/pt-yakiniku1-bf1cd9cb.webp', 'assets/pt-izakaya1-2cf7a0e2.webp', 'assets/pt-netflix1-2ad4a450.webp', 'assets/pt-babytouch1-bc06e433.webp', 'assets/pt-ramen1-b043f5e3.webp', 'assets/pt-ramenya1-2dbeb740.webp', 'assets/pt-yarn1-136f5d46.webp', 'assets/pt-yeonggwang1-9b7ccbf2.webp', 'assets/pt-ragdoll1-ea4a92fb.webp', 'assets/pt-stock1-d0c37720.webp', 'assets/pt-cats2-3257670e.webp', 'assets/pt-hike1-cbe437ba.webp', 'assets/pt-mochi1-f3001d9b.webp', 'assets/pt-babyrab1-0c865227.webp', 'assets/pt-pirate1-5e626785.webp', 'assets/pt-full1-bc4806ff.webp', 'assets/pt-tarot1-56fe59fa.webp', 'assets/pt-babyham1-cf7568fb.webp', 'assets/pt-spirit1-66f5b4cd.webp', 'assets/pt-takoyaki1-233a4397.webp', 'assets/pt-gyaru1-98f351e6.webp', 'assets/pt-bath1-41c9595f.webp', 'assets/pt-vet2-eb066b75.webp', 'assets/pt-sleep1-4e4c2894.webp', 'assets/pt-whisky2-d084f355.webp', 'assets/pt-jeonju1-7c2b71b0.webp', 'assets/pt-cats3-f80afd16.webp', 'assets/pt-cupnood2-696ac66b.webp', 'assets/pt-babytouch2-93dd805a.webp', 'assets/pt-yarn2-501228df.webp', 'assets/pt-vet3-eb933a8b.webp', 'assets/pt-yakitori2-fb8b8a35.webp', 'assets/pt-modernb-1c658903.webp', 'assets/pt-youtube-0b5ef899.webp', 'assets/pt-yakiniku2-e90cb4c4.webp', 'assets/pt-otaku-531e93e7.webp', 'assets/pt-bubble-5024c36a.webp', 'assets/pt-cats4-93b5738b.webp', 'assets/pt-park-d345adac.webp', 'assets/pt-whisky3-92000b23.webp', 'assets/pt-izakaya2-6d770fa4.webp', 'assets/pt-netflix2-a47581af.webp', 'assets/pt-evening-7f9b93ef.webp', 'assets/pt-ramen2-ba8b2edc.webp', 'assets/pt-ramenya2-4059132b.webp', 'assets/pt-steam-08bd1623.webp', 'assets/pt-gwangju-053cbb4c.webp', 'assets/pt-yeonggwang2-8eaa217e.webp', 'assets/pt-ragdoll2-a97fd100.webp', 'assets/pt-stock2-e5264658.webp', 'assets/pt-snack-c555ecc5.webp', 'assets/pt-hike2-1cd2f4cb.webp', 'assets/pt-modernc-423797eb.webp', 'assets/pt-ski-a8447e01.webp', 'assets/pt-tarot2-64e67362.webp', 'assets/pt-cupnood3-d33f31d1.webp', 'assets/pt-vet4-ff50d843.webp', 'assets/pt-cats5-30f2c99a.webp', 'assets/pt-babytouch3-003092f8.webp', 'assets/pt-yarn3-ce96daf8.webp', 'assets/pt-whisky4-5236be8c.webp', 'assets/pt-mochi2-6100564c.webp', 'assets/pt-babyrab2-545854c7.webp', 'assets/pt-pirate2-3dbdf36b.webp', 'assets/pt-full2-d33c34bb.webp', 'assets/pt-babyham2-07a11f14.webp', 'assets/pt-spirit2-c0b529bd.webp', 'assets/pt-takoyaki2-c35cd331.webp', 'assets/pt-gyaru2-7bec9d69.webp', 'assets/pt-cats6-d90079ba.webp', 'assets/pt-bath2-f780c1e4.webp', 'assets/pt-vet5-ac1aa6e8.webp', 'assets/pt-sleep2-89d587a9.webp', 'assets/pt-yakitori3-1e24382c.webp', 'assets/pt-yakiniku3-d7993d26.webp', 'assets/pt-jeonju2-01946096.webp', 'assets/pt-izakaya3-4d9022a1.webp', 'assets/pt-netflix3-9d1ac065.webp', 'assets/pt-ramen3-3cee110d.webp', 'assets/pt-ramenya3-5886c150.webp', 'assets/pt-yeonggwang3-41a78730.webp', 'assets/pt-ragdoll3-94d5bcb4.webp', 'assets/pt-stock3-b4c18e3b.webp', 'assets/pt-cupnood4-3e091146.webp', 'assets/pt-hike3-a9725c83.webp', 'assets/pt-whisky5-2525e12c.webp', 'assets/pt-tarot3-7954d79f.webp', 'assets/pt-cats7-f7899485.webp', 'assets/pt-babytouch4-a7802acf.webp', 'assets/pt-yarn4-bb938a41.webp', 'assets/pt-vet6-42326c4f.webp', 'assets/pt-tako-82dfc24a.webp', 'assets/pt-straw1-f7c63095.webp', 'assets/pt-rabbit-d9e35dc5.webp', 'assets/pt-gold-7d5e6a33.webp', 'assets/pt-mjdai-774aa06a.webp', 'assets/pt-nap-ee6b0b9c.webp', 'assets/pt-paint-5b9aceec.webp', 'assets/pt-cradle-19aa2bb9.webp', 'assets/pt-hedge-7e3bd7fd.webp', 'assets/pt-rocker-69190a2a.webp', 'assets/pt-picin-26f56afb.webp', 'assets/pt-creampj-45c765b6.webp', 'assets/pt-mjmas-9134ddc3.webp', 'assets/pt-cheek-104107f9.webp', 'assets/pt-mouse-d111a13a.webp', 'assets/pt-jam-f13d7b97.webp', 'assets/pt-ringhand-3902543a.webp', 'assets/pt-straw2-6c6a673b.webp', 'assets/pt-picout-0ad8c5c5.webp', 'assets/pt-pinkpj-91c1837d.webp', 'assets/pt-dojo-94aaee23.webp', 'assets/pt-palm-91df6990.webp', 'assets/pt-beanie-c0fa148f.webp', 'assets/pt-onehand-808d6a0d.webp', 'assets/pt-twohands-b1e88546.webp', 'assets/h-sak1-c9f98bc2.webp', 'assets/h-sak2-8cbfabb0.webp', 'assets/h-gin-65a8a199.webp', 'assets/acorn-b36eb3dc.webp', 'assets/bgp-mj-2ab0b6c4.svg', 'assets/bgp-gt-7f400697.svg', 'assets/bgp-dc-68bd9e14.svg', 'assets/tako-8ee4b489.png', 'assets/bgp-acorn-e00e25e2.svg', 'assets/bgp-hamster-ba695d42.svg', 'assets/bgp-tako-4a7b1249.svg', 'assets/bgp-star-3316b1dd.svg', 'assets/splash-bg-3fd97eee.svg', 'assets/angry-929b1262.webp', 'assets/avatar-ea043fd6.png', 'assets/band-11d3ff4c.webp', 'assets/band2-6fc815d8.webp', 'assets/band3-3e51a3f3.webp', 'assets/bday-67a8a96e.webp', 'assets/bg-1c4696a1.webp', 'assets/bg2-d4ac6c28.webp', 'assets/buff-88500d47.webp', 'assets/down-7a38a337.webp', 'assets/ex-ad4a1bab.webp', 'assets/ex2-c53f86a8.webp', 'assets/full-d7142b38.webp', 'assets/h-chu-e2e379ff.webp', 'assets/h-hal-0d4d0ca8.webp', 'assets/h-nyd-654cd4a8.webp', 'assets/h-nye-a795bbe9.webp', 'assets/h-pep-4ae0dd48.webp', 'assets/h-val-e4da064e.webp', 'assets/h-xme-220e1e02.webp', 'assets/h-xma-1809e243.webp', 'assets/h-xmp-eb999c9f.webp', 'assets/hero-65a66c99.webp', 'assets/hungry-fe9efdfd.webp', 'assets/joy-f902ed27.webp', 'assets/jwpixel-5b68f342.otf', 'assets/mj-2c04eba8.webp', 'assets/pat-186a397a.webp', 'assets/sad-bfd4ec53.webp', 'assets/sad2-2b3aac96.webp', 'assets/sea0a-a07eaec5.webp', 'assets/sea0b-27cc4fc7.webp', 'assets/sea1a-05cd6e8d.webp', 'assets/sea1b-8361ec96.webp', 'assets/sea2a-c1caae0d.webp', 'assets/sea2b-407de940.webp', 'assets/sea3a-d3ed21ef.webp', 'assets/sea3b-743f914c.webp', 'assets/sleep-be0f8a26.webp', 'assets/sleep2-2ad1857d.webp', 'assets/sulk-3f66326c.webp', 'assets/tired-3c72403d.webp', 'assets/tori-face-76ee5c37.png'];

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
      caches.match(req).then(r => r || fetch(req).then(res => keep(req, res)).catch(() => Response.error()))
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
