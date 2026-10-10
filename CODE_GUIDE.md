# 토리 앱 수정 안내

앱은 정적 PWA입니다. 서버나 빌드 과정 없이 기존 GitHub Pages 파일을 사용합니다.

## 파일과 수정 위치

| 파일 | 담당 내용 | 주요 진입점 |
| --- | --- | --- |
| index.html | 홈, 상점, 미니게임, 보드게임, 설정, 앱 저장 | bdgCard, mjRoomOpen, mjRoomClose, APP_VER, VER_HIST |
| assets/tori-mahjong-game.html | 마작 엔진, 좌석, 패, 선언, 점수, 효과음 합성 | render, winningGroupsHTML, riverHTML, scoreHTML, roomAudioStart, roomSfx |
| assets/tori-mahjong-content.js | 냐옹이·도치 상황별 만담, BGM 음표와 속도 | talkBank, music |
| sw.js | 오프라인 파일 캐시와 앱 기록 복구 | CACHE, ASSETS |
| tools/check.py | 파일 누락, 버전 일치, JavaScript 문법 검사 | python3 tools/check.py |
| tools/build_preview.py | 폰트·마작·사진을 포함하는 단일 파일 미리보기 | LIGHT=1 python3 tools/build_preview.py index.html preview.html |

마작 대화를 추가할 때는 해당 상황의 두 캐릭터 대사를 한 쌍으로 넣습니다. takeTalk의 섞기·중복 방지 처리는 게임 파일에 있습니다. 음악 데이터 파일의 변경은 진행 상태에 영향을 주지 않습니다.

화료한 패는 점수를 계산한 실제 mianzi 분해를 사용합니다. 머리·몸통 표시를 고칠 때 재분해 결과로 점수 계산 조합을 덮어쓰지 않습니다. 칠대자·국사무쌍 등 특수형은 별도로 표시합니다.

패 이미지의 가로·세로 비율을 유지합니다. 가져간 버림패도 강에 남겨 선택한 패의 공개 장수를 확인할 수 있도록 합니다. 좌석은 현재 사람의 자풍을 기준으로 동남서북 반시계 순서로 배치합니다.

## 기록과 업데이트

기존 localStorage 키 jw_diary_v1과 기존 상태 필드를 유지합니다. 기록, 도토리, 쿠폰, 앨범, 보드게임 저장 데이터를 초기화하지 않습니다. 미리보기만 메모리 저장과 preview_seed.json을 사용합니다.

모든 변경과 로컬 검사를 마친 뒤 APP_VER와 sw.js의 CACHE 버전을 함께 올립니다. VER_HIST 맨 앞에 기존 형식으로 새 기록을 추가하고 이전 기록과 렌더링 형식을 보존합니다. 새 필수 파일은 ASSETS와 단일 파일 미리보기에 함께 넣습니다.

GitHub에는 oncehomework-jpg/tori의 기존 부모 커밋에 연결하는 일반 커밋 한 번으로 반영합니다. 파일과 과거 커밋을 삭제하거나 강제 푸시하지 않습니다. GitHub Actions에서 Chromium 검사, ZIP 제작 또는 일반 컴퓨팅 작업을 실행하지 않습니다. 반복적인 이슈·댓글·PR을 만들지 않습니다. 브라우저 검사와 필요할 때의 패키징은 로컬에서만 합니다.

## 그림 교체

사용자가 제공한 두 그림을 DF_SCENES 데이터로 관리합니다. 기존 두 장은 1122×1402, 추가 두 장은 사용자 승인에 따라 가로1122×838 WebP입니다. 논리 너비는240, 높이는dfHeight()가 실제 비율로 계산합니다. 비교 그림은 spots.box 안에만 그려 정답 밖의 픽셀이 원본과 같도록 합니다. DF_ART는 장면별 로딩 상태를 관리하고 실패 시 다시 불러오기를 제공합니다. 장면을 바꿀 때는 파일 두 개와 다섯 정답 좌표를 함께 수정하고 ASSETS에 파일을 등록합니다.

마작 입구 사진은 mahjong-room-v92.webp입니다. 사용자 제공 그림을 비율을 유지해 최적화했습니다. 향후 그림의 크기 순서는 토리 > 부엉박사 > 냐옹이 > 타코 > 도치이며 서로 조금씩만 차이 나게 합니다.


## 그림 선택/한 화면 비교 (v9.7)
- 장면의 id는 출시 후 바꾸지 않습니다. 완료는 S.dfCompleted[id]===true. dfOrder는 원본 배열을 바꾸지 않고 미완료/완료를 안정적으로 나눕니다. 다른 저장 필드와 보상은 수정하지 않습니다.
- dfSelect/dfPage/dfPageTo/dfStart가 목록과 시작을 담당합니다. dfArtLoad 캐시는 ID별이며 오래된 로딩 응답이 새 그림을 덮지 않도록 객체·ID를 확인합니다.
- dfFit는 실제 pair 공간에서 위아래/좌우 배치 크기를 비교해 더 큰 쪽을 선택합니다. canvas 비율은 dfRatio(), 논리 높이는 dfHeight(). 이전 두 장의 좌표는 유지하고 가로 그림도 같은 비율로 정규화. 터치 시 실제 표시 사각형으로 정규화합니다. 그림 전체가 항상 보이며 잘라내거나 늘이지 않습니다.
- dfZoom는 안내를 숨겨 두 그림 공간을 늘립니다. 한 그림만 늘리는 스크롤 확대는 사용하지 않습니다. 게임에서 선택 화면으로 나갈 때 ResizeObserver를 해제합니다.
- node tools/test_picture_picker.js는 DOM 모의 환경에서 저장/정렬/재플레이/기존 상태 보존을 검사합니다. 실제 화면은 브라우저로 별도 확인합니다.

- 타코 도움: 타코에게 물어보기(dfTako). 아직 못 찾은 한 곳의 소품/위치를 말하고 양쪽에 6초 점선 표시. 직접 터치해야 발견 처리, 도움 자체는 완료/보상/저장 기록을 바꾸지 않음. 안내 숨김에서는 안내를 다시 표시. 재요청/선택/게임 닫기에 타이머 정리.

- tools/build_difference_art.js는 imagegen 결과의 다섯 영역만 합성합니다. 원본 WebP 디코딩 픽셀에 합성하고 비교 WebP는 무손실로 저장해 영역 밖 차이0을 검사합니다. 입력/생성 후보는 최종 ZIP의 art-source에 보관하고 GitHub에는 최적화 파일만 반영합니다.
