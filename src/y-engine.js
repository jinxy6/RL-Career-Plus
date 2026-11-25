'use strict';
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const CLIPS_ROOT = path.join(__dirname, 'clips');

const PLAY_TEMPLATES = {
  goal: [
    { move: 'CEILING DOUBLE TAP',  speedMin: 108, speedMax: 132, clock: '0:00 OT',  lines: [
      '{winner} with an UNREAL {speed} KPH {move} right on {loser}\'s head 💀 {oppHandle} just uninstalled',
      'SOMEONE CHECK {oppHandle}\'S ANKLES!! {player} hits a {speed} KPH {move} in {event}!! 🔥',
      '{player} just ended {loser}\'s entire season with a {speed} KPH {move}. Disgusting. #{tag}',
      'Nah {player} needs to be drug-tested for that {speed} KPH {move} vs {loser} 😭 #{tag}',
      'Call the police — {player} just committed a robbery with a {speed} KPH {move} in {event} 🚨',
    ]},
    { move: 'FLIP RESET MUSTY',    speedMin: 112, speedMax: 138, clock: '1:14',     lines: [
      'NO WAY {player} JUST HIT A {speed} KPH {move} AGAINST {loser} IN {event} 😭🔥',
      '{oppHandle} left the whole net open trying to pre-jump that {move} — {player} is HIM.',
      'Clip of the tournament?? {player} ({winner}) buries a {speed} KPH {move} vs {loser}! #{tag}',
      'Bro hit a {speed} KPH {move} in an official {event} match like it\'s Freeplay 💀 {player} is unreal',
      '{loser}\'s defense just got sent to the shadow realm by {player}\'s {move} 🔥',
    ]},
    { move: 'PSYCHO REDIRECT',     speedMin: 118, speedMax: 146, clock: '0:12',     lines: [
      '{speed} KPH {move} WITH 12 SECONDS LEFT!! {player} HAS ICE IN HIS VEINS 🧊 #{tag}',
      'Nah {loser} actually got clipped on LAN 💀 {player} {speed} KPH {move} in {event}',
      'HOW DO YOU EVEN READ THAT ANGLE?! {player} slaps a {speed} KPH {move} past {loser}!! 😱',
      'Geometry professor {player} just calculated a {speed} KPH {move} straight into {loser}\'s top bins 🎯',
    ]},
    { move: 'ZERO-SECOND EQUALIZER', speedMin: 98, speedMax: 124, clock: '0:00',   lines: [
      '0:00 ON THE CLOCK AND {player} KEEPS IT UP FOR THE {move}!! {event} CINEMA!! 🎬',
      '{oppHandle} thought it was over 😭 {player} keeps the ball alive at 0:00 vs {loser}!',
      'THIS IS ROCKET LEAGUE!! {player} scores at 0:00 against {loser} to force overtime!! #{tag}',
      '{loser} already took their hands off the controller and {player} punished them at 0:00 💀',
    ]},
    { move: 'AIR DRIBBLE BUMP',    speedMin: 86, speedMax: 109, clock: '0:38',     lines: [
      '{player} literally carried the ball AND {oppHandle} into the net 💀 {move} in {event}!',
      'Pure disrespect from {player} — bumped {oppHandle} off the goal line and walked it in 😭 #{tag}',
      '{winner} bullying {loser} with a textbook {move}. Zero counterplay. 🔥',
      'Someone check {oppHandle}\'s monitor after that {move} by {player} 💀',
    ]},
    { move: 'PINCH FROM OWN HALF', speedMin: 136, speedMax: 168, clock: '2:11',     lines: [
      '{speed} KPH CROSS-MAP {move}!! {loser} DIDN\'T EVEN HAVE TIME TO BLINK 🤯 #{tag}',
      'A {speed} KPH LASER FROM {player}!! You could hear that goal explosion in another continent 🔥',
      'Absolute rocket from {player} ({winner}) — {speed} KPH {move} leaves {loser} frozen 💀',
    ]},
    { move: 'BREEZI FLICK TOP BINS', speedMin: 106, speedMax: 129, clock: '1:47',   lines: [
      'HE HIT A {move} IN {event}?! {player} is treating {loser} like ranked 2s 😭🔥',
      '{speed} KPH {move} right over {oppHandle}\'s head!! Put {player} in the Hall of Fame already 👑',
      '{loser} got styled on in front of 100k viewers 💀 {player} {move} #{tag}',
    ]},
    { move: 'ZERO-BOOST FAKE',     speedMin: 58,  speedMax: 79,  clock: '0:27',     lines: [
      '{player} HAD ZERO BOOST AND STILL SENT ALL THREE {loser} PLAYERS FLYING 💀😂',
      'BOTH DEFENDERS FLEW INTO THE BACK WALL!! {player} with the filthiest {move} of {event} 😭',
      'Mind games level 999: {player} doesn\'t even touch the ball and {oppHandle} backflips into orbit 💀',
    ]},
  ],
  whiff: [
    { move: 'OPEN NET CROSSBAR',   speedMin: 62,  speedMax: 89,  clock: '0:04',     lines: [
      'HOW DOES {victim} MISS AN OPEN NET WITH 0:04 LEFT?! 💀 {victimHandle} sell the controller bro',
      'CLIP OF SHAME 😭 {victim} ({loser}) slams the crossbar on a completely open net vs {winner} in {event}!',
      '{loser} fans look away... {victim} just hit the worst {move} of {event} 💀 #{tag}',
      'Open nets remain the hardest mechanic in Rocket League 😭 {victimHandle} hit the post from 2 meters out!',
      'My Gold 3 teammate hits that 💀 {victim} ({loser}) just sold the whole series vs {winner}!',
    ]},
    { move: 'OWN GOAL BACKPASS',   speedMin: 84,  speedMax: 112, clock: '0:19',     lines: [
      'WAIT A SECOND... {victim} JUST TOP-CORNERED HIS OWN NET FOR {winner} 💀💀 {victimHandle} check his PayPal',
      '{victim} with a {speed} KPH banger... into his OWN net 😭 {loser} are chalked in {event}',
      'Best shot of the whole series by {victim}... wrong net though 💀 {winner} says thank you!',
      'Transfer announcement incoming?? {victim} is already playing for {winner} with that {speed} KPH own goal 😂',
    ]},
    { move: 'DOUBLE COMMIT WHIFF', speedMin: 44,  speedMax: 71,  clock: '0:08 OT',  lines: [
      'ALL THREE {loser} PLAYERS IN THE SAME CORNER IN OVERTIME 💀 {winner} walks it into an empty net!',
      'Diamond 2 comms in {event}?? {loser} triple-commit whiff hands {winner} the series 😭 #{tag}',
      'Who\'s got it?! NOBODY!! {loser} bump each other mid-air and gift {winner} the OT winner 💀',
      'Turn the comms on right now 😂 {loser} just recreated a solo-queue C1 lobby in {event}!',
    ]},
    { move: 'BACKFLIP ON KICKOFF', speedMin: 52,  speedMax: 78,  clock: '0:01 OT',  lines: [
      'NOOOOO {victim} FEELSBACKFLIPMAN ON AN OVERTIME KICKOFF VS {winner} 😭💀',
      'Controller disconnect or nerves?? {victimHandle} backflipped straight into a {loser} loss in {event}!',
      'You CANNOT backflip on kickoff in {event} 😭 {winner} gets the easiest goal of the season!',
    ]},
    { move: 'BACKBOARD WHIFF',     speedMin: 67,  speedMax: 95,  clock: '0:42',     lines: [
      '{victim} flew right past the ball on the backboard like a tourist 💀 {winner} cleans up easily!',
      'Where was {victimHandle} going?! Missed the backboard clear by three car lengths 😭 #{tag}',
      '{loser}\'s backboard defense just went on vacation — {winner} punishes {victim} immediately 🔥',
    ]},
  ],
  save: [
    { move: 'GOAL-LINE SQUISHY SAVE', speedMin: 104, speedMax: 128, clock: '0:02', lines: [
      '{player} JUST STOLE {victim}\'S SOUL ON THE GOAL LINE!! 99% IN AND HE SAVED IT!! 🛡️ #{tag}',
      'HOW DID THAT STAY OUT?! {player} ({winner}) denies {loser} with a miraculous {move} in {event}!',
      'THE BALL WAS LITERALLY INSIDE THE NET!! {player} with the greatest {move} of the split 😱🛡️',
      '{victimHandle} already started celebrating and {player} said NOT IN MY HOUSE 🚫🔥',
    ]},
    { move: 'PRE-JUMP INTERCEPTION', speedMin: 110, speedMax: 135, clock: '0:15 OT', lines: [
      '{player} READ {victim}\'S PASS FROM THREE SECONDS IN THE FUTURE!! INSANE {move} 🛡️',
      'Brick wall mode activated: {player} ({winner}) shuts down {loser} with a godlike {move} in {event}!',
      'Zero fear from {player} — flying from the ceiling to snatch {loser}\'s game-winner out of thin air 🔥',
    ]},
    { move: 'ZERO-BOOST SHADOW SAVE', speedMin: 94, speedMax: 118, clock: '0:09', lines: [
      'NO BOOST AND A DREAM!! {player} pulls off an impossible {move} against {loser} 🛡️😭',
      '{player} really saved a {speed} KPH top-corner rocket from {victim} on 4 boost... built different 🔥',
    ]},
  ],
};

const USER_CALLOUT_LINES = [
  '@{oppHandle} Enough dodging — {myClub} wants you in the next bracket. Don\'t hide. 🔥',
  '@{oppHandle} Stop ducking {myClub} in scrims and see us on main stage. 😤',
  '@{oppHandle} Everybody hyping {oppClub} up like we wouldn\'t 3-0 them tomorrow 💀',
  '@{oppHandle} Praying we draw {oppClub} next round. Easiest bracket match of the split. 🎯',
  '@{oppHandle} Talk is cheap — let\'s settle {myClub} vs {oppClub} on LAN in front of everyone 🔥',
  '@{oppHandle} Tell your coach to start watching our replays now, {myClub} is coming for {oppClub} 👀',
  '@{oppHandle} Funny how {oppClub} only looks good when they avoid our side of the bracket 😂',
  '@{oppHandle} Putting {oppClub} on notice right now. Next time we queue up it\'s not even going to Game 5.',
  '@{oppHandle} Hey {oppClub}, keep that trophy warm for {myClub} 🏆🔥',
  '@{oppHandle} Zero fear of {oppClub}. Give us Best of 7 and watch what happens 💀',
  '@{oppHandle} Tired of seeing {oppClub} ranked above us. Meet {myClub} in playoffs and prove it.',
  '@{oppHandle} Scrim results don\'t lie — {oppClub} knows they don\'t want to see {myClub} on Sunday 👀',
  '@{oppHandle} One team in this region runs the server and it sure isn\'t {oppClub} 🔥',
  '@{oppHandle} Bookmark this tweet: {myClub} is sending {oppClub} straight to lowers next event 📸',
  '@{oppHandle} Hey {oppClub}, tell your roster to pack light for the next Major — you won\'t be staying long 💀',
  '@{oppHandle} No more friendly GGs. {myClub} vs {oppClub} is personal now. 🔥',
];

const USER_REPLY_LINES = {
  trashPlayer: [
    '{targetHandle} keep talking on Y, we\'ll do our talking on the pitch 🔥',
    '{targetHandle} rent free 💀 see you next series.',
    '{targetHandle} bold words from someone watching us from lower bracket 😂',
    '{targetHandle} crazy how loud you are on Twitter and how quiet you are in Game 5 💀',
    '{targetHandle} worry about making top 8 before mentioning {myClub} 😂',
    '{targetHandle} typing essays on Y instead of hitting Freeplay is wild 💀',
    '{targetHandle} screenshot this and check back after the next bracket 🔥',
    '{targetHandle} you had 120 points in Game 4 bro sit this one out 😭',
    '{targetHandle} {myClub} owns that matchup and you know it 😤',
    '{targetHandle} keep that same energy when the lights come on at LAN 🔥',
    '{targetHandle} all that barking just to get swept in Swiss 💀',
    '{targetHandle} bro is undefeated on Y and 0-3 in playoffs 😂',
  ],
  trashMedia: [
    '{targetHandle} stop farming impressions with that angle 💀',
    '{targetHandle} crazy bias posting this clip, show the whole series 🔥',
    '{targetHandle} delete this clip immediately 😂',
    '{targetHandle} funny how you skipped all our bangers and posted THIS 💀',
    '{targetHandle} admin definitely had money on the other team 😂',
    '{targetHandle} zero ball knowledge from the admin today, post the scoreboard too 😤',
    '{targetHandle} engagement farming off {myClub} again I see 👀',
    '{targetHandle} bro cut the clip 2 seconds before we scored 💀',
    '{targetHandle} generational hater edit right here 😂',
    '{targetHandle} clip our next sweep too then, don\'t go quiet 🔥',
  ],
  ratio: [
    '{targetHandle} ratio + L take + hold this scoreboard 💀',
    '{targetHandle} ratio + check your replay file bro',
    '{targetHandle} didn\'t ask + ratio + {myClub} on top',
    '{targetHandle} ratio + you got clipped in 4K 😭',
    '{targetHandle} ratio + open net merchant 💀',
    '{targetHandle} ratio + zero boost + no LANs 😂',
    '{targetHandle} counter-ratio + {myClub} clears effortlessly 🔥',
    '{targetHandle} ratio + even your coach disagreed with that take 💀',
    '{targetHandle} ratio + lower bracket merchant 😭',
    '{targetHandle} ratio + ball chaser mentality 😂',
  ],
  respectPlayer: [
    '{targetHandle} much respect, always good matches 🤝',
    '{targetHandle} GGs, looking forward to the next one!',
    '{targetHandle} class players over there, always a battle against you guys 🔥',
    '{targetHandle} respect! Nothing beats a high-level RLCS series 🤝',
    '{targetHandle} GGs all around, see you deep in the next bracket!',
    '{targetHandle} gotta give credit where it\'s due, you guys pushed us hard 👏',
    '{targetHandle} iron sharpens iron — good luck the rest of the split 🤝',
    '{targetHandle} all love off the pitch, let\'s run another banger soon 🔥',
  ],
  respectMedia: [
    '{targetHandle} insane clip ngl 🔥',
    '{targetHandle} pure RLCS cinema right there 🤝',
    '{targetHandle} alright even I gotta admit that play was disgusting 👏',
    '{targetHandle} peak Rocket League right there, W upload 🎬',
    '{targetHandle} gotta respect the mechanics on that one 🔥',
    '{targetHandle} admin cooked with this highlight reel 🤝',
    '{targetHandle} this is why RLCS is the best esport on earth 🏆',
    '{targetHandle} fair play, clip of the weekend right there 👏',
  ],
};

const USER_RECEIPT_LINES = [
  '@{handle} Aged like milk. {score}. Hold that L. 📸',
  '@{handle} Just checking in on this prediction after that {score} 👀📸',
  '@{handle} Don\'t delete it now!! {score} — receipts secured 📸💀',
  '@{handle} "Free 3-0" huh?? Look at the scoreboard: {score}. 😂📸',
  '@{handle} Frame this tweet and hang it in the Louvre. {score}. 🖼️🔥',
  '@{handle} Weird, you went real quiet after {score} 💀📸',
  '@{handle} Thanks for the locker room bulletin board material. {score}. 🔥',
  '@{handle} Remind me what happened again? Oh right. {score}. 📸😂',
  '@{handle} Next time watch the games before tweeting. {score} to {myClub}. 💀',
  '@{handle} Came back just to drop this {score} in your mentions 📸🔥',
  '@{handle} How\'s that hot take tasting now? {score}. 🍽️😂',
  '@{handle} Bookmarking paid off — {myClub} {score}. Night night. 📸',
];

const USER_LEAK_REACT = {
  eyes: [
    '@{handle} 👀',
    '@{handle} 👀👀👀',
    '@{handle} No comment... 👀',
    '@{handle} Stay tuned. 👀🔥',
    '@{handle} Interesting timing on this tweet 👀',
    '@{handle} I plead the fifth 👀😂',
    '@{handle} You didn\'t hear it from me 👀',
    '@{handle} Cooking something up... 👀🔥',
  ],
  deny: [
    '@{handle} Fake news. Stop making things up for impressions.',
    '@{handle} 100% cap, check your sources bro 💀',
    '@{handle} Who is feeding you this nonsense 😂 completely fake.',
    '@{handle} Zero truth to this. Classic Shift engagement farming 🚫',
    '@{handle} First time I\'m hearing about this lol, pure fiction 💀',
    '@{handle} Somebody lied to your sources big time 😂',
    '@{handle} Stop writing fanfiction about our roster 🚫🔥',
    '@{handle} Not even close to true. Try again next window 💀',
  ],
};

const POST_MATCH_JABS = {
  userWon: [
    '@{me} lucky bounces all series, enjoy it while it lasts. Run it back next {stage} 💀',
    '@{me} alright {winner} got us today, don\'t let it go to your head.',
    '@{me} 0% chance you beat us again when it\'s Best of 7.',
    '@{me} you won off two kickoff goals and a demo, relax 😂',
    '@{me} enjoy your regular-season win, see what happens when the crowd is watching 🔥',
    '@{me} we played at 50% today and still almost took it. Next time is ours.',
    '@{me} fair play today, but {winner} won\'t get that lucky twice 😤',
    '@{me} keep celebrating {winScore}-{loseScore}, we\'re writing this one down 📝',
    '@{me} laggiest server of the split and you barely scraped past us 💀',
    '@{me} good series ngl, but we\'re taking our revenge in the next bracket 🔥',
  ],
  userLost: [
    '@{me} thanks for the free highlight clip 💀 hold that {winScore}-{loseScore}',
    '@{me} talked all week just to get clipped in {event} 😭',
    '@{me} {winner} owns {loser}, nothing new here.',
    '@{me} {winScore}-{loseScore} and it wasn\'t even as close as the score looks 💀',
    '@{me} hit Freeplay before next weekend bro, that defense was wide open 😂',
    '@{me} appreciate the warm-up scrim! Good luck in lowers 👋🔥',
    '@{me} all that hype for {loser} just to fold under pressure 😭',
    '@{me} somebody tell {loser} the match started 20 minutes ago 💀',
    '@{me} clean {winScore}-{loseScore}. Next opponent please 🏆',
    '@{me} GGs {loser}, maybe try rotating back post next time 😂',
  ],
};

const RIVAL_BANTER = {
  trash: [
    '@{me} talk all you want on Y, we\'ll see who\'s still in the bracket on Sunday 💀',
    '@{me} Mickey Mouse run and you know it. Next time we match it\'s a 3-0 sweep.',
    '@{me} rent free in your head 😂 worry about your own roster first.',
    '@{me} screenshot this. Next time we play {myClub} we aren\'t dropping a single game.',
    '@{me} big talk from someone who barely survived opens 😭 see you at the Major.',
    '@{me} bro gets one win and forgets how to act 💀',
    '@{me} your whole playbook is boom the ball and pray 😂 we\'re not worried.',
    '@{me} keep yapping on main, it\'s gonna make beating {myClub} 10x sweeter 🔥',
    '@{me} check the head-to-head before typing at me again 💀',
    '@{me} funny how {myClub} always goes silent right around Championship Sunday 😂',
    '@{me} my teammate was playing on 90 ping and still out-paced your roster 😭',
    '@{me} save that energy for lower bracket round 1 💀',
    '@{me} you\'re tweeting more than you\'re scrimming, no wonder we own you 🔥',
    '@{me} bold words for a team that needs overtime to beat bubble squads 😂',
    '@{me} alright bet, adding {myClub} to the whiteboard right now 📝🔥',
  ],
  ratio: [
    '@{me} ain\'t no way bro just tried to ratio me on main 💀',
    '@{me} deleting my account if this ratio lands...',
    '@{me} alright fair play, you actually got me with that one 😂',
    '@{me} bots in your likes 100% no shot',
    '@{me} Y likes don\'t win RLCS trophies bro 😭',
    '@{me} my mentions are cooked, I\'m logging off for the night 💀',
    '@{me} congratulations on winning Twitter, now try winning a LAN 😂',
    '@{me} okay you ratio\'d me, I\'m locking in 12 hours of Freeplay tonight 😤',
    '@{me} bro called his whole Discord server to like that tweet 💀',
    '@{me} shameless ratio attempt, I respect the hustle 😂',
    '@{me} alright hold on why is this actually doing numbers 😭',
    '@{me} enjoy the likes while you can, scoreboard is ours next week 🔥',
  ],
  respect: [
    '@{me} GGs always, respect. See you in the next bracket 🤝',
    '@{me} Appreciate it — always a banger series against {myClub}.',
    '@{me} Class act. Good luck the rest of the split! 🔥',
    '@{me} Much love! Always fun queuing up against you guys 🤝',
    '@{me} Respect bro, {myClub} has been grinding hard this season 👏',
    '@{me} Real recognizes real. Hope we meet in the Grand Finals 🏆',
    '@{me} Appreciate the love! Keep tearing up the bracket 🔥',
    '@{me} Nothing but respect for {myClub}, see you on LAN 🤝',
    '@{me} Always brings out our best gameplay when we face you guys 👏',
    '@{me} GGs all day, let\'s put on a show for the fans next time! 🎬',
  ],
  receipts: [
    '@{me} alright I\'ll hold the L... I\'m deleting that tweet 😭',
    '@{me} fair play you actually shut me up today. Respect.',
    '@{me} lucky bounce in Game 5 doesn\'t count, run it back next event 😤',
    '@{me} my phone won\'t stop vibrating, please leave me alone 💀',
    '@{me} I got hacked, that wasn\'t me who tweeted that 😂',
    '@{me} okay okay I apologize {myClub}, I wasn\'t familiar with your game 🙏',
    '@{me} deactivating for 48 hours, see y\'all next split 😭',
    '@{me} I jinxed my own team so hard 💀 never predicting again.',
    '@{me} alright you earned the right to cook me today 😂 GGs.',
    '@{me} mute button looking real tempting right now 😭📸',
    '@{me} fine, {myClub} proved me wrong. Still running it back next LAN though 🔥',
  ],
  callout: [
    '@{me} oh so you want smoke now?? Bet. Circle the date when {myClub} plays {oppClub} 🔥',
    '@{me} bold move calling out {oppClub} on main. Don\'t hide when we sweep you 💀',
    '@{me} finally someone bringing real rivalries back to RLCS. See you on pitch.',
    '@{me} you sure you want {oppClub} in your bracket?? Be careful what you wish for 😂',
    '@{me} {myClub} really woke up and chose violence today 💀 we accept.',
    '@{me} tell your players to get a good night\'s sleep, {oppClub} is bringing the broom 🧹',
    '@{me} love the confidence — shame it\'s about to get crushed in 15 minutes flat 🔥',
    '@{me} screenshot saved. Let\'s see if @{me} keeps talking after we meet 📸',
    '@{me} {oppClub} doesn\'t dodge anybody. Name the lobby and we\'re there 😤',
    '@{me} cute callout 😂 {myClub} isn\'t even in our tier yet.',
    '@{me} oh this next series is about to be absolute cinema 🎬🔥',
    '@{me} calling out {oppClub} for clout? Alright, we\'ll give you a quick 3-0 for free 💀',
    '@{me} our coach just printed this tweet and taped it to the wall. See you soon 🔥',
    '@{me} respect the guts calling us out publicly — now back it up on Sunday 🤝🔥',
    '@{me} {oppClub} vs {myClub} is officially a grudge match. Bring your A-game. 💀',
  ],
  media: [
    '@{me} bro is really arguing with a highlights page 😭',
    '@{me} don\'t shoot the messenger, we just post the clips 💀',
    '@{me} chat is he cooking or coping right now?? 😂',
    '@{me} adding this reply straight to the next RLCS montage 🎬',
    '@{me} we don\'t even play bro take it up with the bracket 💀',
    '@{me} admin doesn\'t even own a controller, why are you beefing with us 😂',
    '@{me} score more bangers and we\'ll post you too 🤷‍♂️🔥',
    '@{me} quote-tweeting a clip page at 2 AM is crazy work 😭',
    '@{me} hey free engagement is free engagement, appreciate the boost 📈😂',
    '@{me} sorry bro the replay file doesn\'t lie 💀',
    '@{me} we\'re literally just the cameramen, don\'t get mad at us 🎥😂',
    '@{me} pinning this reply to the top of the thread, thank you @{me} 💀',
    '@{me} bro wants us to edit out the goal explosion 😭',
    '@{me} alright next time you hit a flip reset we got you, relax 😂',
  ],
  mediaRespect: [
    '@{me} W mentality, clipping your next banger for sure 🔥',
    '@{me} respect! Sending the camera crew to your next series 🎬',
    '@{me} always love when pros appreciate good Rocket League 🤝',
    '@{me} admin is officially a {myClub} fan now 😂🔥',
    '@{me} give us a zero-second winner next match and you\'re front page 🏆',
    '@{me} certified ball knower right here 👏',
    '@{me} W reply, saving a spot in the Split highlight reel for {myClub} 🎬',
    '@{me} real ones know peak RLCS when they see it 🔥',
    '@{me} appreciate the love! Good luck in the next bracket 🤝',
    '@{me} top tier sportsmanship, rare to see on Y these days 😂👏',
  ],
};

const DOUBT_LINES = [
  'Hot take: {oppClub} is sweeping {myClub} easily in {event}. Not even close.',
  'Anyone picking {myClub} over {oppClub} in {event} hasn\'t watched film this split 💀',
  '{myClub} are frauds until they beat {oppClub} when it matters. Free 3-0 incoming.',
  'Calling it now: {oppClub} sends {myClub} straight to the lower bracket. Bookmark this.',
  'Zero chance {myClub} keeps up with {oppClub}\'s pace in {event}. Calling a quick stomp.',
  'Unpopular opinion? {myClub} is massively overrated. {oppClub} exposes them in {event} 💀',
  'Putting my whole channel point balance on {oppClub} over {myClub} — easiest lock of {event} 😂',
  'Have you seen {oppClub}\'s scrim form?? {myClub} is about to get speed-run in {event} 🔥',
  'Love {myClub}\'s fans, hate to break it to you: {oppClub} wins this series 9 times out of 10.',
  'If {myClub} somehow beats {oppClub} in {event} I\'ll change my profile pic for a week 💀',
  '{myClub} relies way too much on hero plays. {oppClub}\'s structure is gonna dismantle them.',
  'Honestly don\'t even see {myClub} taking two games off {oppClub} in {event}. Sorry not sorry 🤷‍♂️',
  'Everyone hyping {myClub} up just to watch {oppClub} humble them in {event} 😂',
  'Prediction locked: {oppClub} takes out {myClub} cleanly. Come back to this tweet later 📌',
];

const LEAK_LINES = [
  'SOURCES: Multiple RLCS orgs are monitoring {player} ({club}) ahead of the next transfer window 👀',
  'REPORT: {club} considering roster changes if results don\'t turn around — {player} linked with moves 👀',
  'SHIFT RUMOR: {player} spotted scrimming with another roster today... something is cooking 👀',
  'BREAKING: {player} ({club}) has reportedly received quiet inquiries from rival managers this week 👀',
  'INSIDER: {club} insists {player} is not for sale, but two top orgs are preparing huge bids anyway 💰👀',
  'SOURCES: Tension behind the scenes at {club}? {player} could test the market if they miss the next Major 👀',
  'SHIFT SCOOP: Agents working overtime — {player}\'s buyout clause at {club} has caught serious attention 👀',
  'RUMOR MILL: {player} changed his Steam profile picture to a blank avatar... you know what that means in RLCS 👀😂',
  'REPORT: Several clubs view {player} ({club}) as the missing piece for a Worlds push this season 🔥👀',
  'WHISPERS: Scrim leaks suggest {player} is trialing with a mystery roster ahead of the window 👀',
  'SOURCES: Big dominoes could fall soon — {player} ({club}) is at the top of multiple shortlists 📝👀',
  'SHIFT UPDATE: {club} may listen to blockbuster offers for {player} before the trade deadline 💰',
  'INSIDER TALK: Don\'t be shocked if {player} is wearing a new jersey next split. Watch this space 👀',
  'RUMOR: {player} unfollowed {club}\'s manager for 10 minutes and RLCS Twitter is already in meltdown 💀👀',
];

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0);
}

function pick(arr, rng) {
  if (!Array.isArray(arr) || !arr.length) return null;
  return arr[Math.floor((typeof rng === 'function' ? rng() : Math.random()) * arr.length) % arr.length];
}

// No-repeat picker: remembers recently used indices per phrase bank so the same line never repeats back-to-back!
function pickFresh(state, bankKey, arr, rng) {
  if (!Array.isArray(arr) || !arr.length) return null;
  if (arr.length === 1) return arr[0];
  const y = state && state.cpY;
  if (!y) return pick(arr, rng);
  if (!y.recentPicks || typeof y.recentPicks !== 'object') y.recentPicks = {};
  const hist = Array.isArray(y.recentPicks[bankKey]) ? y.recentPicks[bankKey] : [];
  const memCap = Math.min(arr.length - 1, Math.max(1, Math.floor(arr.length * 0.65)));
  const blocked = new Set(hist.slice(-memCap));
  const avail = [];
  for (let i = 0; i < arr.length; i++) {
    if (!blocked.has(i)) avail.push(i);
  }
  const pool = avail.length ? avail : arr.map((_, i) => i);
  const chosenIdx = pool[Math.floor((typeof rng === 'function' ? rng() : Math.random()) * pool.length) % pool.length];
  hist.push(chosenIdx);
  if (hist.length > arr.length) hist.splice(0, hist.length - arr.length);
  y.recentPicks[bankKey] = hist;
  return arr[chosenIdx];
}

function handleOf(engine, name) {
  if (engine && typeof engine.handleFor === 'function') return engine.handleFor(name);
  return String(name || 'rlcs').toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 15) || 'rlcs';
}

function scanClipsLibrary(rootDir) {
  const base = rootDir || CLIPS_ROOT;
  const lib = { goal: [], whiff: [], save: [] };
  const mapDirs = [
    ['goal', 'goals'],
    ['whiff', 'whiffs'],
    ['save', 'saves'],
  ];
  for (const [kind, sub] of mapDirs) {
    const dir = path.join(base, sub);
    try {
      if (!fs.existsSync(dir)) continue;
      for (const f of fs.readdirSync(dir)) {
        if (/\.(webm|mp4)$/i.test(f)) {
          lib[kind].push(pathToFileURL(path.join(dir, f)).href);
        }
      }
    } catch { }
  }
  return lib;
}

function ensureYState(state) {
  if (!state || typeof state !== 'object') return null;
  if (!state.social || typeof state.social !== 'object') state.social = { posts: [], prompt: null };
  if (!Array.isArray(state.social.posts)) state.social.posts = [];
  if (!state.cpY || typeof state.cpY !== 'object') {
    state.cpY = {
      rivalries: {},
      processedFixtures: [],
      processedFixtureSet: null,
      lastPollDate: null,
      lastLeakDate: null,
      lastDoubtFixtureId: null,
      receiptsUsed: {},
      stats: {
        clipsGenerated: 0,
        clapbacksSent: 0,
        ratiosWon: 0,
        receiptsPulled: 0,
        pollsVoted: 0,
      },
    };
  }
  if (!state.cpY.rivalries) state.cpY.rivalries = {};
  if (!Array.isArray(state.cpY.processedFixtures)) state.cpY.processedFixtures = [];
  if (!state.cpY.receiptsUsed) state.cpY.receiptsUsed = {};
  if (!state.cpY.checkedUserTweets) state.cpY.checkedUserTweets = {};
  if (!state.cpY.stats) {
    state.cpY.stats = { clipsGenerated: 0, clapbacksSent: 0, ratiosWon: 0, receiptsPulled: 0, pollsVoted: 0 };
  }
  // Repair any legacy colliding post IDs from earlier versions (caused by pre-increment vs vanilla post-increment)
  const seenIds = new Set();
  let maxId = Number(state.nextId) || 8000;
  for (const p of state.social.posts) {
    if (p && Number(p.id) >= maxId) maxId = Number(p.id) + 1;
  }
  if (Array.isArray(state.social.archive)) {
    for (const p of state.social.archive) {
      if (p && Number(p.id) >= maxId) maxId = Number(p.id) + 1;
    }
  }
  for (const p of state.social.posts) {
    if (!p || p.id == null) continue;
    if (seenIds.has(p.id)) {
      p.id = maxId++;
    }
    seenIds.add(p.id);
  }
  state.nextId = maxId;
  return state.cpY;
}

function rivalryLevelLabel(heat) {
  if (heat >= 80) return 'Blood Feud';
  if (heat >= 55) return 'Fierce Rivalry';
  if (heat >= 30) return 'Heated';
  if (heat >= 10) return 'Simmering';
  return 'Cold';
}

function adjustRivalry(engine, state, teamId, delta, reason) {
  if (teamId == null || teamId === state.userTeamId || teamId < 0) return null;
  const y = ensureYState(state);
  const key = String(teamId);
  const tm = typeof engine.teamById === 'function' ? engine.teamById(state, teamId) : null;
  if (!y.rivalries[key]) {
    y.rivalries[key] = {
      teamId: Number(teamId),
      name: (tm && tm.name) || 'Rival Club',
      heat: 0,
      lastEvent: null,
      lastDate: state.currentDate || null,
    };
  }
  const r = y.rivalries[key];
  if (tm && tm.name) r.name = tm.name;
  r.heat = clamp(Math.round((r.heat || 0) + delta), 0, 100);
  r.level = rivalryLevelLabel(r.heat);
  if (reason) r.lastEvent = reason;
  r.lastDate = state.currentDate || r.lastDate;
  return r;
}

function nextPostId(state) {
  let next = Number(state.nextId) || 8000;
  if (state.social && Array.isArray(state.social.posts)) {
    for (const p of state.social.posts) {
      if (p && Number(p.id) >= next) next = Number(p.id) + 1;
    }
  }
  if (state.social && Array.isArray(state.social.archive)) {
    for (const p of state.social.archive) {
      if (p && Number(p.id) >= next) next = Number(p.id) + 1;
    }
  }
  // Match vanilla league.js post-increment convention (state.nextId++) so IDs NEVER collide!
  state.nextId = next + 1;
  return next;
}

function fmtCashShort(n) {
  const v = Math.max(0, Math.round(Number(n) || 0));
  if (v >= 1000000) return '$' + (v / 1000000).toFixed(v >= 10000000 ? 1 : 2).replace(/\.00$/, '') + 'M';
  if (v >= 1000) return '$' + Math.round(v / 1000) + 'K';
  return '$' + v;
}

function userIdentity(engine, state) {
  const team = typeof engine.teamById === 'function' ? engine.teamById(state, state.userTeamId) : null;
  const mePl = state.userPlayerId != null && typeof engine.playerById === 'function'
    ? engine.playerById(state, state.userPlayerId)
    : null;
  const name = (mePl && mePl.name) || state.managerName || (team ? team.name : 'Manager');
  return {
    name,
    handle: handleOf(engine, name),
    authorId: state.userPlayerId != null ? state.userPlayerId : (mePl ? mePl.id : -1),
    clubId: team ? team.id : null,
    clubName: team ? team.name : 'RLCS',
    followers: (mePl && mePl.followers) || (team && team.followers) || 25000,
    team,
    mePl,
  };
}

function eventContextForFixture(state, fx) {
  if (!fx) return { name: 'RLCS Open', tag: 'RLCS', tier: 'open', importance: 1 };
  const ev = (state.events || []).find((e) => e && (e.id === fx.eventId || (Array.isArray(e.fixtureIds) && e.fixtureIds.includes(fx.id))));
  const cup = (state.intl && Array.isArray(state.intl.cups))
    ? state.intl.cups.find((c) => c && (c.id === fx.cupId || c.id === fx.eventId))
    : null;
  if (cup || fx.cupId != null || fx.kind === 'worldcup') {
    const yr = (cup && cup.year) || (state.currentDate ? state.currentDate.slice(0, 4) : '2026');
    return { name: `FIFAe World Cup ${yr}`, tag: 'FIFAeWorldCup', tier: 'worldcup', importance: 4 };
  }
  if (ev) {
    const k = String(ev.kind || ev.type || '').toLowerCase();
    const nm = ev.name || ev.title || 'RLCS Event';
    if (k.includes('world')) return { name: nm, tag: 'RLCSWorlds', tier: 'worlds', importance: 4 };
    if (k.includes('major')) return { name: nm, tag: 'RLCSMajor', tier: 'major', importance: 3 };
    return { name: nm, tag: 'RLCSOpen', tier: 'open', importance: 2 };
  }
  return { name: 'RLCS Regional', tag: 'RLCS', tier: 'open', importance: 1 };
}

function pickTeamStar(engine, state, team) {
  if (!team || !Array.isArray(team.playerIds)) return null;
  const pls = team.playerIds.map((id) => engine.playerById(state, id)).filter((p) => p && !p.retired);
  if (!pls.length) return null;
  return pls.sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
}

function pushYPost(state, post) {
  ensureYState(state);
  state.social.posts.unshift(post);
  if (state.social.posts.length > 260) state.social.posts.length = 260;
  return post;
}

function generateClipForFixture(engine, state, fx, rand, clipLib) {
  const y = ensureYState(state);
  const home = typeof engine.teamById === 'function' ? engine.teamById(state, fx.homeId) : null;
  const away = typeof engine.teamById === 'function' ? engine.teamById(state, fx.awayId) : null;
  if (!home || !away) return null;

  const hW = Number(fx.homeWins ?? fx.homeScore ?? 0);
  const aW = Number(fx.awayWins ?? fx.awayScore ?? 0);
  if (hW === 0 && aW === 0) return null;

  const winner = hW >= aW ? home : away;
  const loser = hW >= aW ? away : home;
  const winScore = Math.max(hW, aW);
  const loseScore = Math.min(hW, aW);
  const isUserMatch = home.id === state.userTeamId || away.id === state.userTeamId;
  const userWon = winner.id === state.userTeamId;
  const evCtx = eventContextForFixture(state, fx);
  const rng = typeof rand === 'function' ? rand : Math.random;

  const winStar = pickTeamStar(engine, state, winner) || { id: -10, name: winner.name, followers: 40000 };
  const loseStar = pickTeamStar(engine, state, loser) || { id: -11, name: loser.name, followers: 35000 };

  // Decide clip type: close loss or upset -> higher chance of brutal whiff clip for spicy banter!
  const roll = rng();
  const clipKind = roll < 0.56 ? 'goal' : roll < 0.86 ? 'whiff' : 'save';
  const tpl = pickFresh(state, 'clip_tpl_' + clipKind, PLAY_TEMPLATES[clipKind], rng);
  const speed = tpl.speedMin + Math.floor(rng() * (tpl.speedMax - tpl.speedMin + 1));
  const gameNum = Math.min(7, Math.max(1, winScore + loseScore));
  const rawLine = pickFresh(state, 'clip_line_' + tpl.move, tpl.lines, rng);
  const text = rawLine
    .replace(/\{winner\}/g, winner.name)
    .replace(/\{loser\}/g, loser.name)
    .replace(/\{player\}/g, winStar.name)
    .replace(/\{victim\}/g, loseStar.name)
    .replace(/\{oppHandle\}/g, '@' + handleOf(engine, loseStar.name))
    .replace(/\{victimHandle\}/g, '@' + handleOf(engine, loseStar.name))
    .replace(/\{speed\}/g, String(speed))
    .replace(/\{move\}/g, tpl.move)
    .replace(/\{event\}/g, evCtx.name)
    .replace(/\{tag\}/g, evCtx.tag);

  const mediaPool = (clipLib && clipLib[clipKind]) || [];
  const videoUrl = mediaPool.length ? mediaPool[hashStr(String(fx.id) + ':' + clipKind) % mediaPool.length] : '';

  const baseLikes = (isUserMatch ? 420 : 280) * evCtx.importance + Math.floor(rng() * 550);
  const clipPost = pushYPost(state, {
    id: nextPostId(state),
    kind: 'media',
    authorId: -50,
    clubId: winner.id,
    name: evCtx.tier === 'worldcup' ? 'FIFAe Highlights' : 'RLCS Highlights',
    handle: evCtx.tier === 'worldcup' ? 'FIFAeHighlights' : 'RLCSHighlights',
    club: evCtx.name,
    followers: 420000,
    verified: true,
    date: state.currentDate,
    likes: baseLikes,
    reposts: Math.round(baseLikes * 0.22),
    replies: 1,
    views: Math.round(baseLikes * (18 + rng() * 14)),
    text,
    cpCategory: 'clip',
    cpFixtureId: fx.id,
    cpRivalTeamId: isUserMatch ? (home.id === state.userTeamId ? away.id : home.id) : winner.id,
    cpClip: {
      kind: clipKind,
      eventName: evCtx.name,
      eventTier: evCtx.tier,
      move: tpl.move,
      speed,
      clock: `G${gameNum} · ${tpl.clock}`,
      homeName: home.name,
      awayName: away.name,
      homeScore: hW,
      awayScore: aW,
      starName: clipKind === 'whiff' ? loseStar.name : winStar.name,
      starTeam: clipKind === 'whiff' ? loser.name : winner.name,
      videoUrl,
      isUserMatch,
    },
  });

  y.stats.clipsGenerated++;

  // If this was the user's match, build rivalry heat & drop a spicy opposing player/club jab!
  if (isUserMatch) {
    const opp = home.id === state.userTeamId ? away : home;
    const oppStar = pickTeamStar(engine, state, opp) || { id: -12, name: opp.name, followers: 50000 };
    const closeSeries = Math.abs(hW - aW) <= 1;
    const heatDelta = (closeSeries ? 14 : 9) + evCtx.importance * 3;
    adjustRivalry(engine, state, opp.id, heatDelta, `${evCtx.name} (${hW}-${aW})`);

    // Drop a spicy reply from the rival!
    const me = userIdentity(engine, state);
    const jab = pickFresh(state, userWon ? 'jab_won' : 'jab_lost', userWon ? POST_MATCH_JABS.userWon : POST_MATCH_JABS.userLost, rng)
      .replace(/\{me\}/g, me.handle)
      .replace(/\{winner\}/g, winner.name)
      .replace(/\{loser\}/g, loser.name)
      .replace(/\{winScore\}/g, String(winScore))
      .replace(/\{loseScore\}/g, String(loseScore))
      .replace(/\{event\}/g, evCtx.name)
      .replace(/\{stage\}/g, evCtx.tier === 'open' ? 'Open' : 'LAN');

    pushYPost(state, {
      id: nextPostId(state),
      kind: 'player',
      authorId: oppStar.id,
      clubId: opp.id,
      name: oppStar.name,
      handle: handleOf(engine, oppStar.name),
      club: opp.name,
      followers: oppStar.followers || 60000,
      verified: true,
      date: state.currentDate,
      likes: Math.round(baseLikes * 0.55),
      reposts: Math.round(baseLikes * 0.1),
      replies: 0,
      views: Math.round(baseLikes * 9),
      replyTo: clipPost.id,
      mention: true,
      targetId: state.userPlayerId,
      text: jab,
      cpCategory: 'rivalry',
      cpRivalTeamId: opp.id,
    });
  }

  return clipPost;
}

function maybeGeneratePreMatchPollAndDoubt(engine, state, rand) {
  const y = ensureYState(state);
  if (!state.currentDate || !Array.isArray(state.fixtures)) return;
  const rng = typeof rand === 'function' ? rand : Math.random;

  // Find next unplayed user fixture within 3 days
  const upcoming = state.fixtures.find((fx) => {
    if (!fx || fx.played) return false;
    if (fx.homeId !== state.userTeamId && fx.awayId !== state.userTeamId) return false;
    if (!fx.date) return false;
    const d = engine.daysBetween ? engine.daysBetween(state.currentDate, fx.date) : 0;
    return d >= 0 && d <= 3;
  });

  if (upcoming && y.lastDoubtFixtureId !== upcoming.id) {
    const oppId = upcoming.homeId === state.userTeamId ? upcoming.awayId : upcoming.homeId;
    const myTeam = engine.teamById(state, state.userTeamId);
    const oppTeam = engine.teamById(state, oppId);
    if (myTeam && oppTeam) {
      y.lastDoubtFixtureId = upcoming.id;
      const evCtx = eventContextForFixture(state, upcoming);
      const riv = y.rivalries[String(oppId)];
      const isRival = riv && riv.heat >= 25;

      // 1. Pre-match Fan Poll
      const pollId = 'poll_' + upcoming.id;
      if (!y.lastPollDate || (engine.daysBetween ? engine.daysBetween(y.lastPollDate, state.currentDate) >= 4 : true)) {
        y.lastPollDate = state.currentDate;
        const votesA = 800 + Math.floor(rng() * 1800);
        const votesB = 900 + Math.floor(rng() * 2100);
        pushYPost(state, {
          id: nextPostId(state),
          kind: 'media',
          authorId: -51,
          name: 'RLCS Broadcast',
          handle: 'RLEsportsPoll',
          club: evCtx.name,
          followers: 610000,
          verified: true,
          date: state.currentDate,
          likes: 320 + Math.floor(rng() * 400),
          reposts: 65,
          replies: 42,
          views: 48000,
          text: pickFresh(state, 'poll_q', [
            `${isRival ? '🔥 RIVALRY MATCHUP: ' : ''}${myTeam.name} vs ${oppTeam.name} in ${evCtx.name}! Who takes the series? Vote below 👇 #${evCtx.tag}`,
            `📊 ${evCtx.name} PREDICTIONS: ${myTeam.name} or ${oppTeam.name}? Lock in your pick before kickoff 👇 #${evCtx.tag}`,
            `${isRival ? '🚨 GRUDGE MATCH: ' : '⚔️ MATCHDAY POLL: '}${myTeam.name} meets ${oppTeam.name} in ${evCtx.name}! Who moves on? #${evCtx.tag}`,
            `Who are you backing in ${evCtx.name} — ${myTeam.name} or ${oppTeam.name}?? Drop your vote 👇 #${evCtx.tag}`,
            `🔥 BANGER ALERT: ${myTeam.name} vs ${oppTeam.name} (${evCtx.name}). Who wins the series? #${evCtx.tag}`,
          ], rng),
          cpCategory: 'poll',
          cpRivalTeamId: oppId,
          cpPoll: {
            id: pollId,
            options: [
              { label: myTeam.name, votes: votesA },
              { label: oppTeam.name, votes: votesB },
            ],
            votedIdx: null,
          },
        });
      }

      // 2. Doubter Prediction (unlocks "Pull Receipts 📸" if user wins!)
      if (isRival || evCtx.importance >= 2 || rng() < 0.55) {
        const oppStar = pickTeamStar(engine, state, oppTeam);
        const isProDoubt = !!oppStar && rng() < 0.6;
        const raw = pickFresh(state, 'doubt', DOUBT_LINES, rng)
          .replace(/\{myClub\}/g, myTeam.name)
          .replace(/\{oppClub\}/g, oppTeam.name)
          .replace(/\{event\}/g, evCtx.name);
        pushYPost(state, {
          id: nextPostId(state),
          kind: isProDoubt ? 'player' : 'media',
          authorId: isProDoubt ? oppStar.id : -52,
          clubId: isProDoubt ? oppTeam.id : null,
          name: isProDoubt ? oppStar.name : 'RLCS Analyst Desk',
          handle: isProDoubt ? handleOf(engine, oppStar.name) : 'RLCSHotTakes',
          club: isProDoubt ? oppTeam.name : 'Analyst',
          followers: isProDoubt ? (oppStar.followers || 85000) : 290000,
          verified: true,
          date: state.currentDate,
          likes: 210 + Math.floor(rng() * 380),
          reposts: 44,
          replies: 28,
          views: 31000,
          text: raw,
          cpCategory: 'rivalry',
          cpRivalTeamId: oppId,
          cpDoubt: {
            fixtureId: upcoming.id,
            oppTeamId: oppId,
            oppTeamName: oppTeam.name,
            eventName: evCtx.name,
            wonByUser: false,
            receiptPulled: false,
          },
        });
      }
    }
  }
}

const TRANSFER_INTENT_RE = /\b(buy|buying|bought|sign|signing|signed|announce|announcing|welcome|transfer|grabbing|getting|acquir\w*|bid|bidding|offer|offering|poach\w*|pick(?:ing)?\s+up|join(?:ing)?|coming\s+to|here\s+we\s+go|new\s+third|roster\s+move|stealing|taking)\b/i;

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function reactToUserTransferTweet(engine, state, tweet, rand) {
  const y = ensureYState(state);
  if (!tweet || !tweet.text || tweet.replyTo != null) return null;
  if (y.checkedUserTweets[tweet.id]) return null;
  y.checkedUserTweets[tweet.id] = true;

  const txt = String(tweet.text);
  if (!TRANSFER_INTENT_RE.test(txt)) return null;

  // Match any real non-retired player mentioned by name (longest names first so "M0nkey M00n" wins over short tokens)
  const pool = (state.players || [])
    .filter((p) => p && !p.retired && !p.isUser && p.name && p.name.length >= 2)
    .slice()
    .sort((a, b) => b.name.length - a.name.length);

  let targetPl = null;
  for (const pl of pool) {
    const cleanName = String(pl.name).replace(/\.+$/, '').trim();
    if (cleanName.length < 2) continue;
    const re = new RegExp('(^|[^a-z0-9_])' + escapeRegex(cleanName) + '(?=$|[^a-z0-9_])', 'i');
    if (re.test(txt)) {
      targetPl = pl;
      break;
    }
  }
  if (!targetPl) return null;

  const rng = typeof rand === 'function' ? rand : Math.random;
  const me = userIdentity(engine, state);
  const myTeam = me.team;
  const oppTeam = targetPl.teamId >= 0 && typeof engine.teamById === 'function'
    ? engine.teamById(state, targetPl.teamId)
    : null;
  const oppClub = oppTeam ? oppTeam.name : 'Free Agency';
  const myBudget = Number(myTeam && myTeam.budget) || 0;
  const estFee = typeof engine.playerValue === 'function'
    ? Math.max(10000, Math.round(engine.playerValue(state, targetPl)))
    : Math.max(50000, Math.round((targetPl.rating || 75) * 4000));
  const feeStr = fmtCashShort(estFee);
  const budgetStr = fmtCashShort(myBudget);

  let leakText;
  let playerReplyText;
  let affordable = false;

  if (targetPl.teamId === state.userTeamId) {
    leakText = pickFresh(state, 'utweet_owned', [
      `🚨 FACT CHECK: Someone please tell @${me.handle} that ${targetPl.name} ALREADY plays for ${me.clubName} 😭 bro forgot his own roster`,
      `🚨 SOURCES: @${me.handle} announcing ${targetPl.name} like he isn't already sitting in ${me.clubName}'s facility right now 💀`,
      `🚨 SHIFT UPDATE: Breaking news — ${me.clubName} has "signed" ${targetPl.name}, who has been on their payroll this whole time 😂`,
      `🚨 REPORT: Somebody check on @${me.handle}, bro is trying to buy his own player (${targetPl.name}) 💀`,
    ], rng);
    playerReplyText = pickFresh(state, 'utweet_owned_rep', [
      `@${me.handle} bro I'm literally already on the team 😂`,
      `@${me.handle} am I getting a second salary then or what 👀😂`,
      `@${me.handle} I'm sitting right next to you in the scrim room boss 💀`,
    ], rng);
  } else if (myBudget < estFee) {
    // Realistic broke-club roast — ONLY fires when you genuinely cannot afford the player!
    leakText = pickFresh(state, 'utweet_broke', [
      `🚨 FACT CHECK: Fake news lol — ${me.clubName} literally do NOT have the ${feeStr} to buy ${targetPl.name}. Checked the books, ${budgetStr} isn't even close 💀`,
      `🚨 SOURCES: ${oppClub} laughed and hung up the phone. ${me.clubName} tweeting about buying ${targetPl.name} (${feeStr}) with ${budgetStr} in the bank is pure comedy 😂`,
      `🚨 SHIFT REPORT: Zero truth to @${me.handle}'s ${targetPl.name} tweet. ${me.clubName} can't afford the ${feeStr} buyout — fake news 💀`,
      `🚨 BREAKING: Multiple RLCS orgs crying laughing at ${me.clubName} trying to manifest ${targetPl.name} on a ${budgetStr} budget 😭`,
      `🚨 SOURCES: ${me.clubName} sent an offer for ${targetPl.name} and the payment bounced immediately. ${budgetStr} ain't buying a ${feeStr} superstar 💀`,
      `🚨 FACT CHECK: Unless ${oppClub} accepts IOUs and Boost pads, ${me.clubName} (${budgetStr}) is NOT signing ${targetPl.name} (${feeStr}) 😂`,
      `🚨 SHIFT EXCLUSIVE: Accountants confirm ${me.clubName} would have to sell their entire HQ to afford ${targetPl.name}'s ${feeStr} price tag. Fake news 💀`,
      `🚨 RUMOR BUSTED: Nice engagement bait @${me.handle}, but ${budgetStr} doesn't even cover ${targetPl.name}'s signing bonus (${feeStr}) 😭`,
    ], rng);
    playerReplyText = pickFresh(state, 'utweet_broke_rep', [
      `@${me.handle} tell ${me.clubName} to check their bank account first 😂`,
      `@${me.handle} brother I'm not leaving ${oppClub} for ${budgetStr} 💀`,
      `@${me.handle} nice try, come back when you have ${feeStr} 😭`,
      `@${me.handle} my buyout is ${feeStr} bro, start a GoFundMe first 😂`,
      `@${me.handle} appreciate the dream, call me when the wire actually clears 💀`,
      `@${me.handle} ${budgetStr}?? That's cute 😂`,
    ], rng);
  } else {
    // Realistic rich-club blockbuster leak — NEVER calls you broke when you actually have the money!
    affordable = true;
    leakText = pickFresh(state, 'utweet_rich', [
      `🚨 BREAKING: After @${me.handle}'s tweet, sources confirm ${me.clubName} actually DO have the ${feeStr} warchest to make a serious run at ${targetPl.name} (${oppClub}) 👀🔥`,
      `🚨 SOURCES: Don't laugh — ${me.clubName} are sitting on ${budgetStr} and are reportedly eyeing a blockbuster ${feeStr} move for ${targetPl.name} 👀`,
      `🚨 SHIFT EXCLUSIVE: ${oppClub} on high alert after @${me.handle} teased ${targetPl.name}. Insiders confirm ${me.clubName} can legitimately trigger the ${feeStr} deal 👀`,
      `🚨 TRANSFER ALERT: This is NOT a drill — ${me.clubName} (${budgetStr} budget) has the cash ready to stun RLCS and land ${targetPl.name} (${feeStr}) 💰🔥`,
      `🚨 SOURCES: Rival managers are panicking. ${me.clubName} actually has the ${feeStr} needed to pry ${targetPl.name} away from ${oppClub} 👀`,
      `🚨 SHIFT REPORT: Everybody thought @${me.handle} was trolling, but league insiders confirm ${me.clubName} can pay ${targetPl.name}'s ${feeStr} fee tomorrow 💰👀`,
    ], rng);
    playerReplyText = pickFresh(state, 'utweet_rich_rep', [
      `@${me.handle} 👀`,
      `@${me.handle} tell your org to send the contract to my agent then 🔥`,
      `@${me.handle} interesting... DMs are open 👀`,
      `@${me.handle} alright now you have my attention 💰👀`,
      `@${me.handle} talk to ${oppClub} first and we'll see 🔥`,
      `@${me.handle} the RLCS timeline isn't ready for that roster 👀`,
    ], rng);
  }

  const leakPost = pushYPost(state, {
    id: nextPostId(state),
    kind: 'media',
    authorId: -53,
    name: 'Shift RLCS Insider',
    handle: 'ShiftRLCS',
    club: 'Transfer Insider',
    followers: 380000,
    verified: true,
    date: state.currentDate,
    likes: affordable ? (980 + Math.floor(rng() * 1400)) : (1250 + Math.floor(rng() * 1800)),
    reposts: affordable ? 340 : 490,
    replies: 1,
    views: affordable ? 145000 : 185000,
    text: leakText,
    cpCategory: 'leak',
    cpLeak: {
      playerId: targetPl.id,
      playerName: targetPl.name,
      clubId: oppTeam ? oppTeam.id : null,
      reacted: null,
      affordable,
      fromUserTweet: true,
    },
    cpQuoted: {
      name: me.name,
      handle: me.handle,
      text: txt,
      date: tweet.date || state.currentDate,
    },
  });

  // Player himself chimes in right under Shift's leak!
  pushYPost(state, {
    id: nextPostId(state),
    kind: 'player',
    authorId: targetPl.id,
    clubId: oppTeam ? oppTeam.id : null,
    name: targetPl.name,
    handle: handleOf(engine, targetPl.name),
    club: oppClub,
    followers: targetPl.followers || 120000,
    verified: (targetPl.followers || 0) >= 50000 || (targetPl.rating || 0) >= 85,
    replyTo: leakPost.id,
    mention: true,
    targetId: state.userPlayerId,
    date: state.currentDate,
    likes: 640 + Math.floor(rng() * 900),
    reposts: 110,
    replies: 0,
    views: 68000,
    text: playerReplyText,
    cpCategory: 'leak',
    cpRivalTeamId: oppTeam && oppTeam.id !== state.userTeamId ? oppTeam.id : null,
  });

  return leakPost;
}

function maybeGenerateTransferLeak(engine, state, rand) {
  const y = ensureYState(state);
  if (!state.currentDate) return;
  if (y.lastLeakDate && engine.daysBetween && engine.daysBetween(y.lastLeakDate, state.currentDate) < 10) return;
  const rng = typeof rand === 'function' ? rand : Math.random;
  const win = typeof engine.transferWindow === 'function' ? engine.transferWindow(state) : { open: true };
  if (!win || !win.open) return;
  if (rng() > 0.25) return;

  const candidates = (state.players || []).filter((p) => {
    if (!p || p.retired || p.isUser || p.teamId < 0) return false;
    const c = engine.teamById(state, p.teamId);
    return !!(c && c.name && c.name !== 'Team') && (p.rating >= 78 || p.transferListed);
  });
  if (!candidates.length) return;
  const target = pick(candidates, rng);
  const club = engine.teamById(state, target.teamId);
  if (!club) return;

  y.lastLeakDate = state.currentDate;
  const text = pickFresh(state, 'leak', LEAK_LINES, rng)
    .replace(/\{player\}/g, target.name)
    .replace(/\{club\}/g, club.name);
  pushYPost(state, {
    id: nextPostId(state),
    kind: 'media',
    authorId: -53,
    name: 'Shift RLCS Insider',
    handle: 'ShiftRLCS',
    club: 'Transfer Insider',
    followers: 380000,
    verified: true,
    date: state.currentDate,
    likes: 490 + Math.floor(rng() * 650),
    reposts: 140,
    replies: 76,
    views: 92000,
    text,
    cpCategory: 'leak',
    cpLeak: { playerId: target.id, playerName: target.name, clubId: club.id, reacted: null },
  });
}

function processNewFixturesForY(engine, state, rand, clipLib) {
  const y = ensureYState(state);
  if (!state || !Array.isArray(state.fixtures)) return;
  const doneSet = new Set(y.processedFixtures);
  const newlyPlayed = state.fixtures.filter((fx) => fx && fx.played && fx.id != null && !doneSet.has(fx.id));
  if (!newlyPlayed.length) return;

  let aiClipsThisTick = 0;
  for (const fx of newlyPlayed) {
    doneSet.add(fx.id);
    y.processedFixtures.push(fx.id);
    const isUserMatch = fx.homeId === state.userTeamId || fx.awayId === state.userTeamId;
    const hW = Number(fx.homeWins ?? fx.homeScore ?? 0);
    const aW = Number(fx.awayWins ?? fx.awayScore ?? 0);
    const userWon = isUserMatch && ((fx.homeId === state.userTeamId && hW > aW) || (fx.awayId === state.userTeamId && aW > hW));

    // Mark any Doubter post for this fixture as eligible for "Pull Receipts 📸"!
    if (userWon) {
      for (const post of state.social.posts) {
        if (post && post.cpDoubt && post.cpDoubt.fixtureId === fx.id) {
          post.cpDoubt.wonByUser = true;
          post.cpDoubt.scoreline = `${Math.max(hW, aW)}-${Math.min(hW, aW)}`;
        }
      }
    }

    if (isUserMatch) {
      generateClipForFixture(engine, state, fx, rand, clipLib);
    } else if (aiClipsThisTick < 2) {
      const evCtx = eventContextForFixture(state, fx);
      const isThriller = Math.abs(hW - aW) <= 1 && (hW + aW) >= 5;
      const chance = evCtx.importance >= 3 ? 0.55 : isThriller ? 0.35 : 0.12;
      if ((typeof rand === 'function' ? rand() : Math.random()) < chance) {
        generateClipForFixture(engine, state, fx, rand, clipLib);
        aiClipsThisTick++;
      }
    }
  }
  if (y.processedFixtures.length > 600) {
    y.processedFixtures = y.processedFixtures.slice(-400);
  }
}

function handleYCommand(engine, state, cmd, clipLib) {
  const y = ensureYState(state);
  if (!cmd || typeof cmd !== 'object') return { ok: false, error: 'Invalid Y command.' };
  const me = userIdentity(engine, state);
  const rng = Math.random;

  // 1. Reply / Clapback / Ratio / Respect / Custom reply to any Y post
  if (cmd.op === 'reply') {
    const pid = Number(cmd.postId);
    const target = state.social.posts.find((p) => p && p.id === pid && (!cmd.postHandle || p.handle === cmd.postHandle))
      || state.social.posts.find((p) => p && p.id === pid);
    if (!target) return { ok: false, error: 'Post not found.' };
    // Always attach replies to the thread root so threadPosts() displays the full conversation underneath!
    const rootId = target.replyTo != null ? target.replyTo : target.id;
    const rootPost = state.social.posts.find((p) => p && p.id === rootId) || target;
    const tone = cmd.tone || 'trash';
    const isMediaTarget = target.kind === 'media';
    const targetHandle = '@' + (target.handle || handleOf(engine, target.name));

    let replyText = String(cmd.text || '').trim();
    if (!replyText) {
      let bankKey, bankArr;
      if (tone === 'trash') {
        bankKey = isMediaTarget ? 'u_trash_media' : 'u_trash_player';
        bankArr = isMediaTarget ? USER_REPLY_LINES.trashMedia : USER_REPLY_LINES.trashPlayer;
      } else if (tone === 'ratio') {
        bankKey = 'u_ratio';
        bankArr = USER_REPLY_LINES.ratio;
      } else {
        bankKey = isMediaTarget ? 'u_respect_media' : 'u_respect_player';
        bankArr = isMediaTarget ? USER_REPLY_LINES.respectMedia : USER_REPLY_LINES.respectPlayer;
      }
      replyText = pickFresh(state, bankKey, bankArr, rng)
        .replace(/\{targetHandle\}/g, targetHandle)
        .replace(/\{myClub\}/g, me.clubName);
    } else if (!replyText.toLowerCase().includes(targetHandle.toLowerCase())) {
      replyText = `${targetHandle} ${replyText}`;
    }

    const wonRatio = tone === 'ratio' && rng() < 0.62;
    const myLikes = wonRatio
      ? Math.round((target.likes || 120) * (1.25 + rng() * 0.55))
      : tone === 'trash'
        ? Math.round(140 + (me.followers * 0.004) + rng() * 240)
        : Math.round(80 + (me.followers * 0.002) + rng() * 120);

    rootPost.replies = (rootPost.replies || 0) + 2;
    if (tone === 'trash' || tone === 'ratio') rootPost.cpHasRivalry = true;
    // Push user reply FIRST (then counter-reply after, which unshift puts ahead so threadPosts().reverse() shows User Reply -> Counter Reply in exact chronological order!)
    pushYPost(state, {
      id: nextPostId(state),
      kind: 'player',
      authorId: me.authorId,
      clubId: me.clubId,
      name: me.name,
      handle: me.handle,
      club: me.clubName,
      followers: me.followers,
      verified: true,
      mine: true,
      own: true,
      replyTo: rootId,
      date: state.currentDate,
      likes: myLikes,
      reposts: Math.round(myLikes * 0.16),
      replies: 1,
      views: Math.round(myLikes * 16),
      text: replyText,
      cpCategory: rootPost.cpCategory || (tone === 'respect' ? 'all' : 'rivalry'),
      cpRatioWon: wonRatio,
    });

    y.stats.clapbacksSent++;
    if (wonRatio) y.stats.ratiosWon++;

    // Follower & morale consequences + Rivalry Heat!
    const rivalTeamId = target.cpRivalTeamId || (target.clubId != null && target.clubId !== state.userTeamId ? target.clubId : null);
    if (tone === 'trash' || tone === 'ratio') {
      if (rivalTeamId != null && !isMediaTarget) {
        adjustRivalry(engine, state, rivalTeamId, tone === 'trash' ? 16 : 12, 'Y Socials beef');
      }
      const folGain = Math.round((wonRatio ? 900 : 450) + rng() * 500);
      if (me.mePl) me.mePl.followers = (me.mePl.followers || 0) + folGain;
      else if (me.team) me.team.followers = (me.team.followers || 0) + folGain;
    } else if (tone === 'respect') {
      if (rivalTeamId != null && !isMediaTarget) adjustRivalry(engine, state, rivalTeamId, -8, 'Respect shown on Y');
      if (me.team && Array.isArray(me.team.playerIds)) {
        for (const pid of me.team.playerIds) {
          const p = engine.playerById(state, pid);
          if (p && !p.retired && !p.isUser) p.morale = clamp(Math.round(((p.morale ?? 70) + 1) * 10) / 10, 0, 100);
        }
      }
    }

    // Media accounts reply like a real media/clips page (NEVER claiming they'll 3-0 sweep you!)
    const counterKey = isMediaTarget
      ? (tone === 'respect' ? 'mediaRespect' : 'media')
      : (RIVAL_BANTER[tone] ? tone : 'trash');
    const bank = RIVAL_BANTER[counterKey];
    const counter = pickFresh(state, 'counter_' + counterKey, bank, rng)
      .replace(/\{me\}/g, me.handle)
      .replace(/\{myClub\}/g, me.clubName);
    pushYPost(state, {
      id: nextPostId(state),
      kind: target.kind || 'player',
      authorId: target.authorId ?? -60,
      clubId: target.clubId ?? rivalTeamId,
      name: target.name,
      handle: target.handle,
      club: target.club || 'RLCS',
      followers: target.followers || 50000,
      verified: !!target.verified,
      replyTo: rootId,
      mention: true,
      targetId: state.userPlayerId,
      date: state.currentDate,
      likes: Math.round(myLikes * (wonRatio ? 0.35 : 0.72)),
      reposts: Math.round(myLikes * 0.08),
      replies: 0,
      views: Math.round(myLikes * 9),
      text: counter,
      cpCategory: rootPost.cpCategory || 'rivalry',
      cpRivalTeamId: rivalTeamId,
    });

    return { ok: true, wonRatio };
  }

  // 2. Pull Receipts 📸 after beating a doubter!
  if (cmd.op === 'receipts') {
    const target = state.social.posts.find((p) => p && p.id === Number(cmd.postId));
    if (!target || !target.cpDoubt || !target.cpDoubt.wonByUser) {
      return { ok: false, error: 'You can only pull receipts after beating this doubter.' };
    }
    if (target.cpDoubt.receiptPulled) return { ok: false, error: 'Receipts already pulled on this post.' };
    target.cpDoubt.receiptPulled = true;

    const score = target.cpDoubt.scoreline || 'W';
    const likes = Math.round(950 + (target.likes || 300) * 2.4 + rng() * 900);
    const quotePost = pushYPost(state, {
      id: nextPostId(state),
      kind: 'player',
      authorId: me.authorId,
      clubId: me.clubId,
      name: me.name,
      handle: me.handle,
      club: me.clubName,
      followers: me.followers,
      verified: true,
      mine: true,
      own: true,
      date: state.currentDate,
      likes,
      reposts: Math.round(likes * 0.28),
      replies: 1,
      views: Math.round(likes * 24),
      text: pickFresh(state, 'u_receipt', USER_RECEIPT_LINES, rng)
        .replace(/\{handle\}/g, target.handle)
        .replace(/\{score\}/g, score)
        .replace(/\{myClub\}/g, me.clubName),
      cpCategory: 'rivalry',
      cpRivalTeamId: target.cpDoubt.oppTeamId,
      cpQuoted: {
        name: target.name,
        handle: target.handle,
        text: target.text,
        date: target.date,
      },
    });
    y.stats.receiptsPulled++;
    if (target.cpDoubt.oppTeamId != null) {
      adjustRivalry(engine, state, target.cpDoubt.oppTeamId, 20, 'Pulled receipts after win 📸');
    }
    const folGain = Math.round(1400 + rng() * 1200);
    if (me.mePl) me.mePl.followers = (me.mePl.followers || 0) + folGain;
    else if (me.team) me.team.followers = (me.team.followers || 0) + folGain;

    // Embarrassed reply from doubter
    pushYPost(state, {
      id: nextPostId(state),
      kind: target.kind || 'player',
      authorId: target.authorId ?? -61,
      clubId: target.clubId,
      name: target.name,
      handle: target.handle,
      club: target.club || 'RLCS',
      followers: target.followers || 80000,
      verified: true,
      replyTo: quotePost.id,
      mention: true,
      targetId: state.userPlayerId,
      date: state.currentDate,
      likes: Math.round(likes * 0.18),
      reposts: 12,
      replies: 0,
      views: Math.round(likes * 6),
      text: pickFresh(state, 'counter_receipts', RIVAL_BANTER.receipts, rng)
        .replace(/\{me\}/g, me.handle)
        .replace(/\{myClub\}/g, me.clubName),
      cpCategory: 'rivalry',
      cpRivalTeamId: target.cpDoubt.oppTeamId,
    });
    return { ok: true, likes };
  }

  // 3. Vote in a Y Fan Poll
  if (cmd.op === 'vote') {
    const target = state.social.posts.find((p) => p && p.id === Number(cmd.postId));
    if (!target || !target.cpPoll) return { ok: false, error: 'Poll not found.' };
    const idx = Number(cmd.optionIdx);
    if (!target.cpPoll.options[idx]) return { ok: false, error: 'Invalid poll option.' };
    if (target.cpPoll.votedIdx != null) return { ok: false, error: 'Already voted in this poll.' };
    target.cpPoll.votedIdx = idx;
    target.cpPoll.options[idx].votes += 1;
    y.stats.pollsVoted++;
    return { ok: true };
  }

  // 4. React to a ShiftRLCS Transfer Leak (Fake News / Drop 👀)
  if (cmd.op === 'leak-react') {
    const target = state.social.posts.find((p) => p && p.id === Number(cmd.postId));
    if (!target || !target.cpLeak) return { ok: false, error: 'Leak post not found.' };
    if (target.cpLeak.reacted) return { ok: false, error: 'Already reacted to this report.' };
    const mode = cmd.mode === 'eyes' ? 'eyes' : 'deny';
    target.cpLeak.reacted = mode;
    target.replies = (target.replies || 0) + 1;
    const text = pickFresh(state, 'u_leak_' + mode, USER_LEAK_REACT[mode], rng)
      .replace(/\{handle\}/g, target.handle);
    pushYPost(state, {
      id: nextPostId(state),
      kind: 'player',
      authorId: me.authorId,
      clubId: me.clubId,
      name: me.name,
      handle: me.handle,
      club: me.clubName,
      followers: me.followers,
      verified: true,
      mine: true,
      own: true,
      replyTo: target.id,
      date: state.currentDate,
      likes: mode === 'eyes' ? 680 : 390,
      reposts: mode === 'eyes' ? 120 : 45,
      replies: 0,
      views: mode === 'eyes' ? 24000 : 12000,
      text,
      cpCategory: 'leak',
    });
    return { ok: true };
  }

  // 5. Call Out a Rival Club directly from the Rivalries card!
  if (cmd.op === 'callout') {
    const opp = engine.teamById(state, Number(cmd.teamId));
    if (!opp || opp.id === state.userTeamId) return { ok: false, error: 'Select a rival club first.' };
    const oppStar = pickTeamStar(engine, state, opp) || { id: -65, name: opp.name, followers: 75000 };
    const oppHandle = handleOf(engine, opp.name);
    adjustRivalry(engine, state, opp.id, 22, 'Called out on Y 🔥');

    const callLikes = 360 + Math.floor(rng() * 520);
    const callPost = pushYPost(state, {
      id: nextPostId(state),
      kind: 'player',
      authorId: me.authorId,
      clubId: me.clubId,
      name: me.name,
      handle: me.handle,
      club: me.clubName,
      followers: me.followers,
      verified: true,
      mine: true,
      own: true,
      date: state.currentDate,
      likes: callLikes,
      reposts: Math.round(callLikes * (0.14 + rng() * 0.12)),
      replies: 1,
      views: Math.round(callLikes * (42 + rng() * 35)),
      text: pickFresh(state, 'u_callout', USER_CALLOUT_LINES, rng)
        .replace(/\{oppHandle\}/g, oppHandle)
        .replace(/\{myClub\}/g, me.clubName)
        .replace(/\{oppClub\}/g, opp.name),
      cpCategory: 'rivalry',
      cpRivalTeamId: opp.id,
    });
    const repLikes = 290 + Math.floor(rng() * 480);
    pushYPost(state, {
      id: nextPostId(state),
      kind: 'player',
      authorId: oppStar.id,
      clubId: opp.id,
      name: oppStar.name,
      handle: handleOf(engine, oppStar.name),
      club: opp.name,
      followers: oppStar.followers || 75000,
      verified: true,
      replyTo: callPost.id,
      mention: true,
      targetId: state.userPlayerId,
      date: state.currentDate,
      likes: repLikes,
      reposts: Math.round(repLikes * (0.11 + rng() * 0.1)),
      replies: 0,
      views: Math.round(repLikes * (35 + rng() * 30)),
      text: pickFresh(state, 'counter_callout', RIVAL_BANTER.callout, rng)
        .replace(/\{me\}/g, me.handle)
        .replace(/\{myClub\}/g, me.clubName)
        .replace(/\{oppClub\}/g, opp.name),
      cpCategory: 'rivalry',
      cpRivalTeamId: opp.id,
    });
    return { ok: true };
  }

  return { ok: false, error: 'Unknown Y Overhaul command: ' + cmd.op };
}

function buildYSnapshot(engine, state, clipLib) {
  if (!state || typeof state !== 'object') return null;
  const y = ensureYState(state);
  const rivalries = Object.values(y.rivalries || {})
    .filter((r) => r && r.heat > 0)
    .sort((a, b) => b.heat - a.heat)
    .slice(0, 6);

  // Suggest top league clubs the user can call out to start a new rivalry
  const calloutTargets = (state.teams || [])
    .filter((t) => t && !t.national && t.id !== state.userTeamId)
    .slice(0, 20)
    .map((t) => ({ id: t.id, name: t.name }));

  const counts = {
    goal: (clipLib && clipLib.goal && clipLib.goal.length) || 0,
    whiff: (clipLib && clipLib.whiff && clipLib.whiff.length) || 0,
    save: (clipLib && clipLib.save && clipLib.save.length) || 0,
  };

  return {
    rivalries,
    calloutTargets,
    clipCounts: counts,
    clipsDir: CLIPS_ROOT,
    stats: { ...y.stats },
  };
}

function wrapYEngine(engine, opts = {}) {
  if (!engine || engine.__yOverhaul) return false;
  engine.__yOverhaul = true;
  const clipLib = scanClipsLibrary(opts.clipsDir || CLIPS_ROOT);

  const origAdvance           = engine.advance;
  const origApplySeriesResult = engine.applySeriesResult;
  const origApplyUserResult   = engine.applyUserResult;
  const origSimulateFixture   = engine.simulateFixture;
  const origSimulateNextGame  = engine.simulateNextGame;
  const origNextUserSeries    = engine.nextUserSeries;
  const origPostTweet         = engine.postTweet;
  const origPlaceBet          = engine.placeBet;

  function scanRecentUserTweets(state, rand) {
    if (!state || !state.social || !Array.isArray(state.social.posts)) return;
    const recent = state.social.posts.slice(0, 15);
    for (const p of recent) {
      if (p && (p.mine || p.own) && p.replyTo == null) {
        reactToUserTransferTweet(engine, state, p, rand);
      }
    }
  }

  function tickY(state, rand) {
    if (!state || typeof state !== 'object') return;
    processNewFixturesForY(engine, state, rand, clipLib);
    maybeGeneratePreMatchPollAndDoubt(engine, state, rand);
    maybeGenerateTransferLeak(engine, state, rand);
    scanRecentUserTweets(state, rand);
  }

  if (typeof origPostTweet === 'function') {
    engine.postTweet = function yPostTweet(state, text, gif) {
      const res = origPostTweet.call(this, state, text, gif);
      if (res && res.ok !== false && state && state.social && Array.isArray(state.social.posts)) {
        const newest = state.social.posts.find((p) => p && (p.mine || p.own) && p.replyTo == null && p.text === String(text || '').replace(/[ \t]+/g, ' ').trim())
          || state.social.posts[0];
        if (newest) reactToUserTransferTweet(engine, state, newest, Math.random);
      }
      return res;
    };
  }

  if (typeof origAdvance === 'function') {
    engine.advance = function yAdvance(state, rand, mode) {
      const res = origAdvance.call(this, state, rand, mode);
      tickY(state, rand);
      return res;
    };
  }

  for (const [name, orig] of [
    ['applySeriesResult', origApplySeriesResult],
    ['applyUserResult', origApplyUserResult],
    ['simulateFixture', origSimulateFixture],
    ['simulateNextGame', origSimulateNextGame],
    ['nextUserSeries', origNextUserSeries],
  ]) {
    if (typeof orig !== 'function') continue;
    engine[name] = function yMatchWrap(state, ...rest) {
      const rand = rest.find((a) => typeof a === 'function');
      const res = orig.call(this, state, ...rest);
      tickY(state, rand);
      return res;
    };
  }

  if (typeof origPlaceBet === 'function') {
    engine.placeBet = function yPlaceBet(state, kind, ref, teamId, stake) {
      if (typeof kind === 'string' && kind.startsWith('yo:')) {
        try {
          return handleYCommand(engine, state, JSON.parse(kind.slice(3)), clipLib);
        } catch (e) {
          return { ok: false, error: 'Y Overhaul error: ' + e.message };
        }
      }
      return origPlaceBet.call(this, state, kind, ref, teamId, stake);
    };
  }

  engine.__yClipLib = clipLib;
  return true;
}

module.exports = {
  CLIPS_ROOT,
  scanClipsLibrary,
  ensureYState,
  adjustRivalry,
  rivalryLevelLabel,
  generateClipForFixture,
  processNewFixturesForY,
  reactToUserTransferTweet,
  handleYCommand,
  buildYSnapshot,
  wrapYEngine,
};
