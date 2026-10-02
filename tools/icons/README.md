# 픽셀 아이콘 원본 (16×16)

앱의 이모지 → 픽셀 아이콘(`index.html`의 `SP` 안 `q_*`)을 만든 원본이에요.

- `sprites.py`: 1차(장식·탭·도토리 59개) + 공통 도구 `M()`(좌우 대칭), `S()`, 새 색 `PAL_NEW`
- `sp2a.py`: 2차 1묶음(예전 8×8 아이콘 69개) + 얼굴 틀 `face()`, 손 `PALM`
- `sp2b.py`: 2차 2묶음(기본 이모지였던 90개)
- 한 줄 = 16글자, 16줄. 글자 = 색(`k` 윤곽, `w` 흰색, `y` 노랑 … `.` 투명). 색표는 index.html의 `PAL`.
- 검사: `cd tools/icons && python3 chk.py sp2b B EMOJI_B` (줄 길이 확인)
- 보기: `python3 sheet.py sp2b B EMOJI_B /tmp/b.html` 후 브라우저로 열기
- 앱에 넣을 때: 새 아이콘을 `Object.assign(SP,{"q_이름":[...]})`, 이모지 연결은 `Object.assign(AL,{"😀":"q_이름"})`로 `const cache={};` 바로 앞에 추가.
- `sp3.py` (v4.4): 다시 그린 아이콘 10개(기타·발자국·수영 등). `pxdraw.py`는 도형으로 그리는 도우미, `cmp.py`는 옛/새 아이콘 나란히 PNG(`Z=12 python3 cmp.py icons.json out.png 이름...`, icons.json은 index.html의 PAL/SP/AL을 뽑은 것).
