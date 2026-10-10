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

사용자가 제공한 두 그림을 DF_SCENES 데이터로 관리합니다. 원본·비교 그림은 모두 1122×1402 WebP이며 논리 좌표는 240×300입니다. 비교 그림은 spots.box 안에만 그려 정답 밖의 픽셀이 원본과 같도록 합니다. DF_ART는 장면별 로딩 상태를 관리하고 실패 시 다시 불러오기를 제공합니다. 장면을 바꿀 때는 파일 두 개와 다섯 정답 좌표를 함께 수정하고 ASSETS에 파일을 등록합니다.

마작 입구 사진은 mahjong-room-v92.webp입니다. 사용자 제공 그림을 비율을 유지해 최적화했습니다. 향후 그림의 크기 순서는 토리 > 부엉박사 > 냐옹이 > 타코 > 도치이며 서로 조금씩만 차이 나게 합니다.
