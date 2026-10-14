# 📱 Mobile QA Checklist — NearbyPals (iOS + Android)

> **App:** `apps/mobile` (Expo SDK 57) on branch `Mobile-app-v1`
> **Companion to:** [`qa_test_plan.md`](./qa_test_plan.md) (web). Same flows, mobile-specific checks added.
> **Run on:** one iPhone and one Android phone, in **light and dark** mode (switch in the phone's settings).

Mark each cell ✅ pass, ❌ fail (add a note), or — not applicable.

---

## 1. Setup

| Item | Notes |
|---|---|
| Build | `preview` or `beta` EAS build (see `apps/mobile/README.md`). Push (section 10) needs a `development`, `preview` or `beta` build, not Expo Go. |
| API | Reachable from the phones (hosted, or your computer's LAN IP / tunnel) and seeded (`pnpm prisma:seed`). |
| Users | **A** = `alice@test.com`, **B** = `bob@test.com` (dev login). Use a second phone for B, or sign out and back in. |
| Neighborhood | Both pick the same seeded one, e.g. **Hawthorne (97214)**. |

---

## 2. Launch & sign-in

| # | Test | Steps | Expected | iOS | Android |
|---|---|---|---|---|---|
| 2.1 | First launch | Fresh install, open | Splash, then Welcome (tiles, headline, Get Started, I already have an account). No notification prompt yet | ⬜ | ⬜ |
| 2.2 | Get Started | Tap Get Started | Sign-in screen titled "Create a test account", DEV MODE badge | ⬜ | ⬜ |
| 2.3 | Sign in | Enter `alice@test.com`, Continue | New user → onboarding step 1 | ⬜ | ⬜ |
| 2.4 | Blank email | Leave email empty, Continue | A new test user is created → onboarding | ⬜ | ⬜ |
| 2.5 | API down | Stop the API, try to sign in | Inline error with the API address; no crash | ⬜ | ⬜ |
| 2.6 | Keyboard | Focus the email field | Keyboard doesn't cover the field or Continue | ⬜ | ⬜ |
| 2.7 | Back | Tap back on sign-in | Returns to Welcome | ⬜ | ⬜ |

## 3. Onboarding

| # | Test | Steps | Expected | iOS | Android |
|---|---|---|---|---|---|
| 3.1 | Progress | Go through the steps | Bar and "n of 4" advance 1→4 | ⬜ | ⬜ |
| 3.2 | Continue disabled | Step 1 with no name or no neighborhood | Continue disabled | ⬜ | ⬜ |
| 3.3 | Search | Type `972`, then `haw` | Results appear after a short pause; tap one → it shows as selected with a check | ⬜ | ⬜ |
| 3.4 | No results | Type `zzzz` | "No neighborhoods match that search." | ⬜ | ⬜ |
| 3.5 | Back on step 1 | Tap back | Signs out of the new account → Welcome | ⬜ | ⬜ |
| 3.6 | Role | Step 2: pick each option | Only one selected; Continue enabled after picking | ⬜ | ⬜ |
| 3.7 | Interests | Step 3: toggle tiles | Check marks + "n selected"; Continue disabled at 0 | ⬜ | ⬜ |
| 3.8 | Availability | Step 4: pick days and times | Times listed Morning, Afternoon, Evening; button disabled until ≥1 day and ≥1 time | ⬜ | ⬜ |
| 3.9 | State kept | Go back from step 4 to 2 and forward again | Choices still selected | ⬜ | ⬜ |
| 3.10 | Finish | Find my matches | Lands on Discover (tabs) | ⬜ | ⬜ |
| 3.11 | Relaunch | Kill and reopen the app | Opens on Discover, still signed in | ⬜ | ⬜ |

## 4. Discover

| # | Test | Steps | Expected | iOS | Android |
|---|---|---|---|---|---|
| 4.1 | Loading | Open Discover on a slow network | Pulsing placeholder cards | ⬜ | ⬜ |
| 4.2 | Cards | With a matching neighbor | Card: initial, name, role, shared interest chips, "You're both free …" line, View profile / Connect | ⬜ | ⬜ |
| 4.3 | Neighborhood pill | Header | Shows your neighborhood | ⬜ | ⬜ |
| 4.4 | Empty | User with no matches | "Your community is growing", Invite a Neighbor, "Pull down to check…" | ⬜ | ⬜ |
| 4.5 | Invite | Tap Invite a Neighbor | Native share sheet opens with the invite text | ⬜ | ⬜ |
| 4.6 | Pull to refresh | Pull down | Spinner, list refreshes | ⬜ | ⬜ |
| 4.7 | Hidden users | Other user turns off "Show me in matches", you refresh | They disappear | ⬜ | ⬜ |

## 5. Neighbor profile & request

| # | Test | Steps | Expected | iOS | Android |
|---|---|---|---|---|---|
| 5.1 | Profile | View profile | Avatar, name, role/neighborhood chips, about, interests (shared filled), week strip, times, overlap line | ⬜ | ⬜ |
| 5.2 | Send request | Send connection request | Request sent screen with their name and three steps | ⬜ | ⬜ |
| 5.3 | Back to matches | Tap it | Discover; that neighbor is gone from the list | ⬜ | ⬜ |
| 5.4 | View connections | From Request sent | Connections tab; they're under Sent | ⬜ | ⬜ |
| 5.5 | Connect from card | Tap Connect on a card | Same Request sent screen | ⬜ | ⬜ |
| 5.6 | Swipe back | iOS swipe-back on Request sent | Disabled (use the buttons) | ⬜ | — |

## 6. Connections

| # | Test | Steps | Expected | iOS | Android |
|---|---|---|---|---|---|
| 6.1 | Badge | B has a pending request from A | Connections tab shows a badge with the count | ⬜ | ⬜ |
| 6.2 | Sections | Open Connections | Requests (n), Connected (n), Sent (n); empty sections hidden | ⬜ | ⬜ |
| 6.3 | Request card | Incoming request | Name, role, shared interest/time chips, Decline / Accept | ⬜ | ⬜ |
| 6.4 | Accept | Tap Accept | Moves to Connected; badge clears | ⬜ | ⬜ |
| 6.5 | Decline | Tap Decline on another request | Disappears | ⬜ | ⬜ |
| 6.6 | Preview | Connected row | Last message ("You: …" for yours) or "Say hello and plan a meetup" | ⬜ | ⬜ |
| 6.7 | Empty | New user | "No connections yet" + Discover Neighbors → Discover tab | ⬜ | ⬜ |

## 7. Chat

| # | Test | Steps | Expected | iOS | Android |
|---|---|---|---|---|---|
| 7.1 | Empty chat | Open a new connection's chat | "No messages yet. Say hello!" + what you share | ⬜ | ⬜ |
| 7.2 | Send | Type and send | Bubble on the right; field clears | ⬜ | ⬜ |
| 7.3 | Receive | Other user replies | Appears within ~10 s (instantly with push) | ⬜ | ⬜ |
| 7.4 | Keyboard | Focus the message field | **Composer stays above the keyboard; messages still visible** (check carefully on Android) | ⬜ | ⬜ |
| 7.5 | Long message | Type several lines | Field grows up to ~5 lines, then scrolls | ⬜ | ⬜ |
| 7.6 | Offline send | Airplane mode, send | "Message not sent…"; text stays in the field | ⬜ | ⬜ |
| 7.7 | Header | Tap the name | Opens their profile; it shows "You're connected" + Message | ⬜ | ⬜ |

## 8. Profile & editors

| # | Test | Steps | Expected | iOS | Android |
|---|---|---|---|---|---|
| 8.1 | Profile tab | Open it | Avatar, name, neighborhood, four routine rows, privacy switch, Sign out | ⬜ | ⬜ |
| 8.2 | Editors open as sheets | Tap each row | Cancel / Title / Save header; Save disabled until something changes | ⬜ | ⬜ |
| 8.3 | Interests | Change, Save | Row updates; Cancel discards changes | ⬜ | ⬜ |
| 8.4 | Availability grid | Toggle cells, Save | "n time slots selected"; row summary updates | ⬜ | ⬜ |
| 8.5 | About me | Child age + bio | Counter "n/300"; can't type past 300; saved values reappear | ⬜ | ⬜ |
| 8.6 | Child age visibility | Role = Pet parent | Child age field hidden in About me | ⬜ | ⬜ |
| 8.7 | Role | Change to Both, Save | Row shows "Parent & pet parent" | ⬜ | ⬜ |
| 8.8 | Show me in matches | Toggle off / on | Text changes; other user's Discover hides/shows you | ⬜ | ⬜ |
| 8.9 | Sign out | Tap Sign out | Welcome; relaunch stays signed out | ⬜ | ⬜ |

## 9. Resilience

| # | Test | Steps | Expected | iOS | Android |
|---|---|---|---|---|---|
| 9.1 | Offline launch | Airplane mode, relaunch while signed in | "Can't reach NearbyPals" with Try again / Sign out (still signed in) | ⬜ | ⬜ |
| 9.2 | Recover | Turn network on, Try again | Back where you were | ⬜ | ⬜ |
| 9.3 | Background/resume | Leave the app for a few minutes, return | Data refreshes; no crash | ⬜ | ⬜ |
| 9.4 | Rotation | Rotate the phone | Stays portrait | ⬜ | ⬜ |

## 10. Push notifications (development / preview / beta build)

| # | Test | Steps | Expected | iOS | Android |
|---|---|---|---|---|---|
| 10.1 | Permission timing | Fresh install, sign up | Prompt appears on reaching the tabs (after onboarding), not on first launch | ⬜ | ⬜ |
| 10.2 | Request push | A sends B a request, B's app in background | "New connection request — Alice wants to connect" | ⬜ | ⬜ |
| 10.3 | Tap request | Tap it | Opens Connections | ⬜ | ⬜ |
| 10.4 | Accepted push | B accepts | A gets "Bob accepted — say hello"; tap opens the chat | ⬜ | ⬜ |
| 10.5 | Message push | A messages B (app closed) | Title "Alice", body = message (cut at 80 chars); tap launches into that chat | ⬜ | ⬜ |
| 10.6 | In the open chat | B has that chat open | No banner; message appears right away | ⬜ | ⬜ |
| 10.7 | Elsewhere in app | B on Discover | Banner shows; Connections preview updates | ⬜ | ⬜ |
| 10.8 | Denied | Deny the permission | App works normally, no pushes | ⬜ | ⬜ |
| 10.9 | Sign out | B signs out, A messages B | B's phone gets no push | ⬜ | ⬜ |

## 11. Appearance & accessibility

| # | Test | Steps | Expected | iOS | Android |
|---|---|---|---|---|---|
| 11.1 | Dark mode | Switch the phone to dark | Every screen readable; no white flashes | ⬜ | ⬜ |
| 11.2 | Large text | Largest system font size | Text wraps, nothing cut off or overlapping (tab labels, buttons) | ⬜ | ⬜ |
| 11.3 | Screen reader | VoiceOver / TalkBack through onboarding and Discover | Buttons, checkboxes and radios announce their name and state | ⬜ | ⬜ |
| 11.4 | Safe areas | Notch / home indicator / Android gesture bar | Nothing hidden behind them | ⬜ | ⬜ |
| 11.5 | Back gesture | Android back button / iOS swipe | Goes back where expected; doesn't exit mid-flow | ⬜ | ⬜ |

## 12. Two-user happy path (E2E)

Same as section 15 of the web plan, on phones:

1. A and B onboard in the same neighborhood with an overlapping interest and time.
2. A sees B in Discover → Connect → Request sent.
3. B gets a push → Connections → Accept → A gets a push.
4. They exchange messages; each side sees the other's within seconds.
5. A no longer sees B in Discover.

| Platform pair | Result |
|---|---|
| iPhone ↔ Android | ⬜ |
