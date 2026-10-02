# Ouk Chaktrang

A mobile-first Cambodian chess game with browser AI and online partner rooms. English and Khmer UI, three local AI levels, legal moves, special opening rights, promotion, repetition, stalemate, checkmate, and optional endgame counting. Source rules profile: https://www.pychess.org/variants/cambodian

## Run

`npm install` installs development dependencies. `npm run build` bundles the Cloudflare Worker and embeds public assets. The Worker exports a fetch handler and uses the logical D1 binding `DB`; Sites applies the Drizzle migrations during deployment. Serve `public/` with a static HTTP server only for AI-only development. Partner play needs the Worker and D1. No external AI API key is needed.

## AI

Beginner: depth 1 / 60 ms with varied reasonable moves. Medium: up to depth 3 / 220 ms. Advanced: up to depth 5 / 650 ms. The worker is warmed when a game starts and reused between turns. Search deadlines are checked every 16 nodes. Iterative deepening keeps the last fully completed search. Hardware affects actual depth. These labels are relative, not certified ratings.

## Telegram

The page includes Telegram's official Web App SDK, ready/expand, safe-area handling and haptic feedback. The game also works in a regular browser. No account data, bot tokens or messages are needed for local AI play.

To launch for the public, use a publicly accessible HTTPS deployment and configure it as the Mini App/menu button URL for your bot through BotFather. The Site is publicly accessible without an account; it is not yet connected to a Telegram bot. Test the public deployment on Telegram Android, iOS and Desktop before launch. Do not put a bot token in frontend source. Telegram identity is not used for authentication in this version.

## Scope and validation

AI games are session-only and reset on refresh. Partner rooms persist in D1 and resume from their invitation link. No rankings or paid services are included. The board uses traditional Cambodian SVG piece artwork, hosted locally with its attribution and license in public/pieces/. Piece names remain in accessible labels and selected-piece feedback. The Copy link button shares the public game URL. The Cambodian rules profile and AI strength should be reviewed with experienced local players before a tournament release. UI and Telegram device QA have not yet been completed.

## Sounds and game messages

Short sounds accompany both players' moves, captures, checks, invalid moves, counting, and results. A sound switch stores only a device-local on/off preference. Browser audio is initialized on a click; no audio downloads or microphone permissions are required. Sound failure does not block gameplay.

Invalid destinations preserve the selected piece and legal highlights. Checkmate and draws show a result dialog, with View board and Play again actions. The endgame counter stays next to the board and emphasizes the final five counted moves. All messages support English and Khmer.

Run `npm run test:feedback` for interaction-state and audio scheduling checks. These run with DOM/AudioContext contract doubles; actual speaker playback and Telegram device testing still require a device.

Piece colors use ivory and dark purple for clear side identification. The artwork color adaptations remain under CC BY-SA 4.0; see public/pieces/ATTRIBUTION.txt.

## Partner rooms

Choose Play a partner, create a room, share its invitation URL, and select a color. The first successful server-side conditional update reserves a color; another guest cannot reserve it or occupy both seats. When both seats are claimed, ivory moves first. Purple views the board rotated. Moves and results are authoritative on the server and sync by foreground polling every second (four seconds in background tabs).

No account or sign-in is required. A Secure, HttpOnly, same-site guest cookie is a device capability; only its SHA-256 hash is stored in the two seat columns. Keeping the cookie allows the same browser to resume its seat. Clearing browser data or switching browsers loses that seat capability. Anyone with the unguessable room URL can view the board; a third visitor cannot play when both seats are taken. New games use new invitation links. Leaving a room does not erase it or automatically resign.

Move updates use revision compare-and-swap to prevent duplicate or stale writes. The server validates turn, legal moves, promotion, result, repetition and counting using the shared engine. The client waits for a successful response before changing a board. On connection errors it retains the last confirmed state and polls again.

Tests: `npm test` (engine), `npm run test:feedback` (UI state/audio), `npm run test:rooms` (real SQLite through a D1 adapter, two-client and concurrency behavior). Schema migrations are generated with `npm run db:generate`; applied migrations are immutable.

## Room comments

Every partner game has a persistent comment area under its board. Both seated players and link visitors may read before, during, or after the game without an account. Posting requires a named guest profile; this is enforced by the server as well as the comment form. Server-assigned labels identify ivory/purple players and pseudonymous visitors. The visitor tag is derived per room; private guest hashes are never returned in the feed. Messages are plain text (up to 500 characters), with a short per-guest cooldown. Comments do not change the game revision, moves, or seat permissions.

Comments sync independently every two seconds while visible. The latest 50 messages load first; older history remains available. Failed sends retain the draft and reuse a client request ID on retry. A unique database key prevents duplicate retry posts, and new-message polling uses its own cursor so an outgoing message cannot skip an unseen incoming message. `npm run test:comments` checks draft, retry, rendering and room-switch behavior; room integration tests also exercise both players and visitor comments, history and pagination.

## Guest profiles and player records

Players and visitors can create or edit a display name (1–40 characters) using Create profile above the board. No account is required. Profiles use the existing secure guest cookie and a server-side profiles table; they are remembered only in that browser. Clearing cookies, using private browsing, changing the hostname, or switching devices/browsers starts a separate identity. Names are public display labels, not unique or verified identities.

Player names and wins/losses/draws appear beside both sides of the partner board, including for spectators. New comments retain the author's name at posting time, so renaming does not rewrite old conversations. All names render as plain text. Older comments keep their role/visitor label.

Records cover completed partner rooms, including earlier completed games for the same guest identity. Each room contributes once, computed directly from server-validated final game state; repeat requests, refreshes, and name edits cannot increment a result. Resignation is a win/loss; draws are separate. Spectating and unfinished games do not contribute. AI practice is excluded from these totals. The client cannot submit wins or losses. Seat indexes bound record queries to a player's rooms. The initial profile request establishes the guest cookie before invitation-room requests start.

Run `npm run test:profile`, `npm run test:rooms`, `npm run test:feedback`, and `npm run test:comments` for profile, record, permissions, and interaction checks.

## Mobile board sizing

The board declares eight equal columns and eight equal rows using `minmax(0, 1fr)`. Cells fill their assigned grid tracks with zero automatic minimum height, and piece images stay within their cells. This prevents intrinsic SVG/image dimensions from expanding rows and clipping the last rank in mobile WebKit. The header can wrap on narrow phones; long names wrap without widening the board. Below 380 px, difficulty icons are hidden to leave room for the labels.

## Mobile app interface

At widths up to 680 px, the game uses a board-first app shell with a persistent bottom navigation bar: Board, Game, Comments and Profile. Game opens a modal bottom sheet for AI levels, partner invitation/color selection, sound, rules, counting, resignation and move history. The existing panel is moved, not duplicated, so controls and game state survive screen rotations and desktop/mobile resizing. A successful color reservation returns the player to the board. Comments have a separate mobile view; users without a room see a route to partner play, while the named-profile posting rule remains enforced.

Desktop keeps the two-column layout and inline comments. The mobile dock reserves space for iOS/Telegram safe areas; focusing the comment field hides the dock while typing. Profile records remain visible in the profile dialog. `npm run test:mobile` checks navigation and responsive state transitions using DOM contract doubles; real-device Telegram/iOS visual testing remains separate.
