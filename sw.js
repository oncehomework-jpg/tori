// 서비스워커 v12
// - 앱 파일(index.html 등): 저장본을 바로 보여주고, 뒤에서 조용히 새 버전을 확인해요 (바뀐 게 없으면 다시 받지 않아요).
// - images/ fonts/ audio/ games/ 안의 그림·폰트·소리: 파일 이름에 고유 번호가 있어서, 한 번 저장하면 계속 저장본을 써요.
//   (같은 이름으로 파일을 바꿔 올릴 때는 아래 CACHE 숫자를 올려야 폰이 새 파일을 받아요)
// - 새 버전을 받으면 다음에 앱을 켤 때 적용돼요.
// - CDN 폰트/CSS: 한 번 받으면 저장본을 써요.
const CACHE = 'jw-diary-v1.3.7';   // js/app.js 의 APP_VER 와 같은 숫자로 맞춰요
// 토리 알림(v5.1): 앱이 적어 둔 상태(tori-state 캐시)를 보고, 폰이 깨워 줄 때(periodicsync) 하루 한 번만 알림
const STATE = 'tori-state', STATE_URL = 'tori-state.json';
// 앱 파일: 처음 켤 때 저장해 두면 인터넷이 없어도 열려요
const SHELL = [
  './',   // index.html은 넣지 않아요 (Cloudflare가 /index.html을 /로 넘겨서 저장본이 꼬여요)
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-512.png',
  'apple-touch-icon.png',
  'css/variables.css',
  'css/style.css',
  'data/photos.js',
  'data/difference.js',
  'js/app.js',
  'js/pixel-icons.js',
  'js/boardgames.js',
  'js/mystery-game.js',
  'js/tetris.js',
  'js/onsen.js'
];
// 미리 저장할 그림·소리·글꼴 (사진을 새로 추가해도 여기에 안 넣어도 돼요. 처음 볼 때 저절로 저장돼요)
const ASSETS = [
  'images/scenes/onsen-shishiodoshi-inlet-v118.webp',
  'images/scenes/onsen-portrait-night-v118.webp',
  'images/scenes/onsen-portrait-day-v118.webp',
  'images/scenes/onsen-landscape-night-v118.webp',
  'images/scenes/onsen-landscape-day-v118.webp',
  'images/scenes/onsen-shishiodoshi-parts-v118.webp',
  'audio/onsen-bamboo-knock-v114.wav',
  'images/scenes/place-room-v102.webp',
  'images/scenes/place-wheel-v102.webp',
  'images/scenes/place-forest-v102.webp',
  'images/scenes/place-sea-v102.webp',
  'images/scenes/place-stage-v102.webp',
  'images/scenes/place-kitchen-v102.webp',
  'images/icons/onsen-tori-v125.png',
  'images/icons/onsen-hodu-v125.png',
  'images/icons/onsen-dochi-v125.png',
  'images/icons/onsen-owl-v125.png',
  'audio/onsen-pixel-bgm-v102.wav',
  'images/icons/tori-icon-b.png',
  'images/scenes/df-library-v97.webp',
  'images/scenes/df-library-hard-changes-v125.webp',
  'images/scenes/df-garden-v97.webp',
  'images/scenes/df-garden-hard-changes-v125.webp',
  'images/scenes/df-teaparty-v92.webp',
  'images/scenes/df-teaparty-hard-changes-v125.webp',
  'images/scenes/df-kitchen-v92.webp',
  'images/scenes/df-kitchen-hard-changes-v125.webp',
  'images/scenes/mahjong-room-v92.webp',
  'games/tori-mahjong/tori-mahjong-content.js',
  'games/tori-mahjong/tori-mahjong-game.html',
  'fonts/font-galmuri11.woff2',
  'fonts/font-galmuri11-bold.woff2',
  'fonts/font-galmuri14.woff2',
  'images/thumbs/pt-cats1-4fa6f397.webp',
  'images/thumbs/pt-whisky1-4abf9780.webp',
  'images/thumbs/pt-cupnood1-c8f827db.webp',
  'images/thumbs/pt-vet1-dead8ffc.webp',
  'images/thumbs/pt-yakitori1-f98e7344.webp',
  'images/thumbs/pt-yakiniku1-bf1cd9cb.webp',
  'images/thumbs/pt-izakaya1-2cf7a0e2.webp',
  'images/thumbs/pt-netflix1-2ad4a450.webp',
  'images/thumbs/pt-babytouch1-bc06e433.webp',
  'images/thumbs/pt-ramen1-b043f5e3.webp',
  'images/thumbs/pt-ramenya1-2dbeb740.webp',
  'images/thumbs/pt-yarn1-136f5d46.webp',
  'images/thumbs/pt-yeonggwang1-9b7ccbf2.webp',
  'images/thumbs/pt-ragdoll1-ea4a92fb.webp',
  'images/thumbs/pt-stock1-d0c37720.webp',
  'images/thumbs/pt-cats2-3257670e.webp',
  'images/thumbs/pt-hike1-cbe437ba.webp',
  'images/thumbs/pt-mochi1-f3001d9b.webp',
  'images/thumbs/pt-babyrab1-0c865227.webp',
  'images/thumbs/pt-pirate1-5e626785.webp',
  'images/thumbs/pt-full1-bc4806ff.webp',
  'images/thumbs/pt-tarot1-56fe59fa.webp',
  'images/thumbs/pt-babyham1-cf7568fb.webp',
  'images/thumbs/pt-spirit1-66f5b4cd.webp',
  'images/thumbs/pt-takoyaki1-233a4397.webp',
  'images/thumbs/pt-gyaru1-98f351e6.webp',
  'images/thumbs/pt-bath1-41c9595f.webp',
  'images/thumbs/pt-vet2-eb066b75.webp',
  'images/thumbs/pt-sleep1-4e4c2894.webp',
  'images/thumbs/pt-whisky2-d084f355.webp',
  'images/thumbs/pt-jeonju1-7c2b71b0.webp',
  'images/thumbs/pt-cats3-f80afd16.webp',
  'images/thumbs/pt-cupnood2-696ac66b.webp',
  'images/thumbs/pt-babytouch2-93dd805a.webp',
  'images/thumbs/pt-yarn2-501228df.webp',
  'images/thumbs/pt-vet3-eb933a8b.webp',
  'images/thumbs/pt-yakitori2-fb8b8a35.webp',
  'images/thumbs/pt-modernb-1c658903.webp',
  'images/thumbs/pt-youtube-0b5ef899.webp',
  'images/thumbs/pt-yakiniku2-e90cb4c4.webp',
  'images/thumbs/pt-otaku-531e93e7.webp',
  'images/thumbs/pt-bubble-5024c36a.webp',
  'images/thumbs/pt-cats4-93b5738b.webp',
  'images/thumbs/pt-park-d345adac.webp',
  'images/thumbs/pt-whisky3-92000b23.webp',
  'images/thumbs/pt-izakaya2-6d770fa4.webp',
  'images/thumbs/pt-netflix2-a47581af.webp',
  'images/thumbs/pt-evening-7f9b93ef.webp',
  'images/thumbs/pt-ramen2-ba8b2edc.webp',
  'images/thumbs/pt-ramenya2-4059132b.webp',
  'images/thumbs/pt-steam-08bd1623.webp',
  'images/thumbs/pt-gwangju-053cbb4c.webp',
  'images/thumbs/pt-yeonggwang2-8eaa217e.webp',
  'images/thumbs/pt-ragdoll2-a97fd100.webp',
  'images/thumbs/pt-stock2-e5264658.webp',
  'images/thumbs/pt-snack-c555ecc5.webp',
  'images/thumbs/pt-hike2-1cd2f4cb.webp',
  'images/thumbs/pt-modernc-423797eb.webp',
  'images/thumbs/pt-ski-a8447e01.webp',
  'images/thumbs/pt-tarot2-64e67362.webp',
  'images/thumbs/pt-cupnood3-d33f31d1.webp',
  'images/thumbs/pt-vet4-ff50d843.webp',
  'images/thumbs/pt-cats5-30f2c99a.webp',
  'images/thumbs/pt-babytouch3-003092f8.webp',
  'images/thumbs/pt-yarn3-ce96daf8.webp',
  'images/thumbs/pt-whisky4-5236be8c.webp',
  'images/thumbs/pt-mochi2-6100564c.webp',
  'images/thumbs/pt-babyrab2-545854c7.webp',
  'images/thumbs/pt-pirate2-3dbdf36b.webp',
  'images/thumbs/pt-full2-d33c34bb.webp',
  'images/thumbs/pt-babyham2-07a11f14.webp',
  'images/thumbs/pt-spirit2-c0b529bd.webp',
  'images/thumbs/pt-takoyaki2-c35cd331.webp',
  'images/thumbs/pt-gyaru2-7bec9d69.webp',
  'images/thumbs/pt-cats6-d90079ba.webp',
  'images/thumbs/pt-bath2-f780c1e4.webp',
  'images/thumbs/pt-vet5-ac1aa6e8.webp',
  'images/thumbs/pt-sleep2-89d587a9.webp',
  'images/thumbs/pt-yakitori3-1e24382c.webp',
  'images/thumbs/pt-yakiniku3-d7993d26.webp',
  'images/thumbs/pt-jeonju2-01946096.webp',
  'images/thumbs/pt-izakaya3-4d9022a1.webp',
  'images/thumbs/pt-netflix3-9d1ac065.webp',
  'images/thumbs/pt-ramen3-3cee110d.webp',
  'images/thumbs/pt-ramenya3-5886c150.webp',
  'images/thumbs/pt-yeonggwang3-41a78730.webp',
  'images/thumbs/pt-ragdoll3-94d5bcb4.webp',
  'images/thumbs/pt-stock3-b4c18e3b.webp',
  'images/thumbs/pt-cupnood4-3e091146.webp',
  'images/thumbs/pt-hike3-a9725c83.webp',
  'images/thumbs/pt-whisky5-2525e12c.webp',
  'images/thumbs/pt-tarot3-7954d79f.webp',
  'images/thumbs/pt-cats7-f7899485.webp',
  'images/thumbs/pt-babytouch4-a7802acf.webp',
  'images/thumbs/pt-yarn4-bb938a41.webp',
  'images/thumbs/pt-vet6-42326c4f.webp',
  'images/thumbs/pt-tako-82dfc24a.webp',
  'images/thumbs/pt-straw1-f7c63095.webp',
  'images/thumbs/pt-rabbit-d9e35dc5.webp',
  'images/thumbs/pt-gold-7d5e6a33.webp',
  'images/thumbs/pt-mjdai-774aa06a.webp',
  'images/thumbs/pt-nap-ee6b0b9c.webp',
  'images/thumbs/pt-paint-5b9aceec.webp',
  'images/thumbs/pt-cradle-19aa2bb9.webp',
  'images/thumbs/pt-hedge-7e3bd7fd.webp',
  'images/thumbs/pt-rocker-69190a2a.webp',
  'images/thumbs/pt-picin-26f56afb.webp',
  'images/thumbs/pt-creampj-45c765b6.webp',
  'images/thumbs/pt-mjmas-9134ddc3.webp',
  'images/thumbs/pt-cheek-104107f9.webp',
  'images/thumbs/pt-mouse-d111a13a.webp',
  'images/thumbs/pt-jam-f13d7b97.webp',
  'images/thumbs/pt-ringhand-3902543a.webp',
  'images/thumbs/pt-straw2-6c6a673b.webp',
  'images/thumbs/pt-picout-0ad8c5c5.webp',
  'images/thumbs/pt-pinkpj-91c1837d.webp',
  'images/thumbs/pt-dojo-94aaee23.webp',
  'images/thumbs/pt-palm-91df6990.webp',
  'images/thumbs/pt-beanie-c0fa148f.webp',
  'images/thumbs/pt-onehand-808d6a0d.webp',
  'images/thumbs/pt-twohands-b1e88546.webp',
  'images/scenes/h-sak1-c9f98bc2.webp',
  'images/scenes/h-sak2-8cbfabb0.webp',
  'images/scenes/h-gin-65a8a199.webp',
  'images/scenes/acorn-b36eb3dc.webp',
  'images/icons/bgp-mj-2ab0b6c4.svg',
  'images/icons/bgp-gt-7f400697.svg',
  'images/icons/bgp-dc-68bd9e14.svg',
  'images/icons/tako-8ee4b489.png',
  'images/icons/bgp-acorn-e00e25e2.svg',
  'images/icons/bgp-hamster-ba695d42.svg',
  'images/icons/bgp-tako-4a7b1249.svg',
  'images/icons/bgp-star-3316b1dd.svg',
  'images/icons/splash-bg-3fd97eee.svg',
  'images/scenes/angry-929b1262.webp',
  'images/icons/avatar-ea043fd6.png',
  'images/scenes/band-11d3ff4c.webp',
  'images/scenes/band2-6fc815d8.webp',
  'images/scenes/band3-3e51a3f3.webp',
  'images/scenes/bday-67a8a96e.webp',
  'images/scenes/bg-1c4696a1.webp',
  'images/scenes/bg2-d4ac6c28.webp',
  'images/scenes/buff-88500d47.webp',
  'images/scenes/down-7a38a337.webp',
  'images/scenes/ex-ad4a1bab.webp',
  'images/scenes/ex2-c53f86a8.webp',
  'images/scenes/full-d7142b38.webp',
  'images/scenes/h-chu-e2e379ff.webp',
  'images/scenes/h-hal-0d4d0ca8.webp',
  'images/scenes/h-nyd-654cd4a8.webp',
  'images/scenes/h-nye-a795bbe9.webp',
  'images/scenes/h-pep-4ae0dd48.webp',
  'images/scenes/h-val-e4da064e.webp',
  'images/scenes/h-xme-220e1e02.webp',
  'images/scenes/h-xma-1809e243.webp',
  'images/scenes/h-xmp-eb999c9f.webp',
  'images/scenes/hero-65a66c99.webp',
  'images/scenes/hungry-fe9efdfd.webp',
  'images/scenes/joy-f902ed27.webp',
  'fonts/jwpixel-5b68f342.otf',
  'images/scenes/mj-2c04eba8.webp',
  'images/scenes/pat-186a397a.webp',
  'images/scenes/sad-bfd4ec53.webp',
  'images/scenes/sad2-2b3aac96.webp',
  'images/scenes/sea0a-a07eaec5.webp',
  'images/scenes/sea0b-27cc4fc7.webp',
  'images/scenes/sea1a-05cd6e8d.webp',
  'images/scenes/sea1b-8361ec96.webp',
  'images/scenes/sea2a-c1caae0d.webp',
  'images/scenes/sea2b-407de940.webp',
  'images/scenes/sea3a-d3ed21ef.webp',
  'images/scenes/sea3b-743f914c.webp',
  'images/scenes/sleep-be0f8a26.webp',
  'images/scenes/sleep2-2ad1857d.webp',
  'images/scenes/sulk-3f66326c.webp',
  'images/scenes/tired-3c72403d.webp',
  'images/icons/tori-face-76ee5c37.png',
  'images/thumbs/pt-n001-16a220a8.webp',
  'images/thumbs/pt-n002-4b08dcc9.webp',
  'images/thumbs/pt-n003-8ddd6ac9.webp',
  'images/thumbs/pt-n004-ea3936c2.webp',
  'images/thumbs/pt-n005-e77868de.webp',
  'images/thumbs/pt-n006-78004777.webp',
  'images/thumbs/pt-n007-b6c4c9ab.webp',
  'images/thumbs/pt-n008-dd38a5ff.webp',
  'images/thumbs/pt-n009-6ba83924.webp',
  'images/thumbs/pt-n010-256e02f0.webp',
  'images/thumbs/pt-n011-dd1952de.webp',
  'images/thumbs/pt-n012-1840413e.webp',
  'images/thumbs/pt-n013-fc1f63a8.webp',
  'images/thumbs/pt-n014-bee2f332.webp',
  'images/thumbs/pt-n015-e32b6e86.webp',
  'images/thumbs/pt-n016-7e21958a.webp',
  'images/thumbs/pt-n017-fdb0f893.webp',
  'images/thumbs/pt-n018-6d43bd37.webp',
  'images/thumbs/pt-n019-b318a966.webp',
  'images/thumbs/pt-n020-0fc24e93.webp',
  'images/thumbs/pt-n021-5892a030.webp',
  'images/thumbs/pt-n022-64bbbec7.webp',
  'images/thumbs/pt-n023-cfddfebf.webp',
  'images/thumbs/pt-n024-935f61ba.webp',
  'images/thumbs/pt-n025-ea094acd.webp',
  'images/thumbs/pt-n026-a5276f0d.webp',
  'images/thumbs/pt-n027-46edde67.webp',
  'images/thumbs/pt-n028-4fca0b59.webp',
  'images/thumbs/pt-n029-3984d1f8.webp',
  'images/thumbs/pt-n030-e9693bd6.webp',
  'images/thumbs/pt-n031-872e6220.webp',
  'images/thumbs/pt-n032-4e7c63f2.webp',
  'images/thumbs/pt-n033-55704c7d.webp',
  'images/thumbs/pt-n034-03c4f62d.webp',
  'images/thumbs/pt-n035-1c28adfa.webp',
  'images/thumbs/pt-n036-fcaaf2ff.webp',
  'images/thumbs/pt-n037-a02160b6.webp',
  'images/thumbs/pt-n038-a05e4748.webp',
  'images/thumbs/pt-n039-aa9190c0.webp',
  'images/thumbs/pt-n040-c0090c91.webp',
  'images/thumbs/pt-n041-27d164b1.webp',
  'images/thumbs/pt-n042-7a9abb79.webp',
  'images/thumbs/pt-n043-82d4826f.webp',
  'images/thumbs/pt-n044-84bbcffc.webp',
  'images/thumbs/pt-n045-2ee35cb4.webp',
  'images/thumbs/pt-n046-92c6eb8e.webp',
  'images/thumbs/pt-n047-07b81173.webp',
  'images/thumbs/pt-n048-c28bacef.webp',
  'images/thumbs/pt-n049-506c0c99.webp',
  'images/thumbs/pt-n050-030dc150.webp',
  'images/thumbs/pt-n051-d31f13ff.webp',
  'images/thumbs/pt-n052-a33af3ba.webp',
  'images/thumbs/pt-n053-2be082e3.webp',
  'images/thumbs/pt-n054-a3997261.webp',
  'images/thumbs/pt-n055-bac87e80.webp',
  'images/thumbs/pt-n056-ace12f57.webp',
  'images/thumbs/pt-n057-8e583fd7.webp',
  'images/thumbs/pt-n058-c158bb21.webp',
  'images/thumbs/pt-n059-5ff64cd8.webp',
  'images/thumbs/pt-n060-7b78346c.webp',
  'images/thumbs/pt-n061-2dc6b9c3.webp',
  'images/thumbs/pt-n062-47dd903a.webp',
  'images/thumbs/pt-n063-492f2a5a.webp',
  'images/thumbs/pt-n064-31ade5c6.webp',
  'images/thumbs/pt-n065-6fb9c2ec.webp',
  'images/thumbs/pt-n066-e444037d.webp',
  'images/thumbs/pt-n067-c7251a8b.webp',
  'images/thumbs/pt-n068-16af411f.webp',
  'images/thumbs/pt-n069-8eef4360.webp',
  'images/thumbs/pt-n070-3722c580.webp',
  'images/thumbs/pt-n071-1cd3be8b.webp',
  'images/thumbs/pt-n072-2c0e91ad.webp',
  'images/thumbs/pt-n073-5c2b0ccf.webp',
  'images/thumbs/pt-n074-6d8be0ca.webp',
  'images/thumbs/pt-n075-21fdb57d.webp',
  'images/thumbs/pt-n076-1ee853e0.webp',
  'images/thumbs/pt-n077-17b0bef9.webp',
  'images/thumbs/pt-n078-5162bf5b.webp',
  'images/thumbs/pt-n079-fc87e856.webp',
  'images/thumbs/pt-n080-cd9674ae.webp',
  'images/thumbs/pt-n081-7ee2bccd.webp',
  'images/thumbs/pt-n082-5f96cf76.webp',
  'images/thumbs/pt-n083-309ab66b.webp',
  'images/thumbs/pt-n084-2f06cfe9.webp',
  'images/thumbs/pt-n085-5fc2a67b.webp',
  'images/thumbs/pt-n086-eb274487.webp',
  'images/thumbs/pt-n087-5a1b8ced.webp',
  'images/thumbs/pt-n088-913dd873.webp',
  'images/thumbs/pt-n089-415d6563.webp',
  'images/thumbs/pt-n090-57122f47.webp',
  'images/thumbs/pt-n091-d7442f57.webp',
  'images/thumbs/pt-n092-de134f1b.webp',
  'images/thumbs/pt-n093-e4165912.webp',
  'images/thumbs/pt-n094-3c80b5be.webp',
  'images/thumbs/pt-n095-74afc5ac.webp',
  'images/thumbs/pt-n096-d9ef6504.webp',
  'images/thumbs/pt-n097-4ca546cb.webp',
  'images/thumbs/pt-n098-eb056d3c.webp',
  'images/thumbs/pt-n099-b05ce1ee.webp',
  'images/thumbs/pt-n100-8e17dd24.webp',
  'images/thumbs/pt-n101-7fc889e4.webp',
  'images/thumbs/pt-n102-5f4e05ab.webp',
  'images/thumbs/pt-n103-9ad66a96.webp',
  'images/thumbs/pt-n104-358bf849.webp',
  'images/thumbs/pt-n105-cce05081.webp',
  'images/thumbs/pt-n106-04789d03.webp',
  'images/thumbs/pt-n107-92995e70.webp',
  'images/thumbs/pt-n108-9b56367c.webp',
  'images/thumbs/pt-n109-0c79d307.webp',
  'images/thumbs/pt-n110-37f56880.webp',
  'images/thumbs/pt-n111-5caab72a.webp',
  'images/thumbs/pt-n112-71bc14a6.webp',
  'images/thumbs/pt-n113-192a5803.webp',
  'images/thumbs/pt-n114-99454be0.webp',
  'images/thumbs/pt-n115-ac370be1.webp',
  'images/thumbs/pt-n116-903fd9bc.webp',
  'images/thumbs/pt-n117-e35749c7.webp',
  'images/thumbs/pt-n118-d9d56c0a.webp',
  'images/thumbs/pt-n119-5257dd19.webp',
  'images/thumbs/pt-n120-3693575e.webp',
  'images/thumbs/pt-n121-635e221e.webp',
  'images/thumbs/pt-n122-6265005b.webp',
  'images/thumbs/pt-n123-d972184f.webp',
  'images/thumbs/pt-n124-9df7e053.webp',
  'images/thumbs/pt-n125-b4b51655.webp',
  'images/thumbs/pt-n126-6d3754df.webp',
  'images/thumbs/pt-n127-295f8658.webp',
  'images/thumbs/pt-n128-4b547f41.webp',
  'images/thumbs/pt-n129-34b77fd1.webp',
  'images/thumbs/pt-n130-f16f93ef.webp',
  'images/thumbs/pt-n131-92e8683e.webp',
  'images/thumbs/pt-n132-807dc3f9.webp',
  'images/thumbs/pt-n133-fc0b626c.webp',
  'images/thumbs/pt-n134-643ca65b.webp',
  'images/thumbs/pt-n135-f54255f6.webp',
  'images/thumbs/pt-n136-ed07979f.webp',
  'images/thumbs/pt-n137-2e363421.webp',
  'images/thumbs/pt-n138-c5c3a230.webp',
  'images/thumbs/pt-n139-5cc8f310.webp',
  'images/thumbs/pt-n140-56315147.webp',
  'images/thumbs/pt-n141-91698397.webp',
  'images/thumbs/pt-n142-c55e011e.webp',
  'images/thumbs/pt-n143-0fa2cb8a.webp',
  'images/thumbs/pt-n144-b5a1a549.webp',
  'images/thumbs/pt-n145-b60aa08c.webp',
  'images/thumbs/pt-n146-395231a4.webp',
  'images/thumbs/pt-n147-d5d65bb3.webp',
  'images/thumbs/pt-n148-90776f37.webp',
  'images/thumbs/pt-n149-e6e89ea8.webp',
  'images/thumbs/pt-n150-b1c8054a.webp'
];

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

  // 외부(CDN) 파일, 그리고 images/ fonts/ audio/ games/ 안의 파일: 저장본이 있으면 그대로 사용
  if (!same || /\/(?:images|fonts|audio|games)\//.test(url.pathname)) {
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
      return net.catch(() => (req.mode === 'navigate' ? caches.match('./') : Response.error()));
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

