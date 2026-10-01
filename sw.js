// 서비스워커 v12
// - 앱 파일(index.html 등): 저장본을 바로 보여주고, 뒤에서 조용히 새 버전을 확인해요 (바뀐 게 없으면 다시 받지 않아요).
// - assets/ 그림·폰트: 파일 이름에 고유 번호가 있어서, 한 번 저장하면 계속 저장본을 써요.
// - 새 버전을 받으면 다음에 앱을 켤 때 적용돼요.
// - CDN 폰트/CSS: 한 번 받으면 저장본을 써요.
const CACHE = 'jw-diary-v20';
const SHELL = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];
const ASSETS = ['assets/pt-tako-82dfc24a.webp', 'assets/pt-straw1-f7c63095.webp', 'assets/pt-rabbit-d9e35dc5.webp', 'assets/pt-gold-7d5e6a33.webp', 'assets/pt-mjdai-774aa06a.webp', 'assets/pt-nap-ee6b0b9c.webp', 'assets/pt-paint-5b9aceec.webp', 'assets/pt-cradle-19aa2bb9.webp', 'assets/pt-hedge-7e3bd7fd.webp', 'assets/pt-rocker-69190a2a.webp', 'assets/pt-picin-26f56afb.webp', 'assets/pt-creampj-45c765b6.webp', 'assets/pt-mjmas-9134ddc3.webp', 'assets/pt-cheek-104107f9.webp', 'assets/pt-mouse-d111a13a.webp', 'assets/pt-jam-f13d7b97.webp', 'assets/pt-ringhand-3902543a.webp', 'assets/pt-straw2-6c6a673b.webp', 'assets/pt-picout-0ad8c5c5.webp', 'assets/pt-pinkpj-91c1837d.webp', 'assets/pt-dojo-94aaee23.webp', 'assets/pt-palm-91df6990.webp', 'assets/pt-beanie-c0fa148f.webp', 'assets/pt-onehand-808d6a0d.webp', 'assets/pt-twohands-b1e88546.webp', 'assets/h-sak1-c9f98bc2.webp', 'assets/h-sak2-8cbfabb0.webp', 'assets/h-gin-65a8a199.webp', 'assets/acorn-b36eb3dc.webp', 'assets/bgp-mj-2ab0b6c4.svg', 'assets/bgp-gt-7f400697.svg', 'assets/bgp-dc-68bd9e14.svg', 'assets/tako-8ee4b489.png', 'assets/bgp-acorn-e00e25e2.svg', 'assets/bgp-hamster-ba695d42.svg', 'assets/bgp-tako-4a7b1249.svg', 'assets/bgp-star-3316b1dd.svg', 'assets/splash-bg-3fd97eee.svg', 'assets/angry-929b1262.webp', 'assets/avatar-ea043fd6.png', 'assets/band-11d3ff4c.webp', 'assets/band2-6fc815d8.webp', 'assets/band3-3e51a3f3.webp', 'assets/bday-67a8a96e.webp', 'assets/bg-1c4696a1.webp', 'assets/bg2-d4ac6c28.webp', 'assets/buff-88500d47.webp', 'assets/down-7a38a337.webp', 'assets/ex-ad4a1bab.webp', 'assets/ex2-c53f86a8.webp', 'assets/full-d7142b38.webp', 'assets/h-chu-e2e379ff.webp', 'assets/h-hal-0d4d0ca8.webp', 'assets/h-nyd-654cd4a8.webp', 'assets/h-nye-a795bbe9.webp', 'assets/h-pep-4ae0dd48.webp', 'assets/h-val-e4da064e.webp', 'assets/h-xme-220e1e02.webp', 'assets/h-xma-1809e243.webp', 'assets/h-xmp-eb999c9f.webp', 'assets/hero-65a66c99.webp', 'assets/hungry-fe9efdfd.webp', 'assets/joy-f902ed27.webp', 'assets/jwpixel-5b68f342.otf', 'assets/mj-2c04eba8.webp', 'assets/pat-186a397a.webp', 'assets/sad-bfd4ec53.webp', 'assets/sad2-2b3aac96.webp', 'assets/sea0a-a07eaec5.webp', 'assets/sea0b-27cc4fc7.webp', 'assets/sea1a-05cd6e8d.webp', 'assets/sea1b-8361ec96.webp', 'assets/sea2a-c1caae0d.webp', 'assets/sea2b-407de940.webp', 'assets/sea3a-d3ed21ef.webp', 'assets/sea3b-743f914c.webp', 'assets/sleep-be0f8a26.webp', 'assets/sleep2-2ad1857d.webp', 'assets/sulk-3f66326c.webp', 'assets/tired-3c72403d.webp', 'assets/tori-face-76ee5c37.png'];

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
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
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
