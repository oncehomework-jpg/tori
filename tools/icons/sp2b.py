# 2차: 픽셀 아이콘이 없던 것들 (90개)
from sprites import M, S
from sp2a import face, PALM, A

B = {}
def recolor(rows, mp): return [''.join(mp.get(c, c) for c in r) for r in rows]
B['yheart'] = recolor(A['heart'], {'r': 'y', 'h': 'Z'})
B['wheart'] = recolor(A['heart'], {'r': 'w', 'h': 'h'})
B['hearts2'] = [
 "................", "........kk.kk...", ".......krrkrrk..", ".......krhrrrk..", "........krrrk...",
 ".........krk....", "..kk.kk...k.....", ".kppkppk........", "kpqpppppk.......", "kpqppppPk.......",
 ".kpppppk........", "..kpppk.........", "...kpk..........", "....k...........", "................", "................"]
B['stetho'] = [
 "..kk......kk....", "..kN......Nk....", "..kN......Nk....", "..kN......Nk....", "..kN......Nk....",
 "...kN....Nk.....", "....kNNNNk......", "......kk........", "......kn........", "......kn........",
 "......kn....kkk.", ".......kn..kNNNk", "........knnkNmNk", "..........kkNNNk", "............kkk.", "................"]
B['crystal'] = S(
 "....kkkk", "..kkvvvv", ".kvvVVvv", ".kvVhVvv", "kvvVVvvv", "kvvvvvvv", "kvvvvvvv", "kvvvvvvv",
 ".kvvvvvv", ".kevvvvv", "..kkeeee", "...kkkkk", "..kyyyyy", ".kYYYYYY", ".kkkkkkk", "........")
B['takeout'] = [
 "................", ".....kkkkkk.....", "....kn....nk....", "...kn......nk...", "..kkkkkkkkkkkk..",
 "..kwwwwwwwwwwk..", "...kwwwrrwwwk...", "...kwwrrrrwwk...", "...kwwwrrwwwk...", "....kwwwwwwk....",
 "....kwwwwwwk....", "....kNwwwwNk....", ".....kNNNNk.....", ".....kkkkkk.....", "................", "................"]
B['baby'] = S(
 ".......k", "......kd", ".....kkk", "...kkttt", "..kttttt", ".ktttttt", ".kttkkkt", ".kttkhtt",
 "kttttttt", "kpptttkt", "kppttttk", ".kttttkk", "..kttttt", "...kkttt", ".....kkk", "........")
B['yarn'] = S(
 "....kkkk", "..kkpppp", ".kppPPpp", ".kpPppPp", "kppPpppP", "kpPppppP", "kpPpppPp", "kpPppPpp",
 "kppPPppp", "kpppppPP", ".kpppppp", ".kPppppp", "..kkPPPP", "....kkkk", "......kD", ".......k")
B['memo'] = [
 "................", ".kkkkkkkkkk.....", ".kwwwwwwwwk..kk.", ".kwkkkkkkwk.kpk.", ".kwwwwwwwwkkNk..",
 ".kwkkkkkkwkyk...", ".kwwwwwwwkyk....", ".kwkkkkkkyk.....", ".kwwwwwwkyk.....", ".kwkkkkkyk......",
 ".kwwwwwkkk......", ".kwkkkwkkwk.....", ".kwwwwwwwwk.....", ".kNNNNNNNNk.....", ".kkkkkkkkkk.....", "................"]
B['oden'] = [
 "........k.......", ".......kbk......", "......kbbbk.....", ".....kbdbbbk....", "....kkkkkkkkk...",
 ".......kD.......", ".....kkkkkk.....", "....kwwwwwwk....", "....kwhwwwwk....", ".....kkkkkk.....",
 ".......kD.......", ".....kkkkkk.....", ".....kbbbbk.....", ".....kbddbk.....", ".....kkkkkk.....", ".......kD......."]
B['steak'] = [
 "................", "................", "....kkkkkkk.....", "..kkrrrrrrrkk...", ".krrrwrrrrrrrk..",
 "krrrwwrrrrrrrrk.", "krrrrrwrrrkkrrk.", "krrrrrrrrkwwkrk.", "krrrrrrrrkwwkrk.", ".krrrrrrrrkkrrk.",
 ".kSrrrrrrrrrrk..", "..kSSrrrrrrSk...", "...kkSSSSSSk....", ".....kkkkkk.....", "................", "................"]
B['chopstk'] = [
 "................", "..kk......kk....", "..kDk....kDk....", "...kDk..kDk.....", "...kDk..kDk.....",
 "....kDkkDk......", "....kDkkDk......", ".....kddk.......", ".....kddk.......", "....kddkdk......",
 "....kdk.kdk.....", "...kdk..kdk.....", "...kdk...kdk....", "..kdk....kdk....", "..kk......kk....", "................"]
B['fish'] = [
 "................", "................", "................", ".....kkkkk......", "...kkuuuuukk..kk",
 "..kuuuuuuuuuk.kuk", ".kukhuuuuUuuukuuk", "kuukkuuuuUuuuuuk", "kuuuuuuuuUuuuuuk", ".kuuuuuuuUuuukuuk",
 "..kUUUUUUUUUk.kUk", "...kkUUUUUkk..kk", ".....kkkkk......", "................", "................", "................"]
B['catface'] = S(
 ".kk.....", "kbbk....", "kbpbk...", "kbbbbkkk", "kbbbbbbb", "kbbbbbbb", "kbbkkbbb", "kbbkhbbb",
 "kbbbbbbb", "kbppbbbk", "kbbbbbbk", ".kbbbbbk", "..kbbbbb", "...kkbbb", ".....kkk", "........")
B['chart'] = [
 "................", ".kkkkkkkkkkkkkk.", ".kwwwwwwwwwwkkk.", ".kwwwwwwwwwwkrk.", ".kwwwwwwwwwkrrk.",
 ".kwwwwwwwwkrwwk.", ".kwwwwwwwkrwwwk.", ".kwwwkwwkrwwwwk.", ".kwwkrkkrwwwwwk.", ".kwkrwkrwwwwwwk.",
 ".kkrwwwwwwwwwwk.", ".kwwwwwwwwwwwwk.", ".kNNNNNNNNNNNNk.", ".kkkkkkkkkkkkkk.", "................", "................"]
B['mountain'] = [
 "................", "................", "......kk........", ".....kwwk.......", "....kwwnwk......",
 "....knwnnk..kk..", "...knnnnnnkkNNk.", "..knnnnnnnnkNnNk", "..knnnnnnnnnkNNk", ".knnnnnnnnnnnkNk",
 ".kGnnnnnnnnnnnkk", "kGGGnnnnnnnnnnnk", "kgGGGGGnnnnnnGgk", "kggggGGGGGGGGggk", "kkkkkkkkkkkkkkkk", "................"]
B['inbed'] = [
 "................", "................", "................", "...........kkk..", "..........kyyyk.",
 "..........kykyk.", ".kk.......kyyyk.", "kDk.kkkkkkkkkkkk", "kDkkuuuuuuuuuuuk", "kDkuUuuuuuuuuuuk",
 "kDkuuuuuuuuuuuuk", "kDkkkkkkkkkkkkkk", "kDDDDDDDDDDDDDDk", "kDkkkkkkkkkkkkDk", "kkk..........kkk", "................"]
B['wave'] = [
 "................", "................", "......kkkk......", "....kkuuuukk....", "...kuuhhhuuuk...",
 "..kuuhkkkhuuk...", "..kuhk...khuk...", ".kuuk.....kk....", ".kuuk...........", "kuuuuk......kk..",
 "kuuuuukk..kkuuk.", "kuuuuuuukkuuuuuk", "kBuuuuuuuuuuuuBk", "kBBBBBBBBBBBBBBk", "kkkkkkkkkkkkkkkk", "................"]
B['anchor'] = S(
 "......kk", ".....knn", ".....kNk", "......kk", "...kkkkN", "...kNNNN", "...kkkkN", "......kN",
 "......kN", ".kk...kN", "kNk...kN", "kNNk..kN", ".kNNkkkN", "..kNNNNN", "...kkkkk", "........")
B['onsen'] = [
 "................", "...r...r...r....", "..r...r...r.....", "...r...r...r....", "....r...r...r...",
 "...r...r...r....", "..r...r...r.....", "................", "..kk........kk..", ".kNk........kNk.",
 ".kNkkkkkkkkkkNk.", ".kNuuuuuuuuuuNk.", ".kNuhuuuuuuuuNk.", "..kNNNNNNNNNNk..", "...kkkkkkkkkk...", "................"]
B['polish'] = [
 "........kk......", ".......kmmk.....", ".......kmmk.....", ".......kmmk.....", ".......kmmk.....",
 "......kkkkkk....", ".....kNNNNNNk...", "....kpPPPPPPPk..", "....kphPPPPPPk..", "....kphPPPPPPk..",
 "....kpPPPPPPPk..", "....kpPPPPPPPk..", "....kpPPPPPPPk..", "....kPPPPPPPPk..", ".....kkkkkkkk...", "................"]
B['pagoda'] = S(
 ".......k", "......kr", "....kkkr", "..kkSSSS", ".kkkkkkk", "...kwwww", "...kwkkw", "..kkkkkk",
 ".kSSSSSS", "kkkkkkkk", "..kwwwww", "..kwkkww", "..kwkDkw", "..kwkDkw", "kkkkkkkk", "........")
B['tree'] = S(
 "....kkkk", "..kkgggg", ".kggglgg", ".kgglggg", "kggggggg", "kgglgggg", "kggggggg", ".kGggggg",
 ".kGGgggg", "..kkGGGG", "....kkkk", "......kD", "......kD", "......kD", "....kkkD", "....kkkk")
B['notes2'] = [
 "................", "......kkkkkkkk..", "......kuuuuuuk..", "......kkkkkkkk..", "......k......k..",
 "......k......k..", "......k......k..", "......k......k..", "......k......k..", "...kkkk...kkkk..",
 "..kuuuuk.kuuuuk.", "..kuhuuk.kuhuuk.", "..kuuuuk.kuuuuk.", "...kkkk...kkkk..", "................", "................"]
B['palette'] = [
 "................", ".....kkkkkk.....", "...kkbbbbbbkk...", "..kbbrrbbbuubk..", ".kbbbrrbbbuubbk.",
 ".kbbbbbbbbbbbbk.", "kbyybbbbbbbggbbk", "kbyybbbbbbbggbbk", "kbbbbbkkbbbbbbbk", "kbbbbkwwkbbvvbk.",
 ".kbbbbkkbbbvvbk.", ".kbbbbbbbbbbbk..", "..kbbbbbbbbkk...", "...kkbbbbkk.....", ".....kkkk.......", "................"]
B['ferris'] = [
 ".......kk.......", ".....kkrrkk.....", "...kk..kk..kk...", "..ku...kk...uk..", "..k.k..kk..k.k..",
 ".k...k.kk.k...k.", "kyk...kkkk...kyk", "kkkkkkkNNkkkkkkk", "kpk...kkkk...kgk", ".k...k.kk.k...k.",
 "..k.k..kk..k.k..", "..kr..kNNk..vk..", "...kkkk..kkkk...", "....kn....nk....", "...kn......nk...", "..kkkkkkkkkkkk.."]
B['glowstar'] = recolor(A['sparkle'], {})
B['glowstar'] = [
 "...y...k...y....", "....y.kyk.y.....", "......kyk.......", ".....kyZyk......", "kkkkkyZZZykkkkk.",
 ".kyyyZZZZZyyyk..", "..kyyyZZZyyyk...", "y..kyyyyyyyk..y.", "....kyyyyyk.....", "...kyyyykyyyk...",
 "...kyyk.kyyk....", "..kyk.....kyk...", "..kk.......kk...", "....y.....y.....", "...y.......y....", "................"]
B['stub'] = [
 "................", "................", "................", "kkkkkkkkkkkkkkkk", "kuuuuukuuuuuuuuk",
 ".kuuuuuuuuuuuuk.", "kuuuuukuwwwwwuuk", "kuuuuuuuuuuuuuuk", "kuuuuukuwwwuuuuk", ".kuuuuuuuuuuuuk.",
 "kuuuuukuuuuuuuuk", "kBBBBBkBBBBBBBBk", "kkkkkkkkkkkkkkkk", "................", "................", "................"]
B['raise'] = [
 "................", ".k.k.k....k.k.k.", "kykykyk..kykykyk", "kykykyk..kykykyk", "kykykyk..kykykyk",
 "kyyyyyk..kyyyyyk", "kyyyyyk..kyyyyyk", "kyyyyyk..kyyyyyk", ".kyyyk....kyyyk.", ".kuuuk....kuuuk.",
 ".kuuuk....kuuuk.", ".kuuuk....kuuuk.", ".kkkkk....kkkkk.", "..k...k..k...k..", ".k.....kk.....k.", "................"]
B['megaphone'] = [
 "................", "..........kk....", ".........krk..k.", "........krrk.k..", "......kkrrrk....",
 "..kkkkwkrrrk.kk.", ".kwwwwwkrrrk....", ".kwwwwwkrrrk.kk.", "..kkkkwkrrrk....", "...kDk.kkrrk.k..",
 "...kDk..krrk..k.", "...kDk...krk....", "...kkk....kk....", "................", "................", "................"]
B['fireworks'] = [
 "k.......k.......", ".k..r..k..k.....", "..k.r.k..k......", "...krkk.k.......", "rrrrkrrrr.......",
 "...kkkk.........", "..k.r..k.....u..", ".k..r...k..u.u.u", "k...r....k..uuu.", "..........uuuuuuu",
 "....y.......uuu.", "..y.y.y....u.u.u", "...yyy.......u..", ".yyyyyyy........", "...yyy..........", "..y.y.y........."]
B['salad'] = [
 "................", "....kk..kk......", "...kgGk.klgk.kk.", "..kglGkkgggkkrrk", "..kgggrrkglkkrhk",
 ".kkgkrrrkgkgkrrk", "kgglkkkkkkggggkk", "kkkkkkkkkkkkkkkk", "kwwwwwwwwwwwwwwk", ".kwhwwwwwwwwwwk.",
 ".kwwwwwwwwwwwNk.", "..kwwwwwwwwwNk..", "...kkNNNNNNkk...", ".....kkkkkk.....", "................", "................"]
B['write'] = [
 "................", "...........kk...", "..........kppk..", ".........kNkk...", "........kyyk....",
 ".......kyyk.....", "......kyyk......", ".....kyyk.......", "..kkkYyk........", ".kyyykkk.k......",
 "kyyyyyyykyk.....", "kyyyyyyyyyk.....", "kyyyyyyyyk......", ".kyyyyyyk.......", "..kkkkkk........", "................"]
B['soda'] = [
 "..........kk....", ".........kRk....", "........kRk.....", "....kkkkkRkkk...", "...kwwwwkRwwwk..",
 "...kkkkkkkkkkk..", "...krrrrrrrrrk..", "...krhrrrrrrrk..", "....krhwwwwrk...", "....krwrrrwrk...",
 "....krwwwwwrk...", "....krrrrrrrk...", ".....krrrrrk....", ".....kSSSSSk....", ".....kkkkkkk....", "................"]
B['popcorn'] = [
 "................", "....kkk.kkk.....", "...kwwwkwwwk....", "..kwwZwwwwZwk...", "..kwwwwkwwwwwkk.",
 ".kkwkwwwwkwwwwwk", "kwwwwwZwwwwkwwk.", ".kkkkkkkkkkkkkk.", "..krwrwrwrwrwk..", "..krwrwrwrwrwk..",
 "..krwrwrwrwrwk..", "...krwrwrwrwk...", "...krwrwrwrwk...", "...krwrwrwrwk...", "...kkkkkkkkkk...", "................"]
B['shooting'] = [
 "................", "..........k.....", ".........kyk....", "......kkkyZykkk.", ".......kyyZyyk..",
 "........kyyyk...", ".......kyykyyk..", "......kYk...kk..", ".....V..........", "....V...........",
 "...V............", "..V.............", ".V..............", "V...............", "................", "................"]
B['cupped'] = [
 "................", "................", "................", "................", "kk............kk",
 "kyk..........kyk", "kyyk........kyyk", "kyyyk......kyyyk", "kyyyykkkkkkyyyyk", "kyyyyyyyyyyyyyyk",
 ".kyyyyyyyyyyyyk.", "..kyyyyyyyyyyk..", "...kYYYYYYYYk...", "....kkkkkkkk....", "................", "................"]
B['tophat'] = [
 "................", "................", "....kkkkkkkk....", "....kmmmmmmk....", "....kmnmmmmk....",
 "....kmnmmmmk....", "....kmmmmmmk....", "....kmmmmmmk....", "....krrrrrrk....", "....kmmmmmmk....",
 ".kkkkkkkkkkkkkk.", "kmmmmmmmmmmmmmmk", ".kkkkkkkkkkkkkk.", "................", "................", "................"]
B['hedgehog'] = [
 "................", "................", ".....k.k.k......", "....kDkDkDk.k...", "...kDDDDDDDkDk..",
 "..kDdDdDdDDDDk..", ".kDDDDDDDDDDtk..", ".kDdDdDdDdDttkk.", "kDDDDDDDDDtkttk.", "kDdDdDdDdttttkkk",
 "kDDDDDDDDtttttk.", ".kDDDDDDDttttk..", "..kkkkkkkkkkk...", "...kk....kk.....", "................", "................"]
B['city'] = [
 "................", ".....kkk........", ".....kNk..kkkk..", ".kkk.kNk..kuuk..", ".kuk.kNk..kuuk..",
 ".kuk.kykk.kyuk..", "kkukkkNNk.kuuk..", "kykukkyNkkkuyk..", "kNkuk.kNkukuukk.", "kykuk.kykukyuNk.",
 "kNkukkkNkukuuyk.", "kykuNNkykukyuNk.", "kNkuNykNkukuuyk.", "kkkkkkkkkkkkkkk.", "................", "................"]
B['pinch'] = [
 "................", "......kk.k......", ".....kyykyk.....", ".....kyykyk.....", "......kyyk......",
 "......kyyk......", "....kkkyykk.....", "...kyykyyyyk....", "..kyyyyyyyyk....", "..kyyyyyyyyk....",
 "..kyyyyyyyyk....", "...kyyyyyyk.....", "....kYyyyYk.....", ".....kkkkk......", "................", "................"]
B['sunhat'] = [
 "................", "................", "................", "......kkkk......", "....kkyyyykk....",
 "...kyyyyyyyyk...", "...kyyyyyyyyk...", "...kppppppppk...", ".kkkpppppppppkk.", "kyyyyyyyyyyyyyyk",
 "kYyyyyyyyyyyyyYk", ".kkYYYYYYYYYYkk.", "...kkkkkkkkkk...", "................", "................", "................"]
B['skier'] = [
 "..........kkk...", ".........kyyyk..", ".........kyyyk..", "......kkkkkkk...", ".....krrrrrrk...",
 "....krrkrrk.....", "...kyk.krrrk....", "...kk...kuuk....", "........kuukk...", "..k.....kuk.kk..",
 "..k....kuk..kuk.", "..k...kkkk.kkk..", "kkkkkkkkkkkkkkkk", "...........kkk..", "................", "................"]
B['mouse'] = S(
 ".kkk....", "kNNNk...", "kNppk...", "kNppkkkk", ".kNkNNNN", "..kNNNNN", ".kNNkkNN", ".kNNkhNN",
 ".kNNNNNN", "kNppNNNN", ".kNNNNNk", "..kNNNkk", "...kkNNN", ".....kkk", "........", "........")
B['dobok'] = S(
 "....kkkk", "...kwwkw", "..kwwwwk", ".kwwwwwk", "kwwwwwwk", "kwkwwwwk", "kkkwwwwk", "..kwwwwk",
 "..kmmmmm", "..kmmmmm", "..kwwwwk", "..kwwwwk", "..kwwwwk", "..kNNNNk", "..kkkkkk", "........")
B['palm'] = PALM
B['palmdown'] = [
 "................", "................", "...kkkkkkkk.....", "..kyyyyyyyyk....", ".kyyyyyyyyyykk..",
 ".kyyyyyyyyyyyyk.", "..kyyyyyyyyyyyk.", "..kykykykyyyyk..", "..kykykykkkkk...", "..kykykyk.......",
 "..kykykyk.......", "..kykykyk.......", "...k.k.k........", "................", "................", "................"]
B['camera'] = [
 "................", "................", "....kkkk........", "...kmmmmk.......", ".kkkkkkkkkkkkkk.",
 "kmmmmmmmmmmmyymk", "kmmmmkkkkkmmmmmk", "kNNNkuuuuukNNNNk", "kNNkuuhuuuukNNNk", "kNNkuuuuuuukNNNk",
 "kNNkuuuuuuukNNNk", "kNNNkuuuuukNNNNk", "kmmmmkkkkkmmmmmk", ".kkkkkkkkkkkkkk.", "................", "................"]
B['tag'] = [
 "................", ".kkkkkkkk.......", "kyyyyyyyyk......", "kykkyyyyyyk.....", "kykkyyyyyyyk....",
 "kyyyyyyyyyyyk...", "kyyyyyyyyyyyyk..", ".kYyyyyyyyyyyyk.", "..kYyyyyyyyyyyyk", "...kYyyyyyyyyyk.",
 "....kYyyyyyyyk..", ".....kYyyyyyk...", "......kYyyyk....", ".......kYYk.....", "........kk......", "................"]
B['pointup'] = [
 "................", "......kk........", ".....kyyk.......", ".....kyyk.......", ".....kyyk.......",
 ".....kyykkk.....", ".....kyykyykk...", "...kkkyykyykyk..", "..kyykyyyyyyyk..", "..kyyyyyyyyyyk..",
 "..kyyyyyyyyyyk..", "...kyyyyyyyyk...", "....kyyyyyyk....", "....kYYYYYYk....", "....kkkkkkkk....", "................"]
B['pumpkin'] = S(
 ".......k", "......kg", "....kkkk", "..kkoOoo", ".koOoooO", "koOoooOo", "koookkoO", "kooOkkoo",
 "koOooooo", "kooOkkoo", "kooookkk", "koOooooo", ".koOoooO", "..kkoOoo", "....kkkk", "........")
B['bone'] = [
 "................", "...........kk...", "..........kwwk..", "...kkkkkkkkwwkk.", "..krrrrrrrkkwwk.",
 ".krrrhrrrrrk.kk.", "krrrhrrrrrrrk...", "krrrrrrrrrrrk...", "krrrrrrrrrrk....", ".kSrrrrrrrrk....",
 "..kSSrrrrrk.....", "...kkkkkkk......", "..kk............", ".kwwk...........", ".kwk............", "..k............."]
B['beers'] = [
 "................", ".kkkkk....kkkkk.", "kwwwwwk..kwwwwwk", "kkkkkkkk.kkkkkkk", "kyyyyykykyyyyyk.",
 "kyhyyykykyhyyyk.", "kyhyyykykyhyyyk.", "kyyyyykykyyyyyk.", "kyyyyykk.kyyyyk.", "kyyyyyk..kyyyyk.",
 "kYYYYYk..kYYYYk.", "kkkkkkk..kkkkkk.", "................", "................", "................", "................"]
B['herb'] = [
 "................", ".............kk.", "..........kkkgk.", ".........kggggk.", "....kk..kglgggk.",
 "...kgk..kggggk..", "..kglgk.kggkk...", "..kgggk.kkk.....", "..kgggkGk.......", "...kkkGk...kkk..",
 "......kGk.kgggk.", ".......kGkglggk.", "........kGkkkk..", ".........kGk....", "..........kk....", "................"]
B['compass'] = S(
 ".....kkk", "...kkNNN", "..kNNkkk", ".kNkwwww", ".kNkwwww", "kNkwwwwk", "kNkwwwkr", "kNkwwkrr",
 "kNkwwkuu", "kNkwwwku", "kNkwwwwk", ".kNkwwww", ".kNkwwww", "..kNNkkk", "...kkNNN", ".....kkk")
B['ostar'] = recolor(A['dizzystar'], {})
B['ostar'] = S(
 ".......k", ".......k", "......kw", "......kw", ".....kww", "kkkkkkww", "kwwwwwww", ".kwwwwww",
 "..kwwwww", "...kwwww", "...kwwww", "..kwwwwk", "..kwwkk.", ".kwkk...", ".kkk....", "........")
B['anger'] = [
 "................", "................", "...kk.....kk....", "...krk...krk....", "....krk.krk.....",
 "kkk.krk.krk.kkk.", "krrkk.....kkrrk.", ".kkk.......kkk..", "................", ".kkk.......kkk..",
 "krrkk.....kkrrk.", "kkk.krk.krk.kkk.", "....krk.krk.....", "...krk...krk....", "...kk.....kk....", "................"]
B['meh'] = face(r4="__kkkk____kkkk__", r5="___kk______kk___", r10="______kkkkk_____")
B['cry'] = face(r5="___kk______kk___", r6="__uk________ku__", r7="__u__________u__", r8="__u____kk____u__",
 r9="______k__k______", r10="_____k____k_____")
B['swim'] = [
 "................", "................", "................", ".........kkk....", "........kyyyk...",
 "..kkk...kyyyk...", ".kyyykkkkkkk....", "..kkkkrrrrrkkkk.", ".....krrrrrkyyyk", "u.u.u.kkkkk.kkk.",
 ".u.u.u.u.u.u.u.u", "uuuuuuuuuuuuuuuu", "UuuuUuuuUuuuUuuu", "uuuuuuuuuuuuuuuu", "................", "................"]
B['back'] = [
 "................", "................", "......k.........", ".....kuk........", "....kuuk........",
 "...kuuukkkkkk...", "..kuuuuuuuuuukk.", "...kuuukkkkkkuuk", "....kuuk.....kuk", ".....kuk.....kuk",
 "......k......kuk", ".............kuk", "........kkkkkuuk", "........kuuuuuk.", "........kkkkkk..", "................"]
B['robot'] = S(
 ".......k", ".......k", "......kr", "...kkkkk", "..kNNNNN", "..kNkkkN", "..kNkuuN", "..kNkkkN",
 ".kkNNNNN", "kNkNkkkk", "kNkNNNNN", ".kkNNNNN", "...kkkkk", "...kNNNk", "...kkkkk", "........")
B['icecream'] = [
 "................", "........k.......", ".......kwk......", "......kwwk......", ".....kwwwwk.....",
 "....kkwwwwwk....", "...kwwwwwwwwk...", "..kwhwwwwwwwwk..", "..kNwwwwwwwwNk..", "...kkkkkkkkkk...",
 "...kbdbdbdbdk...", "....kdbdbdbk....", "....kbdbdbdk....", ".....kdbdbk.....", "......kbbk......", ".......kk......."]
B['luggage'] = [
 "................", ".....kkkkkk.....", ".....kk..kk.....", "..kkkkkkkkkkkk..", ".krrrrrrrrrrrrk.",
 ".krRrkrrrrkrrrk.", ".krRrkrrrrkrrrk.", ".kkkkkkkkkkkkkk.", ".kyyyyyyyyyyyyk.", ".kkkkkkkkkkkkkk.",
 ".krrrkrrrrkrrrk.", ".krrrkrrrrkrrrk.", ".kSSSkSSSSkSSSk.", ".kkkkkkkkkkkkkk.", "..kk........kk..", "................"]
B['spiral'] = [
 "..k.k.k.k.k.k...", ".kNkNkNkNkNkNk..", "kkkkkkkkkkkkkkk.", "kwwwwwwwwwwwwwk.", "kwkkwkkwkkwkkwk.",
 "kwwwwwwwwwwwwwk.", "kwkkwkkwkkwkkwk.", "kwwwwwwwwwwwwwk.", "kwkkwkkwrrwkkwk.", "kwwwwwwwrrwwwwk.",
 "kwkkwkkwkkwkkwk.", "kwwwwwwwwwwwwwk.", "kNNNNNNNNNNNNNk.", "kkkkkkkkkkkkkkk.", "................", "................"]
B['walk'] = [
 "......kkk.......", ".....kyyyk......", ".....kyyyk......", "......kkk.......", ".....kkkkk......",
 "....kgggggk.....", "...kgkgggkgk....", "...kyk.ggg.kyk..", "...kk.kgggk.kk..", "......kBBBk.....",
 ".....kBBkBBk....", ".....kBk.kBk....", "....kBk...kBk...", "....kDk...kDk...", "...kkk.....kkk..", "................"]
B['car'] = [
 "................", "................", "................", "....kkkkkkk.....", "...krrrrrrrk....",
 "..krkiiikiiikk..", "..krkiiikiiikrk.", ".kkkkkkkkkkkkrrk", "krrrrrrrrrrrrrrk", "kyrrrrrrrrrrrryk",
 "krrrrrrrrrrrrrrk", "kSkkkSSSSSSkkkSk", "kkmNmkkkkkkmNmkk", "..kmk......kmk..", "...k........k...", "................"]
B['pizza'] = [
 "................", "kkkkkkkkkkkkkkkk", "kdddddddddddddDk", ".kyyrryyyyyyrrk.", ".kyyrryygyyyrrk.",
 "..kyyyyyyyyyyk..", "..kyyyyrryyyyk..", "...kygyrryyyk...", "...kyyyyyyyyk...", "....kyyrryyk....",
 "....kyyrryyk....", ".....kyyyyk.....", ".....kyyyyk.....", "......kyyk......", "......kyyk......", ".......kk......."]
B['sunrise'] = [
 "kkkkkkkkkkkkkkkk", "kUUUUUUUUUUUUUUk", "kUUUUUUUUUUUUUUk", "kppppppppppppppk", "kpppppkkkkpppppk",
 "kOOOOkyyyykOOOOk", "kOOOkyyZZyykOOOk", "kooookyyyyykoook", "kkkkkkkkkkkkkkkk", "kuuuuuyyyyuuuuuk",
 "kuUuuuuuuuuuUuuk", "kuuuuyyyyyyuuuuk", "kuuUuuuuuuuuuUuk", "kuuuuuuuuuuuuuuk", "kkkkkkkkkkkkkkkk", "................"]
B['shield'] = S(
 "kkkkkkkk", "kuuuuuuk", "kuhuuuuk", "kuhuuuuk", "kuuuuuky", "kuuuuuky", "kuuuuuky", "kkkkkkky",
 "kyyyyyyy", ".kyyyyyy", ".kyyyyyy", "..kyyyyy", "...kyyyy", "....kkYY", "......kk", "........")
B['eyes'] = S(
 "................", "................", "...kkk..", "..kwwwk.", ".kwwwwwk", ".kwwwwwk", ".kwwkkwk", ".kwwkkwk",
 ".kwwkkwk", ".kwwwwwk", ".kwwwwwk", "..kwwwk.", "...kkk..", "........", "........", "........")
B['turtle'] = [
 "................", "................", "................", "......kkkkk.....", "....kkgGgGgkk...",
 "...kgGgGgGgGgk..", "..kgGgGgGgGgGgk.", "..kGgGgGgGgGgGkkk", ".kkkkkkkkkkkkkkll", "kllkllk...kllkhl",
 "kllk.kk...kk.kll", ".kk...........kk", "................", "................", "................", "................"]
B['ear'] = [
 "................", "......kkkk......", ".....kttttk.....", "....kttkkttk....", "...kttk..kttk...",
 "...ktk.kk.ktk...", "...ktk.kkktk....", "...ktkk..ktk....", "....kttkktk.....", ".....kttttk.....",
 "......kttk......", ".....kttk.......", "....kttk........", "....kkk.........", "................", "................"]
B['sprout'] = [
 "................", "................", "..kkk.....kkk...", ".kgglk...klggk..", "kgggglk.klggggk.",
 "kGgggglkklgggGk.", ".kGGgggkkgggGk..", "..kkkkGkkGkkk...", "......kGGk......", "......kGGk......",
 "......kGGk......", "...kkkkkkkkkk...", "..kDDDDDDDDDDk..", "..kdddddddddDk..", "..kkkkkkkkkkkk..", "................"]
B['box'] = [
 "................", "................", "....kkkkkkkk....", "...kbbbbkbbbk...", "..kbbbbbkbbbbk..",
 ".kkkkkkkkkkkkkk.", ".kbbbbbkkbbbbbk.", ".kbbbbbbbbbbbbk.", ".kbbbbbbbbbbbbk.", ".kbbbbbbbbbbbbk.",
 ".kbbbbbbbbbkkbk.", ".kbbbbbbbbbbbbk.", ".kdddddddddddDk.", ".kkkkkkkkkkkkkk.", "................", "................"]
B['inbox'] = [
 "......kk", ".....kuu", ".....kuu", ".....kuu", ".....kuu", ".....kuu", "...kkkuu", "....kuuu",
 ".....kuu", "kkkkkkkk", "kNNNNkkk", "kNNNNNNN", "kNNNNNNN", "knnnnnnn", "kkkkkkkk", "........"]
B['inbox'] = [r if len(r) == 16 else M(r) for r in B['inbox']]
B['monkey'] = S(
 "....kkkk", "..kkDDDD", ".kDDDDDD", "kbkDtttt", "kbkttttt", ".kytytyy", "kyyytyyy", "kyyyyyyy",
 "kyyyyyyy", ".kyyykkk", "..kttttt", "..kttttt", "..ktttkk", "...kkkkk", "........", "........")
B['shush'] = face(r5="____kk____kk____", r6="____kk____kk____", r8="_pp__________pp_",
 r9="______kyyk______", r10="_____kkyykk_____", r11="______kyyk______", r12="______kyyk______")
B['socks'] = [
 "................", "..kkkkk...kkkkk.", "..kwwwk...kwwwk.", "..krrrk...krrrk.", "..kwwwk...kwwwk.",
 "..kuuuk...kuuuk.", "..kuuuk...kuuuk.", "..kuuuk...kuuuk.", "..kuuuk...kuuuk.", "..kuuuukk.kuuuukk",
 "..kuuuuuk.kuuuuuk", "...kwwwwk..kwwwwk", "....kkkk....kkkk", "................", "................", "................"]
B['socks'] = [r[:16] for r in B['socks']]
B['santa'] = S(
 ".......k", ".....kkr", "....krrr", "...krrrr", "..krrrrr", "..kwwwww", ".kwwwwww", ".kttttkt",
 ".ktttttt", "kwwtttpt", "kwwwwwwk", "kwwwwwkr", ".kwwwwww", "..kwwwww", "...kkwww", ".....kkk")
B['ghost'] = S(
 ".....kkk", "...kkwww", "..kwwwww", ".kwwwwww", ".kwwkkww", ".kwwkkww", "kwwwwwww", "kwppwwww",
 "kwwwwwwk", "kwwwwwww", "kwwwwwww", "kwwwwwww", "kNwNwwwN", "kkNkkNNk", "k.kk..kk", "........")
B['stew'] = [
 "................", ".....w...w......", "......w...w.....", ".....w...w......", "..kkkkkkkkkkkk..",
 ".kooooOoooOoook.", "kkkkkkkkkkkkkkkk", "kmmmmmmmmmmmmmmk", "kmmmmmmmmmmmmmmk", ".kmmmmmmmmmmmmk.",
 ".kmnmmmmmmmmmmk.", "..kmmmmmmmmmmk..", "..kkkkkkkkkkkk..", "................", "................", "................"]
B['shrimp'] = [
 "................", "..k.............", "...k..kkkk......", "....kkOOOOkk....", "....kOkOOOOOk...",
 "....kOOOwOOOOk..", ".....kkOOwOOOk..", "........kOwOOk..", "........kOwOOk..", ".......kOwOOk...",
 "...kk.kOwOOk....", "..kOOkOOOOk.....", "..kOOOOOkk......", "...kkkkk........", "................", "................"]
B['sunflower'] = S(
 "....k.kk", "...kykyy", "..kyykyy", ".kkyyyyk", "kyyykkkk", "kyyykDdD", ".kyykdDd", "kyykdDdD",
 "kyyykDdD", ".kkyykkk", "..kyyyyy", "..kkyky.", "....kGkg", ".....kgg", "......kg", ".......k")
B['sunface'] = recolor(face(r5="____kk____kk____", r6="____kk____kk____", r8="_ppp________ppp_",
 r9="___k________k___", r10="____kk____kk____", r11="______kkkk______"), {'Y': 'o'})
B['paws'] = [
 "................", "........k.k.....", ".......kDkDk....", "........k.k.....", ".......kkkk.....",
 "......kDDDDk....", "......kDDDDk....", ".......kkkk.....", "..k.k...........", ".kDkDk..........",
 "..k.k...........", ".kkkk...........", "kDDDDk..........", "kDDDDk..........", ".kkkk...........", "................"]
B['gem'] = [
 "................", "................", "...kkkkkkkkkk...", "..kiJJiJJiJJik..", ".kiJJiiJJiiJJik.",
 "kkkkkkkkkkkkkkkk", ".kJiJJJiiJJJiJk.", "..kJiJJiiJJiJk..", "...kJiJiiJiJk...", "....kJiJJiJk....",
 ".....kJiiJk.....", "......kJJk......", ".......kk.......", "................", "................", "................"]
B['fire'] = S(
 ".......k", "......kr", "......kr", ".....kro", "..k..kro", ".krk.kro", ".kroko oo".replace(' ', ''), "kroooooo",
 "krooyyoo", "kroyyyyo", "kroyyZyy", "kroyyZZy", ".kroyyyy", "..kkrooo", "....kkkk", "........")
B['clock'] = S(
 "................", ".....kkk", "...kkDDD", "..kDDkkk", ".kDDkwww", ".kDkwwww", "kDDkwwww", "kDkwwwwk",
 "kDkwwwwk", "kDDkwwww", ".kDkwwww", ".kDDkwww", "..kDDkkk", ".kkkkkkk", ".kDDDDDD", ".kkkkkkk")

EMOJI_B = {
 '💛':'yheart','🤍':'wheart','💕':'hearts2','🩺':'stetho','🔮':'crystal','🥡':'takeout','👶':'baby','🧶':'yarn',
 '📝':'memo','🍢':'oden','🥩':'steak','🥢':'chopstk','🐟':'fish','😺':'catface','📈':'chart','⛰':'mountain',
 '🛌':'inbed','🌊':'wave','⚓':'anchor','♨':'onsen','💅':'polish','🏯':'pagoda','🌳':'tree','🎶':'notes2',
 '🎨':'palette','🎡':'ferris','🌟':'glowstar','🎫':'stub','🙌':'raise','📣':'megaphone','🎆':'fireworks',
 '🥗':'salad','✍':'write','🥤':'soda','🍿':'popcorn','🌠':'shooting','🤲':'cupped','🎩':'tophat',
 '🦔':'hedgehog','🏙':'city','🤏':'pinch','👒':'sunhat','⛷':'skier','🐭':'mouse','🥋':'dobok','🖐':'palm',
 '🫳':'palmdown','📷':'camera','🏷':'tag','👆':'pointup','🎃':'pumpkin','🍖':'bone','🍻':'beers','🌿':'herb',
 '🧭':'compass','☆':'ostar','💢':'anger','😒':'meh','😢':'cry','🏊':'swim','↩':'back','🤖':'robot',
 '🍦':'icecream','🧳':'luggage','🗓':'spiral','🚶':'walk','🚗':'car','🍕':'pizza','🌅':'sunrise',
 '🛡':'shield','👀':'eyes','🐢':'turtle','👂':'ear','🌱':'sprout','📦':'box','📥':'inbox','🙈':'monkey',
 '🤫':'shush','🧦':'socks','🎅':'santa','👻':'ghost','🍲':'stew','🦐':'shrimp','🌻':'sunflower',
 '🌞':'sunface','🐾':'paws','💎':'gem','🔥':'fire','🕰':'clock','♪':'note',
}

B['fish'] = [
 "................", "................", "................", ".....kkkkk......", "...kkuuuuukk.kk.",
 "..kuuuuuuuuukkuk", ".kukhuuuuUuuukuk", "kuukkuuuuUuuuuuk", "kuuuuuuuuUuuuuuk", ".kuuuuuuuUuuukuk",
 "..kUUUUUUUUUkkUk", "...kkUUUUUkk.kk.", ".....kkkkk......", "................", "................", "................"]
B['fireworks'][9] = ".........uuuuuuu"
B['turtle'][7] = "..kGgGgGgGgGgGkk"
B['turtle'][8] = ".kkkkkkkkkkkkkll"

B['cupped'] = [
 "................", "................", "..k.k......k.k..", ".kykyk....kykyk.", ".kykyk....kykyk.",
 "kykyyk....kyykyk", "kyyyyk....kyyyyk", "kyyyyykkkkyyyyyk", "kyyyyyykkyyyyyyk", ".kyyyyyyyyyyyyk.",
 "..kyyyyyyyyyyk..", "...kYYYYYYYYk...", "....kkkkkkkk....", "................", "................", "................"]
del B['write']; EMOJI_B['✍'] = 'memo'
B['shield'] = [
 "................", "..kkkkkkkkkkkk..", "..kuuuuukyyyyk..", "..kuhuuukyyyyk..", "..kuuuuukyyyyk..",
 "..kuuuuukyyyyk..", "..kkkkkkkkkkkk..", "..kyyyyykuuuuk..", "..kyyyyykuuuuk..", "...kyyyykuuuk...",
 "...kyyyykuuuk...", "....kyyykuuk....", ".....kyykuk.....", "......kkkk......", ".......kk.......", "................"]
B['clock'] = [
 "................", ".....kkkkkk.....", "...kkDDDDDDkk...", "..kDDkkkkkkDDk..", ".kDDkwwwwwwkDDk.",
 ".kDkwwwkwwwwkDk.", ".kDkwwwkwwwwkDk.", ".kDkwwwkkkwwkDk.", ".kDkwwwwwwwwkDk.", ".kDDkwwwwwwkDDk.",
 "..kDDkkkkkkDDk..", "..kDDDDDDDDDDk..", "..kDDDyyyyDDDk..", ".kkkkkkkkkkkkkk.", ".kDDDDDDDDDDDDk.", ".kkkkkkkkkkkkkk."]
