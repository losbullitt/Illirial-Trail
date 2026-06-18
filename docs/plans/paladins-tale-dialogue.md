# A Paladin's Tale — dialogue script (draft)

**Status:** Draft for review. Lines marked **(design)** are from the original quest spec verbatim or paraphrased minimally. All other lines are generated placeholders.

**Format:** `Speaker → line` · `[Choice]` branches · `{flag}` for state gates

**Candidate placeholder:** `{candidate}` = eligible soldier's name

---

## Yosef — Solem garrison (guest officer, Silver Blades of Sidra)

### First meeting / idle (not yet eligible)

**Yosef:** Commander Yosef, Silver Blades of Sidra — guest officer with Solem's garrison. I don't know your names yet, but I know the look of people who still have miles left in them.

**Yosef:** When one of your soldiers is seasoned enough, we may speak of service beyond the wagon train. Until then, see to your people on the road.

*(Hide quest offer until: level ≥ 10, class soldier, STR ≥ 12, STAM ≥ 12.)*

---

### Eligible — opening offer **(design)**

**Yosef:** You there — soldier. I've watched your company pass through the citadel more than once. You carry yourself like someone who hasn't spent everything on the trail.

**Yosef:** **"Do you want to give more to your people?"**

- **[Yes]** → `yosef_accept_pitch`
- **[No]** → `yosef_decline_once`

---

### Decline (not locked yet)

**Yosef:** Honest answer. The road asks enough without Sidra asking more.

**Yosef:** If you change your mind while I'm still posted here, you know where the guest quarter is.

*(Increment `yosefDeclineCount`. At 3 → `declined_locked` until another party member reaches level 10.)*

---

### Declined locked (caravan)

**Yosef:** *(nods, does not initiate)* My order doesn't press where it isn't welcome. When another of your company proves themselves on the road, perhaps we'll speak again.

---

### Accept — Silver Blades application **(design continuation)**

**Yosef:** Good. The Silver Blades don't recruit from tavern boards. We recruit from folk who've already bled for strangers.

**Yosef:** I won't knight you today. Sidra has a first question for every applicant: can you stand where ordinary folk cannot?

**Yosef:** There's a settlement days off your western line — giants came down from the high ridges. Five people are still trapped in the lower ward. Break the giants, bring me proof, and we'll discuss what comes next.

- **[Accept: The Giant Question]** → start phase 1
- **[Not yet]** → defer; quest offer remains at Solem

---

### Phase 1 complete — turn in giant's head

**Yosef:** You came back. That alone separates applicants from stories.

*(Player turns in `giants_head`.)*

**Yosef:** A giant's head is a crude diploma — but Sidra has always favored results over parchment.

**Yosef:** Five lives still breathing because you marched off-map? That's the work. The Silver Blades notice.

**Yosef:** Second trial. Rare ingots from the Helsfort slopes — south of the Dragonspine, weeks from this road. There's a town called **Jephro** that trades with the mines. Go there. Help them with whatever they need. Dig when they allow it. Bring back the metal if the mountain gives it.

**Yosef:** Don't hurry back for my sake. The mountain doesn't care about your caravan schedule.

→ Phase 2 (`phase2_jephro`)

---

### Phase 2 return — positions filled twist **(design)**

*(Player returns with ingots / completes Jephro chain.)*

**Yosef:** You're back. And you've done what I asked — I won't pretend otherwise. **Thank you for your efforts.**

**Yosef:** I wish I had better news. **They recently filled their open positions** in the main chapter. I'm on a **remote posting** here — **I found out long after you went to complete the second leg.**

**Yosef:** **The next time you're in town, I'll let you know if something opens.**

**Yosef:** Finish your loop. Keep your people alive. If Sidra needs you before we speak again, the need will find you on the road.

→ `waiting_for_opening`

---

### Waiting — subsequent Solem visits (before Rare Air)

**Yosef:** No word from chapter yet. You haven't been forgotten — bureaucracy moves like weather on the spine.

**Yosef:** March well. I'll send word when there's an opening worth your blood.

---

## Phase 1 — The Giant Question (remote town)

### Town elder / magistrate (TBD name)

**Elder:** Thank the wards you're here — we sent three riders and heard nothing back. Giants took the lower storehouses. Five of ours are pinned in the ward chapel.

**Elder:** We can't pay what Cantebury would pay. We can pay you in gratitude and whatever the giants were guarding.

- **[We'll handle it]** → wave combat 1 (2 giants) → wave 2 (3 giants)

---

### After waves — rescue

**Elder:** The chapel door still holds. All five — all five are shaken, but breathing.

**Voice (survivor):** We heard fighting. We thought the roof would come down.

**Elder:** Take what's owed from the yard. And if your commander sent you, tell Sidra this town remembers.

*(Grant `giants_head`.)*

---

### Travel log (optional bark)

**{candidate}:** Giants don't usually hunt chapel wards. Something drove them downslope.

---

## Phase 2 — Jephro hub

### Mayor / reeve (Jephro)

**Reeve:** Jephro doesn't see caravans often. You're weeks off the main march — whoever sent you didn't send you for comfort.

**Reeve:** We have ghosts in the graveyard that won't lie quiet, timber rotting in the lumber woods, and a mine the mountain keeps for itself. Help us in order, and we'll help you at the face.

---

### The Ghosts that Pray

**Gravedigger:** They don't scream. That's what unnerves folk. They **pray** — old words, wrong hours — and the frost on the stones never melts.

**Gravedigger:** Stay one night. If they mean harm, stop them. If they mean peace, listen before you strike.

*(Night encounter — ghosts as foes; post-combat:)*
**Spirit (fading):** We couldn't finish the rite… tell the reeve… the north plot…

**Reeve:** The north plot was washed out in the spring floods. I'll see it consecrated. You've done more than steel usually does here.

→ `ghostsComplete`

---

### The Lumbering Woods

**Foreman:** The Helsfort timber's good — heavy, slow to rot — but the woods have been **lumbering** of late. Trees down that nobody felled. Bring back straight logs from the marked grove. Don't take more than you can haul before dark.

*(Gather / simple encounter optional — wolves, falling limb trap TBD.)*

**Foreman:** That'll roof the mine shack and the infirmary. Tell the reeve you're square with the woods.

→ `lumberComplete`

---

### Mind Your Mines (unlocked after ghosts + lumber)

**Mine captain:** Shaft's unstable. We don't send strangers down unless the town vouches — and the town vouches for you now.

**Mine captain:** Chip what you can. Most nodes give scrap. **One in ten** might give you what your commander described — rare ingot, green streak, cold to the touch.

*(Per node: 10% ingot roll.)*

**Mine captain:** Mountain's mood. You got what she offered. That's the bargain.

→ return to trail / Yosef when ingot quota met (TBD: minimum count)

---

## Phase 3 — Rare Air (outside Gustaf)

### Lady Stillwater — road encounter **(design setup)**

**Lady Stillwater:** Hold — please. I am **Lady Stillwater**. These men are my guard, and they're not lazy — they're **ill**.

**Lady Stillwater:** A **miasma** hangs in the marsh east of the Gustaf road. My soldiers sickened first. If it spreads, your town and every caravan behind you breathes the same poison.

**Lady Stillwater:** Find the source. End it. Gustaf shouldn't pay for what something in the reeds decided to learn.

- **[We'll search the marsh]** → Rare Air active
- **[We can't spare the time]** → defer encounter once; returns next leg

---

### Marsh / pre-boss

**{candidate}:** The air tastes like copper and old prayers. Something's channeling down here.

**Naga (distant):** You should not have followed the sick men. The tome taught me what the swamp keeps hidden.

---

### After Naga defeated

**{candidate}:** It's done. The miasma'll lift — slowly.

*(Grant `dark_channeling_tome`.)*

---

### Return to Lady Stillwater **(design)**

**Lady Stillwater:** You're back from the marsh. My men can already breathe without wincing. **Did you retrieve anything?**

- **[No]** → `stillwater_gold_only`
- **[Yes]** → `stillwater_ask_tome`

---

### Withhold / deny **(design branch)**

**Lady Stillwater:** …I see.

**Lady Stillwater:** Then take this for the march, and we'll call our account closed.

*(Gold reward. `failed_withheld_tome` — Paladin questline stops until restarted via Yosef.)*

**Lady Stillwater:** If Sidra sent you, tell them Stillwater pays her debts — even when the debt is disappointment.

---

### Yes — ask for tome **(design)**

**Lady Stillwater:** **Give it to me.** That book shouldn't ride in a wagon where children sleep.

- **[Give the tome]** → `stillwater_success`
- **[Keep it]** → treat as withhold → `stillwater_gold_only`

---

### Tome delivered — success **(design)**

**Lady Stillwater:** You did well. More than well.

**Lady Stillwater:** **Congratulations — you've completed the Paladin's Quest.** What you carried out of that marsh was corruption dressed as knowledge.

**Lady Stillwater:** **The next time you're in Cantebury, the Paladin Lord, Reginald the Hawk, will give you your award.** Tell him Stillwater sent you, and that you didn't flinch.

→ `ready_for_cantebury`

---

## Reginald the Hawk — Cantebury (Paladin Lord)

### Without quest flag

**Reginald:** Reginald the Hawk, Paladin Lord of Cantebury's chapter. If you're here for petitions, the chancellor's desk is down the hall. If you're here for glory, the west road is longer than you think.

---

### Ready for knighting (`ready_for_cantebury`)

**Reginald:** Stillwater's rider reached us two days ago. She doesn't praise lightly.

**Reginald:** {candidate} — step forward. You applied with Commander Yosef. You answered the giant question. You walked the mountain's errand when the chapter closed its lists. You gave up a dark book when a lesser soldier would have sold it.

**Reginald:** By authority of Sidra and the Silver Blades, I name you **{candidate} of the Silver Blades**.

*(Class → Paladin, +10 Stamina, AP→MP, healing buff, trait TBD.)*

**Reginald:** Your oath isn't to my title. It's to the people who never see the paladin coming — only the shadow between them and harm.

**Reginald:** Go back to your caravan. Give them more than you promised.

→ `completed`

---

## Party / candidate barks (optional)

**{candidate} (on accept):** Sidra doesn't ask twice. Neither do I.

**{candidate} (Jephro departure):** Weeks off the trail. The caravan won't wait — but this won't wait either.

**{candidate} (after twist):** Positions filled. Story of my life — right work, wrong calendar.

**{candidate} (Rare Air):** Miasma, spellcraft, and a noblewoman who doesn't blink. Paladin work, apparently.

---

## Quest journal one-liners (UI)

| Phase | Log text |
|-------|----------|
| Apply | Yosef of the Silver Blades asked whether you would give more to your people. |
| Giant Question | Save five townsfolk from giants; bring a giant's head to Yosef at Solem. |
| Jephro | Travel to Jephro: Ghosts that Pray → Lumbering Woods → Mind Your Mines. |
| Waiting | Yosef: positions filled; await word on Solem return. |
| Rare Air | Lady Stillwater: find the miasma source in the marsh near Gustaf. |
| Cantebury | Reginald the Hawk will confer your award at the keep. |

---

## Lines to refine later (author notes)

- Remote giant-town **name** and elder's voice
- Exact **gold** amount on Stillwater failure path
- **Jephro** reeve name and mine ingot quota
- **Reginald** ceremony length / trait reveal speech
- Whether Yosef has **repeat idle** lines per decline count (1 of 3, 2 of 3)
