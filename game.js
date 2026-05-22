/* Cantebury Trails - skeleton demo (UTF-8, ASCII) */
(function () {
  "use strict";

  var CLASS_HP = { soldier: 10, priest: 6, mercenary: 8, mage: 6 };
  var CARAVAN_FOLLOWERS_TOTAL = 10;
  var DEFAULT_ROUTE_DAYS = 10;
  /** Each trail leg rolls once (3–10 days) and keeps that length every loop. */
  var ROUTE_DAYS_MIN = 3;
  var ROUTE_DAYS_MAX = 10;
  var DESTINATIONS = {
    gustaf: { key: "gustaf", label: "Gustaf", subtitle: "Stone quays and wind-bent banners", badge: "Port" },
    brookside: { key: "brookside", label: "Brookside", subtitle: "A small village where the brook meets the road", badge: "Village" },
    hollow_banks: { key: "hollow_banks", label: "Hollow Banks", subtitle: "Reed marsh and fogbound piers", badge: "Frontier" },
    glennhardt: { key: "glennhardt", label: "Glennhardt", subtitle: "Mid-city markets and guild halls on the fork road", badge: "City" },
    solem: { key: "solem", label: "Solem", subtitle: "Hill citadel above the river forks", badge: "Citadel" },
    new_isil: { key: "new_isil", label: "New Isil", subtitle: "End city - spires above the bay", badge: "Harbor" },
  };
  /** Fork pairs on the western march (pick one from each pair westbound). */
  var TRAIL_FORK_LOWER = ["gustaf", "brookside"];
  var TRAIL_FORK_UPPER = ["hollow_banks", "glennhardt"];
  /** Stage depth for scaling and eastbound ordering when off the recorded path. */
  var TRAIL_TOWN_STAGE = {
    cantebury: 0,
    gustaf: 1,
    brookside: 1,
    hollow_banks: 2,
    glennhardt: 2,
    solem: 3,
    new_isil: 4,
  };
  var KEEP_NPC_LINES = {
    cantebury_governor: {
      speaker: "Governor Kew Kumber",
      title: "Governor of Cantebury",
      portrait: "SK Kew Kumber.jpeg",
      text: "You have my leave to march west. Keep the trade road open, report what you find beyond Hollow Banks, and do not tarry — rumors from New Isil grow worse each week.",
    },
    cantebury_chancellor: {
      speaker: "Chancellor Aldric Venn",
      title: "Chancellor",
      portrait: "",
      text: "Petitions stack on the governor's desk. If you need requisition papers or a seal for the garrison at Gustaf, see me before you depart — I can spare an hour, not a day.",
    },
    solem_magistrate: {
      speaker: "Magistrate Serah Dunwald",
      title: "Magistrate of Solem",
      portrait: "",
      text: "Welcome to the citadel. Solem fields what soldiers we can spare, but the final stretch to New Isil is yours to make. Rest, resupply, and mind the wards — the hills have been restless.",
    },
  };
  function townHasKeep(townKey) {
    return townKey === "cantebury" || townKey === "solem";
  }
  var BARKEEP_BY_TOWN = {
    _default: {
      speaker: "The barkeep",
      title: "Traveler's tavern",
      portrait: "",
      greet: "Another caravan through the door. Ale's hot, beds are taken, and the westward road never sleeps. What can I do for you?",
      activeQuest: "How goes the work I set you on? Finish it proper, then we'll talk coin.",
      noWork: "No contracts tonight — drink, rest, and try your luck on the road.",
    },
    cantebury: {
      speaker: "Barkeep Corbyn",
      title: "The Rusty Nail",
      portrait: "",
      greet: "So you're the lot marching to New Isil. I keep ears on the trade road — smoke over the pass, missing livestock, the usual grim music. Pull up a stool if you want ale; pull up your courage if you want paid work.",
      activeQuest: "Still chasing that chore I mentioned? Don't stroll back until it's settled.",
      noWork: "Nothing paying at the moment. Recruit who you need and mind the governor's timetable.",
    },
    gustaf: {
      speaker: "Barkeep Hella",
      title: "The Windward Stein",
      portrait: "",
      greet: "Port Gustaf sees every fool with a sword and a dream. I hear rumors from the quays — some worth gold, most worth a laugh.",
      activeQuest: "That job I whispered about — still open until you close it. The docks aren't getting quieter.",
      noWork: "Harbor's slow. Wet your throat and move on when the tide turns.",
    },
    hollow_banks: {
      speaker: "Barkeep Merrin",
      title: "The Reed Lantern",
      portrait: "",
      greet: "Hollow Banks eats the careless. I sell warmth and warnings in equal measure. Sit if you like — stand if you're nervous.",
      activeQuest: "You took my lead on that business. See it through before the marsh claims another fool.",
      noWork: "Fog's thick and purses are thin. I have no leads worth your steel tonight.",
    },
    brookside: {
      speaker: "Barkeep Tessa",
      title: "The Willow Ford",
      portrait: "",
      greet: "Brookside is small but the road remembers everyone who passes. I pour thin ale and thick gossip — take both if you're marching west.",
      activeQuest: "That chore I mentioned? The brook folk are still waiting on you.",
      noWork: "Quiet night. Rest your boots and move on when the mist lifts.",
    },
    glennhardt: {
      speaker: "Barkeep Rolf",
      title: "The Guild Crown",
      portrait: "",
      greet: "Glennhardt has every comfort a long march lacks — smiths, scribes, and a barkeep who knows your coin before you sit. What'll it be?",
      activeQuest: "The contract I set is still open. Close it before the guild clerks lose patience.",
      noWork: "Plenty of drink, no paid leads tonight. Browse the markets instead.",
    },
    solem: {
      speaker: "Barkeep Oska",
      title: "The High Fork",
      portrait: "",
      greet: "Solem's the last real roof before New Isil. Garrison folk drink here, and so do the desperate. I know which stories pay.",
      activeQuest: "That contract's still on your tab. Finish it — the citadel doesn't forget debts or heroes.",
      noWork: "Citadel's quiet for hires. Rest the company and climb when you're ready.",
    },
  };
  var PARTY_MAX = 5;
  var STAT_KEYS = ["strength", "intelligence", "stamina", "luck"];
  var BALANCE_DATA =
    typeof window !== "undefined" && window.ILLIRIAL_BALANCE
      ? window.ILLIRIAL_BALANCE
      : {
          version: "4.7.1",
          classCreationBonusPoints: 3,
          classes: {
            soldier: { final: { strength: 7, intelligence: 3, stamina: 5, luck: 4 } },
            priest: { final: { strength: 4, intelligence: 6, stamina: 4, luck: 5 } },
            mercenary: { final: { strength: 6, intelligence: 3, stamina: 5, luck: 5 } },
          },
          monsters: [],
          weapons: [],
        };
  var GAME_VERSION = BALANCE_DATA.version || "4.7.1";
  var CLASS_BONUS_POINTS = BALANCE_DATA.classCreationBonusPoints || 3;
  var CLASS_BASE_STATS = {
    soldier: (BALANCE_DATA.classes && BALANCE_DATA.classes.soldier && BALANCE_DATA.classes.soldier.final) || { strength: 7, intelligence: 3, stamina: 5, luck: 4 },
    priest: (BALANCE_DATA.classes && BALANCE_DATA.classes.priest && BALANCE_DATA.classes.priest.final) || { strength: 4, intelligence: 6, stamina: 4, luck: 5 },
    mercenary: (BALANCE_DATA.classes && BALANCE_DATA.classes.mercenary && BALANCE_DATA.classes.mercenary.final) || { strength: 6, intelligence: 3, stamina: 5, luck: 5 },
    mage: (BALANCE_DATA.classes && BALANCE_DATA.classes.mage && BALANCE_DATA.classes.mage.final) || { strength: 3, intelligence: 7, stamina: 3, luck: 4 },
  };
  var PRESET_LEADER = {
    name: "Captain Elara Vale",
    role: "soldier",
    age: 31,
    hometown: "Cantebury",
    bio: "A veteran caravan captain who has crossed the trade road through flood, famine, and war.",
    gender: "woman",
    headshot: "Vale.jpeg",
    stats: cloneStats(CLASS_BASE_STATS.soldier),
    source: "preset",
  };
  /* Quiet day ramps danger: +25 percentage points per day with no encounter (cap 95%). */
  var ENCOUNTER_BASE = 0.1;
  var ENCOUNTER_STEP = 0.25;
  var ENCOUNTER_CAP = 0.95;
  /** Cantebury local scouting: 80% fewer adventure encounters (20% of normal rate). */
  var CANTEBURY_ADVENTURE_ENCOUNTER_MULT = 0.2;
  var RUINS_BASE_CHANCE = 0.18;
  var RUINS_DAY_BONUS = 0.12;
  var RUINS_MAX_CHANCE = 0.72;
  var RUINS_QUIET_DAY_CHANCE = 0.06;
  var SKELETON_FIGHT_CHANCE = 0.45;
  var RUINS_GOLD_FIND_CHANCE = 0.25;
  var RUINS_GOLD_MIN = 8;
  var RUINS_GOLD_MAX = 20;
  /** Ruins grid minimap — off until shrine navigation is playable. */
  var RUINS_SHOW_MINIMAP = false;
  var WEAPON_TIERS = [
    { id: "knife", label: "Knife", grade: 0 },
    { id: "shortsword", label: "Shortsword", grade: 1 },
    { id: "war_axe", label: "War axe", grade: 2 },
    { id: "runesword", label: "Runesword", grade: 3 },
  ];
  var EXOTIC_WEAPONS = [
    { id: "tellerite_blade", label: "Tellerite Blade", dmgBonus: 20, price: 50000 },
    { id: "vulcan_hammer", label: "Vulcan Hammer", dmgBonus: 20, price: 50000 },
    { id: "romulan_verdant_blade", label: "Romulan Verdant Blade", dmgBonus: 20, price: 50000 },
  ];
  function exoticWeaponDef(weaponId) {
    if (!weaponId) return null;
    for (var i = 0; i < EXOTIC_WEAPONS.length; i++) {
      if (EXOTIC_WEAPONS[i].id === weaponId) return EXOTIC_WEAPONS[i];
    }
    return null;
  }
  function exoticWeaponOwner(weaponId) {
    if (!weaponId) return null;
    for (var i = 0; i < state.party.length; i++) {
      var m = state.party[i];
      if (m && m.exoticWeaponId === weaponId) return m;
    }
    return null;
  }
  var STABILITY_TARGET_DAYS = (BALANCE_DATA && BALANCE_DATA.stabilityTargetDays) || 100;
  var FINAL_BOSS_MIN_DAYS = (BALANCE_DATA && BALANCE_DATA.finalBossMinDays) || 90;
  var NEW_ISIL_BASE_POPULATION = 12;
  var EQUIPMENT_SLOTS = ["weapon", "armor", "finger", "neck"];
  var EQUIPMENT_SLOT_LABELS = { weapon: "Weapon", armor: "Armor", finger: "Finger", neck: "Neck" };
  var EQUIPMENT_CATALOG = (BALANCE_DATA && BALANCE_DATA.equipmentCatalog) || [];
  var EQUIPMENT_BY_ID = {};
  (function buildEquipmentIndex() {
    for (var ei = 0; ei < EQUIPMENT_CATALOG.length; ei++) {
      var it = EQUIPMENT_CATALOG[ei];
      if (it && it.id) EQUIPMENT_BY_ID[it.id] = it;
    }
  })();
  function equipmentItemDef(itemId) {
    return itemId ? EQUIPMENT_BY_ID[itemId] || null : null;
  }
  function ensureMemberEquipment(member) {
    if (!member) return member;
    if (!member.equipment) {
      member.equipment = { weapon: null, armor: null, finger: null, neck: null };
    }
    return member;
  }
  function equipmentHpBonus(member) {
    if (!member || !member.equipment) return 0;
    var sum = 0;
    for (var si = 0; si < EQUIPMENT_SLOTS.length; si++) {
      var def = equipmentItemDef(member.equipment[EQUIPMENT_SLOTS[si]]);
      if (def && def.hpBonus) sum += def.hpBonus;
    }
    return sum;
  }
  function equipmentDmgBonus(member) {
    if (!member || !member.equipment) return 0;
    var sum = 0;
    for (var di = 0; di < EQUIPMENT_SLOTS.length; di++) {
      var ddef = equipmentItemDef(member.equipment[EQUIPMENT_SLOTS[di]]);
      if (ddef && ddef.dmgBonus) sum += ddef.dmgBonus;
    }
    return sum;
  }
  function refreshMemberDerivedStats(member) {
    if (!member) return;
    ensureMemberEquipment(member);
    var oldMax = member.maxHp || memberMaxHp(member);
    var newMax = memberMaxHp(member);
    member.maxHp = newMax;
    if (member.hp > member.maxHp) member.hp = member.maxHp;
    if (newMax > oldMax && member.hp > 0) member.hp = Math.min(newMax, member.hp + (newMax - oldMax));
  }
  function gearStashList() {
    return state && state.gearStash ? state.gearStash.slice() : [];
  }
  function stashItemsForSlot(slot) {
    var stash = gearStashList();
    var out = [];
    for (var i = 0; i < stash.length; i++) {
      var def = equipmentItemDef(stash[i]);
      if (def && def.slot === slot) out.push(stash[i]);
    }
    return out;
  }
  function removeFromGearStash(itemId) {
    if (!state.gearStash) return;
    var idx = state.gearStash.indexOf(itemId);
    if (idx >= 0) state.gearStash.splice(idx, 1);
  }
  function addToGearStash(itemId) {
    if (!itemId) return;
    if (!state.gearStash) state.gearStash = [];
    state.gearStash.push(itemId);
  }
  function unequipSlotToStash(member, slot) {
    if (!member || !member.equipment) return;
    var prev = member.equipment[slot];
    if (!prev) return;
    member.equipment[slot] = null;
    addToGearStash(prev);
    refreshMemberDerivedStats(member);
  }
  function equipItemOnMember(member, slot, itemId) {
    if (!member || !itemId) return false;
    var def = equipmentItemDef(itemId);
    if (!def || def.slot !== slot) return false;
    ensureMemberEquipment(member);
    if (member.equipment[slot]) unequipSlotToStash(member, slot);
    removeFromGearStash(itemId);
    member.equipment[slot] = itemId;
    refreshMemberDerivedStats(member);
    return true;
  }
  function formatGp(amount) {
    return String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  var XP_PER_LEVEL = 3;
  var XP_THRESHOLDS = (BALANCE_DATA && BALANCE_DATA.levelXpThresholds && BALANCE_DATA.levelXpThresholds.length)
    ? BALANCE_DATA.levelXpThresholds.slice()
    : [0, 3, 7, 13, 21, 31, 44, 61, 83, 109, 141, 180, 229, 291, 365, 451, 550, 662, 799, 957];
  var MAX_LEVEL = (BALANCE_DATA && BALANCE_DATA.maxLevel) || (XP_THRESHOLDS.length);
  var STAT_CAP = (BALANCE_DATA && BALANCE_DATA.statCap) || 50;
  var STAT_GAINS_PER_CLASS = (BALANCE_DATA && BALANCE_DATA.statGainsPerClass) || {};
  function xpToNextLevel(level) {
    var L = Math.max(1, level | 0);
    if (L >= MAX_LEVEL) return Infinity;
    if (L >= XP_THRESHOLDS.length) return XP_PER_LEVEL;
    return XP_THRESHOLDS[L] - XP_THRESHOLDS[L - 1];
  }
  function statGainProfile(role) {
    return STAT_GAINS_PER_CLASS[role] || STAT_GAINS_PER_CLASS.soldier || { strength: 0, intelligence: 0, stamina: 0, luck: 0 };
  }
  /** Level-up stat point rolls: favor low gains (0–3); renormalized when class cap is below 3. */
  var STAT_GAIN_VALUE_WEIGHTS = [35, 45, 15, 5];

  function rollWeightedStatGain(max) {
    max = Math.max(0, parseInt(max, 10) || 0);
    if (max <= 0) return 0;
    var total = 0;
    var i;
    for (i = 0; i <= max; i++) {
      total += i < STAT_GAIN_VALUE_WEIGHTS.length ? STAT_GAIN_VALUE_WEIGHTS[i] : 0;
    }
    if (total <= 0) return rollInt(0, max);
    var r = Math.random() * total;
    var acc = 0;
    for (i = 0; i <= max; i++) {
      acc += i < STAT_GAIN_VALUE_WEIGHTS.length ? STAT_GAIN_VALUE_WEIGHTS[i] : 0;
      if (r < acc) return i;
    }
    return max;
  }

  function rollStatGains(role) {
    var p = statGainProfile(role);
    return {
      strength: rollWeightedStatGain(p.strength || 0),
      intelligence: rollWeightedStatGain(p.intelligence || 0),
      stamina: rollWeightedStatGain(p.stamina || 0),
      luck: rollWeightedStatGain(p.luck || 0),
    };
  }
  var MAX_SUPPLIES = 30;
  var RUINS_ROOM_MAX = 20;
  var BALANCE_MONSTERS = (BALANCE_DATA && BALANCE_DATA.monsters ? BALANCE_DATA.monsters : []).filter(function (m) {
    return m && m.name;
  });
  var HEADSHOT_FILES = [
    "farmer 1 woman.jpeg",
    "farmer 1.jpeg",
    "farmer 5 man.jpeg",
    "farmer woman 2.jpeg",
    "female mercenary 1.jpeg",
    "female mercenary 2.jpeg",
    "female mercenary 5.jpeg",
    "female mercenary 6.jpeg",
    "female merchant .jpeg",
    "female priest 1.jpeg",
    "female priest 4.jpeg",
    "female priest 5.jpeg",
    "male cleric 1.jpeg",
    "male merchant.jpeg",
    "male priest 1.jpeg",
    "mercenary 1.jpeg",
    "mercenary 2.jpeg",
    "mercenary 3.jpeg",
    "mercenary female 4.jpeg",
    "merchant 2.jpeg",
    "merchant woman 3.jpeg",
    "soldier 1.jpeg",
    "soldier 10.jpeg",
    "soldier 2.jpeg",
    "soldier 3.jpeg",
    "soldier 4.jpeg",
    "soldier 5.jpeg",
    "soldier 6.jpeg",
    "soldier 7.jpeg",
    "soldier 8.jpeg",
    "soldier 9.jpeg",
    "soldier woman 1.jpeg",
    "soldier woman 10.jpeg",
    "soldier woman 2.jpeg",
    "soldier woman 3.jpeg",
    "soldier woman 4.jpeg",
    "soldier woman 5.jpeg",
    "soldier woman 6.jpeg",
    "soldier woman 7.jpeg",
    "soldier woman 8.jpeg",
    "woman soldier 9.jpeg",
  ];

  var transitionTimers = [];
  var DEPART_BLACKOUT_MS = 950;
  var DEPART_MAP_MS = 1500;
  var MARCH_MS = 1350;
  var ENCOUNTER_CUT_MS = 820;
  var RESUME_TRAVEL_MS = 520;
  var ARRIVE_CITY_MS = 900;

  function clearTransitionTimers() {
    var i;
    for (i = 0; i < transitionTimers.length; i++) clearTimeout(transitionTimers[i]);
    transitionTimers.length = 0;
  }

  function scheduleTransition(fn, ms) {
    transitionTimers.push(setTimeout(fn, ms));
  }

  function trackPlaytest(eventName, payload) {
    if (typeof window === "undefined") return;
    var t = window.PlaytestTracker;
    if (!t || typeof t.track !== "function") return;
    t.track(eventName, payload || {});
  }

  function rollInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function mercenaryCount(party) {
    var n = 0;
    for (var i = 0; i < party.length; i++) if (party[i].role === "mercenary") n++;
    return n;
  }

  function lootMultiplier(party) {
    var mult = 1 + 0.05 * mercenaryCount(party);
    if (state.caravan && state.caravan.merchants) {
      mult += 0.02 * state.caravan.merchants;
    }
    return mult;
  }

  function defaultCaravanFollowers() {
    return {
      total: CARAVAN_FOLLOWERS_TOTAL,
      farmers: 4,
      artisans: 2,
      merchants: 2,
      thatchers: 1,
      stoneMasons: 0,
      cobblers: 1,
      blacksmiths: 0,
    };
  }

  function rollNewCaravanFollowers(total) {
    var n = Math.max(1, total || rollInt(1, 15));
    var c = {
      total: n,
      farmers: 0,
      artisans: 0,
      merchants: 0,
      thatchers: 0,
      stoneMasons: 0,
      cobblers: 0,
      blacksmiths: 0,
    };
    var groups = ["farmers", "merchants", "artisans", "thatchers", "stoneMasons", "cobblers", "blacksmiths"];
    var i;
    for (i = 0; i < n; i++) {
      c[groups[rollInt(0, groups.length - 1)]]++;
    }
    return c;
  }

  function ensureCaravanState() {
    if (!state.caravan || typeof state.caravan.total !== "number") {
      state.caravan = defaultCaravanFollowers();
    }
  }

  function caravanTradeBonus(field) {
    ensureCaravanState();
    return state.caravan[field] || 0;
  }

  function caravanSupplySaveChance() {
    ensureCaravanState();
    return 0.12 + (state.caravan.farmers / CARAVAN_FOLLOWERS_TOTAL) * 0.28;
  }

  function caravanForageSupplyChance() {
    ensureCaravanState();
    return 0.55 + (state.caravan.farmers / CARAVAN_FOLLOWERS_TOTAL) * 0.2;
  }

  function caravanForageGoldChance() {
    ensureCaravanState();
    return 0.22 + (state.caravan.merchants / CARAVAN_FOLLOWERS_TOTAL) * 0.18;
  }

  function caravanCampHealBonus() {
    ensureCaravanState();
    return (state.caravan.artisans / CARAVAN_FOLLOWERS_TOTAL) * 0.12;
  }

  function caravanFollowersSummary() {
    ensureCaravanState();
    var c = state.caravan;
    return (
      c.total +
      " (" +
      c.farmers +
      " farmers, " +
      c.artisans +
      " artisans, " +
      c.merchants +
      " merchants)"
    );
  }

  function caravanFollowersPanelHtml() {
    ensureCaravanState();
    var c = state.caravan;
    return (
      '<section class="caravan-followers">' +
      '<h3 class="roster-heading">Trail caravan (' +
      c.total +
      " civilians)</h3>" +
      '<p class="roster-note">Farmers, artisans, and merchants march behind your fighters. They do not join tactical combat but support the train on the road.</p>' +
      '<ul class="caravan-followers-list">' +
      "<li><b>" +
      c.farmers +
      " farmers</b> — stretch rations (" +
      Math.round(caravanSupplySaveChance() * 100) +
      "% chance to skip a supply day)</li>" +
      "<li><b>" +
      c.artisans +
      " artisans</b> — mend gear and morale (+" +
      Math.round(caravanCampHealBonus() * 100) +
      "% camp healing)</li>" +
      "<li><b>" +
      c.merchants +
      " merchants</b> — quarter the loot (" +
      lootMultiplier(state.party).toFixed(2) +
      "× with mercenaries)</li>" +
      "<li><b>" +
      (c.thatchers || 0) +
      " thatchers</b> — +" +
      caravanTradeBonus("thatchers") +
      " caravan mending (future)</li>" +
      "<li><b>" +
      (c.stoneMasons || 0) +
      " stone masons</b> — +" +
      caravanTradeBonus("stoneMasons") +
      " stone works in towns (future)</li>" +
      "<li><b>" +
      (c.cobblers || 0) +
      " cobblers</b> — +" +
      caravanTradeBonus("cobblers") +
      " caravan & equipment mending</li>" +
      "<li><b>" +
      (c.blacksmiths || 0) +
      " blacksmiths</b> — +" +
      caravanTradeBonus("blacksmiths") +
      " weapons & town metal (future)</li>" +
      '<li class="caravan-ration-row">Rations: <label><input type="radio" name="rationMode" value="normal"' +
      (state.rationMode !== "stretch" ? " checked" : "") +
      '> Normal</label> <label><input type="radio" name="rationMode" value="stretch"' +
      (state.rationMode === "stretch" ? " checked" : "") +
      "> Stretch (saves supplies, strains morale)</label></li>" +
      "</ul></section>"
    );
  }

  function namesPool() {
    if (typeof window !== "undefined" && window.ILLIRIAL_NAMES) return window.ILLIRIAL_NAMES;
    if (BALANCE_DATA && BALANCE_DATA.characterNames) return BALANCE_DATA.characterNames;
    return null;
  }

  function pickFromNameList(key) {
    var pool = namesPool();
    if (!pool || !pool[key] || !pool[key].length) return null;
    return pool[key][rollInt(0, pool[key].length - 1)];
  }

  function rollCharacterName() {
    var r = Math.random();
    var first =
      r < 0.45 ? pickFromNameList("male") : r < 0.9 ? pickFromNameList("female") : pickFromNameList("neutral");
    var last = pickFromNameList("last");
    if (!first && !last) return "Traveler " + rollInt(1, 99);
    if (!first) return last || "Traveler";
    if (!last) return first;
    return first + " " + last;
  }

  function blessingTypeLabel(type) {
    if (type === "attack") return "War blessing (+1 attack power)";
    if (type === "gold") return "Prosperity blessing (+gold found on the road)";
    if (type === "ward") return "Ward blessing (fewer enemies engage)";
    return "None";
  }

  function hasBlessing(type) {
    if (!state.blessing) return false;
    if (typeof state.blessingExpiresOnDay === "number" && (state.totalDaysElapsed || 0) >= state.blessingExpiresOnDay) {
      return false;
    }
    return state.blessing === type;
  }

  function grantBlessing(type) {
    state.blessing = type;
    state.blessingExpiresOnDay = (state.totalDaysElapsed || 0) + rollInt(1, 8);
  }

  function tickBlessingExpiry() {
    if (!state.blessing || typeof state.blessingExpiresOnDay !== "number") return;
    if ((state.totalDaysElapsed || 0) < state.blessingExpiresOnDay) return;
    var was = blessingTypeLabel(state.blessing);
    state.blessing = null;
    state.blessingExpiresOnDay = null;
    logLine("The chapel's " + was + " fades after a week on the road.", "");
  }

  function roadGoldBonus(baseGold) {
    if (!hasBlessing("gold")) return baseGold;
    return baseGold + 1;
  }

  function addSupplies(amount) {
    if (!amount || amount < 1) return 0;
    var room = Math.max(0, MAX_SUPPLIES - state.food);
    var gain = Math.min(room, amount);
    state.food += gain;
    return gain;
  }

  function monsterDamageForName(name) {
    var lower = (name || "").toLowerCase();
    if (lower.indexOf("dragon") >= 0) return 5;
    if (lower.indexOf("lich king") >= 0) return 4;
    if (lower.indexOf("lich") >= 0) return 3;
    return 2;
  }

  function rollRuinsRoomCount() {
    if (Math.random() < 0.8) return rollInt(1, 6);
    return rollInt(7, RUINS_ROOM_MAX);
  }

  function initRuinsMap() {
    var width = rollInt(4, 6);
    var height = rollInt(4, 6);
    state.ruinsMap = {
      width: width,
      height: height,
      playerX: Math.floor(width / 2),
      playerY: Math.floor(height / 2),
      explored: {},
    };
    markRuinsTileExplored(state.ruinsMap.playerX, state.ruinsMap.playerY);
  }

  function ruinsTileKey(x, y) {
    return x + "," + y;
  }

  function markRuinsTileExplored(x, y) {
    if (!state.ruinsMap) return;
    if (!state.ruinsMap.explored) state.ruinsMap.explored = {};
    state.ruinsMap.explored[ruinsTileKey(x, y)] = true;
  }

  function ruinsMinimapHtml() {
    if (!RUINS_SHOW_MINIMAP) return "";
    var map = state.ruinsMap;
    if (!map) {
      return '<p class="hint">Ruins map initializing...</p>';
    }
    var rows = "";
    for (var y = 0; y < map.height; y++) {
      var cells = "";
      for (var x = 0; x < map.width; x++) {
        var explored = map.explored && map.explored[ruinsTileKey(x, y)];
        var isPlayer = x === map.playerX && y === map.playerY;
        var glyph = isPlayer ? "@" : explored ? "." : "?";
        cells += '<span style="display:inline-block;width:1.4rem;text-align:center;color:' +
          (isPlayer ? "#c89c3f" : explored ? "#9a8b78" : "#4a3d2a") + '">' + glyph + "</span>";
      }
      rows += '<div style="font-family:monospace;line-height:1.35">' + cells + "</div>";
    }
    return (
      '<div class="ruins-minimap" style="margin:1rem 0;padding:.75rem;background:#1c160e;border:1px solid #4a3d2a;border-radius:8px;display:inline-block">' +
        '<div style="color:#c89c3f;font-weight:600;margin-bottom:.35rem">Ruins map (prototype)</div>' +
        rows +
        '<div class="hint" style="margin-top:.5rem">@ = party, ? = unexplored, . = cleared</div>' +
      "</div>"
    );
  }

  function ruinsNavigationPlaceholderHtml() {
    return (
      '<div class="ruins-nav-placeholder" style="margin:.75rem 0">' +
        '<div style="color:#9a8b78;margin-bottom:.35rem">Directional exploration (coming soon)</div>' +
        '<div style="display:grid;grid-template-columns:repeat(3,max-content);gap:.35rem;justify-content:start">' +
          '<span></span><button type="button" disabled title="Coming soon">Up</button><span></span>' +
          '<button type="button" disabled title="Coming soon">Left</button>' +
          '<button type="button" disabled title="Coming soon">Down</button>' +
          '<button type="button" disabled title="Coming soon">Right</button>' +
        '</div>' +
        '<p class="hint" style="margin-top:.35rem">Future update: wander the grid, get lost, and burn supplies. For now, explore the current room below.</p>' +
      "</div>"
    );
  }

  function rollSettlementRecruitSlots(townKey) {
    if (townKey === "solem") return rollInt(2, 3);
    if (townKey === "gustaf" || townKey === "hollow_banks" || townKey === "brookside") {
      var r = Math.random();
      if (r < 0.65) return 0;
      if (r < 0.92) return 1;
      return 2;
    }
    if (townKey === "glennhardt") return PARTY_MAX;
    return PARTY_MAX;
  }

  function settlementRecruitMode(townKey) {
    if (townKey === "solem") return "soldier_only";
    if (townKey === "gustaf" || townKey === "hollow_banks" || townKey === "brookside") return "limited";
    return "open";
  }

  function settlementRecruitNote(townKey) {
    if (townKey === "solem") return "Solem can field 2-3 new soldiers this stay. Slots left: " + (state.settlementRecruitSlots || 0) + ".";
    if (townKey === "brookside") return "Brookside rarely sees hires. Slots this stay: " + (state.settlementRecruitSlots || 0) + ".";
    if (townKey === "glennhardt") return "Glennhardt's guild halls field a full roster. Slots left: " + (state.settlementRecruitSlots || 0) + ".";
    if (townKey === "gustaf" || townKey === "hollow_banks") return "Travelers are scarce here. Random local recruits this stay: " + (state.settlementRecruitSlots || 0) + ".";
    return "Recruit soldiers, priests, mercenaries, or mages for the fighting line.";
  }

  function destinationForKey(key) {
    if (key === "cantebury") {
      return { key: "cantebury", label: "Cantebury", subtitle: "Walled capital at the trailhead", badge: "Capital" };
    }
    return DESTINATIONS[key] || DESTINATIONS.gustaf;
  }

  function currentDestination() {
    return destinationForKey(state && state.travelDestination ? state.travelDestination : "gustaf");
  }

  function locationLabel(key) {
    if (key === "cantebury") return "Cantebury";
    return destinationForKey(key).label;
  }

  function currentOriginLabel() {
    return locationLabel(state && state.travelOrigin ? state.travelOrigin : "cantebury");
  }

  function legRouteKey(originKey, destinationKey) {
    return (originKey || "cantebury") + ">" + (destinationKey || "gustaf");
  }

  function ensureTrailPath() {
    if (!state.trailPath || !state.trailPath.length) state.trailPath = ["cantebury"];
  }

  function canonicalWestwardPath() {
    var lower = state.trailLowerFork || "gustaf";
    var upper = state.trailUpperFork || "hollow_banks";
    return ["cantebury", lower, upper, "solem", "new_isil"];
  }

  function appendTrailPathTown(townKey) {
    if (!townKey || townKey === "cantebury") return;
    ensureTrailPath();
    if (state.trailPath.indexOf(townKey) >= 0) return;
    state.trailPath.push(townKey);
  }

  function resetTrailPathForWestwardMarch() {
    state.trailPath = ["cantebury"];
    state.trailLowerFork = null;
    state.trailUpperFork = null;
  }

  function recordWestboundForkChoice(originKey, destKey) {
    if (originKey === "cantebury" && TRAIL_FORK_LOWER.indexOf(destKey) >= 0) state.trailLowerFork = destKey;
    if (TRAIL_FORK_LOWER.indexOf(originKey) >= 0 && TRAIL_FORK_UPPER.indexOf(destKey) >= 0) state.trailUpperFork = destKey;
  }

  function westboundForkDestinations(originKey) {
    if (originKey === "cantebury") return TRAIL_FORK_LOWER.slice();
    if (TRAIL_FORK_LOWER.indexOf(originKey) >= 0) return TRAIL_FORK_UPPER.slice();
    if (TRAIL_FORK_UPPER.indexOf(originKey) >= 0) return ["solem"];
    if (originKey === "solem") return ["new_isil"];
    return [];
  }

  function pathPreviousTown(fromTownKey) {
    if (fromTownKey === "cantebury") return null;
    ensureTrailPath();
    var idx = state.trailPath.indexOf(fromTownKey);
    if (idx > 0) return state.trailPath[idx - 1];
    var canon = canonicalWestwardPath();
    var ci = canon.indexOf(fromTownKey);
    if (ci > 0) return canon[ci - 1];
    if (fromTownKey === "new_isil") return "solem";
    if (fromTownKey === "solem") return state.trailUpperFork || "hollow_banks";
    if (TRAIL_FORK_UPPER.indexOf(fromTownKey) >= 0) return state.trailLowerFork || "gustaf";
    if (TRAIL_FORK_LOWER.indexOf(fromTownKey) >= 0) return "cantebury";
    return "cantebury";
  }

  function totalWestwardTrailDays() {
    var path = state.trailLowerFork && state.trailUpperFork ? canonicalWestwardPath() : state.trailPath;
    if (!path || path.length < 2) return ROUTE_DAYS_MAX * 4;
    var sum = 0;
    var i;
    for (i = 1; i < path.length; i++) sum += cachedLegDays(path[i - 1], path[i]);
    return Math.max(1, sum);
  }

  function resolveLegRouteDays(originKey, destinationKey) {
    if (!state.legDaysByRoute) state.legDaysByRoute = {};
    var key = legRouteKey(originKey, destinationKey);
    var cached = state.legDaysByRoute[key];
    if (typeof cached === "number" && cached > 0) return cached;
    if (isEastboundLeg(originKey, destinationKey)) {
      var reverseKey = legRouteKey(destinationKey, originKey);
      var mirror = state.legDaysByRoute[reverseKey];
      if (typeof mirror === "number" && mirror > 0) {
        state.legDaysByRoute[key] = mirror;
        return mirror;
      }
    }
    var days = rollInt(ROUTE_DAYS_MIN, ROUTE_DAYS_MAX);
    state.legDaysByRoute[key] = days;
    return days;
  }

  function routeDaysForLeg(originKey, destinationKey) {
    if (state && state.legDaysByRoute) {
      var stored = state.legDaysByRoute[legRouteKey(originKey, destinationKey)];
      if (typeof stored === "number" && stored > 0) return stored;
    }
    return Math.floor((ROUTE_DAYS_MIN + ROUTE_DAYS_MAX) / 2);
  }

  function cachedLegDays(originKey, destinationKey) {
    if (state.legDaysByRoute) {
      var stored = state.legDaysByRoute[legRouteKey(originKey, destinationKey)];
      if (typeof stored === "number" && stored > 0) return stored;
    }
    return routeDaysForLeg(originKey, destinationKey);
  }

  function rollRouteDaysForDestination(destinationKey) {
    var origin = state && state.travelOrigin ? state.travelOrigin : "cantebury";
    return resolveLegRouteDays(origin, destinationKey);
  }

  function legDepartDaysHint(originKey, destinationKey) {
    if (isEastboundLeg(originKey, destinationKey)) {
      var ret =
        state.legDaysByRoute && state.legDaysByRoute[legRouteKey(originKey, destinationKey)];
      var d =
        typeof ret === "number" && ret > 0
          ? ret
          : routeDaysForLeg(originKey, destinationKey);
      return " (" + d + " days eastbound)";
    }
    var d =
      state.legDaysByRoute && state.legDaysByRoute[legRouteKey(originKey, destinationKey)];
    if (typeof d === "number" && d > 0) return " (" + d + " days)";
    return " (3–10 days, set on departure)";
  }

  function trailTownStage(townKey) {
    if (TRAIL_TOWN_STAGE.hasOwnProperty(townKey)) return TRAIL_TOWN_STAGE[townKey];
    return -1;
  }

  function trailTownIndex(townKey) {
    return trailTownStage(townKey);
  }

  function trailPathIndex(townKey) {
    ensureTrailPath();
    var idx = state.trailPath.indexOf(townKey);
    if (idx >= 0) return idx;
    return trailTownStage(townKey);
  }

  function markTrailTownVisited(townKey) {
    if (!townKey || townKey === "cantebury") return;
    if (!state.visitedTrailTowns) state.visitedTrailTowns = [];
    if (state.visitedTrailTowns.indexOf(townKey) >= 0) return;
    state.visitedTrailTowns.push(townKey);
  }

  /** Toward New Isil = westward; marching back down the trail = eastbound. */
  function isEastboundLeg(originKey, destinationKey) {
    if (destinationKey === "cantebury") return true;
    ensureTrailPath();
    var oi = state.trailPath.indexOf(originKey);
    var di = state.trailPath.indexOf(destinationKey);
    if (oi >= 0 && di >= 0) return di < oi;
    var os = trailTownStage(originKey);
    var ds = trailTownStage(destinationKey);
    if (os < 0 || ds < 0) return destinationKey === "cantebury";
    return ds < os;
  }

  function travelDirectionAdverb(originKey, destinationKey) {
    return isEastboundLeg(originKey, destinationKey) ? "eastbound" : "westward";
  }

  function travelDirectionClause(originKey, destinationKey) {
    return (
      travelDirectionAdverb(originKey, destinationKey) +
      " toward " +
      destinationForKey(destinationKey).label
    );
  }

  function eastboundRevisitTargets(fromTownKey) {
    if (fromTownKey === "cantebury") return [];
    var out = [];
    var prev = pathPreviousTown(fromTownKey);
    var path = state.trailLowerFork && state.trailUpperFork ? canonicalWestwardPath() : state.trailPath || ["cantebury"];
    var fromIdx = path.indexOf(fromTownKey);
    var visited = state.visitedTrailTowns || [];
    var i;
    var key;
    if (prev && out.indexOf(prev) < 0) out.push(prev);
    for (i = path.length - 1; i >= 0; i--) {
      key = path[i];
      if (key === fromTownKey || key === "cantebury") continue;
      if (fromIdx >= 0 && i >= fromIdx) continue;
      if (visited.indexOf(key) >= 0 && out.indexOf(key) < 0) out.push(key);
    }
    var fromStage = trailTownStage(fromTownKey);
    for (i = 0; i < visited.length; i++) {
      key = visited[i];
      if (key === fromTownKey || out.indexOf(key) >= 0) continue;
      if (trailTownStage(key) < fromStage && out.indexOf(key) < 0) out.push(key);
    }
    out.sort(function (a, b) {
      var pa = path.indexOf(a);
      var pb = path.indexOf(b);
      if (pa >= 0 && pb >= 0) return pb - pa;
      return trailTownStage(b) - trailTownStage(a);
    });
    if (out.indexOf("cantebury") < 0 && fromTownKey !== "cantebury") out.push("cantebury");
    return out;
  }

  function trailLegIndex(originKey) {
    return trailPathIndex(originKey);
  }

  function monsterHpMultiplierForProgress() {
    var origin = state && state.travelOrigin ? state.travelOrigin : "cantebury";
    var legIndex = trailLegIndex(origin);
    var routeDays = Math.max(1, currentRouteDays());
    var dayRatio = Math.min(1, Math.max(0, (state && state.travelDay ? state.travelDay : 0) / routeDays));
    return 1 + legIndex * 0.35 + dayRatio * 0.15;
  }

  function currentRouteDays() {
    if (state && state.legRouteDays && state.legRouteDays > 0) return state.legRouteDays;
    var origin = state && state.travelOrigin ? state.travelOrigin : "cantebury";
    var dest = state && state.travelDestination ? state.travelDestination : "gustaf";
    return resolveLegRouteDays(origin, dest);
  }

  function levelKValue(level) {
    var tune = BALANCE_DATA && BALANCE_DATA.hpGrowthTuning ? BALANCE_DATA.hpGrowthTuning : null;
    var model = tune && tune.selectedModel ? tune.selectedModel : "optimal";
    if (model === "conservative") return Math.ceil(1.2 * level) + 2;
    if (model === "optimalA") return level;
    return level + 1;
  }

  function memberBaseStats(member) {
    if (member && member.stats) {
      return cloneStats(member.stats);
    }
    if (member && member.id === "p0" && state && state.leaderProfile && state.leaderProfile.stats) {
      return cloneStats(state.leaderProfile.stats);
    }
    return baseStatsForRole(member && member.role ? member.role : "soldier");
  }

  var NON_SPELLCASTER_ROLES = { mercenary: true };

  function memberMaxMp(member) {
    if (!member) return 25;
    if (NON_SPELLCASTER_ROLES[member.role]) return 25;
    if (member.stats && typeof member.stats.intelligence === "number") {
      return 25 + Math.max(0, member.stats.intelligence - 4) * 5;
    }
    var bonusInt = (member.bonus && member.bonus.intelligence) || 0;
    return 25 + bonusInt * 5;
  }

  function memberBaseMaxHp(member) {
    var role = (member && member.role) || "soldier";
    var baseHp = CLASS_HP[role] || 1;
    if (member && member.stats && typeof member.stats.stamina === "number") {
      return baseHp + Math.max(0, member.stats.stamina - 4) * 2;
    }
    var bonusStam = (member && member.bonus && member.bonus.stamina) || 0;
    return baseHp + bonusStam * 2;
  }

  function memberMaxHp(member) {
    return memberBaseMaxHp(member) + equipmentHpBonus(member);
  }

  function hpGainOnLevel(member) {
    var st = memberBaseStats(member);
    var level = member && typeof member.level === "number" ? member.level : 1;
    var base = Math.ceil((st.stamina || 0) / 2);
    var raw = base + rollInt(0, level);
    var gain = Math.max(1, raw - levelKValue(level));
    return gain;
  }

  function initMemberProgress(member) {
    if (!member) return member;
    if (typeof member.level !== "number" || member.level < 1) member.level = 1;
    if (typeof member.xp !== "number" || member.xp < 0) member.xp = 0;
    if (!member.bonus) {
      member.bonus = { strength: 0, intelligence: 0, stamina: 0, luck: 0 };
    }
    if (!member.stats) {
      var base = baseStatsForRole(member.role || "soldier");
      member.stats = {
        strength: (base.strength || 0) + (member.bonus.strength || 0),
        intelligence: (base.intelligence || 0) + (member.bonus.intelligence || 0),
        stamina: (base.stamina || 0) + (member.bonus.stamina || 0),
        luck: (base.luck || 0) + (member.bonus.luck || 0),
      };
    }
    var derivedMaxHp = memberMaxHp(member);
    if (typeof member.maxHp !== "number" || member.maxHp < derivedMaxHp) member.maxHp = derivedMaxHp;
    if (typeof member.hp !== "number" || member.hp < 0) member.hp = member.maxHp;
    var derivedMaxMp = memberMaxMp(member);
    if (typeof member.maxMp !== "number" || member.maxMp < derivedMaxMp) member.maxMp = derivedMaxMp;
    if (typeof member.mp !== "number" || member.mp < 0) member.mp = member.maxMp;
    if (member.mp > member.maxMp) member.mp = member.maxMp;
    if (member.hp > member.maxHp) member.hp = member.maxHp;
    ensureMemberEquipment(member);
    return member;
  }

  var PARTY_ROLES = ["soldier", "priest", "mercenary", "mage"];

  function rollRandomPartyRoles(count) {
    var n = count || PARTY_MAX;
    var roles = [];
    for (var i = 0; i < n; i++) {
      roles.push(PARTY_ROLES[rollInt(0, PARTY_ROLES.length - 1)]);
    }
    return roles;
  }

  function buildPartyFromRoles(roles) {
    var out = [];
    var used = {};
    for (var i = 0; i < roles.length; i++) {
      var role = roles[i];
      var portrait = pickUniquePortrait(role, null, used);
      out.push(
        initMemberProgress({
          id: "p" + i,
          name: rollCharacterName(),
          role: role,
          gender: portrait.gender,
          headshot: portrait.headshot,
          hp: CLASS_HP[role],
          maxHp: CLASS_HP[role],
        })
      );
      if (portrait.headshot) used[portrait.headshot] = true;
    }
    return out;
  }

  function createParty() {
    return buildPartyFromRoles(rollRandomPartyRoles(PARTY_MAX));
  }


  function cloneStats(stats) {
    return {
      strength: stats.strength,
      intelligence: stats.intelligence,
      stamina: stats.stamina,
      luck: stats.luck,
    };
  }

  function baseStatsForRole(role) {
    return cloneStats(CLASS_BASE_STATS[role] || CLASS_BASE_STATS.soldier);
  }

  function cloneLeaderProfile(src) {
    var b = src && src.bonus ? src.bonus : null;
    return {
      name: src.name,
      role: src.role,
      age: src.age,
      hometown: src.hometown,
      bio: src.bio,
      gender: src.gender || "man",
      headshot: src.headshot || "",
      stats: src.stats ? cloneStats(src.stats) : baseStatsForRole(src.role),
      bonus: {
        strength: (b && b.strength) || 0,
        intelligence: (b && b.intelligence) || 0,
        stamina: (b && b.stamina) || 0,
        luck: (b && b.luck) || 0,
      },
      source: src.source || "custom",
    };
  }

  function totalBonusPoints(bonus) {
    var sum = 0;
    for (var i = 0; i < STAT_KEYS.length; i++) sum += bonus[STAT_KEYS[i]] || 0;
    return sum;
  }

  function currentLeaderDraft() {
    if (!state.newLeaderDraft) {
      state.newLeaderDraft = {
        name: "",
        role: "soldier",
        age: 28,
        hometown: "Cantebury",
        bio: "",
        gender: "man",
        headshot: "",
        headshotShowCount: 5,
        bonus: { strength: 0, intelligence: 0, stamina: 0, luck: 0 },
      };
    }
    return state.newLeaderDraft;
  }

  function setLeaderDraftField(key, value) {
    var draft = currentLeaderDraft();
    draft[key] = value;
  }

  function adjustLeaderDraftBonus(stat, delta) {
    var draft = currentLeaderDraft();
    if (!draft.bonus) draft.bonus = { strength: 0, intelligence: 0, stamina: 0, luck: 0 };
    var cur = draft.bonus[stat] || 0;
    var used = totalBonusPoints(draft.bonus);
    if (delta > 0 && used >= CLASS_BONUS_POINTS) return;
    if (delta < 0 && cur <= 0) return;
    draft.bonus[stat] = cur + delta;
  }

  function leaderDraftFinalStats(draft) {
    var base = baseStatsForRole(draft.role);
    return {
      strength: base.strength + (draft.bonus.strength || 0),
      intelligence: base.intelligence + (draft.bonus.intelligence || 0),
      stamina: base.stamina + (draft.bonus.stamina || 0),
      luck: base.luck + (draft.bonus.luck || 0),
    };
  }

  function beginRunWithLeader(profile) {
    var lead = cloneLeaderProfile(profile);
    state.leaderProfile = lead;
    state.newLeaderDraft = null;

    if (lead.source === "preset") {
      var presetRoles = rollRandomPartyRoles(PARTY_MAX);
      var roleCounts = {};
      for (var prc = 0; prc < presetRoles.length; prc++) {
        var rname = presetRoles[prc];
        roleCounts[rname] = (roleCounts[rname] || 0) + 1;
      }
      var countParts = [];
      for (var rk in roleCounts) {
        if (roleCounts.hasOwnProperty(rk)) {
          countParts.push(roleCounts[rk] + " " + roleLabel(rk) + (roleCounts[rk] > 1 ? "s" : ""));
        }
      }
      state.party = buildPartyFromRoles(presetRoles);
      state.partyIdSeq = state.party.length;
      if (state.party[0]) {
        state.party[0].name = lead.name;
        state.party[0].role = lead.role;
        state.party[0].bonus = {
          strength: (lead.bonus && lead.bonus.strength) || 0,
          intelligence: (lead.bonus && lead.bonus.intelligence) || 0,
          stamina: (lead.bonus && lead.bonus.stamina) || 0,
          luck: (lead.bonus && lead.bonus.luck) || 0,
        };
        var leadBase0 = baseStatsForRole(state.party[0].role);
        state.party[0].stats = {
          strength: (leadBase0.strength || 0) + state.party[0].bonus.strength,
          intelligence: (leadBase0.intelligence || 0) + state.party[0].bonus.intelligence,
          stamina: (leadBase0.stamina || 0) + state.party[0].bonus.stamina,
          luck: (leadBase0.luck || 0) + state.party[0].bonus.luck,
        };
        state.party[0].maxHp = memberMaxHp(state.party[0]);
        state.party[0].hp = state.party[0].maxHp;
        state.party[0].maxMp = memberMaxMp(state.party[0]);
        state.party[0].mp = state.party[0].maxMp;
      }
      logLine(
        "Preset caravan assembled: <span class=\"hi\">" +
          countParts.join(", ") +
          "</span>. " +
          caravanFollowersSummary() +
          " march in the train.",
        "good"
      );
    } else {
      state.party = [
        initMemberProgress({
          id: "p0",
          name: lead.name,
          role: lead.role,
          bonus: {
            strength: (lead.bonus && lead.bonus.strength) || 0,
            intelligence: (lead.bonus && lead.bonus.intelligence) || 0,
            stamina: (lead.bonus && lead.bonus.stamina) || 0,
            luck: (lead.bonus && lead.bonus.luck) || 0,
          },
        }),
      ];
      state.partyIdSeq = 1;
      logLine(
        "You begin with only your leader. Recruit up to " +
          PARTY_MAX +
          " fighters in the tavern. " +
          caravanFollowersSummary() +
          " march with the train.",
        "hi"
      );
    }

    state.food = Math.min(MAX_SUPPLIES, state.food + (state.water || 0));
    state.water = 0;
    if (state.party[0]) {
      if (!state.party[0].gender) state.party[0].gender = lead.gender || "man";
      if (!state.party[0].headshot && lead.headshot) state.party[0].headshot = lead.headshot;
    }
    for (var pi = 0; pi < state.party.length; pi++) {
      var pm = state.party[pi];
      initMemberProgress(pm);
      pm.hp = pm.maxHp;
      pm.mp = pm.maxMp;
    }
    assignMissingPartyPortraits();
    if (state.party[0] && state.leaderProfile) {
      if (!state.leaderProfile.gender) state.leaderProfile.gender = state.party[0].gender || "man";
      if (!state.leaderProfile.headshot) state.leaderProfile.headshot = state.party[0].headshot || "";
    }
    state.inventoryFocusId = state.party[0].id;
    state.inventoryHealTargetId = state.party[0].id;
    state.inventoryDetailOpen = false;
    state.travelInventoryOpen = false;
    state.illiriView = "castle";
    state.keepView = "hall";
    state.cityView = "shop";
    state.playthrough = claimPlaythroughNumber();
    state.runId = "run-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
    state.phase = "story_illiri";
    logLine("Caravan leader ready: <span class=\"hi\">" + lead.name + "</span> (" + roleLabel(lead.role) + ").", "good");
    trackPlaytest("run_started", {
      leaderRole: lead.role,
      leaderSource: lead.source || "custom",
      partySize: state.party.length,
      playthrough: state.playthrough,
      version: GAME_VERSION,
    });
  }

  function initialState() {
    return {
      phase: "new_game_setup",
      gold: 100,
      gems: 0,
      food: 10,
      healingPotions: 0,
      lifePotions: 0,
      water: 0,
      weapons: 0,
      weaponInventory: [],
      party: createParty(),
      partyIdSeq: 5,
      illiriView: "castle",
      keepView: "hall",
      cityView: "shop",
      travelOrigin: "cantebury",
      travelDestination: "gustaf",
      guest: null,
      travelDay: 0,
      legRouteDays: 0,
      legDaysByRoute: {},
      encounterChance: ENCOUNTER_BASE,
      ruinsDiscovered: false,
      ruinsTravelDay: null,
      ruinsSearched: false,
      ruinsRoomsTotal: 0,
      ruinsRoomsRemaining: 0,
      ruinsMap: null,
      log: [],
      pendingEncounter: null,
      combat: null,
      transition: null,
      blessing: null,
      blessingExpiresOnDay: null,
      rationMode: "normal",
      stretchedRationDays: 0,
      caravanDeliveredToNewIsil: false,
      onReturnMarch: false,
      trailPath: ["cantebury"],
      trailLowerFork: null,
      trailUpperFork: null,
      visitedTrailTowns: [],
      leaderProfile: null,
      newLeaderDraft: null,
      inventoryFocusId: "p0",
      inventoryHealTargetId: "p0",
      dollStyleByMember: {},
      inventoryDetailOpen: false,
      travelInventoryOpen: false,
      settlementTown: null,
      settlementView: "church",
      settlementRecruitSlots: 0,
      settlementRecruitMode: "open",
      gameoverMode: null,
      finalBossCleared: false,
      finalHarborBossDefeated: false,
      stabilityExtendedTarget: 0,
      stabilityExtensionNoted: false,
      headstones: loadHeadstonesFromStorage(),
      headstonesIdSeq: 0,
      runId: "run-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      playthrough: 0,
      adventure: null,
      elaraDialog: null,
      elaraDialogShown: false,
      totalDaysElapsed: 0,
      caravanLoops: 0,
      newIsilSettlers: [],
      newIsilGrowth: { population: NEW_ISIL_BASE_POPULATION },
      gearStash: ["travel_knife", "leather_coat", "lucky_ring", "travel_charm"],
      winReason: null,
      stableRestDays: 0,
      quest: null,
      questsCompleted: [],
      questDialog: null,
      npcDialog: null,
      caravan: defaultCaravanFollowers(),
    };
  }

  var HEADSTONE_STORAGE_KEY = "illirial.headstones";
  var HEADSTONE_STORAGE_BACKUP_KEY = "illirial.headstones.backup";
  var HEADSTONE_RELEASE_PHASE = "alpha";
  var PLAYTHROUGH_COUNTER_KEY = "illirial.playthrough.next";

  function claimPlaythroughNumber() {
    var n = 1;
    try {
      if (typeof localStorage !== "undefined") {
        var parsed = parseInt(localStorage.getItem(PLAYTHROUGH_COUNTER_KEY), 10);
        if (parsed > 0) n = parsed;
        localStorage.setItem(PLAYTHROUGH_COUNTER_KEY, String(n + 1));
      }
    } catch (e) { /* ignore */ }
    return n;
  }

  /** Version as 3-digit memorial code (e.g. 5.4.6 → 546). */
  function versionMemorialCode(versionStr) {
    var parts = String(versionStr || GAME_VERSION || "0")
      .replace(/[^0-9.]/g, "")
      .split(".");
    var major = parseInt(parts[0], 10) || 0;
    var minor = parseInt(parts[1], 10) || 0;
    var patch = parseInt(parts[2], 10) || 0;
    var code = major * 100 + minor * 10 + patch;
    if (code > 999) code = code % 1000;
    return String(code).padStart(3, "0");
  }

  function padJourneyDaysForMemorial(days) {
    var n = Math.max(0, parseInt(days, 10) || 0);
    if (n > 99) return "99";
    return (n < 10 ? "0" : "") + String(n);
  }

  function buildMemorialDate(playthrough, journeyDays, versionStr) {
    var run = Math.max(1, parseInt(playthrough, 10) || 1);
    return run + "." + padJourneyDaysForMemorial(journeyDays) + "." + versionMemorialCode(versionStr);
  }

  function formatMemorialDate(hs) {
    if (!hs) return buildMemorialDate(1, 0, "0.0.0");
    if (hs.memorialDate) return hs.memorialDate;
    var run = Math.max(1, parseInt(hs.playthrough, 10) || 1);
    var days = typeof hs.journeyDays === "number" ? hs.journeyDays : hs.day || 0;
    if (hs.gameVersionAtDeath) {
      return buildMemorialDate(run, days, hs.gameVersionAtDeath);
    }
    if (hs.versionCode) {
      return run + "." + padJourneyDaysForMemorial(days) + "." + String(hs.versionCode).padStart(3, "0");
    }
    return run + "." + padJourneyDaysForMemorial(days) + ".000";
  }

  function freezeHeadstoneMemorial(hs) {
    if (!hs) return;
    if (!hs.memorialDate) hs.memorialDate = formatMemorialDate(hs);
  }

  function normalizeHeadstoneEntry(hs) {
    if (!hs || typeof hs !== "object") return hs;
    freezeHeadstoneMemorial(hs);
    return hs;
  }

  function memorialDateHintHtml() {
    return '<span class="hint">Date inscribed as playthrough.journeyDays.version (e.g. 3.12.546).</span>';
  }

  function loadHeadstonesFromStorage() {
    try {
      if (typeof localStorage === "undefined") return [];
      var raw = localStorage.getItem(HEADSTONE_STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(normalizeHeadstoneEntry);
      if (parsed && Array.isArray(parsed.entries)) return parsed.entries.map(normalizeHeadstoneEntry);
    } catch (e) { /* ignore */ }
    try {
      if (typeof localStorage === "undefined") return [];
      var rawBackup = localStorage.getItem(HEADSTONE_STORAGE_BACKUP_KEY);
      if (!rawBackup) return [];
      var parsedBackup = JSON.parse(rawBackup);
      if (Array.isArray(parsedBackup)) return parsedBackup.map(normalizeHeadstoneEntry);
      if (parsedBackup && Array.isArray(parsedBackup.entries)) return parsedBackup.entries.map(normalizeHeadstoneEntry);
    } catch (e2) { /* ignore */ }
    return [];
  }

  function saveHeadstonesToStorage() {
    try {
      if (typeof localStorage === "undefined") return;
      var payload = {
        schemaVersion: 1,
        phase: HEADSTONE_RELEASE_PHASE,
        savedAt: Date.now(),
        entries: state.headstones || [],
      };
      var serialized = JSON.stringify(payload);
      localStorage.setItem(HEADSTONE_STORAGE_KEY, serialized);
      localStorage.setItem(HEADSTONE_STORAGE_BACKUP_KEY, serialized);
    } catch (e) { /* ignore */ }
  }

  function ensureHeadstonesState() {
    if (!state.headstones) state.headstones = [];
    if (typeof state.headstonesIdSeq !== "number") state.headstonesIdSeq = state.headstones.length;
    if (!state.runId) state.runId = "run-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
  }

  function currentLocationLabelForHeadstone() {
    var phase = state && state.phase;
    if (phase === "story_illiri") return locationLabel("cantebury");
    if (phase === "settlement" && state.settlementTown) return locationLabel(state.settlementTown);
    var origin = locationLabel(state.travelOrigin || "cantebury");
    var dest = currentDestination();
    return "the road between " + origin + " and " + (dest && dest.label ? dest.label : "the next stop");
  }

  function snapshotMemberDeathContext(m) {
    if (!m || m.diedGameVersion) return;
    ensureHeadstonesState();
    if (!state.playthrough) state.playthrough = claimPlaythroughNumber();
    m.diedGameVersion = GAME_VERSION;
    m.diedJourneyDays = state.totalDaysElapsed || 0;
    m.diedPlaythrough = state.playthrough;
    m.diedTravelDay = state.travelDay;
  }

  function clearMemberDeathSnapshot(m) {
    if (!m) return;
    m.diedGameVersion = undefined;
    m.diedJourneyDays = undefined;
    m.diedPlaythrough = undefined;
    m.diedTravelDay = undefined;
  }

  function makeHeadstoneForMember(m) {
    ensureHeadstonesState();
    snapshotMemberDeathContext(m);
    if (!state.playthrough) state.playthrough = claimPlaythroughNumber();
    var versionStr = m.diedGameVersion || GAME_VERSION;
    var journeyDays =
      typeof m.diedJourneyDays === "number" ? m.diedJourneyDays : state.totalDaysElapsed || 0;
    var playthrough = m.diedPlaythrough || state.playthrough;
    var verCode = versionMemorialCode(versionStr);
    var memorialDate = buildMemorialDate(playthrough, journeyDays, versionStr);
    state.headstonesIdSeq += 1;
    return {
      id: "hs-" + Date.now() + "-" + state.headstonesIdSeq,
      runId: state.runId,
      memberId: m.id,
      name: m.name,
      role: m.role,
      day: typeof m.diedTravelDay === "number" ? m.diedTravelDay : state.travelDay,
      journeyDays: journeyDays,
      playthrough: playthrough,
      gameVersionAtDeath: versionStr,
      versionCode: verCode,
      memorialDate: memorialDate,
      location: currentLocationLabelForHeadstone(),
      town: null,
      note: "",
    };
  }

  function setHeadstoneNote(hsId, note) {
    ensureHeadstonesState();
    for (var i = 0; i < state.headstones.length; i++) {
      if (state.headstones[i].id === hsId) {
        state.headstones[i].note = (note || "").slice(0, 200);
        state.headstones[i].frozen = true;
        freezeHeadstoneMemorial(state.headstones[i]);
        saveHeadstonesToStorage();
        return true;
      }
    }
    return false;
  }

  function isHeadstoneFrozen(hs) {
    if (!hs) return false;
    if (hs.frozen === true) return true;
    if (typeof hs.note === "string" && hs.note.length > 0) return true;
    return false;
  }

  function internPendingHeadstones() {
    ensureHeadstonesState();
    var townKey = state && state.settlementTown;
    if (!townKey) return 0;
    var any = 0;
    for (var i = 0; i < state.headstones.length; i++) {
      var hs = state.headstones[i];
      if (!hs.town && hs.runId === state.runId) {
        hs.town = townKey;
        any++;
      }
    }
    if (any > 0) {
      saveHeadstonesToStorage();
      logLine(any + " fallen comrade" + (any > 1 ? "s are" : " is") + " interred at " + locationLabel(townKey) + ".", "");
    }
    return any;
  }

  var state = initialState();
  assignMissingPartyPortraits();

  function logLine(html, cls) {
    state.log.unshift({ html: html, cls: cls || "" });
    if (state.log.length > 80) state.log.length = 80;
  }

  function partyAlive() {
    return state.party.filter(function (p) {
      return p.hp > 0;
    });
  }

  function allDead() {
    return partyAlive().length === 0;
  }

  function combatTeam() {
    var list = partyAlive().slice();
    if (state.guest && state.guest.hp > 0) {
      list.push({
        id: "guest",
        name: state.guest.name,
        role: state.guest.role || "soldier",
        hp: state.guest.hp,
        maxHp: state.guest.maxHp,
        isGuest: true,
      });
    }
    return list;
  }

  function teamMemberById(id) {
    if (id === "guest" && state.guest) return state.guest;
    for (var i = 0; i < state.party.length; i++) if (state.party[i].id === id) return state.party[i];
    return null;
  }

  function healMember(id, amt) {
    var m = teamMemberById(id);
    if (!m || m.hp <= 0) return;
    m.hp = Math.min(m.maxHp, m.hp + amt);
  }

  function damageMember(id, amt) {
    var m = teamMemberById(id);
    if (!m || m.hp <= 0) return;
    m.hp -= amt;
    if (m.hp < 0) m.hp = 0;
    if (m.hp <= 0) snapshotMemberDeathContext(m);
    if (id === "guest" && state.guest) state.guest.hp = m.hp;
  }

  function endOfDayPriestHealing() {
    return;
  }

  function rollTravelEncounter() {
    var chance = state.encounterChance;
    if (state.phase === "adventure" && state.adventure && state.adventure.town === "cantebury") {
      chance *= CANTEBURY_ADVENTURE_ENCOUNTER_MULT;
    }
    if (Math.random() < chance) {
      state.encounterChance = ENCOUNTER_BASE;
      return true;
    }
    state.encounterChance = Math.min(state.encounterChance + ENCOUNTER_STEP, ENCOUNTER_CAP);
    return false;
  }

  function randomBalanceMonster(pool) {
    var src = pool && pool.length ? pool : BALANCE_MONSTERS;
    if (!src.length) return { name: "Bandit", atk: 2, hp: 5 };
    return src[rollInt(0, src.length - 1)];
  }

  function isWolfMonsterName(name) {
    return (name || "").toLowerCase().indexOf("wolf") >= 0;
  }

  // Level gating per the design rules:
  // - Road, origin in {cantebury, gustaf}: only L1/L2 (you are still approaching Hollow Banks).
  // - Road, origin in {hollow_banks, solem}: 10% chance for L3 to join the L1/L2 pool.
  // - Ruins, origin != solem: L1/L2 only.
  // - Ruins, origin === solem (i.e., past Solem on the way to New Isil): 20% chance L3 joins.
  function allowedLevelsForRoadEncounter() {
    var origin = (state && state.travelOrigin) || "cantebury";
    if (origin === "hollow_banks" || origin === "solem") {
      if (Math.random() < 0.05) return [1, 2, 3];
    }
    return [1, 2];
  }

  function allowedLevelsForRuinsEncounter() {
    var origin = (state && state.travelOrigin) || "cantebury";
    if (origin === "solem") {
      if (Math.random() < 0.10) return [1, 2, 3];
    }
    return [1, 2];
  }

  function buildRandomMonsterEncounter(sourceKind) {
    var allowed;
    if (sourceKind === "ruins") {
      allowed = allowedLevelsForRuinsEncounter();
    } else if (sourceKind === "adventure") {
      var advTown = (state.adventure && state.adventure.town) || (state.settlementTown || "cantebury");
      allowed = allowedLevelsForAdventureEncounter(advTown);
    } else {
      allowed = allowedLevelsForRoadEncounter();
    }
    var pool = BALANCE_MONSTERS.filter(function (m) {
      var lvl = (m && m.level) || 1;
      return allowed.indexOf(lvl) >= 0;
    });
    if (!pool.length) pool = BALANCE_MONSTERS.slice();
    var archetype = randomBalanceMonster(pool);
    var wolfPack = isWolfMonsterName(archetype && archetype.name);
    var n = wolfPack ? rollInt(3, 6) : rollInt(1, 4);
    if (hasBlessing("ward")) n = Math.max(wolfPack ? 3 : 1, n - 1);
    var wolfPool = pool.filter(function (m) {
      return isWolfMonsterName(m && m.name);
    });
    if (!wolfPool.length) wolfPool = [archetype];
    var list = [];
    for (var i = 0; i < n; i++) {
      var mon = wolfPack ? randomBalanceMonster(wolfPool) : randomBalanceMonster(pool);
      var baseMonsterHp = Math.max(1, parseInt(mon && mon.hp, 10) || 1);
      var scaledMonsterHp = Math.max(1, Math.round(baseMonsterHp * monsterHpMultiplierForProgress()));
      list.push({
        id: "m" + i,
        name: mon.name,
        hp: scaledMonsterHp,
        maxHp: scaledMonsterHp,
        dmg: monsterDamageForName(mon.name),
        level: (mon && mon.level) || 1,
      });
    }
    var src = sourceKind || "road";
    return { kind: "monster_pack", label: n + " random monster(s) [" + src + "]", foes: list };
  }

  function buildNewIsilBossEncounter() {
    return {
      kind: "new_isil_gate_boss",
      label: "SK Kew Kumber and his lich kings",
      foes: [
        {
          id: "boss-sk-kumber",
          name: "SK Kew Kumber",
          hp: 100,
          maxHp: 100,
          dmg: 5,
          portrait: "SK Kew Kumber.jpeg",
          level: 3,
        },
        { id: "boss-lich-1", name: "Lich King", hp: 30, maxHp: 30, dmg: 4, level: 3 },
        { id: "boss-lich-2", name: "Lich King", hp: 30, maxHp: 30, dmg: 4, level: 3 },
      ],
    };
  }

  function ruinsDiscoveryChance() {
    var destKey = currentDestination().key;
    var base = RUINS_BASE_CHANCE;
    var bonus = RUINS_DAY_BONUS;
    var cap = RUINS_MAX_CHANCE;
    if (destKey === "gustaf") {
      base = 0.2;
      bonus = 0.1;
      cap = 0.7;
    } else if (destKey === "hollow_banks") {
      base = 0.22;
      bonus = 0.11;
      cap = 0.74;
    } else if (destKey === "solem") {
      base = 0.25;
      bonus = 0.12;
      cap = 0.8;
    } else if (destKey === "new_isil") {
      base = 0.28;
      bonus = 0.13;
      cap = 0.84;
    }
    var byDay = base + Math.max(0, state.travelDay - 1) * bonus;
    return Math.min(byDay, cap);
  }

  function rollFieldEncounterType() {
    if (!state.ruinsDiscovered && Math.random() < ruinsDiscoveryChance()) return "ruins_discovery";
    return "monster";
  }

  function startTacticalCombat(enc) {
    state.phase = "action";
    state.pendingEncounter = enc;
    var ambushed = rollAmbush(enc.foes || []);
    state.combat = {
      kind: enc.kind,
      foes: enc.foes.map(function (f) {
        return {
          id: f.id,
          name: f.name,
          hp: f.hp,
          maxHp: f.maxHp,
          dmg: f.dmg,
          portrait: f.portrait || "",
          level: f.level || 1,
        };
      }),
      choices: {},
      defending: {},
      round: 1,
      ambushed: ambushed,
    };
    if (ambushed) {
      logLine("<span class=\"hi\">Battle:</span> " + enc.label + " — the enemy got the drop on you!", "bad");
    } else {
      logLine("<span class=\"hi\">Battle:</span> " + enc.label + ". Choose actions, then End round.", "");
    }
    trackPlaytest("combat_started", {
      kind: enc.kind,
      label: enc.label,
      foeCount: enc.foes ? enc.foes.length : 0,
      day: state.travelDay,
      ambushed: ambushed,
    });
    if (ambushed && resolveAmbushOpening()) return;
  }

  function foesAlive() {
    if (!state.combat) return [];
    return state.combat.foes.filter(function (f) {
      return f.hp > 0;
    });
  }

  function randomFoe() {
    var a = foesAlive();
    if (!a.length) return null;
    return a[rollInt(0, a.length - 1)];
  }

  function isUndeadFight() {
    return state.combat && (state.combat.kind === "skeletons" || state.combat.kind === "ruins_combat");
  }

  function strDamageBonus(member) {
    if (!member || !member.stats) return 0;
    var str = member.stats.strength || 0;
    var excess = Math.max(0, str - 4);
    var level = member.level || 1;
    var mult = level >= 10 ? 2 : 1;
    return excess * mult;
  }

  function attackDamage(member) {
    var d;
    if (member.role === "soldier") d = 4;
    else if (member.role === "mercenary") d = 3;
    else if (member.role === "priest") d = isUndeadFight() ? 3 : 2;
    else d = 2;
    if (hasBlessing("attack")) d += 1;
    d += strDamageBonus(member);
    var exotic = exoticWeaponDef(member.exoticWeaponId);
    if (exotic) d += exotic.dmgBonus;
    d += equipmentDmgBonus(member);
    return d;
  }

  function intSpellBonus(member) {
    if (!member || !member.stats) return 0;
    var intel = member.stats.intelligence || 0;
    var excess = Math.max(0, intel - 4);
    var level = member.level || 1;
    var perPoint = level >= 10 ? 1 : 0.5;
    return Math.max(0, Math.floor(excess * perPoint));
  }

  function spellDamage(member) {
    return Math.max(1, 1 + intSpellBonus(member));
  }

  function spellHealAmount(member) {
    return Math.max(2, 2 + intSpellBonus(member));
  }

  function partyTotalLuck() {
    var sum = 0;
    for (var i = 0; i < state.party.length; i++) {
      var m = state.party[i];
      if (!m) continue;
      initMemberProgress(m);
      sum += (m.stats && m.stats.luck) || 0;
    }
    return sum;
  }

  function ambushBaseChanceForFoes(foes) {
    if (!foes || !foes.length) return 0;
    var maxLvl = 1;
    for (var i = 0; i < foes.length; i++) {
      maxLvl = Math.max(maxLvl, foeLevel(foes[i]));
    }
    if (maxLvl <= 1) return 0.30;
    if (maxLvl === 2) return 0.40;
    return 0.50;
  }

  function rollAmbush(foes) {
    var base = ambushBaseChanceForFoes(foes);
    var luck = partyTotalLuck();
    var chance = base * Math.max(0, 1 - luck * 0.02);
    return Math.random() < chance;
  }

  function resolveAmbushOpening() {
    if (!state.combat || !state.combat.ambushed) return;
    logLine("<span class=\"hi\">Ambush!</span> The enemy strikes before you can react.", "bad");
    enemyVolley();
    if (!partyAlive().length) {
      tacticalLoss();
      return true;
    }
    return false;
  }

  function rollWeaponLoot(fromRuins) {
    var mercs = mercenaryCount(state.party);
    var gradeBonus = fromRuins ? 1 + mercs : mercs;
    var rolls = fromRuins ? 3 : 1;
    for (var i = 0; i < rolls; i++) {
      var r = Math.random();
      var tierIdx = 0;
      if (r > 0.55) tierIdx = 1;
      if (r > 0.78) tierIdx = 2;
      if (r > 0.92) tierIdx = 3;
      if (Math.random() < 0.25 * gradeBonus) tierIdx++;
      if (tierIdx > WEAPON_TIERS.length - 1) tierIdx = WEAPON_TIERS.length - 1;
      var w = WEAPON_TIERS[tierIdx];
      state.weaponInventory.push(w.id);
      state.weapons++;
      logLine("Loot: <span class=\"hi\">" + w.label + "</span> (grade " + w.grade + ").", "good");
    }
  }

  function resolveRuinsSearchRewards() {
    var mult = lootMultiplier(state.party);
    var goldGain = roadGoldBonus(Math.floor(10 * mult));
    var gemGain = Math.floor(10 * mult);
    state.gold += goldGain;
    state.gems += gemGain;
    rollWeaponLoot(true);
    state.ruinsSearched = true;
    logLine("Ruins search complete: " + goldGain + " gold, " + gemGain + " gems.", "good");
  }

  function monsterLevelByName(name) {
    if (!name) return 1;
    var monsters = (BALANCE_DATA && BALANCE_DATA.monsters) || [];
    var target = String(name).toLowerCase().trim();
    for (var i = 0; i < monsters.length; i++) {
      var n = String(monsters[i].name || "").toLowerCase().trim();
      if (n === target) return monsters[i].level || 1;
    }
    return 1;
  }

  function foeLevel(foe) {
    if (foe && typeof foe.level === "number" && foe.level >= 1) return foe.level;
    return monsterLevelByName(foe && foe.name);
  }

  function computeXpFromFoes(foes) {
    if (!foes || !foes.length) return 0;
    var sum = 0;
    for (var i = 0; i < foes.length; i++) sum += Math.max(1, foeLevel(foes[i]));
    return sum;
  }

  // Level 1: XP only.
  // Level 2: XP + small gold + 5% weapon drop.
  // Level 3: XP + better gold + 30% weapon drop.
  function applyLevelDrops(foes) {
    if (!foes || !foes.length) return;
    for (var i = 0; i < foes.length; i++) {
      var lvl = foeLevel(foes[i]);
      var goldGain;
      if (lvl <= 1) goldGain = roadGoldBonus(rollInt(0, 2));
      else if (lvl === 2) goldGain = roadGoldBonus(rollInt(1, 3));
      else goldGain = roadGoldBonus(rollInt(3, 6));
      if (goldGain > 0) {
        state.gold += goldGain;
        logLine(foes[i].name + " drop: +" + goldGain + " gold.", "good");
      }
      var dropChance;
      if (lvl <= 1) dropChance = 0.02;
      else if (lvl === 2) dropChance = 0.05;
      else dropChance = 0.30;
      if (Math.random() < dropChance) {
        state.weapons += 1;
        state.weaponInventory.push("rare_drop");
        logLine(foes[i].name + " drop: weapon found!", "good");
      }
    }
  }

  function grantXp(amount) {
    if (!amount || amount < 1) return;
    var gained = 0;
    for (var i = 0; i < state.party.length; i++) {
      var m = state.party[i];
      if (!m) continue;
      initMemberProgress(m);
      if (m.hp <= 0) continue;
      m.xp += amount;
      gained++;
      while (m.level < MAX_LEVEL) {
        var needed = xpToNextLevel(m.level);
        if (!(m.xp >= needed)) break;
        m.xp -= needed;
        m.level += 1;
        if (m.level >= MAX_LEVEL) m.xp = 0;
        var sg = rollStatGains(m.role);
        if (!m.stats) m.stats = { strength: 0, intelligence: 0, stamina: 0, luck: 0 };
        m.stats.strength = Math.min(STAT_CAP, (m.stats.strength || 0) + sg.strength);
        m.stats.intelligence = Math.min(STAT_CAP, (m.stats.intelligence || 0) + sg.intelligence);
        m.stats.stamina = Math.min(STAT_CAP, (m.stats.stamina || 0) + sg.stamina);
        m.stats.luck = Math.min(STAT_CAP, (m.stats.luck || 0) + sg.luck);
        var hpGain = hpGainOnLevel(m);
        m.maxHp += hpGain;
        m.hp = Math.min(m.maxHp, m.hp + hpGain);
        var prevMaxMp = m.maxMp || 0;
        m.maxMp = memberMaxMp(m);
        var mpGain = Math.max(0, m.maxMp - prevMaxMp);
        m.mp = Math.min(m.maxMp, (m.mp || 0) + mpGain);
        var gainTokens = [];
        if (hpGain) gainTokens.push("+" + hpGain + " HP");
        if (mpGain) gainTokens.push("+" + mpGain + " MP");
        if (sg.strength) gainTokens.push("+" + sg.strength + " STR");
        if (sg.intelligence) gainTokens.push("+" + sg.intelligence + " INT");
        if (sg.stamina) gainTokens.push("+" + sg.stamina + " STAM");
        if (sg.luck) gainTokens.push("+" + sg.luck + " LUCK");
        var gainSuffix = gainTokens.length ? " (" + gainTokens.join(", ") + ")" : "";
        logLine(
          m.name +
            " levels up to <span class=\"hi\">" +
            m.level +
            "</span>" +
            gainSuffix +
            ".",
          "good"
        );
        trackPlaytest("member_leveled", {
          memberId: m.id,
          role: m.role,
          level: m.level,
          hpGain: hpGain,
          mpGain: mpGain,
          statGains: sg,
        });
      }
    }
    if (gained) logLine("XP +" + amount + " awarded to active party (" + gained + " member(s)).", "good");
  }

  function fleeEncounter() {
    if (state.food > 0) state.food--;
    logLine("You flee, losing supplies.", "bad");
    state.encounterChance = ENCOUNTER_BASE;
    state.combat = null;
    state.pendingEncounter = null;
    finishEncounterCommon();
  }

  function queueResumeTravel() {
    clearTransitionTimers();
    var resumeLabel = "On the road again";
    if (state.quest && state.quest.status === "active") {
      state.phase = "quest_trek";
      resumeLabel = "Pressing into the pass";
    } else if (state.adventure) {
      state.phase = "adventure";
      resumeLabel = "Exploring on";
    } else {
      state.phase = "travel";
    }
    state.transition = { kind: "resume", label: resumeLabel };
    render();
    scheduleTransition(function () {
      state.transition = null;
      render();
    }, RESUME_TRAVEL_MS);
  }

  function newIsilSettlerCount() {
    return state && state.newIsilSettlers ? state.newIsilSettlers.length : 0;
  }

  function syncNewIsilPopulation() {
    if (!state.newIsilGrowth) state.newIsilGrowth = { population: NEW_ISIL_BASE_POPULATION };
    state.newIsilGrowth.population = NEW_ISIL_BASE_POPULATION + newIsilSettlerCount();
  }

  function effectiveStabilityTarget() {
    return Math.max(STABILITY_TARGET_DAYS, state.stabilityExtendedTarget || 0);
  }

  function estimatedDaysToNewIsilBoss() {
    if (state.phase === "travel" && currentDestination().key === "new_isil") {
      return Math.max(1, currentRouteDays() - state.travelDay + 1);
    }
    var originTown = state.settlementTown;
    if (state.phase === "story_illiri") originTown = "cantebury";
    if (state.phase === "settlement" && originTown) {
      if (originTown === "new_isil") return 1;
      var days = 0;
      var key = originTown;
      if (key === "cantebury") {
        days += cachedLegDays("cantebury", "gustaf");
        key = "gustaf";
      }
      if (key === "gustaf") {
        days += cachedLegDays("gustaf", "hollow_banks");
        key = "hollow_banks";
      }
      if (key === "hollow_banks") {
        days += cachedLegDays("hollow_banks", "solem");
        key = "solem";
      }
      if (key === "solem") days += cachedLegDays("solem", "new_isil");
      return Math.max(1, days + 1);
    }
    return (
      cachedLegDays("cantebury", "gustaf") +
      cachedLegDays("gustaf", "hollow_banks") +
      cachedLegDays("hollow_banks", "solem") +
      cachedLegDays("solem", "new_isil") +
      2
    );
  }

  function mustDefeatFinalHarborBoss() {
    return (state.totalDaysElapsed || 0) >= FINAL_BOSS_MIN_DAYS && !state.finalHarborBossDefeated;
  }

  function isFinalNewIsilApproach() {
    return currentDestination().key === "new_isil" && mustDefeatFinalHarborBoss();
  }

  function shouldTriggerNewIsilGateBoss() {
    if (!isFinalNewIsilApproach()) return false;
    if (state.finalBossCleared) return false;
    var preFinalDay = Math.max(1, currentRouteDays() - 1);
    return state.travelDay === preFinalDay;
  }

  function extendStabilityTargetIfNeeded(extraDays, logMsg) {
    var bump = Math.max(1, extraDays | 0);
    var needed = (state.totalDaysElapsed || 0) + bump;
    var target = Math.max(STABILITY_TARGET_DAYS, state.stabilityExtendedTarget || 0, needed);
    if (target <= effectiveStabilityTarget()) return;
    state.stabilityExtendedTarget = target;
    if (logMsg && !state.stabilityExtensionNoted) {
      state.stabilityExtensionNoted = true;
      logLine(logMsg, "hi");
    }
  }

  function applyDepartBossGateForLeg(dest, originKey) {
    if (dest.key !== "new_isil") {
      state.finalBossCleared = true;
      return;
    }
    if ((state.totalDaysElapsed || 0) >= FINAL_BOSS_MIN_DAYS && !state.finalHarborBossDefeated) {
      state.finalBossCleared = false;
      extendStabilityTargetIfNeeded(
        state.legRouteDays + 2,
        "Clerks add marching days for the final westward leg — after journey day " +
          FINAL_BOSS_MIN_DAYS +
          ", SK Kew Kumber blocks the road to New Isil."
      );
    } else {
      state.finalBossCleared = true;
    }
  }

  function checkStabilityWin() {
    return false;
  }

  function checkCampaignVictoryAtNewIsil() {
    if (mustDefeatFinalHarborBoss()) {
      extendStabilityTargetIfNeeded(
        estimatedDaysToNewIsilBoss() + 2,
        "The march ledger stays open until you break Kew Kumber's blockade on the final westward leg."
      );
      return false;
    }
    var target = effectiveStabilityTarget();
    if ((state.totalDaysElapsed || 0) < target) return false;
    trackPlaytest("run_completed", {
      day: state.totalDaysElapsed,
      reason: "new_isil",
      caravanLoops: state.caravanLoops || 0,
      settlers: newIsilSettlerCount(),
      finalBossDefeated: !!state.finalHarborBossDefeated,
    });
    state.gameoverMode = "win";
    state.winReason = "new_isil";
    state.phase = "gameover";
    logLine(
      "<span class=\"hi\">The Illirial Trail is complete:</span> your caravan reaches New Isil after " +
        target +
        " journey days" +
        (target > STABILITY_TARGET_DAYS ? " (extended for the final harbor march)" : "") +
        ". The colony takes root; the realm records your march.",
      "good"
    );
    return true;
  }

  function deliverCaravanToNewIsil() {
    ensureCaravanState();
    if (state.caravanDeliveredToNewIsil) return;
    if (!state.caravan || state.caravan.total <= 0) return;
    var count = state.caravan.total;
    state.caravanDeliveredToNewIsil = true;
    state.caravan = {
      total: 0,
      farmers: 0,
      artisans: 0,
      merchants: 0,
      thatchers: 0,
      stoneMasons: 0,
      cobblers: 0,
      blacksmiths: 0,
    };
    logLine(
      "<span class=\"hi\">New Isil:</span> " +
        count +
        " settlers disembark to build the harbor. The fighting line marches on with no civilian train.",
      "good"
    );
  }

  function replenishCaravanAtCantebury() {
    if (!state.caravanDeliveredToNewIsil) return;
    ensureCaravanState();
    if (state.caravan.total > 0) return;
    var n = rollInt(1, 15);
    state.caravan = rollNewCaravanFollowers(n);
    logLine(
      "<span class=\"hi\">Cantebury:</span> the crown assigns <b>" +
        n +
        "</b> new civilians to your next westward march (" +
        caravanFollowersSummary() +
        ").",
      "good"
    );
  }

  function arriveCanteburyFromReturn() {
    clearTransitionTimers();
    trackPlaytest("leg_completed", {
      day: state.travelDay,
      routeDays: currentRouteDays(),
      destination: "cantebury",
      origin: state.travelOrigin || "new_isil",
      caravanLoop: (state.caravanLoops || 0) + 1,
    });
    state.caravanLoops = (state.caravanLoops || 0) + 1;
    state.phase = "story_illiri";
    state.illiriView = "castle";
    state.keepView = "hall";
    state.settlementTown = null;
    state.npcDialog = null;
    internPendingHeadstones();
    logLine(
      "<span class=\"hi\">Cantebury:</span> the caravan completes its eastbound return from New Isil (loop " +
        state.caravanLoops +
        "). Settlers abroad: " +
        newIsilSettlerCount() +
        ".",
      "good"
    );
    replenishCaravanAtCantebury();
    state.transition = { kind: "arrive", label: "Cantebury" };
    render();
    scheduleTransition(function () {
      state.transition = null;
      render();
    }, ARRIVE_CITY_MS);
  }

  function settleMemberAtNewIsil(memberId) {
    var living = state.party.filter(function (m) {
      return m && m.hp > 0 && !m.permadead;
    });
    if (living.length <= 1) {
      logLine("At least one companion must lead the caravan eastbound back to Cantebury.", "bad");
      render();
      return;
    }
    var member = null;
    for (var i = 0; i < state.party.length; i++) {
      if (state.party[i] && state.party[i].id === memberId) member = state.party[i];
    }
    if (!member || member.hp <= 0 || member.permadead) return;
    ensureMemberEquipment(member);
    var slot;
    for (var s = 0; s < EQUIPMENT_SLOTS.length; s++) {
      slot = EQUIPMENT_SLOTS[s];
      if (member.equipment[slot]) addToGearStash(member.equipment[slot]);
      member.equipment[slot] = null;
    }
    state.newIsilSettlers.push({
      id: member.id,
      name: member.name,
      role: member.role,
      settledOnDay: state.totalDaysElapsed || 0,
      loop: state.caravanLoops || 0,
      stats: cloneStats(member.stats || baseStatsForRole(member.role)),
      bonus: member.bonus ? cloneStats(member.bonus) : null,
      headshot: member.headshot || "",
      gender: member.gender || "",
      canRejoin: true,
    });
    state.party = state.party.filter(function (m) {
      return m && m.id !== memberId;
    });
    syncNewIsilPopulation();
    logLine(member.name + " settles in New Isil to begin a new life.", "good");
    render();
  }

  function applyPermanentStatPenalty(member, fraction) {
    if (!member) return;
    var f = typeof fraction === "number" ? fraction : 0.25;
    var scale = 1 - f;
    var keys = STAT_KEYS;
    var i;
    if (!member.stats) member.stats = baseStatsForRole(member.role);
    for (i = 0; i < keys.length; i++) {
      member.stats[keys[i]] = Math.max(1, Math.floor((member.stats[keys[i]] || 0) * scale));
    }
    if (member.bonus) {
      for (i = 0; i < keys.length; i++) {
        member.bonus[keys[i]] = Math.max(0, Math.floor((member.bonus[keys[i]] || 0) * scale));
      }
    }
    member.settlerPenalty = true;
    initMemberProgress(member);
    member.maxHp = memberMaxHp(member);
    member.hp = Math.min(member.hp, member.maxHp);
    member.maxMp = memberMaxMp(member);
    member.mp = Math.min(member.mp || 0, member.maxMp);
  }

  function recruitSettlerBack(settlerId) {
    if (state.party.length >= PARTY_MAX) {
      logLine("Party is full — make room before inviting a settler back.", "bad");
      render();
      return;
    }
    var settler = null;
    var settlers = state.newIsilSettlers || [];
    var i;
    for (i = 0; i < settlers.length; i++) {
      if (settlers[i].id === settlerId) settler = settlers[i];
    }
    if (!settler || !settler.canRejoin) return;
    for (i = 0; i < state.party.length; i++) {
      if (state.party[i] && state.party[i].id === settlerId) {
        logLine(settler.name + " is already with the caravan.", "bad");
        render();
        return;
      }
    }
    var id = "p" + state.partyIdSeq++;
    var member = initMemberProgress({
      id: id,
      name: settler.name,
      role: settler.role,
      stats: settler.stats ? cloneStats(settler.stats) : baseStatsForRole(settler.role),
      bonus: settler.bonus ? cloneStats(settler.bonus) : undefined,
      headshot: settler.headshot || "",
      gender: settler.gender || "",
      hp: CLASS_HP[settler.role] || 6,
      maxHp: CLASS_HP[settler.role] || 6,
    });
    applyPermanentStatPenalty(member, 0.25);
    state.party.push(member);
    settler.canRejoin = false;
    logLine(
      settler.name +
        " rejoins the march with a permanent toll on body and nerve (−25% stats).",
      "hi"
    );
    render();
  }

  function returnCaravanToCantebury() {
    departEastboundTo("cantebury");
  }

  function departWestboundTo(townKey) {
    if (state.phase !== "settlement" && state.phase !== "story_illiri") return;
    var origin = state.settlementTown || state.travelOrigin || "cantebury";
    if (origin === "cantebury") resetTrailPathForWestwardMarch();
    recordWestboundForkChoice(origin, townKey);
    state.travelOrigin = origin;
    state.travelDestination = townKey;
    state.onReturnMarch = false;
    departIllirial();
  }

  function departEastboundTo(townKey) {
    if (state.phase !== "settlement") return;
    state.onReturnMarch = true;
    state.travelOrigin = state.settlementTown;
    state.travelDestination = townKey;
    state.finalBossCleared = true;
    departIllirial();
  }

  function queueArrivalAtDestination() {
    clearTransitionTimers();
    var dest = currentDestination();
    if (dest.key === "cantebury") {
      arriveCanteburyFromReturn();
      return;
    }
    trackPlaytest("leg_completed", { day: state.travelDay, routeDays: currentRouteDays(), destination: dest.key, origin: state.travelOrigin || "cantebury" });
    state.phase = "settlement";
    state.settlementTown = dest.key;
    state.settlementView = dest.key === "solem" ? "keep" : "church";
    state.keepView = "hall";
    state.npcDialog = null;
    state.settlementRecruitSlots = rollSettlementRecruitSlots(dest.key);
    state.settlementRecruitMode = settlementRecruitMode(dest.key);
    internPendingHeadstones();
    markTrailTownVisited(dest.key);
    appendTrailPathTown(dest.key);
    if (dest.key === "new_isil") {
      deliverCaravanToNewIsil();
      syncNewIsilPopulation();
      state.settlementView = "depart";
      if (checkCampaignVictoryAtNewIsil()) {
        render();
        return;
      }
      if (mustDefeatFinalHarborBoss()) {
        logLine(
          "<span class=\"hi\">New Isil:</span> you are still short of the final reckoning — return west when ready; after journey day " +
            FINAL_BOSS_MIN_DAYS +
            " SK Kew Kumber holds the last road.",
          "hi"
        );
      } else if (state.finalHarborBossDefeated) {
        logLine(
          "<span class=\"hi\">New Isil:</span> Kew Kumber's blockade is broken. Settle companions or march eastbound home — stability closes at " +
            effectiveStabilityTarget() +
            " journey days.",
          "good"
        );
      } else {
        logLine(
          "<span class=\"hi\">New Isil:</span> the harbor welcomes the caravan (Kew Kumber does not bar the road until journey day " +
            FINAL_BOSS_MIN_DAYS +
            "). Settle companions or return to Cantebury.",
          "good"
        );
      }
    }
    state.transition = { kind: "arrive", label: dest.label };
    render();
    scheduleTransition(function () {
      state.transition = null;
      render();
    }, ARRIVE_CITY_MS);
  }

  function finishEncounterCommon() {
    state.pendingEncounter = null;
    state.combat = null;
    endOfDayPriestHealing();
    if (state.quest && state.quest.status === "active") {
      queueResumeTravel();
      return;
    }
    if (state.adventure) {
      if (state.adventure.dir === "out" && state.adventure.daysOut >= state.adventure.maxDays) {
        state.adventure.dir = "back";
        state.adventure.returnDays = state.adventure.daysOut;
        logLine("You've used all 10 adventuring days. Heading back to " + locationLabel(state.adventure.town) + " (" + state.adventure.returnDays + " day(s) home).", "hi");
      }
      queueResumeTravel();
      return;
    }
    if (state.travelDay >= currentRouteDays()) {
      logLine("<span class=\"hi\">You reach " + currentDestination().label + ".</span>", "good");
      queueArrivalAtDestination();
    } else {
      queueResumeTravel();
    }
  }

  function tacticalWin() {
    var k = state.combat.kind;
    var defeatedFoes = state.combat && state.combat.foes ? state.combat.foes.slice() : [];
    var foesDefeated = defeatedFoes.length;
    var xpAward = computeXpFromFoes(defeatedFoes);
    trackPlaytest("combat_won", {
      kind: k,
      foesDefeated: foesDefeated,
      xpAward: xpAward,
      day: state.travelDay,
    });
    if (xpAward > 0) grantXp(xpAward);
    applyLevelDrops(defeatedFoes);
    if (k === "new_isil_gate_boss") {
      state.finalBossCleared = true;
      state.finalHarborBossDefeated = true;
      logLine("SK Kew Kumber is defeated. The final road to New Isil is open.", "good");
    }
    if (k === "quest_boss_drakes") {
      logLine("The drakes lie still. The pass is yours.", "good");
      state.encounterChance = ENCOUNTER_BASE;
      completeCurrentQuest();
      return;
    }
    state.encounterChance = ENCOUNTER_BASE;
    state.combat = null;
    state.pendingEncounter = null;
    if (k === "ruins_combat" && state.ruinsRoomsRemaining > 0) {
      logLine("Ruins room cleared. " + state.ruinsRoomsRemaining + " room(s) remain.", "good");
      state.phase = "action";
      state.pendingEncounter = { kind: "ruins_discovery", label: "Mysterious ruins", foes: [] };
      render();
      return;
    }
    if (k === "ruins_combat") resolveRuinsSearchRewards();
    maybePostBattleDialog();
    finishEncounterCommon();
  }

  var POST_BATTLE_LINES = [
    "These monsters keep strange bed-fellows.",
  ];

  function maybePostBattleDialog() {
    if (Math.random() >= 0.15) return;
    var alive = (state.party || []).filter(function (m) { return m && m.hp > 0; });
    if (!alive.length) return;
    var speaker = alive[Math.floor(Math.random() * alive.length)];
    var line = POST_BATTLE_LINES[Math.floor(Math.random() * POST_BATTLE_LINES.length)];
    state.postBattleDialog = {
      speaker: speaker.name || roleLabel(speaker.role) || "Adventurer",
      portrait: speaker.headshot || "Vale.jpeg",
      text: line,
    };
  }

  function tacticalLoss() {
    trackPlaytest("combat_lost", {
      kind: state.combat && state.combat.kind ? state.combat.kind : "unknown",
      day: state.travelDay,
    });
    ensureHeadstonesState();
    for (var i = 0; i < state.party.length; i++) {
      var m = state.party[i];
      if (!m || m.hp > 0) continue;
      state.headstones.push(makeHeadstoneForMember(m));
    }
    saveHeadstonesToStorage();
    buryRemainingAtFallbackTown();
    state.gameoverMode = "loss";
    state.phase = "gameover";
    logLine("The party has fallen. Headstones rise where they were heading.", "bad");
    state.combat = null;
    state.pendingEncounter = null;
    render();
  }

  function choiceForMember(memberId) {
    if (!state.combat) return null;
    var raw = state.combat.choices[memberId];
    if (!raw) return null;
    if (typeof raw === "string") return { action: raw, targetId: null };
    return raw;
  }

  function spellNeedsFoeTarget(role, spellKind) {
    if (role === "priest" && spellKind === "spark") return true;
    if (role === "mage" && spellKind === "fire") return true;
    return false;
  }
  function spellNeedsAllyTarget(role, spellKind) {
    if (role === "priest" && spellKind === "heal") return true;
    return false;
  }

  function choiceComplete(memberId) {
    var rec = choiceForMember(memberId);
    if (!rec || !rec.action) return false;
    if (rec.action === "attack") return !!rec.targetId;
    if (rec.action === "item") return !!rec.itemKind;
    if (rec.action === "spell") {
      var mem = teamMemberById(memberId);
      if (mem && (mem.role === "priest" || mem.role === "mage")) {
        if (!rec.spellKind) return false;
        if (spellNeedsFoeTarget(mem.role, rec.spellKind) || spellNeedsAllyTarget(mem.role, rec.spellKind)) {
          return !!rec.targetId;
        }
        return true;
      }
    }
    return true;
  }

  function currentPlannerId() {
    if (!state.combat) return null;
    var team = combatTeam();
    for (var i = 0; i < team.length; i++) {
      var ref = teamMemberById(team[i].id);
      if (!ref || ref.hp <= 0) continue;
      if (!choiceComplete(team[i].id)) return team[i].id;
    }
    return null;
  }

  function setChoice(memberId, action) {
    if (!state.combat) return;
    var current = currentPlannerId();
    if (!current || memberId !== current) return;
    if (action === "attack") {
      state.combat.choices[memberId] = { action: "attack", targetId: null };
    } else if (action === "item") {
      state.combat.choices[memberId] = { action: "item", targetId: null, itemKind: null };
    } else if (action === "spell") {
      var m = teamMemberById(memberId);
      if (m && (m.role === "priest" || m.role === "mage")) state.combat.choices[memberId] = { action: "spell", targetId: null, spellKind: null };
      else state.combat.choices[memberId] = { action: "spell", targetId: null };
    } else {
      state.combat.choices[memberId] = { action: action, targetId: null };
    }
    render();
  }

  function chooseAttackTarget(foeId) {
    if (!state.combat || !foeId) return;
    var current = currentPlannerId();
    if (!current) return;
    var rec = choiceForMember(current);
    if (!rec) return;
    if (rec.action !== "attack" && rec.action !== "spell") return;
    var foes = foesAlive();
    var target = null;
    for (var i = 0; i < foes.length; i++) {
      if (foes[i].id === foeId) target = foes[i];
    }
    if (!target) return;
    var next = { action: rec.action, targetId: foeId };
    if (rec.action === "spell") next.spellKind = rec.spellKind || null;
    state.combat.choices[current] = next;
    render();
  }

  function chooseSpellAllyTarget(allyId) {
    if (!state.combat || !allyId) return;
    var current = currentPlannerId();
    if (!current) return;
    var rec = choiceForMember(current);
    if (!rec || rec.action !== "spell") return;
    var ally = teamMemberById(allyId);
    if (!ally || ally.hp <= 0) return;
    state.combat.choices[current] = { action: "spell", targetId: allyId, spellKind: rec.spellKind || null };
    render();
  }

  function chooseItemOption(itemKind) {
    if (!state.combat || !itemKind) return;
    var current = currentPlannerId();
    if (!current) return;
    var rec = choiceForMember(current);
    if (!rec || rec.action !== "item") return;
    state.combat.choices[current] = { action: "item", targetId: null, itemKind: itemKind };
    render();
  }

  function chooseSpellOption(spellKind) {
    if (!state.combat || !spellKind) return;
    var current = currentPlannerId();
    if (!current) return;
    var rec = choiceForMember(current);
    if (!rec || rec.action !== "spell") return;
    state.combat.choices[current] = { action: "spell", targetId: null, spellKind: spellKind };
    render();
  }

  function allChoicesReady() {
    return currentPlannerId() === null;
  }

  function strikeFoe(foe, dmg) {
    if (!foe || dmg <= 0) return;
    foe.hp -= dmg;
    if (foe.hp < 0) foe.hp = 0;
  }

  function weakestFoes(n) {
    var a = foesAlive().slice().sort(function (a, b) {
      return a.hp - b.hp;
    });
    return a.slice(0, n);
  }

  function strongestFoe() {
    var a = foesAlive();
    if (!a.length) return null;
    return a.slice().sort(function (a, b) {
      return b.hp - a.hp;
    })[0];
  }

  function lowestHpAlly() {
    var team = combatTeam().filter(function (m) {
      return teamMemberById(m.id) && teamMemberById(m.id).hp > 0;
    });
    if (!team.length) return null;
    return team.slice().sort(function (a, b) {
      return a.hp / a.maxHp - b.hp / b.maxHp;
    })[0];
  }

  function executePartyActions() {
    var c = state.combat;
    c.defending = {};
    var team = combatTeam();
    var i;
    for (i = 0; i < team.length; i++) {
      var m = team[i];
      var rec = choiceForMember(m.id);
      var act = rec && rec.action ? rec.action : null;
      var ref = teamMemberById(m.id);
      if (!ref || ref.hp <= 0) continue;

      if (act === "defend") {
        c.defending[m.id] = true;
        logLine(m.name + " defends.", "");
        continue;
      }
      if (act === "attack") {
        var tgt = rec && rec.targetId ? state.combat.foes.find(function (f) { return f.id === rec.targetId && f.hp > 0; }) : null;
        if (!tgt) tgt = randomFoe();
        if (!tgt) continue;
        var d = attackDamage(m);
        strikeFoe(tgt, d);
        logLine(m.name + " attacks " + tgt.name + " (-" + d + ").", "hi");
        continue;
      }
      if (act === "spell") {
        if ((m.role === "priest" || m.role === "mage") && (ref.mp || 0) < 5) {
          logLine(m.name + " tries to cast but lacks MP.", "bad");
          continue;
        }
        if (m.role === "priest") {
          var priestSpell = rec && rec.spellKind ? rec.spellKind : "";
          if (priestSpell === "heal") {
            var chosenAllyId = rec && rec.targetId ? rec.targetId : null;
            var ally2 = chosenAllyId ? teamMemberById(chosenAllyId) : null;
            if (!ally2 || ally2.hp <= 0) ally2 = lowestHpAlly();
            if (ally2) {
              var healAmt = spellHealAmount(m);
              ref.mp = Math.max(0, (ref.mp || 0) - 5);
              healMember(ally2.id, healAmt);
              logLine(m.name + " casts Heal on " + ally2.name + " (+" + healAmt + ", 5 MP).", "good");
            } else {
              logLine(m.name + " casts Heal but no one is injured.", "");
            }
          } else {
            ref.mp = Math.max(0, (ref.mp || 0) - 5);
            var sparkDmg = spellDamage(m);
            var chosenSparkId = rec && rec.targetId ? rec.targetId : null;
            var sparkTarget = chosenSparkId
              ? state.combat.foes.find(function (f) { return f.id === chosenSparkId && f.hp > 0; })
              : null;
            if (!sparkTarget) sparkTarget = randomFoe();
            if (sparkTarget) {
              strikeFoe(sparkTarget, sparkDmg);
              logLine(m.name + " casts Spark on " + sparkTarget.name + " (-" + sparkDmg + ", 5 MP).", "hi");
            }
          }
        } else if (m.role === "mage") {
          ref.mp = Math.max(0, (ref.mp || 0) - 5);
          var fireDmg = spellDamage(m);
          var chosenFireId = rec && rec.targetId ? rec.targetId : null;
          var fireTarget = chosenFireId
            ? state.combat.foes.find(function (f) { return f.id === chosenFireId && f.hp > 0; })
            : null;
          if (!fireTarget) fireTarget = randomFoe();
          if (fireTarget) {
            strikeFoe(fireTarget, fireDmg);
            logLine(m.name + " casts Fire on " + fireTarget.name + " (-" + fireDmg + ", 5 MP).", "hi");
          }
        } else if (m.role === "soldier") {
          var wk = weakestFoes(2);
          if (wk[0]) strikeFoe(wk[0], 2);
          if (wk[1]) strikeFoe(wk[1], 2);
          logLine(m.name + " cleaves the enemy line.", "hi");
        } else {
          var t2 = randomFoe();
          if (t2) {
            strikeFoe(t2, 2);
            logLine(m.name + " casts Greed strike.", "hi");
            if (c.kind === "bandits") {
              state.gold += 1;
              logLine("+1 gold (scuffle).", "good");
            }
          }
        }
        continue;
      }
      if (act === "item") {
        var itemKind = rec && rec.itemKind ? rec.itemKind : "";
        if (itemKind === "life_potion") {
          var fallen = state.party.filter(function (p) {
            return p.hp <= 0 && !p.permadead;
          });
          if (!fallen.length || state.lifePotions <= 0) {
            logLine(m.name + " cannot use Potion of Life right now.", "bad");
            continue;
          }
          state.lifePotions--;
          var revived = fallen[0];
          revived.hp = Math.max(1, Math.ceil(revived.maxHp * 0.5));
          revived.deadSinceDay = undefined;
          clearMemberDeathSnapshot(revived);
          logLine(m.name + " uses Potion of Life on " + revived.name + " (revived to " + revived.hp + " HP).", "good");
          continue;
        }
        if (itemKind === "heal_potion") {
          if (state.healingPotions <= 0) {
            logLine(m.name + " has no Potion of Healing.", "bad");
            continue;
          }
          state.healingPotions--;
          healMember(m.id, 3);
          logLine(m.name + " drinks Potion of Healing (+3 HP).", "good");
          continue;
        }
        logLine(m.name + " has no item selected.", "bad");
        continue;
      }
    }
  }

  function foePrefersSoftTargets(foe) {
    var lower = (foe && foe.name ? foe.name : "").toLowerCase();
    return lower.indexOf("dragon") >= 0 || lower.indexOf("lich") >= 0;
  }

  function pickEnemyTarget(foe, live) {
    if (!live.length) return null;
    if (!foePrefersSoftTargets(foe)) return live[rollInt(0, live.length - 1)];
    var preferredRoles = { priest: true, mage: true };
    var first = live.filter(function (m) {
      return preferredRoles[m.role || ""];
    });
    if (first.length) return first[rollInt(0, first.length - 1)];
    var second = live.filter(function (m) {
      return (m.role || "") !== "soldier";
    });
    if (second.length) return second[rollInt(0, second.length - 1)];
    return live[rollInt(0, live.length - 1)];
  }

  function enemyVolley() {
    var c = state.combat;
    var foes = c.foes.filter(function (f) {
      return f.hp > 0;
    });
    var team = combatTeam();
    for (var i = 0; i < foes.length; i++) {
      var f = foes[i];
      if (!team.length) break;
      var live = team.filter(function (m) {
        return teamMemberById(m.id) && teamMemberById(m.id).hp > 0;
      });
      if (!live.length) break;
      var v = pickEnemyTarget(f, live);
      var dmg = Math.max(0, parseInt(f.dmg, 10) || 2);
      if (c.defending[v.id]) dmg = Math.max(0, dmg - 2);
      damageMember(v.id, dmg);
      logLine(f.name + " hits " + v.name + " (-" + dmg + ").", "bad");
    }
  }

  function commitCombatRound() {
    if (!state.combat || !allChoicesReady()) return;
    executePartyActions();
    state.combat.choices = {};

    if (!foesAlive().length) {
      tacticalWin();
      return;
    }

    enemyVolley();

    if (!combatTeam().filter(function (m) {
      return teamMemberById(m.id) && teamMemberById(m.id).hp > 0;
    }).length) {
      tacticalLoss();
      return;
    }

    if (!partyAlive().length) {
      tacticalLoss();
      return;
    }

    state.combat.round++;
    logLine("--- Round " + state.combat.round + " ---", "");
    render();
  }

  function queueEncounterCutaway(title, subtitle, applyFn) {
    clearTransitionTimers();
    state.transition = { kind: "encounter", title: title, subtitle: subtitle };
    render();
    scheduleTransition(function () {
      state.transition = null;
      applyFn();
      render();
    }, ENCOUNTER_CUT_MS);
  }

  function applyRuinsDiscoveryEncounter() {
    state.ruinsDiscovered = true;
    state.ruinsTravelDay = state.travelDay;
    state.ruinsRoomsTotal = rollRuinsRoomCount();
    state.ruinsRoomsRemaining = state.ruinsRoomsTotal;
    initRuinsMap();
    state.pendingEncounter = { kind: "ruins_discovery", label: "Mysterious ruins", foes: [] };
    state.phase = "action";
    logLine("Ruins mapped: " + state.ruinsRoomsTotal + " room(s) detected.", "hi");
  }

  function applyTravelDayMpRegen() {
    var regen = 1;
    var any = 0;
    for (var i = 0; i < state.party.length; i++) {
      var m = state.party[i];
      if (!m || m.permadead) continue;
      if (m.hp <= 0) continue;
      initMemberProgress(m);
      var before = m.mp || 0;
      m.mp = Math.min(m.maxMp, before + regen);
      if (m.mp - before > 0) any++;
    }
    if (state.guest && !state.guest.permadead && state.guest.hp > 0) {
      var gBefore = state.guest.mp || 0;
      state.guest.mp = Math.min(state.guest.maxMp || 25, gBefore + regen);
    }
    if (any > 0) logLine("Road march: +" + regen + " MP to the party.", "");
  }

  function applyCampMpRegen() {
    var regen = 2;
    var any = 0;
    for (var i = 0; i < state.party.length; i++) {
      var m = state.party[i];
      if (!m || m.permadead) continue;
      if (m.hp <= 0) continue;
      initMemberProgress(m);
      var before = m.mp || 0;
      m.mp = Math.min(m.maxMp, before + regen);
      if (m.mp - before > 0) any++;
    }
    if (state.guest && !state.guest.permadead && state.guest.hp > 0) {
      var gBefore = state.guest.mp || 0;
      state.guest.mp = Math.min(state.guest.maxMp || 25, gBefore + regen);
    }
    if (any > 0) logLine("Camp rest: +" + regen + " MP to the party.", "");
  }

  function processDailyDeath() {
    ensureHeadstonesState();
    var droppedIds = [];
    for (var i = 0; i < state.party.length; i++) {
      var m = state.party[i];
      if (!m) continue;
      if (m.hp > 0) {
        m.deadSinceDay = undefined;
        clearMemberDeathSnapshot(m);
        continue;
      }
      if (typeof m.deadSinceDay !== "number") {
        m.deadSinceDay = state.travelDay;
        snapshotMemberDeathContext(m);
        logLine(m.name + " lies fallen. Revive within 2 days or they are lost.", "bad");
        continue;
      }
      var daysDead = state.travelDay - m.deadSinceDay;
      if (daysDead >= 2) {
        state.headstones.push(makeHeadstoneForMember(m));
        droppedIds.push(m.id);
        logLine(m.name + " was not revived in time. The body will be interred at the next town.", "bad");
        trackPlaytest("member_permadead", { memberId: m.id, role: m.role, day: state.travelDay });
      }
    }
    if (droppedIds.length) {
      saveHeadstonesToStorage();
      state.party = state.party.filter(function (p) { return droppedIds.indexOf(p.id) < 0; });
      if (state.inventoryFocusId && droppedIds.indexOf(state.inventoryFocusId) >= 0) {
        state.inventoryFocusId = state.party[0] ? state.party[0].id : null;
      }
      if (state.inventoryHealTargetId && droppedIds.indexOf(state.inventoryHealTargetId) >= 0) {
        state.inventoryHealTargetId = state.party[0] ? state.party[0].id : null;
      }
    }
    var anyAlive = state.party.some(function (p) { return p && p.hp > 0; });
    if (state.party.length === 0 || !anyAlive) {
      buryRemainingAtFallbackTown();
      state.gameoverMode = "loss";
      state.phase = "gameover";
      logLine("The expedition has ended in tragedy. None remain to carry on.", "bad");
    }
  }

  function buryRemainingAtFallbackTown() {
    ensureHeadstonesState();
    var fallback = (state && state.travelDestination) || "new_isil";
    var changed = 0;
    for (var i = 0; i < state.headstones.length; i++) {
      var hs = state.headstones[i];
      if (!hs.town && hs.runId === state.runId) {
        hs.town = fallback;
        changed++;
      }
    }
    if (changed > 0) saveHeadstonesToStorage();
  }

  function runTravelDayResolution() {
    if (state.phase !== "travel") return;
    if (state.travelDay >= currentRouteDays()) return;
    state.travelDay++;
    tickJourneyDay();
    if (state.phase === "gameover") {
      render();
      return;
    }
    state.stableRestDays = 0;
    logLine("Day " + state.travelDay + " of " + currentRouteDays() + " on the road.", "");
    trackPlaytest("day_advanced", { day: state.travelDay, routeDays: currentRouteDays() });
    processDailyDeath();
    applyTravelDayMpRegen();
    if (shouldTriggerNewIsilGateBoss()) {
      queueEncounterCutaway(
        "Dark standard ahead",
        "SK Kew Kumber blocks the final road to New Isil (journey day " + (state.totalDaysElapsed || 0) + "+)",
        function () {
          startTacticalCombat(buildNewIsilBossEncounter());
        }
      );
      return;
    }
    var hadEncounter = rollTravelEncounter();
    if (hadEncounter) {
      var t = rollFieldEncounterType();
      if (t === "ruins_discovery") {
        queueEncounterCutaway("Shrine ruins on the horizon", "Day " + state.travelDay + " - old stonework breaks the skyline", function () {
          applyRuinsDiscoveryEncounter();
        });
        return;
      }
      queueEncounterCutaway("Hostile creatures", "Day " + state.travelDay + " - a random pack attacks", function () {
        startTacticalCombat(buildRandomMonsterEncounter("road"));
      });
      return;
    }
    if (!state.ruinsDiscovered && Math.random() < RUINS_QUIET_DAY_CHANCE) {
      logLine("Scouts spot a shrine ruin off-road.", "hi");
      queueEncounterCutaway("Shrine ruins", "Day " + state.travelDay + " - a side path worth a look", function () {
        applyRuinsDiscoveryEncounter();
      });
      return;
    }
    logLine("Quiet travel.", "");
    endOfDayPriestHealing();
    if (state.travelDay >= currentRouteDays()) {
      logLine("You reach " + currentDestination().label + ".", "good");
      queueArrivalAtDestination();
    } else {
      render();
    }
  }

  function beginNextTravelDayMarch() {
    if (state.phase !== "travel") return;
    if (state.travelDay >= currentRouteDays()) return;
    clearTransitionTimers();
    state.transition = { kind: "march", fromD: state.travelDay, toD: state.travelDay + 1 };
    render();
    scheduleTransition(function () {
      state.transition = null;
      runTravelDayResolution();
    }, MARCH_MS);
  }

  function allowedLevelsForAdventureEncounter(townKey) {
    var key = townKey || "cantebury";
    if (key === "cantebury") return [1];
    if (key === "brookside" || key === "hollow_banks" || key === "glennhardt" || key === "solem" || key === "new_isil") {
      if (Math.random() < 0.05) return [1, 2, 3];
    }
    return [1, 2];
  }

  function adventureOriginTown() {
    if (state.phase === "story_illiri") return "cantebury";
    return state.settlementTown || null;
  }

  function beginAdventure() {
    var town = adventureOriginTown();
    if (!town) {
      logLine("There is nowhere to set out from.", "bad");
      render();
      return;
    }
    if (state.food <= 0) {
      logLine("You need supplies before venturing out.", "bad");
      render();
      return;
    }
    var fallen = state.party.filter(function (p) { return p && p.hp <= 0; }).length;
    if (fallen >= state.party.length) {
      logLine("No one is fit to walk out the gate.", "bad");
      render();
      return;
    }
    state.adventure = { dir: "out", daysOut: 0, maxDays: 10, town: town, returnDays: 0 };
    state.phase = "adventure";
    state.travelOrigin = town;
    state.travelInventoryOpen = false;
    state.inventoryDetailOpen = false;
    state.encounterChance = ENCOUNTER_BASE;
    state.elaraDialog = null;
    state.elaraDialogShown = false;
    logLine("You strike out from " + locationLabel(town) + " for an adventuring trek (up to 10 days).", "hi");
    trackPlaytest("adventure_started", { town: town });
    render();
  }

  function advanceAdventureDay() {
    if (state.phase !== "adventure" || !state.adventure || state.adventure.dir !== "out") return;
    if (state.transition) return;
    consumeTravelDaySupplies();
    if (allDead()) {
      state.gameoverMode = "loss";
      state.phase = "gameover";
      logLine("The expedition is lost in the wilds.", "bad");
      render();
      return;
    }
    state.travelDay++;
    state.adventure.daysOut++;
    tickJourneyDay();
    state.stableRestDays = 0;
    logLine("Adventure day " + state.adventure.daysOut + " of " + state.adventure.maxDays + " near " + locationLabel(state.adventure.town) + ".", "");
    trackPlaytest("adventure_day_advanced", { daysOut: state.adventure.daysOut, town: state.adventure.town });
    processDailyDeath();
    if (state.phase === "gameover") { render(); return; }
    applyTravelDayMpRegen();
    var hadEncounter = rollTravelEncounter();
    if (hadEncounter) {
      queueEncounterCutaway("Hostile creatures", "Adventure day " + state.adventure.daysOut + " - a wild pack attacks", function () {
        startTacticalCombat(buildRandomMonsterEncounter("adventure"));
      });
      return;
    }
    logLine("Quiet exploration.", "");
    endOfDayPriestHealing();
    if (state.adventure.daysOut >= state.adventure.maxDays) {
      state.adventure.dir = "back";
      state.adventure.returnDays = state.adventure.daysOut;
      logLine("You've used all 10 adventuring days. Heading back to " + locationLabel(state.adventure.town) + " (" + state.adventure.returnDays + " day(s) home).", "hi");
    }
    render();
  }

  function openAdventureReturnConfirm() {
    if (!state.adventure) return;
    var daysCost = state.adventure.dir === "out"
      ? state.adventure.daysOut
      : state.adventure.returnDays;
    if (daysCost <= 0) {
      endAdventureBackInTown();
      return;
    }
    state.confirmDialog = {
      kind: "adventure_return",
      title: "Return to " + locationLabel(state.adventure.town) + "?",
      message: "The trip home will cost <b>" + daysCost + " day(s)</b> and <b>" + daysCost + " supply" + (daysCost > 1 ? " bundles" : "") + "</b>. No encounters on the way back.",
      confirmLabel: "Return home",
      cancelLabel: "Stay out",
      onConfirm: "executeAdventureReturn",
    };
    render();
  }

  function executeAdventureReturn() {
    if (!state.adventure) {
      state.confirmDialog = null;
      render();
      return;
    }
    var daysCost = state.adventure.dir === "out"
      ? state.adventure.daysOut
      : state.adventure.returnDays;
    if (daysCost <= 0) {
      state.confirmDialog = null;
      endAdventureBackInTown();
      return;
    }
    state.adventure.dir = "back";
    state.adventure.returnDays = 0;
    state.confirmDialog = null;
    for (var i = 0; i < daysCost; i++) {
      consumeTravelDaySupplies();
      if (allDead()) {
        state.gameoverMode = "loss";
        state.phase = "gameover";
        logLine("The expedition is lost on the way home.", "bad");
        render();
        return;
      }
      state.travelDay++;
      tickJourneyDay();
      applyTravelDayMpRegen();
      processDailyDeath();
      if (state.phase === "gameover") {
        render();
        return;
      }
    }
    state.stableRestDays = 0;
    logLine("After " + daysCost + " day(s) of march, you return to " + locationLabel(state.adventure.town) + ".", "good");
    endAdventureBackInTown();
  }

  function cancelConfirmDialog() {
    state.confirmDialog = null;
    render();
  }

  function turnBackAdventure() {
    if (state.phase !== "adventure" || !state.adventure) return;
    openAdventureReturnConfirm();
  }

  function continueAdventureReturn() {
    openAdventureReturnConfirm();
  }

  var QUEST_CATALOG = {
    fire_in_sky: {
      id: "fire_in_sky",
      name: "Fire in the sky",
      giver: "barkeep",
      pitch: "Adventurers, if you would, please find and kill the drakes that are killing our animals!",
      summary: "A 5-day trek through a dangerous mountain pass guarded by trolls, goblins, and ogres. A pack of 4 drakes nests at the end.",
      rewardGold: 20,
      type: "monster_hunt",
      totalDays: 5,
      monsterPool: ["Troll", "Goblin", "Ogre"],
      bossLabel: "Drake nest",
      bossMonster: "Drake",
      bossCount: 4,
    },
  };

  function questDef(id) {
    return QUEST_CATALOG[id] || null;
  }

  function questIsCompleted(id) {
    return (state.questsCompleted || []).indexOf(id) >= 0;
  }

  function questIsAvailable(id) {
    if (state.quest) return false;
    return !questIsCompleted(id);
  }

  function questsAvailableFromBarkeep() {
    var keys = Object.keys(QUEST_CATALOG);
    return keys.filter(function (k) {
      return QUEST_CATALOG[k].giver === "barkeep" && questIsAvailable(k);
    });
  }

  function offerQuest(questId) {
    if (!questIsAvailable(questId)) return;
    openBarkeepDialog(questId);
  }

  function barkeepTownKey() {
    if (state.phase === "story_illiri") return "cantebury";
    return state.settlementTown || "cantebury";
  }

  function barkeepProfileForTown(townKey) {
    return BARKEEP_BY_TOWN[townKey] || BARKEEP_BY_TOWN._default;
  }

  function buildBarkeepNpcDialog(forcedQuestId) {
    var town = barkeepTownKey();
    var cfg = barkeepProfileForTown(town);
    var questOfferId = null;
    var text = cfg.greet;
    var summaryHtml = "";

    if (state.quest) {
      var active = questDef(state.quest.id);
      text = cfg.activeQuest;
      if (active) {
        summaryHtml =
          '<div class="hint" style="margin-top:.35rem">Active: <b style="color:#e8dcc8">' +
          escapeHtml(active.name) + "</b></div>";
      }
    } else {
      var offers = questsAvailableFromBarkeep();
      var qid = forcedQuestId && questIsAvailable(forcedQuestId) ? forcedQuestId : offers[0] || null;
      if (qid) {
        var qd = questDef(qid);
        if (qd) {
          questOfferId = qid;
          text = qd.pitch;
          summaryHtml =
            '<div class="hint" style="margin-top:.35rem">' + escapeHtml(qd.summary) +
            ' Reward: <b style="color:#e8dcc8">' + qd.rewardGold + " gp</b>.</div>";
        }
      } else {
        text = cfg.noWork;
      }
    }

    return {
      speaker: cfg.speaker,
      title: cfg.title,
      portrait: cfg.portrait || "",
      text: text,
      summaryHtml: summaryHtml,
      questOfferId: questOfferId,
    };
  }

  function openBarkeepDialog(forcedQuestId) {
    state.npcDialog = buildBarkeepNpcDialog(forcedQuestId);
    state.questDialog = null;
    render();
  }

  function acceptQuest(questId) {
    if (!questIsAvailable(questId)) return;
    var def = questDef(questId);
    if (!def) return;
    state.quest = {
      id: questId,
      status: "accepted",
      dayProgress: 0,
      totalDays: def.totalDays,
      startedAt: state.settlementTown || "cantebury",
      encountersDone: 0,
      minEncounters: typeof def.minEncounters === "number" ? def.minEncounters : 2,
    };
    state.questDialog = null;
    state.npcDialog = null;
    if (state.phase === "story_illiri") state.illiriView = "party";
    else state.settlementView = "inventory";
    logLine("Accepted quest: <span class=\"hi\">" + def.name + "</span>.", "good");
    trackPlaytest("quest_accepted", { questId: questId });
    render();
  }

  function declineQuest() {
    state.questDialog = null;
    render();
  }

  function beginQuestTrek() {
    if (!state.quest) return;
    var town = state.settlementTown || state.quest.startedAt || "cantebury";
    if (state.food <= 0) {
      logLine("You need supplies before heading into the pass.", "bad");
      render();
      return;
    }
    var def = questDef(state.quest.id);
    state.quest.status = "active";
    state.phase = "quest_trek";
    state.travelOrigin = town;
    state.travelInventoryOpen = false;
    state.inventoryDetailOpen = false;
    state.encounterChance = ENCOUNTER_BASE;
    state.stableRestDays = 0;
    logLine("You set out for the mountain pass. " + (def ? def.totalDays : 5) + " days ahead.", "hi");
    trackPlaytest("quest_trek_started", { questId: state.quest.id });
    render();
  }

  function advanceQuestDay() {
    if (state.phase !== "quest_trek" || !state.quest) return;
    if (state.transition) return;
    consumeTravelDaySupplies();
    if (allDead()) {
      state.gameoverMode = "loss";
      state.phase = "gameover";
      logLine("The party is lost in the mountain pass.", "bad");
      render();
      return;
    }
    state.travelDay++;
    state.quest.dayProgress++;
    tickJourneyDay();
    state.stableRestDays = 0;
    processDailyDeath();
    if (state.phase === "gameover") { render(); return; }
    applyTravelDayMpRegen();
    var def = questDef(state.quest.id);
    if (!def) {
      logLine("Quest data missing. Returning to town.", "bad");
      abandonQuest();
      return;
    }
    if (state.quest.dayProgress >= state.quest.totalDays) {
      queueEncounterCutaway(def.bossLabel || "Final stand", "Day " + state.quest.dayProgress + " of " + state.quest.totalDays + " - the quarry shows itself", function () {
        startTacticalCombat(buildQuestBossEncounter(def));
      });
      return;
    }
    var doneSoFar = state.quest.encountersDone || 0;
    var minNeeded = typeof state.quest.minEncounters === "number" ? state.quest.minEncounters : 2;
    var daysLeftAfterToday = (state.quest.totalDays - 1) - state.quest.dayProgress;
    var stillNeeded = Math.max(0, minNeeded - doneSoFar);
    var forceEncounter = stillNeeded > daysLeftAfterToday;
    var encounterToday = forceEncounter || Math.random() < 0.5;
    if (encounterToday) {
      state.quest.encountersDone = doneSoFar + 1;
      queueEncounterCutaway("Pass ambush", "Day " + state.quest.dayProgress + " of " + state.quest.totalDays + " in the pass", function () {
        startTacticalCombat(buildQuestEncounter(def));
      });
    } else {
      logLine("Day " + state.quest.dayProgress + " of " + state.quest.totalDays + " in the pass passes quietly.", "");
      render();
    }
  }

  function abandonQuest() {
    var def = state.quest ? questDef(state.quest.id) : null;
    var name = def ? def.name : "the quest";
    var town = (state.quest && state.quest.startedAt) || state.settlementTown || "cantebury";
    var qid = state.quest && state.quest.id;
    state.quest = null;
    state.phase = "settlement";
    state.settlementTown = town;
    state.settlementView = "inventory";
    state.encounterChance = ENCOUNTER_BASE;
    internPendingHeadstones();
    logLine("Abandoned " + name + ". You return to " + locationLabel(town) + " empty-handed.", "bad");
    trackPlaytest("quest_abandoned", { questId: qid });
    render();
  }

  function completeCurrentQuest() {
    if (!state.quest) return;
    var def = questDef(state.quest.id);
    if (!def) return;
    var town = state.quest.startedAt || state.settlementTown || "cantebury";
    var qid = state.quest.id;
    var reward = def.rewardGold || 0;
    state.gold += reward;
    state.questsCompleted = (state.questsCompleted || []).concat([qid]);
    logLine("<span class=\"hi\">" + def.name + "</span> complete! Reward: +" + reward + " gp.", "good");
    trackPlaytest("quest_completed", { questId: qid, reward: reward });
    state.quest = null;
    state.phase = "settlement";
    state.settlementTown = town;
    state.settlementView = "inventory";
    state.encounterChance = ENCOUNTER_BASE;
    internPendingHeadstones();
    render();
  }

  function buildQuestEncounter(def) {
    var pool = BALANCE_MONSTERS.filter(function (m) {
      return m && def.monsterPool.indexOf(m.name) >= 0;
    });
    if (!pool.length) pool = BALANCE_MONSTERS.slice();
    var n = rollInt(1, 3);
    var list = [];
    for (var i = 0; i < n; i++) {
      var mon = randomBalanceMonster(pool);
      var baseHp = Math.max(1, parseInt(mon && mon.hp, 10) || 1);
      var scaled = Math.max(1, Math.round(baseHp * monsterHpMultiplierForProgress()));
      list.push({
        id: "qm" + i,
        name: mon.name,
        hp: scaled,
        maxHp: scaled,
        dmg: monsterDamageForName(mon.name),
        level: (mon && mon.level) || 1,
      });
    }
    return { kind: "quest_combat", label: n + " hostile(s) in the pass", foes: list };
  }

  function buildQuestBossEncounter(def) {
    var bossDef = null;
    for (var i = 0; i < BALANCE_MONSTERS.length; i++) {
      if (BALANCE_MONSTERS[i] && BALANCE_MONSTERS[i].name === def.bossMonster) {
        bossDef = BALANCE_MONSTERS[i];
        break;
      }
    }
    if (!bossDef) bossDef = { name: def.bossMonster || "Drake", hp: 25, atk: 8, level: 3 };
    var foes = [];
    var count = def.bossCount || 1;
    for (var j = 0; j < count; j++) {
      var baseHp = Math.max(1, parseInt(bossDef.hp, 10) || 25);
      foes.push({
        id: "qb" + j,
        name: bossDef.name,
        hp: baseHp,
        maxHp: baseHp,
        dmg: monsterDamageForName(bossDef.name),
        level: bossDef.level || 3,
      });
    }
    return { kind: "quest_boss_drakes", label: def.bossLabel || (count + " " + bossDef.name), foes: foes };
  }

  function endAdventureBackInTown() {
    var town = state.adventure ? state.adventure.town : (state.settlementTown || "cantebury");
    trackPlaytest("adventure_ended", { town: town });
    state.adventure = null;
    if (town === "cantebury") {
      state.phase = "story_illiri";
      state.illiriView = "adventure";
      state.settlementTown = null;
    } else {
      state.phase = "settlement";
      state.settlementTown = town;
      state.settlementView = "church";
    }
    state.encounterChance = ENCOUNTER_BASE;
    state.elaraDialog = null;
    state.elaraDialogShown = false;
    internPendingHeadstones();
    render();
  }

  function findElaraInParty() {
    for (var i = 0; i < state.party.length; i++) {
      var m = state.party[i];
      if (m && m.name === "Captain Elara Vale" && m.hp > 0) return m;
    }
    return null;
  }

  function maybeTriggerElaraDialog() {
    if (state.phase !== "adventure") return;
    if (state.elaraDialog) return;
    if (state.elaraDialogShown) return;
    var elara = findElaraInParty();
    if (!elara) return;
    if (!elara.maxHp || elara.hp / elara.maxHp >= 0.5) return;
    state.elaraDialog = {
      portrait: elara.headshot || "Vale.jpeg",
      speaker: elara.name,
      text: "Man, this is tough."
    };
    state.elaraDialogShown = true;
    trackPlaytest("elara_dialog_triggered", { hp: elara.hp, maxHp: elara.maxHp });
  }

  function confirmDialogOverlayHtml(dlg) {
    if (!dlg) return "";
    var title = dlg.title || "Confirm";
    var message = dlg.message || "Are you sure?";
    var confirmLabel = dlg.confirmLabel || "Yes";
    var cancelLabel = dlg.cancelLabel || "Cancel";
    return (
      '<div class="confirm-dialog-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.65);display:flex;align-items:center;justify-content:center;z-index:60;padding:1rem">' +
        '<div class="confirm-dialog" style="background:#2a2218;border:2px solid #c89c3f;border-radius:12px;padding:1rem 1.25rem;max-width:30rem;width:100%;box-shadow:0 8px 30px rgba(0,0,0,0.6)">' +
          '<div style="color:#c89c3f;font-weight:600;margin-bottom:.35rem">' + escapeHtml(title) + '</div>' +
          '<div style="color:#e8dcc8;margin-bottom:.75rem">' + message + '</div>' +
          '<div style="text-align:right;display:flex;justify-content:flex-end;gap:.4rem;flex-wrap:wrap">' +
            '<button type="button" id="confirmDialogCancel">' + escapeHtml(cancelLabel) + '</button>' +
            '<button type="button" class="primary" id="confirmDialogYes">' + escapeHtml(confirmLabel) + '</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  var CONFIRM_HANDLERS = {
    executeAdventureReturn: function () { executeAdventureReturn(); },
  };

  function campDialogOverlayHtml() {
    var dlg = state.campDialog;
    if (!dlg) return "";
    var forageDisabled = dlg.hasForage ? "" : " disabled";
    return (
      '<div class="camp-dialog-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.65);display:flex;align-items:center;justify-content:center;z-index:60;padding:1rem">' +
        '<div class="camp-dialog" style="background:#2a2218;border:2px solid #c89c3f;border-radius:12px;padding:1rem 1.25rem;max-width:32rem;width:100%;box-shadow:0 8px 30px rgba(0,0,0,0.6)">' +
          '<div style="color:#c89c3f;font-weight:600;margin-bottom:.35rem">Set up camp?</div>' +
          '<div style="color:#e8dcc8;margin-bottom:.5rem">Pick how the night unfolds. There is always a ~20% chance the watch fires draw eyes.</div>' +
          '<ul style="color:#9a8b78;margin:0 0 .75rem 1rem;padding:0;list-style:disc">' +
            '<li><b>Rest only</b>: lose 1 supply, recover 50% of missing HP.</li>' +
            '<li><b>Rest & forage</b>: lose 2 supplies, recover 25% of missing HP, chance to find supplies, gold, or gear.</li>' +
          '</ul>' +
          '<div style="display:flex;justify-content:flex-end;gap:.4rem;flex-wrap:wrap">' +
            '<button type="button" id="campDialogCancel">Cancel</button>' +
            '<button type="button" id="campDialogForage"' + forageDisabled + '>Rest & forage</button>' +
            '<button type="button" class="primary" id="campDialogRest">Rest only</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function wireCampDialog(root) {
    if (!state.campDialog) return;
    var rest = root.querySelector("#campDialogRest");
    var forage = root.querySelector("#campDialogForage");
    var cancel = root.querySelector("#campDialogCancel");
    if (rest) rest.onclick = function () { campRest("rest"); };
    if (forage) forage.onclick = function () { campRest("forage"); };
    if (cancel) cancel.onclick = cancelCampDialog;
  }

  function wireConfirmDialog(root) {
    var dlg = state.confirmDialog;
    if (!dlg) return;
    var yes = root.querySelector("#confirmDialogYes");
    var no = root.querySelector("#confirmDialogCancel");
    if (yes) yes.onclick = function () {
      var h = CONFIRM_HANDLERS[dlg.onConfirm];
      if (h) h();
      else { state.confirmDialog = null; render(); }
    };
    if (no) no.onclick = cancelConfirmDialog;
  }

  function questDialogOverlayHtml(dlg) {
    var def = dlg && dlg.questId ? questDef(dlg.questId) : null;
    if (!def) return "";
    return (
      '<div class="quest-dialog-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.65);display:flex;align-items:center;justify-content:center;z-index:50;padding:1rem">' +
        '<div class="quest-dialog" style="background:#2a2218;border:2px solid #c89c3f;border-radius:12px;padding:1rem 1.25rem;max-width:32rem;width:100%;box-shadow:0 8px 30px rgba(0,0,0,0.6)">' +
          '<div style="color:#c89c3f;font-weight:600;margin-bottom:.35rem">Barkeep</div>' +
          '<div style="color:#e8dcc8;margin-bottom:.5rem;font-style:italic">"' + escapeHtml(def.pitch) + '"</div>' +
          '<div style="color:#9a8b78;margin-bottom:.75rem">' + escapeHtml(def.summary) +
          ' Reward: <b style="color:#e8dcc8">' + def.rewardGold + ' gp</b>.</div>' +
          '<div style="text-align:right;display:flex;justify-content:flex-end;gap:.4rem;flex-wrap:wrap">' +
            '<button type="button" id="questDecline">Not interested</button>' +
            '<button type="button" class="primary" id="questAccept-' + def.id + '">Accept quest</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function postBattleDialogOverlayHtml() {
    var dlg = state.postBattleDialog;
    if (!dlg) return "";
    var portraitUrl = headshotUrl(dlg.portrait || "Vale.jpeg");
    return (
      '<div class="post-battle-dialog-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.65);display:flex;align-items:center;justify-content:center;z-index:55;padding:1rem">' +
        '<div class="post-battle-dialog" style="background:#2a2218;border:2px solid #c89c3f;border-radius:12px;padding:1rem 1.25rem;max-width:28rem;width:100%;display:flex;gap:1rem;align-items:flex-start;box-shadow:0 8px 30px rgba(0,0,0,0.6)">' +
          '<img src="' + portraitUrl + '" alt="' + escapeHtml(dlg.speaker || "") + '" style="width:84px;height:84px;border-radius:8px;object-fit:cover;border:1px solid #4a3d2a;flex-shrink:0">' +
          '<div style="flex:1;min-width:0">' +
            '<div style="color:#c89c3f;font-weight:600;margin-bottom:.35rem">' + escapeHtml(dlg.speaker || "") + '</div>' +
            '<div style="color:#e8dcc8;margin-bottom:.75rem;font-style:italic">"' + escapeHtml(dlg.text || "") + '"</div>' +
            '<div style="text-align:right">' +
              '<button type="button" id="postBattleDialogClose">Continue</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function wirePostBattleDialog(root) {
    if (!state.postBattleDialog) return;
    var b = root.querySelector("#postBattleDialogClose");
    if (b) b.onclick = function () { state.postBattleDialog = null; render(); };
  }

  function elaraDialogOverlayHtml(dlg) {
    var portraitUrl = headshotUrl(dlg.portrait || "Vale.jpeg");
    return (
      '<div class="elara-dialog-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.65);display:flex;align-items:center;justify-content:center;z-index:50;padding:1rem">' +
        '<div class="elara-dialog" style="background:#2a2218;border:2px solid #c89c3f;border-radius:12px;padding:1rem 1.25rem;max-width:28rem;width:100%;display:flex;gap:1rem;align-items:flex-start;box-shadow:0 8px 30px rgba(0,0,0,0.6)">' +
          '<img src="' + portraitUrl + '" alt="' + escapeHtml(dlg.speaker || "") + '" style="width:84px;height:84px;border-radius:8px;object-fit:cover;border:1px solid #4a3d2a;flex-shrink:0">' +
          '<div style="flex:1;min-width:0">' +
            '<div style="color:#c89c3f;font-weight:600;margin-bottom:.35rem">' + escapeHtml(dlg.speaker || "") + '</div>' +
            '<div style="color:#e8dcc8;margin-bottom:.75rem;font-style:italic">"' + escapeHtml(dlg.text || "") + '"</div>' +
            '<div style="text-align:right">' +
              '<button type="button" id="elaraDialogClose">Continue</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function buy(item) {
    if (item === "food") {
      if (state.gold < 1) {
        logLine("The shopkeeper shrugs: you need at least <span class=\"hi\">1 gp</span>.", "bad");
        render();
        return;
      }
      if (state.food >= MAX_SUPPLIES) {
        logLine("Supply packs are full (" + MAX_SUPPLIES + ").", "bad");
        render();
        return;
      }
      state.gold -= 1;
      addSupplies(1);
      logLine("Bought 1 supply.", "");
      render();
      return;
    }
    if (item === "heal_potion") {
      if (state.gold < 5) {
        logLine("Need 5 gp for a Potion of Healing.", "bad");
        render();
        return;
      }
      state.gold -= 5;
      state.healingPotions += 1;
      logLine("Bought Potion of Healing (+3 HP when used).", "good");
      render();
      return;
    }
    if (item === "life_potion") {
      if (state.gold < 15) {
        logLine("Need 15 gp for a Potion of Life.", "bad");
        render();
        return;
      }
      state.gold -= 15;
      state.lifePotions += 1;
      logLine("Bought Potion of Life (revive to 50% HP).", "good");
      render();
      return;
    }
    logLine("That item is not sold here.", "bad");
    render();
  }

  function innRestCost() {
    return Math.max(1, Math.ceil(state.gold * 0.1));
  }

  function restAtInn() {
    var cost = innRestCost();
    if (state.gold < cost) {
      logLine("Not enough gold for an inn room. Try the stables instead.", "bad");
      render();
      return;
    }
    state.gold -= cost;
    state.party.forEach(function (m) {
      if (m.hp > 0) m.hp = m.maxHp;
    });
    if (state.guest && state.guest.hp > 0) state.guest.hp = state.guest.maxHp;
    state.stableRestDays = 0;
    tickJourneyDay();
    logLine("Inn stay complete (-" + cost + " gp). Living members restored to full HP.", "good");
    render();
  }

  function stableRestEfficiency() {
    var consec = state.stableRestDays || 0;
    var eff = 0.5 - 0.25 * consec;
    return Math.max(0, eff);
  }

  function restAtStables() {
    var eff = stableRestEfficiency();
    if (eff <= 0) {
      logLine("The stables are picked clean of hay. Another night here will not help (0% HP).", "bad");
      state.stableRestDays = (state.stableRestDays || 0) + 1;
      tickJourneyDay();
      render();
      return;
    }
    var pct = Math.round(eff * 100);
    state.party.forEach(function (m) {
      if (m.hp <= 0) return;
      var missing = Math.max(0, m.maxHp - m.hp);
      var gain = Math.ceil(missing * eff);
      m.hp = Math.min(m.maxHp, m.hp + gain);
    });
    if (state.guest && state.guest.hp > 0) {
      var gMissing = Math.max(0, state.guest.maxHp - state.guest.hp);
      state.guest.hp = Math.min(state.guest.maxHp, state.guest.hp + Math.ceil(gMissing * eff));
    }
    state.stableRestDays = (state.stableRestDays || 0) + 1;
    tickJourneyDay();
    logLine("Stable rest (" + pct + "% of missing HP recovered).", "");
    render();
  }

  function noteStretchedRationGrumbles() {
    if (state.rationMode !== "stretch") {
      state.stretchedRationDays = 0;
      return;
    }
    state.stretchedRationDays = (state.stretchedRationDays || 0) + 1;
    if (state.stretchedRationDays === 2) {
      logLine('A civilian mutters, "You know, only dictators hold food back."', "bad");
    } else if (state.stretchedRationDays === 5) {
      logLine('Someone in the train sighs, "It was easier back in Cantebury."', "bad");
    }
  }

  function consumeTravelDaySupplies() {
    if (state.food > 0) {
      var stretch = state.rationMode === "stretch";
      var saveChance = stretch ? Math.min(0.85, caravanSupplySaveChance() + 0.35) : caravanSupplySaveChance();
      if (Math.random() < saveChance) {
        logLine(
          stretch
            ? "Caravan drovers stretch the rations — no supply spent today."
            : "Caravan drovers ration carefully — no supply spent today.",
          ""
        );
        if (stretch) noteStretchedRationGrumbles();
      } else {
        state.food--;
        if (stretch) state.stretchedRationDays = 0;
      }
    } else {
      partyAlive().forEach(function (m) {
        m.hp = Math.max(0, m.hp - 2);
      });
      logLine("No supplies (-2 HP each).", "bad");
    }
  }

  function tickJourneyDay() {
    if (typeof state.totalDaysElapsed !== "number") state.totalDaysElapsed = 0;
    state.totalDaysElapsed++;
    tickBlessingExpiry();
    if (checkCampaignVictoryAtNewIsil() && state.phase !== "gameover") {
      /* victory only triggers on New Isil arrival, not mid-trail */
    }
  }

  function applyCampHealing(percent) {
    if (typeof percent !== "number") percent = 0.5;
    percent = Math.min(1, percent + caravanCampHealBonus());
    var pctLabel = Math.round(percent * 100);
    state.party.forEach(function (m) {
      if (!m || m.hp <= 0) return;
      var missing = Math.max(0, m.maxHp - m.hp);
      if (missing <= 0) return;
      var gain = Math.ceil(missing * percent);
      m.hp = Math.min(m.maxHp, m.hp + gain);
    });
    if (state.guest && state.guest.hp > 0) {
      var gMissing = Math.max(0, state.guest.maxHp - state.guest.hp);
      if (gMissing > 0) state.guest.hp = Math.min(state.guest.maxHp, state.guest.hp + Math.ceil(gMissing * percent));
    }
    logLine("Camp is quiet. Each living member recovers " + pctLabel + "% of missing HP.", "good");
  }

  function applyForageRewards() {
    var bag = [];
    if (Math.random() < caravanForageSupplyChance()) {
      var gained = addSupplies(1);
      if (gained) bag.push("+1 supply (caravan foragers)");
    }
    if (Math.random() < caravanForageGoldChance()) {
      state.gold += 1;
      bag.push("+1 gold (caravan traders)");
    }
    if (Math.random() < 0.20) {
      var w = WEAPON_TIERS[0];
      state.weaponInventory.push(w.id);
      state.weapons++;
      bag.push("+1 " + w.label);
    }
    if (Math.random() < 0.15) { state.healingPotions++; bag.push("+1 healing potion"); }
    if (Math.random() < 0.05) { state.lifePotions++; bag.push("+1 life potion"); }
    if (bag.length) logLine("Forage spoils: " + bag.join(", ") + ".", "good");
    else logLine("Nothing useful turns up in the brush.", "");
  }

  function openCampDialog() {
    if (state.transition) return;
    var phase = state.phase;
    if (phase !== "travel" && phase !== "adventure" && phase !== "quest_trek") return;
    if (state.food <= 0) {
      logLine("You have no supplies left to make camp.", "bad");
      render();
      return;
    }
    state.campDialog = {
      hasForage: state.food >= 2,
    };
    render();
  }

  function cancelCampDialog() {
    state.campDialog = null;
    render();
  }

  function campRest(mode) {
    if (state.transition) return;
    state.campDialog = null;
    var phase = state.phase;
    if (phase !== "travel" && phase !== "adventure" && phase !== "quest_trek") return;
    var foraging = mode === "forage";
    var hpPercent = foraging ? 0.25 : 0.5;
    consumeTravelDaySupplies();
    if (foraging) {
      if (state.food <= 0) {
        logLine("Not enough supplies to forage at camp.", "bad");
        render();
        return;
      }
      state.food--;
    }
    if (allDead()) {
      state.gameoverMode = "loss";
      state.phase = "gameover";
      logLine("The party is lost at camp.", "bad");
      render();
      return;
    }
    state.travelDay++;
    tickJourneyDay();
    state.stableRestDays = 0;
    processDailyDeath();
    if (state.phase === "gameover") { render(); return; }
    applyCampMpRegen();
    if (phase === "travel") {
      logLine("You camp on the road. Day " + state.travelDay + " of " + currentRouteDays() + ".", "");
    } else if (phase === "adventure" && state.adventure) {
      logLine("You hold camp near " + locationLabel(state.adventure.town) + ".", "");
    } else {
      logLine("You camp in the pass.", "");
    }
    if (Math.random() < 0.20) {
      var encBuilder;
      if (phase === "quest_trek" && state.quest) {
        var qDefRest = questDef(state.quest.id);
        if (qDefRest) encBuilder = function () { return buildQuestEncounter(qDefRest); };
      }
      if (!encBuilder) {
        var sourceKind = phase === "adventure" ? "adventure" : "road";
        encBuilder = function () { return buildRandomMonsterEncounter(sourceKind); };
      }
      queueEncounterCutaway("Camp ambush", "Watch fires draw eyes", function () {
        startTacticalCombat(encBuilder());
      });
      return;
    }
    applyCampHealing(hpPercent);
    if (foraging) applyForageRewards();
    if (phase === "travel" && state.travelDay >= currentRouteDays()) {
      logLine("You drift into " + currentDestination().label + " on rest legs.", "good");
      queueArrivalAtDestination();
      return;
    }
    render();
  }

  function addPartyMember(role) {
    if (state.party.length >= PARTY_MAX) {
      logLine("Party is full (" + PARTY_MAX + " members).", "bad");
      return;
    }
    if (state.phase === "settlement" && state.settlementView === "tavern") {
      if ((state.settlementRecruitSlots || 0) <= 0) {
        logLine("No recruits are available in this settlement right now.", "bad");
        render();
        return;
      }
      if (state.settlementRecruitMode === "soldier_only" && role !== "soldier") {
        logLine("Solem only has soldiers available for hire.", "bad");
        render();
        return;
      }
    }
    var id = "p" + state.partyIdSeq++;
    var portrait = pickUniquePortrait(role, null, usedHeadshotsMap());
    if (!portrait.headshot) {
      state.partyIdSeq--;
      logLine("No unique " + role + " headshots remain for this session.", "bad");
      render();
      return;
    }
    var fresh = initMemberProgress({
      id: id,
      name: rollCharacterName(),
      role: role,
      gender: portrait.gender,
      headshot: portrait.headshot,
      hp: CLASS_HP[role],
      maxHp: CLASS_HP[role],
    });
    fresh.hp = fresh.maxHp;
    fresh.mp = fresh.maxMp;
    state.party.push(fresh);
    if (state.phase === "settlement" && state.settlementView === "tavern") {
      state.settlementRecruitSlots = Math.max(0, (state.settlementRecruitSlots || 0) - 1);
    }
    logLine("Recruited a " + role + " (" + id + "). Joins at full health.", "good");
    render();
  }

  function removePartyMember(memberId) {
    if (state.party.length <= 1) {
      logLine("You need at least one party member.", "bad");
      return;
    }
    var prev = state.party.length;
    state.party = state.party.filter(function (p) {
      return p.id !== memberId;
    });
    if (state.party.length === prev) return;
    logLine("Removed " + memberId + " from the party.", "");
    render();
  }

  function rosterEditHtml(titleOpt, noteOpt) {
    var hTitle = titleOpt || "Party roster";
    var hNote =
      noteOpt ||
      "Up to " +
      PARTY_MAX +
      " members (guest is separate). At least one must stay.";
    var rows = state.party
      .map(function (m) {
        return (
          '<li class="roster-row">' +
          '<span class="' +
          avatarClass(m.role) +
          ' sm">' +
          m.role.charAt(0).toUpperCase() +
          "</span>" +
          '<span class="role-' +
          m.role +
          ' roster-name">' +
          m.name +
          "</span>" +
          '<span class="roster-meta">' +
          m.hp +
          "/" +
          m.maxHp +
          " HP</span>" +
          '<button type="button" class="roster-remove" data-remove="' +
          m.id +
          '">Remove</button>' +
          "</li>"
        );
      })
      .join("");
    var full = state.party.length >= PARTY_MAX;
    var dis = full ? " disabled" : "";
    return (
      "<h3 class=\"roster-heading\">" +
      hTitle +
      "</h3>" +
      "<p class=\"roster-note\">" +
      hNote +
      "</p>" +
      "<ul class=\"roster-edit\">" +
      rows +
      "</ul>" +
      "<div class=\"roster-add\">" +
      '<button type="button" id="addSoldier"' +
      dis +
      ">+ Soldier</button>" +
      '<button type="button" id="addPriest"' +
      dis +
      ">+ Priest</button>" +
      '<button type="button" id="addMercenary"' +
      dis +
      ">+ Mercenary</button>" +
      '<button type="button" id="addMage"' +
      dis +
      ">+ Mage</button>" +
      "</div>"
    );
  }

  function illiriTabStrip() {
    function tab(which, label) {
      var active = state.illiriView === which ||
        (which === "party" && state.illiriView === "inventory") ||
        (which === "castle" && state.illiriView === "keep");
      return (
        '<button type="button" role="tab" class="' +
        ("illiri-tab" + (active ? " illiri-tab-active" : "")) +
        '" data-illiri-tab="' +
        which +
        '" aria-selected="' +
        (active ? "true" : "false") +
        '">' +
        label +
        "</button>"
      );
    }
    return (
      '<nav class="illiri-tabs" role="tablist" aria-label="Cantebury">' +
      tab("castle", "Castle") +
      tab("city", "City") +
      tab("party", "Party") +
      tab("adventure", "Adventure") +
      tab("depart", "Depart") +
      "</nav>"
    );
  }

  function normalizeCanteburyNav() {
    var v = state.illiriView;
    if (v === "keep") state.illiriView = "castle";
    else if (v === "inventory") state.illiriView = "party";
    else if (v === "shop" || v === "tavern") {
      state.cityView = v;
      state.illiriView = "city";
    } else if (v === "church") {
      state.keepView = "chapel";
      state.illiriView = "castle";
    } else if (v === "inn") {
      state.cityView = "shop";
      state.illiriView = "city";
    }
    if (!state.keepView) state.keepView = "hall";
    if (!state.cityView) state.cityView = "shop";
  }

  function openInventoryView() {
    state.illiriView = "party";
    render();
  }

  function wireIlliriTabs(root) {
    var tabs = root.querySelectorAll("[data-illiri-tab]");
    var i;
    for (i = 0; i < tabs.length; i++) {
      tabs[i].onclick = (function (el) {
        return function () {
          state.illiriView = el.getAttribute("data-illiri-tab");
          if (state.illiriView === "castle") state.keepView = state.keepView || "hall";
          if (state.illiriView === "city") state.cityView = state.cityView || "shop";
          render();
        };
      })(tabs[i]);
    }
  }

  function questPanelHtml() {
    var heading = '<h3 class="church-section-title" style="margin-top:1.5rem">Quest log</h3>';
    if (!state.quest) {
      var completed = (state.questsCompleted || []).map(function (qid) {
        var qd = questDef(qid);
        return qd ? '<li>' + escapeHtml(qd.name) + ' <span class="hint">(complete)</span></li>' : '';
      }).join("");
      return heading +
        '<p class="hint">No active quest. Ask around the tavern for work.</p>' +
        (completed
          ? '<h4 class="church-section-title" style="margin-top:.75rem">Past deeds</h4><ul class="roster-edit">' + completed + '</ul>'
          : '');
    }
    var qd = questDef(state.quest.id);
    if (!qd) return heading + '<p class="hint">Quest data missing.</p>';
    return heading +
      '<p><b>' + escapeHtml(qd.name) + '</b> - ' + escapeHtml(qd.summary) + '</p>' +
      '<div class="shop-block"><div class="shop-row" style="flex-direction:column;align-items:stretch">' +
      '<div>Progress: <b>' + state.quest.dayProgress + ' / ' + state.quest.totalDays + '</b> days into the pass.</div>' +
      '<div class="hint">Reward on completion: ' + qd.rewardGold + ' gp.</div>' +
      '<div style="margin-top:.5rem;display:flex;gap:.4rem;flex-wrap:wrap">' +
      '<button type="button" class="primary" id="questBegin"' + (state.food > 0 ? "" : " disabled") + '>' +
      (state.quest.dayProgress > 0 ? "Resume trek" : "Set out for the pass") +
      '</button>' +
      '<button type="button" id="questAbandon">Abandon quest</button>' +
      '</div>' +
      '</div></div>';
  }

  function memorialPanelHtml(townKey) {
    var frozenStones = (state.headstones || []).filter(function (hs) {
      return hs && hs.town === townKey && isHeadstoneFrozen(hs);
    });
    if (frozenStones.length === 0) return "";
    var memHtml = '<h3 class="church-section-title" style="margin-top:1.5rem">In Memoriam</h3>' +
      '<p class="hint">Sealed memorials at ' + locationLabel(townKey) +
      '. Each headstone is set in stone &mdash; final words for fallen comrades. ' + memorialDateHintHtml() + '</p>' +
      '<div class="shop-block">';
    for (var mi = 0; mi < frozenStones.length; mi++) {
      var fhs = frozenStones[mi];
      var fNote = String(fhs.note || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      var fTheirs = fhs.runId === state.runId;
      memHtml += '<div class="shop-row" style="flex-direction:column;align-items:stretch">' +
        '<div style="display:flex;gap:.75rem;align-items:flex-start">' +
        '<div style="font-size:1.75rem;line-height:1;color:#9a8b78" aria-hidden="true">\u2020</div>' +
        '<div style="flex:1">' +
        '<div><b>' + escapeHtml(fhs.name) + '</b> (' + roleLabel(fhs.role) + ')</div>' +
        '<div class="hint"><span class="hi">' + escapeHtml(formatMemorialDate(fhs)) + '</span> &mdash; lost on ' + escapeHtml(fhs.location) +
          (fTheirs ? '.' : '. (previous traveler)') + '</div>' +
        '<div style="margin-top:.5rem;padding:.5rem .6rem;background:#1c160e;border:1px solid #4a3d2a;border-radius:6px;font-style:italic;color:#e8dcc8;min-height:2.5em">' +
          (fNote || '<span class="hint">[No inscription left.]</span>') +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';
    }
    memHtml += '</div>';
    return memHtml;
  }

  function settlementTabStrip(townKey) {
    function tab(id, label) {
      return (
        '<button type="button" class="illiri-tab' +
        (state.settlementView === id ? " illiri-tab-active" : "") +
        '" data-settlement-tab="' +
        id +
        '">' +
        label +
        "</button>"
      );
    }
    var html = '<div class="illiri-tabs">';
    if (townHasKeep(townKey)) {
      html += tab("keep", townKey === "solem" ? "Keep" : "Castle");
    }
    html +=
      tab("church", "Church") +
      tab("inn", "Inn") +
      tab("tavern", "Tavern") +
      tab("shop", "Shop") +
      tab("inventory", "Party" + (state.quest ? " *" : "")) +
      tab("adventure", "Adventure") +
      tab("depart", "Depart") +
      "</div>";
    return html;
  }

  function wireSettlementTabs(root) {
    var tabs = root.querySelectorAll("[data-settlement-tab]");
    var i;
    for (i = 0; i < tabs.length; i++) {
      tabs[i].onclick = (function (el) {
        return function () {
          state.settlementView = el.getAttribute("data-settlement-tab") || "church";
          if (state.settlementView === "keep") state.keepView = state.keepView || "hall";
          render();
        };
      })(tabs[i]);
    }
  }

  function citySubTabStrip(activeView) {
    function sub(id, label) {
      return (
        '<button type="button" class="illiri-tab' +
        (activeView === id ? " illiri-tab-active" : "") +
        '" data-city-sub="' +
        id +
        '">' +
        label +
        "</button>"
      );
    }
    return (
      '<nav class="illiri-tabs keep-subtabs" role="tablist" aria-label="City">' +
      sub("shop", "Shop") +
      sub("tavern", "Tavern") +
      "</nav>"
    );
  }

  function canteburyTavernInnerHtml() {
    return (
      '<p class="tavern-lead">Dim light, spilled ale, dice in the corner. The barkeep knows everyone who marches the trade road.</p>' +
      '<div class="tavern-choice-row">' +
      '<button type="button" class="primary" id="barkeepBtn">Talk to the barkeep</button>' +
      "</div>" +
      rosterEditHtml(
        "Add / remove party members",
        "Recruit fighters only — soldiers, priests, mercenaries, or mages (up to " +
          PARTY_MAX +
          "). " +
          caravanFollowersSummary() +
          " travel with the train. Guest slot is separate."
      ) +
      caravanFollowersPanelHtml() +
      '<div class="actions tavern-guest-actions">' +
      '<button type="button" id="guestBtn">' +
      (state.guest ? "Dismiss guest" : "Add test guest") +
      "</button>" +
      "</div>"
    );
  }

  function canteburyAdventurePanelHtml() {
    return (
      "<h2 class=\"panel-title\">Local adventure</h2>" +
      '<p class="town-lead">Scout the meadows and lanes around Cantebury before the long westward march. Up to <b>10 days</b> exploring nearby wilds.</p>' +
      '<p class="hint">Training grounds: foes are <b>level 1</b> only. Encounter pace is <b>80% slower</b> than adventures from other towns.</p>' +
      '<div class="actions">' +
      '<button type="button" class="primary" id="beginCanteburyAdventureBtn"' +
      (state.food > 0 ? "" : " disabled") +
      ">Venture out (begin trek)</button>" +
      "</div>"
    );
  }

  function cityInteriorHtml() {
    var view = state.cityView || "shop";
    var inner =
      view === "tavern"
        ? canteburyTavernInnerHtml()
        : '<p class="shopkeeper-lead">Market stalls along the high street — road fare and common potions.</p>' +
          canteburyShopInnerHtml();
    return (
      "<h2 class=\"panel-title\">Cantebury</h2>" +
      '<p class="town-lead">Shops and the traveler\'s quarter below the castle walls.</p>' +
      citySubTabStrip(view) +
      inner
    );
  }

  function wireCitySubTabs(root) {
    var tabs = root.querySelectorAll("[data-city-sub]");
    var i;
    for (i = 0; i < tabs.length; i++) {
      tabs[i].onclick = (function (el) {
        return function () {
          state.cityView = el.getAttribute("data-city-sub") || "shop";
          render();
        };
      })(tabs[i]);
    }
  }

  function wireCanteburyTavern(root) {
    wireRosterEdit(root);
    wireTavernBarkeep(root);
    var guestBtn = root.querySelector("#guestBtn");
    if (guestBtn) {
      guestBtn.onclick = function () {
        if (state.guest) {
          state.guest = null;
          logLine("Guest dismissed.", "");
        } else {
          var guestPortrait = pickUniquePortrait("soldier", null, usedHeadshotsMap());
          if (!guestPortrait.headshot) {
            logLine("No unique soldier headshots remain for a guest this session.", "bad");
            render();
            return;
          }
          state.guest = {
            id: "g1",
            name: "Guest: Guide",
            role: "soldier",
            gender: guestPortrait.gender,
            headshot: guestPortrait.headshot,
            hp: 10,
            maxHp: 10,
            staticMember: true,
          };
          logLine("Guest joins - seventh member alongside your party of " + state.party.length + ".", "good");
        }
        render();
      };
    }
  }

  function wireCityInterior(root) {
    wireCitySubTabs(root);
    var view = state.cityView || "shop";
    if (view === "shop") wireCanteburyShop(root);
    else wireCanteburyTavern(root);
  }

  function keepTitle(townKey) {
    return townKey === "solem" ? "Citadel Keep" : "Cantebury Castle";
  }

  function keepLead(townKey) {
    if (townKey === "solem") {
      return "Stone halls rise above the river forks. Garrison clerks, quartermasters, and the magistrate's court all work from this keep.";
    }
    return "The governor's castle overlooks the market road. Petitioners, the keep chapel, and the crown quartermaster all lie within the inner ward.";
  }

  function keepSubTabStrip(activeView) {
    function sub(id, label) {
      return (
        '<button type="button" class="illiri-tab' +
        (activeView === id ? " illiri-tab-active" : "") +
        '" data-keep-sub="' +
        id +
        '">' +
        label +
        "</button>"
      );
    }
    return (
      '<nav class="illiri-tabs keep-subtabs" role="tablist" aria-label="Keep">' +
      sub("hall", "Hall") +
      sub("chapel", "Chapel") +
      sub("shop", "Quartermaster") +
      "</nav>"
    );
  }

  function keepHallHtml(townKey) {
    if (townKey === "solem") {
      return (
        '<p class="hint">Audience chamber — who will you speak with?</p>' +
        '<div class="shop-block">' +
        '<div class="shop-row" style="flex-direction:column;align-items:stretch">' +
        '<div><b>Magistrate Serah Dunwald</b> <span class="hint">— local law and garrison orders</span></div>' +
        '<div style="margin-top:.4rem;text-align:right">' +
        '<button type="button" id="keepTalkMagistrate">Speak with the magistrate</button>' +
        "</div></div></div>"
      );
    }
    return (
      '<p class="hint">Audience chamber — who will you speak with?</p>' +
      '<div class="shop-block">' +
      '<div class="shop-row" style="flex-direction:column;align-items:stretch">' +
      '<div><b>Governor Kew Kumber</b> <span class="hint">— lord of Cantebury and the westward march</span></div>' +
      '<div style="margin-top:.4rem;text-align:right">' +
      '<button type="button" id="keepTalkGovernor">Speak with the governor</button>' +
      "</div></div>" +
      '<div class="shop-row" style="flex-direction:column;align-items:stretch;margin-top:.5rem">' +
      '<div><b>Chancellor Aldric Venn</b> <span class="hint">— petitions, seals, and requisitions</span></div>' +
      '<div style="margin-top:.4rem;text-align:right">' +
      '<button type="button" id="keepTalkChancellor">Speak with the chancellor</button>' +
      "</div></div></div>"
    );
  }

  function canteburyChapelInnerHtml() {
    return (
      '<p class="town-lead">A small chapel off the great hall. Tapers burn beside a rail worn smooth by generations of departing caravans.</p>' +
      '<div class="actions"><button type="button" id="churchBless">Receive blessing</button></div>'
    );
  }

  function canteburyShopInnerHtml() {
    return (
      '<p class="shopkeeper-lead">The crown quartermaster keeps road fare at posted rates beside stacked supply bundles.</p>' +
      '<p class="shop-gold-line">Your purse: <b>' +
      state.gold +
      '</b> gp</p>' +
      '<div class="shop-block">' +
      '<div class="shop-row"><span>Supplies</span><button type="button" id="buyFood">Buy 1 gp</button></div>' +
      '<div class="shop-row"><span>Potion of Healing (+3 HP)</span><button type="button" id="buyHealPotion">Buy 5 gp</button></div>' +
      '<div class="shop-row"><span>Potion of Life (revive 50%)</span><button type="button" id="buyLifePotion">Buy 15 gp</button></div>' +
      "</div>"
    );
  }

  function settlementChurchPanelHtml() {
    var html =
      '<div class="actions"><button type="button" id="settlementBless">Receive blessing</button></div>';
    var fallen = state.party.filter(function (p) { return p.hp <= 0; });
    var headstones = (state.headstones || []).filter(function (hs) {
      return hs && hs.town === state.settlementTown;
    });
    html += '<h3 class="church-section-title" style="margin-top:1rem">Revival rites</h3>' +
      '<p>Restore a fallen companion to full health for <b>25 gp</b>, or use a <b>Potion of Life</b> to bring them back at half HP.</p>';
    if (fallen.length === 0) {
      html += '<p class="hint">No one to revive.</p>';
    } else {
      html += '<div class="shop-block">';
      for (var i = 0; i < fallen.length; i++) {
        var m = fallen[i];
        html += '<div class="shop-row" style="flex-wrap:wrap;gap:.4rem">' +
          '<span>' + m.name + ' (' + roleLabel(m.role) + ')</span>' +
          '<span style="display:flex;gap:.4rem;flex-wrap:wrap">' +
          '<button type="button" id="reviveAtChurch-' + m.id + '"' +
          (state.gold >= 25 ? "" : " disabled") +
          '>Revive (25 gp)</button>' +
          '<button type="button" id="reviveLifeAtChurch-' + m.id + '"' +
          (state.lifePotions > 0 ? "" : " disabled") +
          '>Use Life Potion (' + state.lifePotions + ')</button>' +
          '</span></div>';
      }
      html += '</div>';
    }
    var pending = headstones.filter(function (hs) { return !isHeadstoneFrozen(hs); });
    if (pending.length > 0) {
      html += '<h3 class="church-section-title" style="margin-top:1.25rem">Recent losses</h3>' +
        '<p>Leave a final note for each fallen comrade. Once saved, the headstone is sealed and the inscription is permanent. ' + memorialDateHintHtml() + '</p>' +
        '<div class="shop-block">';
      for (var hi = 0; hi < pending.length; hi++) {
        var hs = pending[hi];
        var safeNote = String(hs.note || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        var theirRun = hs.runId === state.runId;
        html += '<div class="shop-row" style="flex-direction:column;align-items:stretch">' +
          '<div><b>' + hs.name + '</b> (' + roleLabel(hs.role) + ') &mdash; <span class="hi">' + escapeHtml(formatMemorialDate(hs)) + '</span> on ' + escapeHtml(hs.location) +
          (theirRun ? '.' : '. <span class="hint">(previous traveler)</span>') +
          '</div>' +
          '<textarea id="hsNote-' + hs.id + '" maxlength="200" placeholder="A small note for future travelers..." ' +
          'style="margin-top:.35rem;width:100%;min-height:3em;background:#1c160e;color:#e8dcc8;border:1px solid #4a3d2a;border-radius:6px;padding:.4rem .5rem;font-family:inherit">' +
          safeNote + '</textarea>' +
          '<div style="margin-top:.35rem;text-align:right">' +
          '<button type="button" id="hsSave-' + hs.id + '">Seal headstone</button>' +
          '</div>' +
          '</div>';
      }
      html += '</div>';
    }
    html += memorialPanelHtml(state.settlementTown);
    return html;
  }

  function settlementShopPanelHtml() {
    return (
      '<p class="shop-gold-line">Your purse: <b>' +
      state.gold +
      '</b> gp | Gems: <b>' +
      state.gems +
      '</b></p>' +
      '<div class="shop-block">' +
      shopRowHtml({
        id: "supplies",
        label: "Supplies",
        count: state.food,
        buyPrice: 1,
        sellPrice: 1,
        maxBuy: Math.min(Math.max(0, MAX_SUPPLIES - state.food), state.gold),
        maxSell: state.food,
      }) +
      shopRowHtml({
        id: "weapon",
        label: "Weapon",
        count: state.weapons,
        buyPrice: 3,
        sellPrice: 1,
        maxBuy: Math.floor(state.gold / 3),
        maxSell: state.weapons,
      }) +
      shopRowHtml({
        id: "healPotion",
        label: "Potion of Healing (+3 HP)",
        count: state.healingPotions,
        buyPrice: 5,
        sellPrice: 2,
        maxBuy: Math.floor(state.gold / 5),
        maxSell: state.healingPotions,
      }) +
      shopRowHtml({
        id: "lifePotion",
        label: "Potion of Life (revive 50%)",
        count: state.lifePotions,
        buyPrice: 15,
        sellPrice: 7,
        maxBuy: Math.floor(state.gold / 15),
        maxSell: state.lifePotions,
      }) +
      shopRowHtml({
        id: "gem",
        label: "Gem",
        count: state.gems,
        sellPrice: 5,
        maxSell: state.gems,
      }) +
      "</div>"
    );
  }

  function keepQmMemberSelectHtml(selectId) {
    var html = '<select id="' + selectId + '" class="shop-qty" style="width:auto;max-width:12rem">';
    for (var i = 0; i < state.party.length; i++) {
      var m = state.party[i];
      if (!m) continue;
      initMemberProgress(m);
      var equipped = exoticWeaponDef(m.exoticWeaponId);
      var note = equipped ? " [" + equipped.label + "]" : "";
      html += '<option value="' + m.id + '">' + escapeHtml(m.name) + " (" + roleLabel(m.role) + ")" + escapeHtml(note) + "</option>";
    }
    html += "</select>";
    return html;
  }

  function keepQmExoticSectionHtml() {
    var html =
      '<h3 class="church-section-title" style="margin-top:1.5rem">Exotic arms (vault)</h3>' +
      '<p class="hint">Legendary stock under seal — one of each blade per caravan. Equip on purchase.</p>' +
      '<div class="shop-block">';
    for (var i = 0; i < EXOTIC_WEAPONS.length; i++) {
      var w = EXOTIC_WEAPONS[i];
      var owner = exoticWeaponOwner(w.id);
      html += '<div class="shop-row" style="flex-wrap:wrap;gap:.5rem;align-items:center">' +
        '<span class="shop-row-label" style="flex:1 1 12rem"><b>' + escapeHtml(w.label) + '</b> <span class="hint">(+' + w.dmgBonus + ' dmg)</span></span>';
      if (owner) {
        html += '<span class="hint">Equipped by <b>' + escapeHtml(owner.name) + "</b></span>";
      } else {
        html += '<span style="display:flex;flex-wrap:wrap;gap:.4rem;align-items:center">' +
          keepQmMemberSelectHtml("qmEquip-" + w.id) +
          '<button type="button" id="qmBuy-' + w.id + '"' +
          (state.gold >= w.price ? "" : " disabled") +
          ">Buy @ " + formatGp(w.price) + " gp</button>" +
          "</span>";
      }
      html += "</div>";
    }
    html += "</div>";
    return html;
  }

  function buyExoticWeapon(weaponId) {
    var w = exoticWeaponDef(weaponId);
    if (!w) return;
    if (exoticWeaponOwner(weaponId)) {
      logLine(w.label + " is already in the caravan.", "bad");
      render();
      return;
    }
    if (state.gold < w.price) {
      logLine("Need " + formatGp(w.price) + " gp for a " + w.label + ".", "bad");
      render();
      return;
    }
    var sel = document.getElementById("qmEquip-" + weaponId);
    var memberId = sel ? sel.value : null;
    var member = memberId ? state.party.find(function (p) { return p && p.id === memberId; }) : null;
    if (!member) {
      logLine("Pick a party member to equip the " + w.label + ".", "bad");
      render();
      return;
    }
    if (member.exoticWeaponId) {
      var prev = exoticWeaponDef(member.exoticWeaponId);
      logLine(member.name + " already carries " + (prev ? prev.label : "an exotic weapon") + ".", "bad");
      render();
      return;
    }
    state.gold -= w.price;
    member.exoticWeaponId = w.id;
    logLine(
      member.name + " receives the <span class=\"hi\">" + w.label + "</span> (+" + w.dmgBonus + " dmg) for " + formatGp(w.price) + " gp.",
      "good"
    );
    trackPlaytest("exotic_weapon_bought", { weaponId: w.id, memberId: member.id, price: w.price, town: state.settlementTown || "cantebury" });
    render();
  }

  function wireQmExoticWeapons(root) {
    for (var i = 0; i < EXOTIC_WEAPONS.length; i++) {
      (function (w) {
        if (exoticWeaponOwner(w.id)) return;
        var btn = root.querySelector("#qmBuy-" + w.id);
        if (btn) btn.onclick = function () { buyExoticWeapon(w.id); };
      })(EXOTIC_WEAPONS[i]);
    }
  }

  function keepInteriorHtml(townKey) {
    var view = state.keepView || "hall";
    var inner =
      view === "hall"
        ? keepHallHtml(townKey)
        : view === "chapel"
          ? (townKey === "solem"
              ? '<p class="town-lead">The keep chapel serves garrison and caravan alike.</p>' + settlementChurchPanelHtml()
              : canteburyChapelInnerHtml())
          : townKey === "solem"
            ? '<p class="shopkeeper-lead">The citadel quartermaster trades at standard road rates.</p>' + settlementShopPanelHtml() + keepQmExoticSectionHtml()
            : canteburyShopInnerHtml() + keepQmExoticSectionHtml();
    return (
      '<h2 class="panel-title">' + keepTitle(townKey) + "</h2>" +
      '<p class="town-lead">' + keepLead(townKey) + "</p>" +
      keepSubTabStrip(view) +
      inner
    );
  }

  function npcDialogueDef(dialogKey) {
    var fromBalance = BALANCE_DATA.npcDialogues && BALANCE_DATA.npcDialogues[dialogKey];
    if (fromBalance && fromBalance.lines && fromBalance.lines.length) return fromBalance;
    var legacy = KEEP_NPC_LINES[dialogKey];
    if (!legacy) return null;
    return {
      speaker: legacy.speaker,
      title: legacy.title,
      portrait: legacy.portrait,
      lines: [legacy.text],
    };
  }

  function pickNpcDialogueLine(def, dialogKey) {
    var lines = (def && def.lines) || [];
    if (!lines.length) return "";
    if (dialogKey === "cantebury_governor") {
      if ((state.totalDaysElapsed || 0) >= STABILITY_TARGET_DAYS - 10) return lines[lines.length - 1];
      if ((state.caravanLoops || 0) > 0) return lines[Math.min(3, lines.length - 1)];
    }
    if (dialogKey === "cantebury_chancellor" && newIsilSettlerCount() > 0) {
      return lines[Math.min(1, lines.length - 1)];
    }
    return lines[rollInt(0, lines.length - 1)];
  }

  function openKeepNpcDialog(dialogKey) {
    var def = npcDialogueDef(dialogKey);
    if (!def) return;
    state.npcDialog = {
      speaker: def.speaker,
      title: def.title,
      portrait: def.portrait,
      text: pickNpcDialogueLine(def, dialogKey),
    };
    render();
  }

  function eastboundRevisitDepartHtml(fromTownKey) {
    var targets = eastboundRevisitTargets(fromTownKey);
    if (!targets.length) return "";
    var reverseKey = pathPreviousTown(fromTownKey);
    var btns = targets
      .map(function (key) {
        var dest = destinationForKey(key);
        var isPrimary = reverseKey ? key === reverseKey : key === "cantebury";
        return (
          '<button type="button"' +
          (isPrimary ? ' class="primary"' : "") +
          ' data-eastbound-to="' +
          key +
          '">March to ' +
          dest.label +
          legDepartDaysHint(fromTownKey, key) +
          "</button>"
        );
      })
      .join("");
    var reverseNote =
      reverseKey && targets[0] === reverseKey
        ? '<p class="hint">Your outbound route reverses here — next hop on the trail home is <b>' +
          destinationForKey(reverseKey).label +
          "</b>.</p>"
        : "";
    return (
      '<p class="town-lead">Eastbound — follow your route in reverse or detour to another town you visited.</p>' +
      reverseNote +
      '<div class="actions" style="flex-wrap:wrap;gap:.4rem">' +
      btns +
      "</div>"
    );
  }

  function settlementWestwardForkNote(townKey) {
    if (townKey === "cantebury") {
      return '<p class="hint">Lower fork: march to <b>Gustaf</b> (port) or <b>Brookside</b> (village) — you will not pass through both.</p>';
    }
    if (TRAIL_FORK_LOWER.indexOf(townKey) >= 0) {
      return '<p class="hint">Upper fork: <b>Hollow Banks</b> (marsh) or <b>Glennhardt</b> (city) — pick one, then Solem and New Isil.</p>';
    }
    return "";
  }

  function settlementWestwardDepartHtml(townKey) {
    var choices = westboundForkDestinations(townKey);
    if (!choices.length) return "";
    var btns = choices
      .map(function (key) {
        var dest = destinationForKey(key);
        return (
          '<button type="button" class="primary" data-westbound-to="' +
          key +
          '">Depart for ' +
          dest.label +
          legDepartDaysHint(townKey, key) +
          "</button>"
        );
      })
      .join("");
    return (
      '<p class="town-lead">Choose the next leg <b>westward</b>.</p>' +
      settlementWestwardForkNote(townKey) +
      '<div class="actions" style="flex-wrap:wrap;gap:.4rem">' +
      btns +
      "</div>"
    );
  }

  function settlementDepartPanelHtml(townKey) {
    if (townKey === "new_isil") return newIsilDepartPanelHtml();
    if (state.onReturnMarch) return eastboundRevisitDepartHtml(townKey);
    return settlementWestwardDepartHtml(townKey);
  }

  function settlementMainPanelHtml(town) {
    var townKey = town.key;
    if (state.settlementView === "keep") return keepInteriorHtml(townKey);
    var head = '<h2 class="panel-title">' + town.label + "</h2>";
    if (state.settlementView === "church") {
      return head + '<p class="town-lead">A quiet chapel waits by the market road.</p>' + settlementChurchPanelHtml();
    }
    if (state.settlementView === "inn") {
      var cost = innRestCost();
      var eff = stableRestEfficiency();
      var pct = Math.round(eff * 100);
      var consec = state.stableRestDays || 0;
      var consecNote = consec > 0 ? ' <span class="hint">(consecutive stays: ' + consec + ")</span>" : "";
      return (
        head +
        '<p class="town-lead">A warm inn offers cots, stew, and a safe night to recover. ' +
        "A bed costs <b>" +
        cost +
        " gp</b> and restores everyone to full health. " +
        "The stables out back are free but rest there is rough — the more nights in a row, the less you recover." +
        consecNote +
        "</p>" +
        '<div class="actions">' +
        '<button type="button" id="settlementInnRest"' +
        (state.gold >= cost ? "" : " disabled") +
        ">Rest at inn (" +
        cost +
        " gp, full)</button>" +
        '<button type="button" id="settlementStableRest">Rest at stables (free, ' +
        pct +
        "%)</button>" +
        "</div>"
      );
    }
    if (state.settlementView === "tavern") return head + settlementTavernHtml(townKey);
    if (state.settlementView === "shop") {
      return head + '<p class="shopkeeper-lead">Restock or trade away surplus.</p>' + settlementShopPanelHtml();
    }
    if (state.settlementView === "inventory") {
      return (
        '<h2 class="panel-title">Party & resources</h2>' +
        resourcesStatsGridHtml() +
        inventoryScreenHtml() +
        questPanelHtml()
      );
    }
    if (state.settlementView === "adventure") {
      return (
        head +
        '<p class="town-lead">Strike out for an adventuring trek. Up to <b>10 days</b> exploring the wilds near ' +
        locationLabel(townKey) +
        ". Each day spent outbound rolls an encounter. Turn back any time; the return trip takes the same days you spent (no encounters) and still consumes supplies.</p>" +
        '<p class="hint">Tip: Make sure your party is rested and stocked. Encounter level scales with how far you have marched west.</p>' +
        '<div class="actions">' +
        '<button type="button" class="primary" id="beginAdventureBtn"' +
        (state.food > 0 ? "" : " disabled") +
        ">Venture out (begin trek)</button>" +
        "</div>"
      );
    }
    return head + settlementDepartPanelHtml(townKey);
  }

  function newIsilDepartPanelHtml() {
    syncNewIsilPopulation();
    var pop = state.newIsilGrowth ? state.newIsilGrowth.population : NEW_ISIL_BASE_POPULATION;
    var settlers = state.newIsilSettlers || [];
    var settlerList =
      settlers.length === 0
        ? '<p class="hint">No companions settled yet.</p>'
        : "<ul>" +
          settlers
            .map(function (s) {
              return (
                "<li><b>" +
                escapeHtml(s.name) +
                "</b> (" +
                roleLabel(s.role) +
                ") — day " +
                (s.settledOnDay || "?") +
                "</li>"
              );
            })
            .join("") +
          "</ul>";
    var partyRows = state.party
      .map(function (m) {
        if (!m || m.hp <= 0) return "";
        return (
          '<div class="shop-row" style="align-items:center;gap:.5rem">' +
          "<span><b>" +
          escapeHtml(m.name) +
          "</b> (" +
          roleLabel(m.role) +
          ")</span>" +
          '<button type="button" data-settle-member="' +
          m.id +
          '">Settle in New Isil</button>' +
          "</div>"
        );
      })
      .join("");
    var rejoinRows = settlers
      .filter(function (s) {
        return s.canRejoin;
      })
      .map(function (s) {
        return (
          '<div class="shop-row" style="align-items:center;gap:.5rem">' +
          "<span><b>" +
          escapeHtml(s.name) +
          "</b> (" +
          roleLabel(s.role) +
          ", settled)</span>" +
          '<button type="button" data-rejoin-settler="' +
          s.id +
          '">Rejoin caravan (−25% stats, permanent)</button>' +
          "</div>"
        );
      })
      .join("");
    return (
      '<p class="town-lead">New Isil is the harbor goal. Settle companions here; on the <b>eastbound</b> return you may invite them back at a permanent cost. The campaign ends when you reach New Isil after <b>' +
      effectiveStabilityTarget() +
      " journey days</b>" +
      (mustDefeatFinalHarborBoss() ? " (after Kew Kumber falls on the final westward leg)" : "") +
      ".</p>" +
      '<p><b>Harbor population:</b> ' +
      pop +
      " (+" +
      settlers.length +
      " from your caravans)</p>" +
      "<h3 class=\"roster-heading\">Settled here</h3>" +
      settlerList +
      "<h3 class=\"roster-heading\">Caravan — settle companions</h3>" +
      (partyRows || '<p class="hint">No living companions left to settle.</p>') +
      (rejoinRows ? "<h3 class=\"roster-heading\">Invite settlers back</h3>" + rejoinRows : "") +
      "<h3 class=\"roster-heading\">Eastbound depart</h3>" +
      eastboundRevisitDepartHtml("new_isil") +
      '<p class="hint">Journey day ' +
      (state.totalDaysElapsed || 0) +
      " / " +
      effectiveStabilityTarget() +
      (mustDefeatFinalHarborBoss() ? " — defeat Kew Kumber on the final westward leg (day " + FINAL_BOSS_MIN_DAYS + "+)" : "") +
      ".</p>"
    );
  }

  function wireNewIsilDepart(root) {
    var settleBtns = root.querySelectorAll("[data-settle-member]");
    for (var i = 0; i < settleBtns.length; i++) {
      settleBtns[i].onclick = (function (btn) {
        return function () {
          settleMemberAtNewIsil(btn.getAttribute("data-settle-member"));
        };
      })(settleBtns[i]);
    }
    var rejoinBtns = root.querySelectorAll("[data-rejoin-settler]");
    for (var r = 0; r < rejoinBtns.length; r++) {
      rejoinBtns[r].onclick = (function (btn) {
        return function () {
          recruitSettlerBack(btn.getAttribute("data-rejoin-settler"));
        };
      })(rejoinBtns[r]);
    }
    wireEastboundDepart(root);
  }

  function wireEastboundDepart(root) {
    var eastBtns = root.querySelectorAll("[data-eastbound-to]");
    for (var e = 0; e < eastBtns.length; e++) {
      eastBtns[e].onclick = (function (btn) {
        return function () {
          state.onReturnMarch = true;
          departEastboundTo(btn.getAttribute("data-eastbound-to"));
        };
      })(eastBtns[e]);
    }
  }

  function wireWestboundDepart(root) {
    var westBtns = root.querySelectorAll("[data-westbound-to]");
    for (var w = 0; w < westBtns.length; w++) {
      westBtns[w].onclick = (function (btn) {
        return function () {
          departWestboundTo(btn.getAttribute("data-westbound-to"));
        };
      })(westBtns[w]);
    }
  }

  function npcDialogPortraitHtml(portrait, speaker) {
    if (portrait) {
      return (
        '<img src="' + headshotUrl(portrait) + '" alt="' + escapeHtml(speaker || "") +
        '" style="width:84px;height:84px;border-radius:8px;object-fit:cover;border:1px solid #4a3d2a;flex-shrink:0">'
      );
    }
    var initial = escapeHtml((speaker || "?").charAt(0).toUpperCase());
    return (
      '<div style="width:84px;height:84px;border-radius:8px;border:1px solid #4a3d2a;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:#1c160e;color:#c89c3f;font-size:2rem;font-weight:700">' +
      initial +
      "</div>"
    );
  }

  function npcDialogOverlayHtml(dlg) {
    if (!dlg) return "";
    var actions =
      dlg.questOfferId
        ? '<div style="text-align:right;display:flex;justify-content:flex-end;gap:.4rem;flex-wrap:wrap">' +
          '<button type="button" id="npcDialogDecline">Not interested</button>' +
          '<button type="button" class="primary" id="npcDialogAccept-' + escapeHtml(dlg.questOfferId) + '">Accept quest</button>' +
          "</div>"
        : '<div style="text-align:right">' +
          '<button type="button" id="npcDialogClose">Continue</button>' +
          "</div>";
    return (
      '<div class="npc-dialog-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.65);display:flex;align-items:center;justify-content:center;z-index:50;padding:1rem">' +
        '<div class="npc-dialog" style="background:#2a2218;border:2px solid #c89c3f;border-radius:12px;padding:1rem 1.25rem;max-width:32rem;width:100%;display:flex;gap:1rem;align-items:flex-start;box-shadow:0 8px 30px rgba(0,0,0,0.6)">' +
          npcDialogPortraitHtml(dlg.portrait, dlg.speaker) +
          '<div style="flex:1;min-width:0">' +
            '<div style="color:#c89c3f;font-weight:600;margin-bottom:.15rem">' + escapeHtml(dlg.speaker || "") + "</div>" +
            (dlg.title ? '<div class="hint" style="margin-bottom:.35rem">' + escapeHtml(dlg.title) + "</div>" : "") +
            '<div style="color:#e8dcc8;margin-bottom:.5rem;font-style:italic">"' + escapeHtml(dlg.text || "") + '"</div>' +
            (dlg.summaryHtml || "") +
            actions +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  function wireNpcDialog(root) {
    if (!state.npcDialog) return;
    var dlg = state.npcDialog;
    var close = root.querySelector("#npcDialogClose");
    if (close) close.onclick = function () { state.npcDialog = null; render(); };
    var decline = root.querySelector("#npcDialogDecline");
    if (decline) decline.onclick = function () { state.npcDialog = null; render(); };
    if (dlg.questOfferId) {
      var accept = root.querySelector("#npcDialogAccept-" + dlg.questOfferId);
      if (accept) accept.onclick = function () { acceptQuest(dlg.questOfferId); };
    }
  }

  function settlementTavernHtml(townKey) {
    return (
      '<p class="tavern-lead">Fresh crews trade stories and caravan contracts. The barkeep eyes you over a mug.</p>' +
      '<div class="tavern-choice-row">' +
      '<button type="button" class="primary" id="barkeepBtn">Talk to the barkeep</button>' +
      "</div>" +
      rosterEditHtml("Tavern roster", settlementRecruitNote(townKey))
    );
  }

  function wireTavernBarkeep(root) {
    var barkeepBtn = root.querySelector("#barkeepBtn");
    if (barkeepBtn) barkeepBtn.onclick = function () { openBarkeepDialog(); };
  }

  function wireCanteburyBlessing(root) {
    var blessBtn = root.querySelector("#churchBless");
    if (!blessBtn) return;
    blessBtn.onclick = function () {
      if (state.blessing) {
        logLine("You already carry a blessing: <span class=\"hi\">" + blessingTypeLabel(state.blessing) + "</span>.", "");
        render();
        return;
      }
      var r = Math.random();
      var type = null;
      if (r < 0.3) type = "attack";
      else if (r < 0.5) type = "gold";
      else if (r < 0.6) type = "ward";
      if (type) {
        grantBlessing(type);
        logLine(
          "Blessing granted: <span class=\"hi\">" +
            blessingTypeLabel(type) +
            "</span> (fades in " +
            (state.blessingExpiresOnDay - (state.totalDaysElapsed || 0)) +
            " journey day(s)).",
          "good"
        );
      } else logLine("The prayer brings calm, but no lasting boon this time.", "");
      render();
    };
  }

  function wireCanteburyShop(root) {
    var buyFood = root.querySelector("#buyFood");
    if (buyFood) buyFood.onclick = function () { buy("food"); };
    var buyHeal = root.querySelector("#buyHealPotion");
    if (buyHeal) buyHeal.onclick = function () { buy("heal_potion"); };
    var buyLife = root.querySelector("#buyLifePotion");
    if (buyLife) buyLife.onclick = function () { buy("life_potion"); };
  }

  function wireSettlementChurchPanel(root) {
    var blessBtn = document.getElementById("settlementBless");
    if (blessBtn) {
      blessBtn.onclick = function () {
        if (state.blessing) {
          logLine("You already carry a blessing: <span class=\"hi\">" + blessingTypeLabel(state.blessing) + "</span>.", "");
          render();
          return;
        }
        var r = Math.random();
        var type = null;
        if (r < 0.3) type = "attack";
        else if (r < 0.5) type = "gold";
        else if (r < 0.6) type = "ward";
        if (type) {
          grantBlessing(type);
          logLine(
            "Blessing granted: <span class=\"hi\">" +
              blessingTypeLabel(type) +
              "</span> (fades in " +
              (state.blessingExpiresOnDay - (state.totalDaysElapsed || 0)) +
              " journey day(s)).",
            "good"
          );
        } else logLine("The prayer brings calm, but no lasting boon this time.", "");
        render();
      };
    }
    for (var ri = 0; ri < state.party.length; ri++) {
      (function (m) {
        if (m.hp > 0) return;
        var btn = document.getElementById("reviveAtChurch-" + m.id);
        if (btn) btn.onclick = function () { reviveAtChurch(m.id); };
        var lifeBtn = document.getElementById("reviveLifeAtChurch-" + m.id);
        if (lifeBtn) lifeBtn.onclick = function () { reviveWithLifePotionAtChurch(m.id); };
      })(state.party[ri]);
    }
    var headstones = (state.headstones || []).filter(function (hs) {
      return hs && hs.town === state.settlementTown;
    });
    for (var hi = 0; hi < headstones.length; hi++) {
      (function (hs) {
        var btn = document.getElementById("hsSave-" + hs.id);
        var ta = document.getElementById("hsNote-" + hs.id);
        if (btn && ta) {
          btn.onclick = function () {
            setHeadstoneNote(hs.id, ta.value);
            logLine("Headstone sealed for " + hs.name + ". The inscription is now permanent.", "");
            render();
          };
        }
      })(headstones[hi]);
    }
  }

  function wireSettlementShopPanel(root) {
    wireShopRow("supplies", buySettlementSupplies, sellSettlementSupplies);
    wireShopRow("weapon", buySettlementWeapon, sellSettlementWeapon);
    wireShopRow("healPotion", buySettlementHealPotion, sellSettlementHealPotion);
    wireShopRow("lifePotion", buySettlementLifePotion, sellSettlementLifePotion);
    wireShopRow("gem", null, sellSettlementGem);
  }

  function wireKeepSubTabs(root) {
    var tabs = root.querySelectorAll("[data-keep-sub]");
    var i;
    for (i = 0; i < tabs.length; i++) {
      tabs[i].onclick = (function (el) {
        return function () {
          state.keepView = el.getAttribute("data-keep-sub") || "hall";
          render();
        };
      })(tabs[i]);
    }
  }

  function wireKeepInterior(root, townKey) {
    wireKeepSubTabs(root);
    var view = state.keepView || "hall";
    if (view === "hall") {
      var gov = root.querySelector("#keepTalkGovernor");
      if (gov) gov.onclick = function () { openKeepNpcDialog("cantebury_governor"); };
      var chan = root.querySelector("#keepTalkChancellor");
      if (chan) chan.onclick = function () { openKeepNpcDialog("cantebury_chancellor"); };
      var mag = root.querySelector("#keepTalkMagistrate");
      if (mag) mag.onclick = function () { openKeepNpcDialog("solem_magistrate"); };
    } else if (view === "chapel") {
      if (townKey === "solem") wireSettlementChurchPanel(root);
      else wireCanteburyBlessing(root);
    } else if (view === "shop") {
      if (townKey === "solem") wireSettlementShopPanel(root);
      else wireCanteburyShop(root);
      wireQmExoticWeapons(root);
    }
  }

  function shopRowHtml(opts) {
    var hasBuy = typeof opts.buyPrice === "number";
    var hasSell = typeof opts.sellPrice === "number";
    var qtyId = "shopQty-" + opts.id;
    var buyId = "shopBuy-" + opts.id;
    var sellId = "shopSell-" + opts.id;
    var countStr = typeof opts.count === "number" ? " (you have " + opts.count + ")" : "";
    var maxBuy = opts.maxBuy || 0;
    var maxSell = opts.maxSell || 0;
    var qtyCap = Math.max(maxBuy, maxSell, 1);
    var html =
      '<div class="shop-row">' +
      '<span class="shop-row-label">' + opts.label + countStr + '</span>' +
      '<span class="shop-row-controls">' +
      'qty <input type="number" min="1" max="' + qtyCap + '" value="1" id="' + qtyId +
        '" data-max-buy="' + maxBuy + '" data-max-sell="' + maxSell +
        '" class="shop-qty" style="width:4.5em" />';
    if (hasBuy) {
      html += ' <button type="button" id="' + buyId + '"' +
        (maxBuy > 0 ? "" : " disabled") +
        '>Buy @ ' + opts.buyPrice + ' gp</button>';
    }
    if (hasSell) {
      html += ' <button type="button" id="' + sellId + '"' +
        (maxSell > 0 ? "" : " disabled") +
        '>Sell @ ' + opts.sellPrice + ' gp</button>';
    }
    html += '</span></div>';
    return html;
  }

  function readShopQty(id) {
    var el = document.getElementById("shopQty-" + id);
    if (!el) return 1;
    var v = parseInt(el.value, 10);
    if (!(v > 0)) v = 1;
    var cap = parseInt(el.getAttribute("max"), 10);
    if (cap > 0 && v > cap) {
      v = cap;
      el.value = String(cap);
    }
    return v;
  }

  function buySettlementSupplies(qty) {
    qty = Math.max(0, parseInt(qty, 10) || 1);
    var room = Math.max(0, MAX_SUPPLIES - state.food);
    var actual = Math.min(qty, room, state.gold);
    if (actual <= 0) {
      if (state.gold <= 0) logLine("Need at least 1 gp to buy supplies.", "bad");
      else if (room <= 0) logLine("Supplies are already at max capacity (" + MAX_SUPPLIES + ").", "bad");
      render();
      return;
    }
    state.gold -= actual;
    addSupplies(actual);
    logLine("Bought " + actual + " supply" + (actual > 1 ? " bundles" : "") + " for " + actual + " gp.", "good");
    render();
  }

  function buySettlementWeapon(qty) {
    qty = Math.max(0, parseInt(qty, 10) || 1);
    var affordable = Math.floor(state.gold / 3);
    var actual = Math.min(qty, affordable);
    if (actual <= 0) {
      logLine("Need 3 gp to buy a weapon.", "bad");
      render();
      return;
    }
    state.gold -= actual * 3;
    state.weapons += actual;
    for (var i = 0; i < actual; i++) state.weaponInventory.push("settlement_blade");
    logLine("Bought " + actual + " weapon" + (actual > 1 ? "s" : "") + " for " + (actual * 3) + " gp.", "good");
    render();
  }

  function buySettlementHealPotion(qty) {
    qty = Math.max(0, parseInt(qty, 10) || 1);
    var affordable = Math.floor(state.gold / 5);
    var actual = Math.min(qty, affordable);
    if (actual <= 0) {
      logLine("Need 5 gp for a Potion of Healing.", "bad");
      render();
      return;
    }
    state.gold -= actual * 5;
    state.healingPotions += actual;
    logLine("Bought " + actual + " Potion of Healing for " + (actual * 5) + " gp.", "good");
    render();
  }

  function buySettlementLifePotion(qty) {
    qty = Math.max(0, parseInt(qty, 10) || 1);
    var affordable = Math.floor(state.gold / 15);
    var actual = Math.min(qty, affordable);
    if (actual <= 0) {
      logLine("Need 15 gp for a Potion of Life.", "bad");
      render();
      return;
    }
    state.gold -= actual * 15;
    state.lifePotions += actual;
    logLine("Bought " + actual + " Potion of Life for " + (actual * 15) + " gp.", "good");
    render();
  }

  function sellSettlementHealPotion(qty) {
    qty = Math.max(0, parseInt(qty, 10) || 1);
    var actual = Math.min(qty, state.healingPotions);
    if (actual <= 0) {
      logLine("No Potions of Healing to sell.", "bad");
      render();
      return;
    }
    state.healingPotions -= actual;
    state.gold += actual * 2;
    logLine("Sold " + actual + " Potion of Healing for " + (actual * 2) + " gp.", "good");
    render();
  }

  function sellSettlementLifePotion(qty) {
    qty = Math.max(0, parseInt(qty, 10) || 1);
    var actual = Math.min(qty, state.lifePotions);
    if (actual <= 0) {
      logLine("No Potions of Life to sell.", "bad");
      render();
      return;
    }
    state.lifePotions -= actual;
    state.gold += actual * 7;
    logLine("Sold " + actual + " Potion of Life for " + (actual * 7) + " gp.", "good");
    render();
  }

  function sellSettlementGem(qty) {
    qty = Math.max(0, parseInt(qty, 10) || 1);
    var actual = Math.min(qty, state.gems);
    if (actual <= 0) {
      logLine("No gems to sell.", "bad");
      render();
      return;
    }
    state.gems -= actual;
    state.gold += actual * 5;
    logLine("Sold " + actual + " gem" + (actual > 1 ? "s" : "") + " for " + (actual * 5) + " gp.", "good");
    render();
  }

  function sellSettlementWeapon(qty) {
    qty = Math.max(0, parseInt(qty, 10) || 1);
    var actual = Math.min(qty, state.weapons, state.weaponInventory.length);
    if (actual <= 0) {
      logLine("No weapons to sell.", "bad");
      render();
      return;
    }
    state.weapons -= actual;
    for (var i = 0; i < actual; i++) state.weaponInventory.pop();
    state.gold += actual;
    logLine("Sold " + actual + " weapon" + (actual > 1 ? "s" : "") + " for " + actual + " gp.", "good");
    render();
  }

  function sellSettlementSupplies(qty) {
    qty = Math.max(0, parseInt(qty, 10) || 1);
    var actual = Math.min(qty, state.food);
    if (actual <= 0) {
      logLine("No supplies to sell.", "bad");
      render();
      return;
    }
    state.food -= actual;
    state.gold += actual;
    logLine("Sold " + actual + " supply" + (actual > 1 ? " bundles" : "") + " for " + actual + " gp.", "good");
    render();
  }

  function reviveAtChurch(memberId) {
    if (state.gold < 25) {
      logLine("Need 25 gp for revival rites.", "bad");
      render();
      return;
    }
    var m = null;
    for (var i = 0; i < state.party.length; i++) {
      if (state.party[i].id === memberId) { m = state.party[i]; break; }
    }
    if (!m) {
      logLine("Companion not found.", "bad");
      render();
      return;
    }
    if (m.permadead) {
      logLine(m.name + " is beyond the church's reach.", "bad");
      render();
      return;
    }
    if (m.hp > 0) {
      logLine(m.name + " does not need reviving.", "bad");
      render();
      return;
    }
    state.gold -= 25;
    m.hp = m.maxHp;
    m.deadSinceDay = undefined;
    clearMemberDeathSnapshot(m);
    logLine(m.name + " is revived at the chapel to full health (" + m.maxHp + "/" + m.maxHp + " HP).", "good");
    render();
  }

  function reviveWithLifePotionInField(memberId) {
    if (state.lifePotions <= 0) {
      logLine("No Potion of Life on hand.", "bad");
      render();
      return;
    }
    var m = null;
    for (var i = 0; i < state.party.length; i++) {
      if (state.party[i].id === memberId) { m = state.party[i]; break; }
    }
    if (!m) {
      logLine("Companion not found.", "bad");
      render();
      return;
    }
    if (m.permadead) {
      logLine(m.name + " is beyond help.", "bad");
      render();
      return;
    }
    if (m.hp > 0) {
      logLine(m.name + " is already standing.", "bad");
      render();
      return;
    }
    state.lifePotions--;
    m.hp = Math.max(1, Math.ceil(m.maxHp * 0.5));
    m.deadSinceDay = undefined;
    clearMemberDeathSnapshot(m);
    logLine(m.name + " is revived with a Potion of Life in the field (" + m.hp + "/" + m.maxHp + " HP).", "good");
    render();
  }

  function reviveWithLifePotionAtChurch(memberId) {
    if (state.lifePotions <= 0) {
      logLine("No Potion of Life on hand.", "bad");
      render();
      return;
    }
    var m = null;
    for (var i = 0; i < state.party.length; i++) {
      if (state.party[i].id === memberId) { m = state.party[i]; break; }
    }
    if (!m) {
      logLine("Companion not found.", "bad");
      render();
      return;
    }
    if (m.permadead) {
      logLine(m.name + " is beyond the church's reach.", "bad");
      render();
      return;
    }
    if (m.hp > 0) {
      logLine(m.name + " does not need reviving.", "bad");
      render();
      return;
    }
    state.lifePotions--;
    m.hp = Math.max(1, Math.ceil(m.maxHp * 0.5));
    m.deadSinceDay = undefined;
    clearMemberDeathSnapshot(m);
    logLine(m.name + " is revived with a Potion of Life at the chapel (" + m.hp + "/" + m.maxHp + " HP).", "good");
    render();
  }

  function wireShopRow(id, buyFn, sellFn) {
    if (buyFn) {
      var buyBtn = document.getElementById("shopBuy-" + id);
      if (buyBtn) buyBtn.onclick = function () { buyFn(readShopQty(id)); };
    }
    if (sellFn) {
      var sellBtn = document.getElementById("shopSell-" + id);
      if (sellBtn) sellBtn.onclick = function () { sellFn(readShopQty(id)); };
    }
  }

  function wireRosterEdit(root) {
    var rm = root.querySelectorAll(".roster-remove");
    var i;
    for (i = 0; i < rm.length; i++) {
      rm[i].onclick = (function (btn) {
        return function () {
          removePartyMember(btn.getAttribute("data-remove"));
        };
      })(rm[i]);
    }
    var addS = root.querySelector("#addSoldier");
    var addP = root.querySelector("#addPriest");
    var addM = root.querySelector("#addMercenary");
    var addMage = root.querySelector("#addMage");
    if (addS)
      addS.onclick = function () {
        addPartyMember("soldier");
      };
    if (addP)
      addP.onclick = function () {
        addPartyMember("priest");
      };
    if (addM)
      addM.onclick = function () {
        addPartyMember("mercenary");
      };
    if (addMage)
      addMage.onclick = function () {
        addPartyMember("mage");
      };
  }

  function departIllirial() {
    clearTransitionTimers();
    state.illiriView = "castle";
    state.keepView = "hall";
    state.cityView = "shop";
    state.travelInventoryOpen = false;
    state.inventoryDetailOpen = false;
    state.phase = "travel";
    state.travelDay = 0;
    state.encounterChance = ENCOUNTER_BASE;
    state.ruinsDiscovered = false;
    state.ruinsTravelDay = null;
    state.ruinsSearched = false;
    state.ruinsRoomsTotal = 0;
    state.ruinsRoomsRemaining = 0;
    state.ruinsMap = null;
    state.transition = { kind: "depart", stage: "blackout" };
    var dest = currentDestination();
    var originKey = state.travelOrigin || "cantebury";
    if (originKey === "cantebury" && isEastboundLeg(originKey, dest.key) === false) {
      state.onReturnMarch = false;
    }
    var hadLeg = !!(state.legDaysByRoute && state.legDaysByRoute[legRouteKey(originKey, dest.key)]);
    state.legRouteDays = resolveLegRouteDays(originKey, dest.key);
    applyDepartBossGateForLeg(dest, originKey);
    var originLabel = currentOriginLabel();
    var legNote =
      isEastboundLeg(originKey, dest.key)
        ? ", matching your " + totalWestwardTrailDays() + "-day westward march (" + state.legRouteDays + " eastbound)"
        : hadLeg
          ? ", same as before"
          : ", route length set for this campaign";
    logLine(
      "You depart " +
        originLabel +
        ", marching " +
        travelDirectionClause(originKey, dest.key) +
        " (" +
        state.legRouteDays +
        " day" +
        (state.legRouteDays === 1 ? "" : "s") +
        " on this leg" +
        legNote +
        ").",
      "hi"
    );
    trackPlaytest("travel_started", {
      routeDays: currentRouteDays(),
      partySize: state.party.length,
      destination: dest.key,
      origin: state.travelOrigin || "cantebury",
    });
    render();
    scheduleTransition(function () {
      state.transition = { kind: "depart", stage: "map" };
      render();
    }, DEPART_BLACKOUT_MS);
    scheduleTransition(function () {
      state.transition = null;
      render();
    }, DEPART_BLACKOUT_MS + DEPART_MAP_MS);
  }

  function transitionBlackoutHtml(title, line) {
    return (
      '<div class="transition-root transition-root--blackout" role="presentation">' +
      '<div class="transition-blackout-inner">' +
      '<p class="transition-blackout-title">' +
      title +
      "</p>" +
      '<p class="transition-blackout-line">' +
      line +
      "</p>" +
      "</div></div>"
    );
  }

  function transitionEncounterHtml(tr) {
    return (
      '<div class="transition-root transition-root--cut" role="dialog" aria-modal="true">' +
      '<div class="cut-card">' +
      '<div class="cut-kicker">Cut away</div>' +
      "<h2 class=\"cut-title\">" +
      tr.title +
      "</h2>" +
      '<p class="cut-sub">' +
      tr.subtitle +
      "</p>" +
      "</div></div>"
    );
  }

  function transitionResumeOverlayHtml(tr) {
    return (
      '<div class="transition-sheet transition-sheet--dim" role="presentation">' +
      '<p class="transition-sheet-title">' +
      tr.label +
      "</p></div>"
    );
  }

  function transitionArriveOverlayHtml(tr) {
    return (
      '<div class="transition-sheet transition-sheet--gold" role="presentation">' +
      '<p class="transition-sheet-title">' +
      tr.label +
      "</p>" +
      '<p class="transition-sheet-sub">The gates open ahead</p></div>'
    );
  }

  function travelMapHtml(march) {
    march = march || null;
    var routeDays = currentRouteDays();
    var i;
    var segs = "";
    var marching = march && march.kind === "march";
    for (i = 1; i <= routeDays; i++) {
      var done = state.travelDay >= i;
      var marchingSeg = marching && march.toD === i;
      var cur = state.travelDay + 1 === i && state.phase === "travel" && !marchingSeg;
      var ruinHere = state.ruinsDiscovered && state.ruinsTravelDay === i;
      segs +=
        '<div class="map-seg' +
        (done ? " done" : "") +
        (cur ? " current" : "") +
        (marchingSeg ? " map-seg-marching" : "") +
        '">' +
        '<span class="map-day">D' +
        i +
        "</span>" +
        (ruinHere ? '<span class="map-ruin" title="Ruins">R</span>' : "") +
        "</div>";
    }
    var fromD = marching ? Math.max(0, march.fromD) : 0;
    var toD = marching ? Math.min(routeDays, Math.max(1, march.toD)) : 0;
    var fromPct = fromD <= 0 ? 0 : ((fromD - 0.5) / routeDays) * 100;
    var toPct = ((toD - 0.5) / routeDays) * 100;
    var caravan =
      marching
        ? '<div class="map-caravan" style="--from-left:' + fromPct.toFixed(3) + '%;--to-left:' + toPct.toFixed(3) + '%;" aria-hidden="true"><span class="map-caravan-dot"></span></div>'
        : "";
    return (
      '<div class="travel-visual" aria-hidden="true">' +
      '<div class="map-row">' +
      '<div class="map-node start">' + currentOriginLabel() + '</div>' +
      '<div class="map-track map-track--rel">' +
      segs +
      caravan +
      "</div>" +
      '<div class="map-node end">' + currentDestination().label + '</div>' +
      "</div>" +
      '<p class="map-caption">' +
      routeDays +
      " days on the trade road" +
      (isEastboundLeg(state.travelOrigin || "cantebury", state.travelDestination)
        ? " (eastbound — reverse your fork choices town by town)"
        : "") +
      '. Each quiet day adds <b>+25%</b> to the next day\'s encounter roll (max 95%). A fight resets tension.</p>' +
      "</div>"
    );
  }

  function startCitySplash() {
    return (
      '<div class="scene scene-splash scene-start-city" role="img" aria-label="Outpost city skyline">' +
      '<div class="splash-badge">Camp</div>' +
      '<div class="splash-title">Cantebury</div>' +
      '<div class="splash-sub">Outpost City - walls, markets, smoke</div>' +
      "</div>"
    );
  }

  function travelSplashMarkup() {
    var leg = Math.min(Math.max(state.travelDay, 0) + 1, currentRouteDays());
    return (
      '<div class="scene scene-splash scene-travel scene-travel-d' +
      leg +
      '" role="img" aria-label="Travel leg ' +
      leg +
      '">' +
      '<div class="splash-badge">March</div>' +
      '<div class="splash-title">The road</div>' +
      '<div class="splash-sub">Leg ' +
      leg +
      " of " +
      currentRouteDays() +
      " - weather and miles change each dawn</div>" +
      "</div>"
    );
  }

  function endCitySplash() {
    var dest = currentDestination();
    return (
      '<div class="scene scene-splash scene-end-city scene-end-city--' + dest.key + '" role="img" aria-label="Destination city">' +
      '<div class="splash-badge">' + dest.badge + '</div>' +
      '<div class="splash-title">' + dest.label + '</div>' +
      '<div class="splash-sub">' + dest.subtitle + '</div>' +
      "</div>"
    );
  }

  function avatarClass(role) {
    return "avatar avatar-" + role;
  }


  function roleLabel(role) {
    if (role === "soldier") return "Soldier";
    if (role === "priest") return "Priest";
    if (role === "mercenary") return "Mercenary";
    if (role === "mage") return "Mage";
    return "Traveler";
  }

  /** Folder containing index.html + images/ (derived from game.js script URL). */
  function detectGameAssetBase() {
    if (typeof document === "undefined" || typeof window === "undefined") return "";
    var scripts = document.getElementsByTagName("script");
    var i;
    for (i = scripts.length - 1; i >= 0; i--) {
      var src = scripts[i].src;
      if (src && /\/game\.js(\?|#|$)/.test(src)) {
        return src.replace(/[#?].*$/, "").replace(/[^/]+$/, "");
      }
    }
    var path = window.location.pathname || "/";
    if (!/\/$/.test(path)) {
      var cut = path.lastIndexOf("/");
      path = cut >= 0 ? path.slice(0, cut + 1) : "/";
    }
    return window.location.origin + path;
  }

  var GAME_ASSET_BASE = detectGameAssetBase();

  function headshotUrl(filename) {
    if (!filename) return "";
    var base = GAME_ASSET_BASE || detectGameAssetBase();
    return base + "images/headshot/" + encodeURIComponent(filename);
  }

  function headshotLabel(filename) {
    return (filename || "").replace(/\.(jpe?g|png|webp)$/i, "");
  }

  function headshotGender(file) {
    var lower = (file || "").toLowerCase();
    if (lower.indexOf("woman") >= 0 || lower.indexOf("female") >= 0) return "woman";
    if (lower.indexOf("male") >= 0 || /\bman\b/.test(lower)) return "man";
    return "unknown";
  }

  function headshotOptionsForRole(role, gender) {
    var keys = [];
    if (role === "soldier") keys = ["soldier"];
    else if (role === "priest") keys = ["priest", "cleric"];
    else if (role === "mercenary") keys = ["mercenary"];
    else if (role === "mage") keys = ["mage", "wizard"];
    var roleFiltered = HEADSHOT_FILES.filter(function (file) {
      var lower = file.toLowerCase();
      for (var i = 0; i < keys.length; i++) if (lower.indexOf(keys[i]) >= 0) return true;
      return false;
    });
    if (!roleFiltered.length) roleFiltered = HEADSHOT_FILES.slice();
    var want = gender === "woman" ? "woman" : "man";
    var genderFiltered = roleFiltered.filter(function (file) {
      var g = headshotGender(file);
      if (want === "woman") return g === "woman";
      return g !== "woman";
    });
    return genderFiltered.length ? genderFiltered : roleFiltered;
  }

  function randomGender() {
    return Math.random() < 0.5 ? "man" : "woman";
  }

  function usedHeadshotsMap(extra) {
    var used = {};
    var i;
    for (i = 0; i < state.party.length; i++) {
      var shot = state.party[i] && state.party[i].headshot ? state.party[i].headshot : "";
      if (shot) used[shot] = true;
    }
    if (state.guest && state.guest.headshot) used[state.guest.headshot] = true;
    if (extra) {
      var keys = Object.keys(extra);
      for (i = 0; i < keys.length; i++) used[keys[i]] = true;
    }
    return used;
  }

  function pickUniquePortrait(role, preferredGender, used) {
    var usedSet = used || {};
    var firstGender = preferredGender || randomGender();
    var genders = firstGender === "woman" ? ["woman", "man"] : ["man", "woman"];
    for (var gi = 0; gi < genders.length; gi++) {
      var g = genders[gi];
      var pool = headshotOptionsForRole(role, g).filter(function (file) {
        return !usedSet[file];
      });
      if (pool.length) {
        var pick = pool[rollInt(0, pool.length - 1)];
        return { gender: g, headshot: pick };
      }
    }
    return { gender: firstGender, headshot: "" };
  }

  function assignMissingPartyPortraits() {
    var used = usedHeadshotsMap();
    for (var i = 0; i < state.party.length; i++) {
      var m = state.party[i];
      if (!m) continue;
      if (m.headshot) {
        used[m.headshot] = true;
        if (!m.gender || m.gender === "unknown") {
          var inferred = headshotGender(m.headshot);
          m.gender = inferred === "woman" ? "woman" : "man";
        }
        continue;
      }
      var got = pickUniquePortrait(m.role, m.gender, used);
      m.gender = got.gender;
      m.headshot = got.headshot;
      if (got.headshot) used[got.headshot] = true;
    }
    if (state.guest && !state.guest.headshot) {
      var gpick = pickUniquePortrait(state.guest.role || "soldier", state.guest.gender, used);
      state.guest.gender = gpick.gender;
      state.guest.headshot = gpick.headshot;
    }
  }

  function roleDollStyles(role) {
    if (role === "soldier") return ["classic", "veteran", "warden"];
    if (role === "priest") return ["classic", "scribe", "oracle"];
    if (role === "mercenary") return ["classic", "raider", "ranger"];
    if (role === "mage") return ["classic", "apprentice", "archon"];
    return ["classic"];
  }


  function memberDollStyle(member) {
    var opts = roleDollStyles(member.role);
    var chosen = state.dollStyleByMember ? state.dollStyleByMember[member.id] : null;
    if (!chosen) return opts[0];
    return opts.indexOf(chosen) >= 0 ? chosen : opts[0];
  }

  function inventoryMemberById(id) {
    for (var i = 0; i < state.party.length; i++) if (state.party[i].id === id) return state.party[i];
    return state.party[0] || null;
  }

  function ensureInventoryFocus() {
    var m = inventoryMemberById(state.inventoryFocusId);
    if (!m && state.party.length) state.inventoryFocusId = state.party[0].id;
  }

  function profileForMember(m) {
    if (m && m.id === "p0" && state.leaderProfile) {
      initMemberProgress(m);
      var st = cloneStats(m.stats || state.leaderProfile.stats || baseStatsForRole(state.leaderProfile.role));
      return {
        age: state.leaderProfile.age,
        hometown: state.leaderProfile.hometown,
        bio: state.leaderProfile.bio,
        gender: state.leaderProfile.gender || "man",
        headshot: state.leaderProfile.headshot || m.headshot || "",
        skills: m.role === "priest" ? ["Field medicine", "Rite of warding", "Camp counsel"] : m.role === "mercenary" ? ["Trail scouting", "Quick draw", "Loot appraisal"] : ["Shield wall", "Road discipline", "Vanguard drills"],
        traits: m.role === "priest" ? ["Patient", "Observant", "Composed"] : m.role === "mercenary" ? ["Pragmatic", "Bold", "Wry"] : ["Steady", "Protective", "Direct"],
        stats: st,
        level: m.level,
        xp: m.xp,
        xpToLevel: xpToNextLevel(m.level),
      };
    }
    var seed = 0;
    var src = (m.id || "") + (m.name || "");
    for (var i = 0; i < src.length; i++) seed += src.charCodeAt(i) * (i + 1);
    var age = 18 + (seed % 17);
    var towns = ["Cantebury", "Northwall", "Dunmere", "Isil Reach", "Stonefield", "Harbor Vale"];
    var hometown = towns[seed % towns.length];
    var bioByRole = {
      soldier: "Keeps the line under pressure and protects the caravan vanguard.",
      priest: "Carries old rites, mends wounds, and steadies morale on the road.",
      mercenary: "Scouts profit routes, reads danger, and cuts deals under stress.",
      mage: "Shapes fire and spark at range while the civilian train marches behind.",
    };
    var skillsByRole = {
      soldier: ["Shield wall", "Road discipline", "Vanguard drills"],
      priest: ["Field medicine", "Rite of warding", "Camp counsel"],
      mercenary: ["Trail scouting", "Quick draw", "Loot appraisal"],
      mage: ["Arcane fire", "Spark cantrip", "Road focus"],
    };
    var traitsByRole = {
      soldier: ["Steady", "Protective", "Direct"],
      priest: ["Patient", "Observant", "Composed"],
      mercenary: ["Pragmatic", "Bold", "Wry"],
      mage: ["Curious", "Intense", "Reserved"],
    };
    initMemberProgress(m);
    return {
      age: age,
      hometown: hometown,
      bio: bioByRole[m.role] || "A hardened road traveler.",
      gender: m.gender || "man",
      headshot: m.headshot || "",
      skills: skillsByRole[m.role] || ["Adaptable", "Resilient", "Focused"],
      traits: traitsByRole[m.role] || ["Stoic", "Reliable", "Calm"],
      stats: cloneStats(m.stats || baseStatsForRole(m.role || "soldier")),
      level: m.level,
      xp: m.xp,
      xpToLevel: xpToNextLevel(m.level),
    };
  }

  function travelHealableTargets() {
    var targets = state.party.filter(function (m) {
      return m && m.hp > 0 && m.hp < m.maxHp;
    });
    if (state.guest && state.guest.hp > 0 && state.guest.hp < state.guest.maxHp) {
      targets.push({
        id: "guest",
        name: state.guest.name,
        hp: state.guest.hp,
        maxHp: state.guest.maxHp,
      });
    }
    return targets;
  }

  function inventoryActionHealingContext() {
    if (state.phase === "travel" || state.phase === "adventure" || state.phase === "quest_trek") return true;
    return !!(state.phase === "action" && state.pendingEncounter && state.pendingEncounter.kind === "ruins_discovery");
  }

  function memberEquipmentPanelHtml(member) {
    ensureMemberEquipment(member);
    var html = '<h4>-Equipment-</h4>';
    for (var si = 0; si < EQUIPMENT_SLOTS.length; si++) {
      var slot = EQUIPMENT_SLOTS[si];
      var equippedId = member.equipment[slot];
      var equippedDef = equipmentItemDef(equippedId);
      var equippedLabel = equippedDef ? equippedDef.label : equippedId ? equippedId : "empty";
      var stashOpts = stashItemsForSlot(slot);
      var optionHtml = '<option value="">Equip from stash</option>';
      for (var oi = 0; oi < stashOpts.length; oi++) {
        var oid = stashOpts[oi];
        var odef = equipmentItemDef(oid);
        optionHtml +=
          '<option value="' +
          escapeHtml(oid) +
          '">' +
          escapeHtml(odef ? odef.label : oid) +
          "</option>";
      }
      html +=
        '<p class="inv-equip-row"><b>' +
        EQUIPMENT_SLOT_LABELS[slot] +
        "</b>: " +
        escapeHtml(equippedLabel) +
        (equippedId
          ? ' <button type="button" data-unequip-slot="' +
            escapeHtml(member.id) +
            '" data-slot="' +
            slot +
            '">Unequip</button>'
          : "") +
        ' <select data-equip-member="' +
        escapeHtml(member.id) +
        '" data-equip-slot="' +
        slot +
        '"' +
        (stashOpts.length ? "" : " disabled") +
        ">" +
        optionHtml +
        "</select></p>";
    }
    return html;
  }

  function inventoryScreenHtml() {
    ensureInventoryFocus();
    var focus = inventoryMemberById(state.inventoryFocusId);
    if (!focus) return "";

    if (!state.inventoryDetailOpen) {
      var cards = state.party
        .map(function (m) {
          var ms = (m && m.stats) || { strength: 0, intelligence: 0, stamina: 0, luck: 0 };
          var statsLine = "STR " + (ms.strength || 0) + " | INT " + (ms.intelligence || 0)
            + " | STAM " + (ms.stamina || 0) + " | LUCK " + (ms.luck || 0);
          return (
            '<button type="button" class="inv-open-char" data-open-char="' +
            m.id +
            '">' +
            '<span class="' +
            avatarClass(m.role) +
            '">' +
            m.role.charAt(0).toUpperCase() +
            "</span>" +
            '<span class="inv-open-meta">' +
            '<span class="inv-open-name">' +
            m.name +
            "</span>" +
            '<span class="inv-open-sub">' +
            roleLabel(m.role) +
            " - " +
            memberDollStyle(m) +
            " - Lv " +
            (typeof m.level === "number" ? m.level : 1) +
            " - " +
            (typeof m.hp === "number" ? m.hp : 0) +
            "/" +
            (typeof m.maxHp === "number" ? m.maxHp : 0) +
            " HP" +
            "</span>" +
            '<span class="inv-open-sub" style="color:#c89c3f">' + statsLine + "</span>" +
            "</span>" +
            "</button>"
          );
        })
        .join("");

      return (
        '<section class="sheet-wrap sheet-wrap--single">' +
        '<div class="sheet-card">' +
        "<h3 class=\"roster-heading\">Trail ledger</h3>" +
        resourcesStatsGridHtml() +
        '<h3 class="roster-heading">Party roster</h3>' +
        '<p class="roster-note">Hover and click a name/icon to open that character sheet.</p>' +
        '<div class="inv-open-list">' +
        cards +
        "</div>" +
        "</div></section>"
      );
    }

    var prof = profileForMember(focus);
    var roleStyle = memberDollStyle(focus);
    var portraitLabel = prof.headshot ? headshotLabel(prof.headshot) : roleStyle;
    var portraitVisual = prof.headshot
      ? '<img class="sheet-headshot" src="' +
        headshotUrl(prof.headshot) +
        '" alt="' +
        escapeHtml(focus.name + " headshot") +
        '" loading="lazy">'
      : '<div class="sheet-doll avatar avatar-' +
        focus.role +
        ' doll-' +
        focus.role +
        '-' +
        roleStyle +
        '">' +
        focus.role.charAt(0).toUpperCase() +
        "</div>";
    var styleChoices = roleDollStyles(focus.role)
      .map(function (st) {
        return (
          '<button type="button" class="inv-style-btn' +
          (st === roleStyle ? " selected" : "") +
          '" data-style-set="' +
          focus.id +
          '" data-style="' +
          st +
          '">' +
          st +
          "</button>"
        );
      })
      .join("");

    var travelPotionActions = "";
    if (inventoryActionHealingContext()) {
      var healableTargets = travelHealableTargets();
      var selectedHealTargetId = state.inventoryHealTargetId || "";
      var hasSelectedHealableTarget = healableTargets.some(function (m) {
        return m.id === selectedHealTargetId;
      });
      if (!hasSelectedHealableTarget) {
        selectedHealTargetId = healableTargets.length ? healableTargets[0].id : "";
      }
      var healTargetOptions = healableTargets
        .map(function (m) {
          return (
            '<option value="' +
            m.id +
            '"' +
            (m.id === selectedHealTargetId ? " selected" : "") +
            ">" +
            escapeHtml(m.name) +
            " (" +
            m.hp +
            "/" +
            m.maxHp +
            " HP)</option>"
          );
        })
        .join("");
      var canPriestCastHeal = focus.role === "priest" && focus.hp > 0 && (focus.mp || 0) >= 5 && healableTargets.length > 0;
      var focusHealAmt = spellHealAmount(focus);
      var priestHealControls =
        focus.role === "priest"
          ? '<label class="inv-heal-target">Heal target <select id="invHealTarget"' +
            (healableTargets.length ? "" : " disabled") +
            ">" +
            healTargetOptions +
            '</select></label><button type="button" id="invCastHeal"' +
            (canPriestCastHeal ? "" : " disabled") +
            '>Cast Heal (+' + focusHealAmt + ' HP, 5 MP)</button>'
          : "";
      travelPotionActions =
        '<div class="actions">' +
        '<button type="button" id="invUseHealPotion"' + (state.healingPotions > 0 && focus.hp > 0 && focus.hp < focus.maxHp ? "" : " disabled") + '>Use Healing Potion (' + state.healingPotions + ')</button>' +
        '<button type="button" id="invUseLifePotion"' + (state.lifePotions > 0 && focus.hp <= 0 && !focus.permadead ? "" : " disabled") + '>Use Life Potion (' + state.lifePotions + ')</button>' +
        priestHealControls +
        "</div>";
    }

    return (
      '<section class="sheet-wrap sheet-wrap--single">' +
      '<div class="sheet-card">' +
      '<div class="actions"><button type="button" id="invBack">Back to roster</button></div>' +
      '<div class="sheet-top">' +
      '<div class="sheet-portrait" role="img" aria-label="portrait">' +
      portraitVisual +
      (prof.headshot ? "" : '<div class="sheet-style-chip">' + escapeHtml(portraitLabel) + "</div>") +
      "</div>" +
      '<div class="sheet-meta">' +
      '<p><b>class</b> ' +
      roleLabel(focus.role) +
      "</p>" +
      '<p><b>name</b> ' +
      focus.name +
      "</p>" +
      '<p><b>age</b> ' +
      prof.age +
      "</p>" +
      '<p><b>hometown</b> ' +
      prof.hometown +
      "</p>" +
      '<p><b>biography</b> ' +
      prof.bio +
      "</p>" +      '<p><b>paper doll</b> <span class="inv-style-btn-row">' +
      styleChoices +
      "</span></p>" +
      '<p><b>hp</b> ' +
      focus.hp +
      "/" +
      focus.maxHp +
      "</p>" +
      '<p><b>mp</b> ' +
      (typeof focus.mp === "number" ? focus.mp : 0) +
      "/" +
      (typeof focus.maxMp === "number" ? focus.maxMp : memberMaxMp(focus)) +
      "</p>" +
      '<p><b>level</b> ' +
      (typeof prof.level === "number" ? prof.level : 1) +
      "</p>" +
      '<p><b>xp</b> ' +
      (typeof prof.xp === "number" ? prof.xp : 0) +
      "/" +
      (isFinite(prof.xpToLevel) ? prof.xpToLevel : "max") +
      "</p>" +
      "</div>" +
      "</div>" +
      travelPotionActions +
      '<div class="sheet-divider"></div>' +
      '<div class="sheet-sections">' +
      memberEquipmentPanelHtml(focus) +
      '<h4>-Stats-</h4>' +
      '<p>Strength: ' +
      prof.stats.strength +
      "</p>" +
      '<p>Intelligence: ' +
      prof.stats.intelligence +
      "</p>" +
      '<p>Stamina: ' +
      prof.stats.stamina +
      "</p>" +
      '<p>Luck: ' +
      prof.stats.luck +
      "</p>" +
      '<h4>-Skills-</h4>' +
      '<p>- ' +
      prof.skills.join("</p><p>- ") +
      "</p>" +
      '<h4>-Personality-</h4>' +
      '<p>- ' +
      prof.traits.join("</p><p>- ") +
      "</p>" +
      "</div></div></section>"
    );
  }

  function wireCaravanRationMode(root) {
    if (!root) return;
    var radios = root.querySelectorAll('input[name="rationMode"]');
    var i;
    for (i = 0; i < radios.length; i++) {
      radios[i].onchange = (function (el) {
        return function () {
          if (!el.checked) return;
          state.rationMode = el.value === "stretch" ? "stretch" : "normal";
          if (state.rationMode !== "stretch") state.stretchedRationDays = 0;
          logLine(
            state.rationMode === "stretch"
              ? "Caravan rations set to <span class=\"hi\">stretch</span> — supplies last longer, morale may crack."
              : "Caravan rations set to <span class=\"hi\">normal</span>.",
            ""
          );
          render();
        };
      })(radios[i]);
    }
  }

  function wireInventoryScreen(root) {
    if (!state.inventoryDetailOpen) {
      var opens = root.querySelectorAll("[data-open-char]");
      for (var i = 0; i < opens.length; i++) {
        opens[i].onclick = (function (btn) {
          return function () {
            state.inventoryFocusId = btn.getAttribute("data-open-char");
            state.inventoryDetailOpen = true;
            render();
          };
        })(opens[i]);
      }
      return;
    }

    var back = root.querySelector("#invBack");
    if (back) {
      back.onclick = function () {
        state.inventoryDetailOpen = false;
        render();
      };
    }

    var useHeal = root.querySelector("#invUseHealPotion");
    if (useHeal) {
      useHeal.onclick = function () {
        var m = inventoryMemberById(state.inventoryFocusId);
        if (!m || m.hp <= 0 || m.hp >= m.maxHp || state.healingPotions <= 0) return;
        state.healingPotions--;
        m.hp = Math.min(m.maxHp, m.hp + 3);
        logLine(m.name + " uses Potion of Healing (+3 HP).", "good");
        render();
      };
    }
    var useLife = root.querySelector("#invUseLifePotion");
    if (useLife) {
      useLife.onclick = function () {
        var m = inventoryMemberById(state.inventoryFocusId);
        if (!m || m.hp > 0 || m.permadead || state.lifePotions <= 0) return;
        state.lifePotions--;
        m.hp = Math.max(1, Math.ceil(m.maxHp * 0.5));
        m.deadSinceDay = undefined;
        clearMemberDeathSnapshot(m);
        logLine(m.name + " is revived with Potion of Life (" + m.hp + " HP).", "good");
        render();
      };
    }
    var castHeal = root.querySelector("#invCastHeal");
    if (castHeal) {
      castHeal.onclick = function () {
        var priest = inventoryMemberById(state.inventoryFocusId);
        var healTargetSel = root.querySelector("#invHealTarget");
        var targetId = healTargetSel ? healTargetSel.value : "";
        var target = teamMemberById(targetId);
        if (!target) {
          var fallbackTargets = travelHealableTargets();
          target = fallbackTargets.length ? teamMemberById(fallbackTargets[0].id) : null;
        }
        if (!priest || priest.role !== "priest" || priest.hp <= 0 || (priest.mp || 0) < 5) return;
        if (!target || target.hp <= 0 || target.hp >= target.maxHp) return;
        priest.mp = Math.max(0, (priest.mp || 0) - 5);
        var healAmt = spellHealAmount(priest);
        target.hp = Math.min(target.maxHp, target.hp + healAmt);
        state.inventoryHealTargetId = target.id;
        logLine(priest.name + " casts Heal on " + target.name + " (+" + healAmt + " HP, 5 MP).", "good");
        render();
      };
    }
    var healTarget = root.querySelector("#invHealTarget");
    if (healTarget) {
      healTarget.onchange = function () {
        state.inventoryHealTargetId = healTarget.value;
      };
    }

    var unequipBtns = root.querySelectorAll("[data-unequip-slot]");
    for (var ue = 0; ue < unequipBtns.length; ue++) {
      unequipBtns[ue].onclick = (function (btn) {
        return function () {
          var mid = btn.getAttribute("data-unequip-slot");
          var slot = btn.getAttribute("data-slot");
          var mem = inventoryMemberById(mid);
          if (!mem || !slot) return;
          unequipSlotToStash(mem, slot);
          logLine(mem.name + " stows " + EQUIPMENT_SLOT_LABELS[slot] + " gear.", "");
          render();
        };
      })(unequipBtns[ue]);
    }
    var equipSelects = root.querySelectorAll("[data-equip-member]");
    for (var es = 0; es < equipSelects.length; es++) {
      equipSelects[es].onchange = (function (sel) {
        return function () {
          var itemId = sel.value;
          if (!itemId) return;
          var mid = sel.getAttribute("data-equip-member");
          var slot = sel.getAttribute("data-equip-slot");
          var mem = inventoryMemberById(mid);
          if (!mem || !slot) return;
          if (equipItemOnMember(mem, slot, itemId)) {
            var def = equipmentItemDef(itemId);
            logLine(mem.name + " equips " + (def ? def.label : itemId) + ".", "good");
          }
          render();
        };
      })(equipSelects[es]);
    }

    var styleBtns = root.querySelectorAll("[data-style-set]");
    for (var j = 0; j < styleBtns.length; j++) {
      styleBtns[j].onclick = (function (btn) {
        return function () {
          var id = btn.getAttribute("data-style-set");
          var style = btn.getAttribute("data-style");
          var m = inventoryMemberById(id);
          if (!m) return;
          if (!state.dollStyleByMember) state.dollStyleByMember = {};
          state.dollStyleByMember[id] = style;
          logLine("Paper doll style set for " + m.name + ": <span class=\"hi\">" + style + "</span>.", "");
          render();
        };
      })(styleBtns[j]);
    }
  }

  function hpBarHtml(pct) {
    pct = Math.max(0, Math.min(100, pct));
    return '<span class="hpbar" title="HP"><span style="width:' + pct + '%"></span></span>';
  }

  function foeCardHtml(f, canTarget, selectedTarget) {
    var pct = Math.round((100 * f.hp) / f.maxHp);
    var targetable = !!canTarget && f.hp > 0;
    var cls = "foe-card" + (targetable ? " foe-card-targetable" : "") + (selectedTarget ? " foe-card-selected" : "");
    var portraitHtml = f.portrait
      ? '<img class="foe-portrait" src="' + headshotUrl(f.portrait) + '" alt="' + escapeHtml(f.name + ' portrait') + '" loading="lazy">'
      : "";
    return (
      '<button type="button" class="' +
      cls +
      '" data-foe-target="' +
      f.id +
      '"' +
      (targetable ? "" : " disabled") +
      '>' +
      portraitHtml +
      '<div class="foe-name">' +
      f.name +
      "</div>" +
      hpBarHtml(pct) +
      '<div class="foe-meta">' +
      f.hp +
      "/" +
      f.maxHp +
      " HP - hits for " +
      f.dmg +
      "</div>" +
      "</button>"
    );
  }

  function battlePartyCard(m, activeMemberId, allyTargetMode) {
    var ref = teamMemberById(m.id);
    if (!ref) return "";
    var pct = Math.round((100 * ref.hp) / ref.maxHp);
    var rec = choiceForMember(m.id);
    var act = rec && rec.action ? rec.action : null;
    var isActive = activeMemberId === m.id;
    var canBeAllyTarget = !!allyTargetMode && ref.hp > 0;
    var allyTargetBtn = canBeAllyTarget
      ? '<button type="button" class="act-btn primary" data-ally-target="' + m.id + '" style="margin-top:.35rem">Target heal</button>'
      : "";
    var actions = ["attack", "defend", "spell", "item"];
    var labels = { attack: "Attack", defend: "Defend", spell: "Spell", item: "Item" };
    var btns = "";
    var itemMenu = "";
    var spellMenu = "";
    var a;
    for (a = 0; a < actions.length; a++) {
      var key = actions[a];
      var on = act === key ? " selected" : "";
      btns +=
        '<button type="button" class="act-btn' +
        on +
        '" data-mid="' +
        m.id +
        '" data-act="' +
        key +
        '"' +
        (isActive ? "" : " disabled") +
        '>' +
        labels[key] +
        "</button>";
    }
    if (isActive && act === "spell") {
      var selectedSpell = rec && rec.spellKind ? rec.spellKind : "";
      var spellDmgAmt = spellDamage(m);
      var spellHealAmt = spellHealAmount(m);
      if (m.role === "priest") {
        var spellDisabled = (ref.mp || 0) >= 5 ? "" : " disabled";
        spellMenu =
          '<div class="battle-item-menu">' +
          '<button type="button" class="act-btn' + (selectedSpell === "spark" ? " selected" : "") + '" data-spell-choice="spark"' + spellDisabled + '>Spark (' + spellDmgAmt + ' dmg, 5 MP)</button>' +
          '<button type="button" class="act-btn' + (selectedSpell === "heal" ? " selected" : "") + '" data-spell-choice="heal"' + spellDisabled + '>Heal (+' + spellHealAmt + ' HP, 5 MP)</button>' +
          "</div>";
      } else if (m.role === "mage") {
        var fireDisabled = (ref.mp || 0) >= 5 ? "" : " disabled";
        spellMenu =
          '<div class="battle-item-menu">' +
          '<button type="button" class="act-btn' + (selectedSpell === "fire" ? " selected" : "") + '" data-spell-choice="fire"' + fireDisabled + '>Fire (' + spellDmgAmt + ' dmg, 5 MP)</button>' +
          "</div>";
      }
    }
    if (isActive && act === "item") {
      var selectedItem = rec && rec.itemKind ? rec.itemKind : "";
      var healDisabled = state.healingPotions > 0 ? "" : " disabled";
      var lifeDisabled = state.lifePotions > 0 ? "" : " disabled";
      itemMenu =
        '<div class="battle-item-menu">' +
        '<button type="button" class="act-btn' + (selectedItem === "heal_potion" ? " selected" : "") + '" data-item-choice="heal_potion"' + healDisabled + '>Healing potion (' + state.healingPotions + ')</button>' +
        '<button type="button" class="act-btn' + (selectedItem === "life_potion" ? " selected" : "") + '" data-item-choice="life_potion"' + lifeDisabled + '>Life potion (' + state.lifePotions + ')</button>' +
        "</div>";
    }
    return (
      '<div class="battle-card' +
      (isActive ? " battle-card-active" : "") +
      '">' +
      '<div class="battle-doll">' +
      '<div class="battle-card-head">' +
      '<span class="' +
      avatarClass(m.role) +
      ' battle-avatar">' +
      m.role.charAt(0).toUpperCase() +
      "</span>" +
      '<span class="battle-name">' +
      m.name +
      "</span>" +
      "</div>" +
      hpBarHtml(pct) +
      '<div class="battle-hp">' +
      ref.hp +
      "/" +
      ref.maxHp +
      "</div>" +
      "</div>" +
      '<div class="battle-actions">' +
      btns +
      spellMenu +
      itemMenu +
      allyTargetBtn +
      "</div>" +
      "</div>"
    );
  }

  function memberHpLevelLine(m) {
    if (!m) return "";
    initMemberProgress(m);
    return (
      m.hp +
      "/" +
      m.maxHp +
      " HP · Lv " +
      (typeof m.level === "number" ? m.level : 1)
    );
  }

  function resourcesStatsGridHtml() {
    var mult = lootMultiplier(state.party).toFixed(2);
    var ru = state.ruinsDiscovered ? "day " + state.ruinsTravelDay : "-";
    var bless = state.blessing ? blessingTypeLabel(state.blessing) : blessingTypeLabel(null);
    if (state.blessing && typeof state.blessingExpiresOnDay === "number") {
      bless += " (" + Math.max(0, state.blessingExpiresOnDay - (state.totalDaysElapsed || 0)) + "d left)";
    }
    return (
      "<div class=\"stats-grid stats-grid-compact\">" +
      "<div class=\"stat\">Gold: <b>" +
      state.gold +
      "</b></div>" +
      "<div class=\"stat\">Gems: <b>" +
      state.gems +
      "</b></div>" +
      "<div class=\"stat\">Supplies: <b>" +
      state.food +
      "</b></div>" +
      "<div class=\"stat\">Caravan: <b>" +
      (state.caravan ? state.caravan.total : 0) +
      "</b> <span class=\"stat-hint\">civilians</span></div>" +
      "<div class=\"stat\">Weapons: <b>" +
      state.weapons +
      "</b></div>" +
      "<div class=\"stat\">Merc loot: <b>x" +
      mult +
      "</b></div>" +
      "<div class=\"stat\">Next day encounter: <b>" +
      (state.encounterChance * 100).toFixed(0) +
      "%</b> <span class=\"stat-hint\">(+25% per quiet day)</span></div>" +
      "<div class=\"stat\">Blessing: <b>" +
      bless +
      "</b></div>" +
      "<div class=\"stat\">Ruins: <b>" +
      ru +
      "</b></div>" +
      "<div class=\"stat\">Journey: <b>day " +
      (state.totalDaysElapsed || 0) +
      " / " +
      effectiveStabilityTarget() +
      "</b></div>" +
      "<div class=\"stat\">New Isil settlers: <b>" +
      newIsilSettlerCount() +
      "</b></div>" +
      "<div class=\"stat\">Version: <b>v" +
      GAME_VERSION +
      "</b></div>" +
      "</div>"
    );
  }

  function renderHeader() {
    var combatUi = state.phase === "action" && state.combat;
    var canOpenFromHeader = state.phase === "story_illiri" && (state.illiriView === "party" || state.illiriView === "inventory");
    var partyBits = state.party
      .map(function (m) {
        return (
          "<li" +
          (canOpenFromHeader ? ' class="party-openable" data-open-from-header="' + m.id + '"' : "") +
          ">" +
          '<span class="' +
          avatarClass(m.role) +
          ' sm">' +
          m.role.charAt(0).toUpperCase() +
          "</span>" +
          '<span class="role-' +
          m.role +
          '">' +
          m.name +
          "</span>" +
          '<span class="party-hp-text">' +
          memberHpLevelLine(m) +
          "</span></li>"
        );
      })
      .join("");
    var guestLi = state.guest
      ? "<li>" +
        '<span class="' +
        avatarClass(state.guest.role || "soldier") +
        ' sm">G</span>' +
        '<span class="role-guest">' +
        state.guest.name +
        "</span>" +
        '<span class="party-hp-text">' +
        memberHpLevelLine(state.guest) +
        "</span></li>"
      : '<li class="role-guest"><em>Guest slot empty.</em></li>';

    var marchForMap =
      state.phase === "travel" && state.transition && state.transition.kind === "march" ? state.transition : null;
    var mapBlock =
      state.phase === "travel" || (state.phase === "action" && !combatUi) ? travelMapHtml(marchForMap) : "";

    return (
      mapBlock +
      '<div class="party-panel' +
      (combatUi ? " party-panel--combat" : "") +
      '">' +
      "<h2 class=\"panel-title panel-title-party\">Party</h2>" +
      "<ul class=\"party-list party-list-compact\">" +
      partyBits +
      guestLi +
      "</ul></div>"
    );
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function compactJson(obj) {
    return escapeHtml(JSON.stringify(obj, null, 2));
  }

  function balanceDataScreenHtml() {
    var classes = (BALANCE_DATA && BALANCE_DATA.classes) || {};
    var classKeys = Object.keys(classes);
    var monsters = (BALANCE_DATA && BALANCE_DATA.monsters) || [];
    var weapons = (BALANCE_DATA && BALANCE_DATA.weapons) || [];
    var classRows = classKeys
      .map(function (k) {
        var c = classes[k] || {};
        var b = c.base || {};
        var x = c.bonus || {};
        var f = c.final || {};
        return (
          "<tr>" +
          "<td>" +
          roleLabel(k) +
          "</td>" +
          "<td>" +
          [b.strength || 0, b.intelligence || 0, b.stamina || 0, b.luck || 0].join("/") +
          "</td>" +
          "<td>" +
          [x.strength || 0, x.intelligence || 0, x.stamina || 0, x.luck || 0].join("/") +
          "</td>" +
          "<td>" +
          [f.strength || 0, f.intelligence || 0, f.stamina || 0, f.luck || 0].join("/") +
          "</td>" +
          "</tr>"
        );
      })
      .join("");
    var monsterPreview = compactJson(monsters.slice(0, 12));
    var weaponPreview = compactJson(weapons.slice(0, 12));
    return (
      '<section class="data-panel">' +
      '<div class="stats-grid">' +
      '<div class="stat">Data version: <b>v' +
      GAME_VERSION +
      "</b></div>" +
      '<div class="stat">Creation bonus points: <b>' +
      CLASS_BONUS_POINTS +
      "</b></div>" +
      '<div class="stat">Classes loaded: <b>' +
      classKeys.length +
      "</b></div>" +
      '<div class="stat">Monsters loaded: <b>' +
      monsters.length +
      "</b></div>" +
      '<div class="stat">Weapons loaded: <b>' +
      weapons.length +
      "</b></div>" +
      "</div>" +
      '<h3 class="panel-title">Class stat model (STR/INT/STA/LUCK)</h3>' +
      '<div class="data-table-wrap"><table class="data-table"><thead><tr><th>Class</th><th>Base</th><th>Preset bonus</th><th>Final before +3</th></tr></thead><tbody>' +
      classRows +
      "</tbody></table></div>" +
      '<details class="data-details" open><summary>Monster data preview (first 12)</summary><pre class="data-pre">' +
      monsterPreview +
      "</pre></details>" +
      '<details class="data-details"><summary>Weapon data preview (first 12)</summary><pre class="data-pre">' +
      weaponPreview +
      "</pre></details>" +
      "</section>"
    );
  }

  function renderLog() {
    return (
      "<div class=\"log\">" +
      state.log
        .map(function (l) {
          return "<p class=\"" + l.cls + "\">" + l.html + "</p>";
        })
        .join("") +
      "</div>"
    );
  }

  function wireHeaderPartyOpen(root) {
    var rows = root.querySelectorAll("[data-open-from-header]");
    for (var i = 0; i < rows.length; i++) {
      rows[i].onclick = (function (row) {
        return function () {
          state.inventoryFocusId = row.getAttribute("data-open-from-header");
          state.inventoryDetailOpen = true;
          render();
        };
      })(rows[i]);
    }
  }

  function autoPlanRemainingChoices() {
    if (!state.combat) return;
    var guard = 0;
    while (currentPlannerId() && guard < 64) {
      guard++;
      var mid = currentPlannerId();
      if (!mid) break;
      var foes = foesAlive();
      if (!foes.length) {
        state.combat.choices[mid] = { action: "defend", targetId: null };
        continue;
      }
      var tgt = foes[rollInt(0, foes.length - 1)];
      state.combat.choices[mid] = { action: "attack", targetId: tgt.id };
    }
    render();
  }

  function wireBattleActions(root) {
    var btns = root.querySelectorAll(".act-btn");
    for (var i = 0; i < btns.length; i++) {
      btns[i].onclick = (function (b) {
        return function () {
          setChoice(b.getAttribute("data-mid"), b.getAttribute("data-act"));
        };
      })(btns[i]);
    }
    var targets = root.querySelectorAll("[data-foe-target]");
    for (var j = 0; j < targets.length; j++) {
      targets[j].onclick = (function (t) {
        return function () {
          chooseAttackTarget(t.getAttribute("data-foe-target"));
        };
      })(targets[j]);
    }
    var itemBtns = root.querySelectorAll("[data-item-choice]");
    for (var k = 0; k < itemBtns.length; k++) {
      itemBtns[k].onclick = (function (ib) {
        return function () {
          chooseItemOption(ib.getAttribute("data-item-choice"));
        };
      })(itemBtns[k]);
    }
    var spellBtns = root.querySelectorAll("[data-spell-choice]");
    for (var si = 0; si < spellBtns.length; si++) {
      spellBtns[si].onclick = (function (sb) {
        return function () {
          chooseSpellOption(sb.getAttribute("data-spell-choice"));
        };
      })(spellBtns[si]);
    }
    var allyTargets = root.querySelectorAll("[data-ally-target]");
    for (var at = 0; at < allyTargets.length; at++) {
      allyTargets[at].onclick = (function (ab) {
        return function () {
          chooseSpellAllyTarget(ab.getAttribute("data-ally-target"));
        };
      })(allyTargets[at]);
    }
    var autoBtn = root.querySelector("#autoRoundBtn");
    if (autoBtn) autoBtn.onclick = autoPlanRemainingChoices;
  }

  function render() {
    var app = document.getElementById("app");
    if (!app) return;

    if (state.phase === "gameover") {
      var overText =
        state.gameoverMode === "win"
          ? "The Illirial Trail is complete — New Isil after " + effectiveStabilityTarget() + " journey days."
          : "Game over.";
      var winDetail =
        state.gameoverMode === "win"
          ? "<p class=\"hint\">Journey days: <b>" +
            (state.totalDaysElapsed || 0) +
            "</b>. Caravan loops: <b>" +
            (state.caravanLoops || 0) +
            "</b>. Settlers in New Isil: <b>" +
            newIsilSettlerCount() +
            "</b>. Harbor population: <b>" +
            (state.newIsilGrowth ? state.newIsilGrowth.population : NEW_ISIL_BASE_POPULATION) +
            "</b>.</p>"
          : "";
      app.innerHTML =
        renderHeader() +
        "<p>" + overText + "</p>" +
        winDetail +
        '<div class="actions"><button type="button" class="primary" id="btnRestart">Restart</button></div>' +
        renderLog();
      document.getElementById("btnRestart").onclick = function () {
        clearTransitionTimers();
        state = initialState();
        render();
      };
      return;
    }

    if (state.phase === "new_game_setup") {
      app.innerHTML =
        startCitySplash() +
        "<h2 class=\"panel-title\">Start a new caravan</h2>" +
        "<p class=\"town-lead\">Choose how to set your caravan leader before departing Cantebury.</p>" +
        "<div class=\"actions\">" +
        '<button type="button" class="primary" id="newLeaderBtn">Create new character</button>' +
        '<button type="button" id="presetLeaderBtn">Use preset leader</button>' +
        "</div>" +
        renderLog();
      document.getElementById("newLeaderBtn").onclick = function () {
        state.phase = "new_character";
        render();
      };
      document.getElementById("presetLeaderBtn").onclick = function () {
        try {
          beginRunWithLeader(PRESET_LEADER);
          render();
        } catch (err) {
          var msg = err && err.message ? err.message : "Unknown preset start error.";
          logLine("Preset caravan failed to initialize: " + msg, "bad");
          if (typeof console !== "undefined" && console.error) console.error(err);
          render();
        }
      };
      return;
    }

    if (state.phase === "new_character") {
      var draft = currentLeaderDraft();
      var baseStats = baseStatsForRole(draft.role);
      var headshotChoices = headshotOptionsForRole(draft.role, draft.gender || "man");
      var showCount = Math.max(5, parseInt(draft.headshotShowCount, 10) || 5);
      if (draft.headshot && headshotChoices.indexOf(draft.headshot) < 0) headshotChoices.unshift(draft.headshot);
      var visibleHeadshots = headshotChoices.slice(0, showCount);
      var canShowMoreHeadshots = showCount < headshotChoices.length;
      var bonus = draft.bonus || { strength: 0, intelligence: 0, stamina: 0, luck: 0 };
      var usedPts = totalBonusPoints(bonus);
      var remainPts = CLASS_BONUS_POINTS - usedPts;
      function statRow(key, label) {
        var b = baseStats[key];
        var plus = bonus[key] || 0;
        var total = b + plus;
        return (
          '<div class="char-stat-row">' +
          '<span class="char-stat-name">' +
          label +
          '</span>' +
          '<span class="char-stat-base">Base ' +
          b +
          '</span>' +
          '<button type="button" class="char-stat-btn" data-stat-minus="' +
          key +
          '"' +
          (plus <= 0 ? ' disabled' : '') +
          '>-</button>' +
          '<span class="char-stat-bonus">+' +
          plus +
          '</span>' +
          '<button type="button" class="char-stat-btn" data-stat-plus="' +
          key +
          '"' +
          (remainPts <= 0 ? ' disabled' : '') +
          '>+</button>' +
          '<span class="char-stat-total">Total ' +
          total +
          '</span>' +
          '</div>'
        );
      }

      function headshotOptionHtml(file) {
        var selected = draft.headshot === file;
        var label = headshotLabel(file);
        return (
          '<button type="button" class="char-headshot-option' +
          (selected ? ' selected' : '') +
          '" data-headshot="' +
          escapeHtml(file) +
          '">' +
          '<img src="' +
          headshotUrl(file) +
          '" alt="' +
          escapeHtml(label + ' headshot') +
          '" loading="lazy">' +
          '<span>' +
          escapeHtml(label) +
          '</span>' +
          '</button>'
        );
      }

      app.innerHTML =
        startCitySplash() +
        "<h2 class=\"panel-title\">Create your leader</h2>" +
        "<p class=\"town-lead\">Define the character who leads the first caravan.</p>" +
        '<div class="char-form">' +
        '<label>Name <input id="leadName" maxlength="32" placeholder="e.g. Rowan Hale" value="' +
        (draft.name || "") +
        '"></label>' +
        '<label>Class <select id="leadRole"><option value="soldier"' +
        (draft.role === "soldier" ? " selected" : "") +
        '>Soldier</option><option value="priest"' +
        (draft.role === "priest" ? " selected" : "") +
        '>Priest</option><option value="mercenary"' +
        (draft.role === "mercenary" ? " selected" : "") +
        '>Mercenary</option><option value="mage"' +
        (draft.role === "mage" ? " selected" : "") +
        '>Mage</option></select></label>' +
        '<label>Gender <select id="leadGender"><option value="man"' +
        ((draft.gender || "man") === "man" ? " selected" : "") +
        '>Man</option><option value="woman"' +
        ((draft.gender || "man") === "woman" ? " selected" : "") +
        '>Woman</option></select></label>' +
        '<label>Age <input id="leadAge" type="number" min="16" max="70" value="' +
        draft.age +
        '"></label>' +
        '<label>Hometown <input id="leadTown" maxlength="32" value="' +
        (draft.hometown || "") +
        '"></label>' +
        '<label>Biography <textarea id="leadBio" rows="4" maxlength="240" placeholder="A short backstory...">' +
        (draft.bio || "") +
        '</textarea></label>' +
        '<div class="char-headshot-wrap">' +
        '<p class="char-headshot-head">Headshot</p>' +
        '<div class="char-headshot-grid">' +
        '<button type="button" class="char-headshot-option char-headshot-option-none' +
        (!draft.headshot ? ' selected' : '') +
        '" data-headshot="">No headshot</button>' +
        visibleHeadshots.map(headshotOptionHtml).join('') +
        '</div>' +
        (canShowMoreHeadshots ? '<div class="actions"><button type="button" id="headshotMoreBtn">Show 5 more headshots</button></div>' : '') +
        '</div>' +
        '<div class="char-stat-wrap">' +
        '<p class="char-stat-head">Bonus points remaining: <b>' +
        remainPts +
        "</b> / " +
        CLASS_BONUS_POINTS +
        "</p>" +
        statRow("strength", "Strength") +
        statRow("intelligence", "Intelligence") +
        statRow("stamina", "Stamina") +
        statRow("luck", "Luck") +
        '</div>' +
        '</div>' +
        "<div class=\"actions\">" +
        '<button type="button" class="primary" id="createLeaderBtn">Start caravan</button>' +
        '<button type="button" id="backLeaderBtn">Back</button>' +
        "</div>" +
        renderLog();

      document.getElementById("leadName").oninput = function () {
        setLeaderDraftField("name", this.value);
      };
      document.getElementById("leadRole").onchange = function () {
        setLeaderDraftField("role", this.value);
        setLeaderDraftField("headshot", "");
        setLeaderDraftField("headshotShowCount", 5);
        render();
      };
      document.getElementById("leadGender").onchange = function () {
        setLeaderDraftField("gender", this.value || "man");
        setLeaderDraftField("headshot", "");
        setLeaderDraftField("headshotShowCount", 5);
        render();
      };
      document.getElementById("leadAge").oninput = function () {
        var v = parseInt(this.value, 10);
        setLeaderDraftField("age", isNaN(v) ? 28 : v);
      };
      document.getElementById("leadTown").oninput = function () {
        setLeaderDraftField("hometown", this.value);
      };
      document.getElementById("leadBio").oninput = function () {
        setLeaderDraftField("bio", this.value);
      };
      var shotBtns = app.querySelectorAll("[data-headshot]");
      for (var si = 0; si < shotBtns.length; si++) {
        shotBtns[si].onclick = (function (btn) {
          return function () {
            setLeaderDraftField("headshot", btn.getAttribute("data-headshot") || "");
            render();
          };
        })(shotBtns[si]);
      }
      var moreHeadshots = document.getElementById("headshotMoreBtn");
      if (moreHeadshots) {
        moreHeadshots.onclick = function () {
          setLeaderDraftField("headshotShowCount", showCount + 5);
          render();
        };
      }

      var plusBtns = app.querySelectorAll("[data-stat-plus]");
      for (var pi = 0; pi < plusBtns.length; pi++) {
        plusBtns[pi].onclick = (function (btn) {
          return function () {
            adjustLeaderDraftBonus(btn.getAttribute("data-stat-plus"), 1);
            render();
          };
        })(plusBtns[pi]);
      }
      var minusBtns = app.querySelectorAll("[data-stat-minus]");
      for (var mi = 0; mi < minusBtns.length; mi++) {
        minusBtns[mi].onclick = (function (btn) {
          return function () {
            adjustLeaderDraftBonus(btn.getAttribute("data-stat-minus"), -1);
            render();
          };
        })(minusBtns[mi]);
      }

      document.getElementById("backLeaderBtn").onclick = function () {
        state.phase = "new_game_setup";
        render();
      };

      document.getElementById("createLeaderBtn").onclick = function () {
        var latest = currentLeaderDraft();
        var name = (latest.name || "").trim();
        var role = latest.role;
        var ageRaw = parseInt(latest.age, 10);
        var hometown = (latest.hometown || "").trim();
        var bio = (latest.bio || "").trim();
        var remain = CLASS_BONUS_POINTS - totalBonusPoints(latest.bonus || { strength: 0, intelligence: 0, stamina: 0, luck: 0 });

        if (!name) {
          logLine("Leader name is required.", "bad");
          render();
          return;
        }
        if (remain !== 0) {
          logLine("Spend all " + CLASS_BONUS_POINTS + " bonus points before starting.", "bad");
          render();
          return;
        }
        if (!(ageRaw >= 16 && ageRaw <= 70)) ageRaw = 28;
        if (!hometown) hometown = "Cantebury";
        if (!bio) bio = "A first-time caravan leader eager to reach New Isil.";

        beginRunWithLeader({
          name: name,
          role: role,
          age: ageRaw,
          hometown: hometown,
          bio: bio,
          gender: latest.gender || "man",
          headshot: latest.headshot || "",
          stats: leaderDraftFinalStats(latest),
          bonus: latest.bonus || { strength: 0, intelligence: 0, stamina: 0, luck: 0 },
          source: "custom",
        });
        render();
      };
      return;
    }

    if (state.phase === "story_illiri") {
      normalizeCanteburyNav();
      var illiriShell = startCitySplash() + illiriTabStrip();

      if (state.illiriView === "castle") {
        app.innerHTML =
          illiriShell +
          keepInteriorHtml("cantebury") +
          renderLog() +
          npcDialogOverlayHtml(state.npcDialog);
        wireIlliriTabs(app);
        wireKeepInterior(app, "cantebury");
        wireNpcDialog(app);
        return;
      }

      if (state.illiriView === "city") {
        app.innerHTML = illiriShell + cityInteriorHtml() + renderLog() + npcDialogOverlayHtml(state.npcDialog);
        wireIlliriTabs(app);
        wireCityInterior(app);
        wireNpcDialog(app);
        return;
      }

      if (state.illiriView === "party") {
        app.innerHTML =
          illiriShell +
          "<h2 class=\"panel-title\">Party</h2>" +
          "<p class=\"town-lead\">Fighting line (up to " +
          PARTY_MAX +
          ") plus the civilian train on the road.</p>" +
          renderHeader() +
          caravanFollowersPanelHtml() +
          inventoryScreenHtml() +
          renderLog();
        wireIlliriTabs(app);
        wireInventoryScreen(app);
        wireCaravanRationMode(app);
        wireHeaderPartyOpen(app);
        return;
      }

      if (state.illiriView === "adventure") {
        app.innerHTML = illiriShell + canteburyAdventurePanelHtml() + renderLog();
        wireIlliriTabs(app);
        var advStart = document.getElementById("beginCanteburyAdventureBtn");
        if (advStart) advStart.onclick = beginAdventure;
        return;
      }

      if (state.illiriView === "data") {
        app.innerHTML =
          illiriShell +
          "<h2 class=\"panel-title\">Balance Data</h2>" +
          "<p class=\"town-lead\">Review spreadsheet-loaded balancing data in a separate screen.</p>" +
          balanceDataScreenHtml() +
          renderLog();
        wireIlliriTabs(app);
        return;
      }
      if (state.illiriView === "depart") {
        app.innerHTML =
          illiriShell +
          "<h2 class=\"panel-title\">Depart</h2>" +
          "<p class=\"town-lead\">March <b>westward</b> with two forks: <b>Gustaf or Brookside</b>, then <b>Hollow Banks or Glennhardt</b>, then Solem and New Isil. On the return, march your route in <b>reverse</b> (or detour to towns you visited). The campaign <b>ends</b> when you reach New Isil after <b>" +
          effectiveStabilityTarget() +
          " journey days</b> (plus any extension for the final leg). After <b>day " +
          FINAL_BOSS_MIN_DAYS +
          "</b>, SK Kew Kumber blocks the last westward hop.</p>" +
          '<p><b>Progress:</b> day ' +
          (state.totalDaysElapsed || 0) +
          " / " +
          effectiveStabilityTarget() +
          " · loops " +
          (state.caravanLoops || 0) +
          " · settlers abroad " +
          newIsilSettlerCount() +
          "</p>" +
          '<p><b>Trail legs:</b> each hop rolls <b>' +
          ROUTE_DAYS_MIN +
          "–" +
          ROUTE_DAYS_MAX +
          ' days</b> the first time you march each hop; eastbound legs mirror the same routes in reverse.</p>' +
          settlementWestwardForkNote("cantebury") +
          (state.trailLowerFork
            ? '<p class="hint">Last lower-fork choice: <b>' + destinationForKey(state.trailLowerFork).label + "</b>.</p>"
            : "") +
          '<div class="actions" style="flex-wrap:wrap;gap:.4rem">' +
          '<button type="button" class="primary" data-westbound-to="gustaf">March to Gustaf' +
          legDepartDaysHint("cantebury", "gustaf") +
          "</button>" +
          '<button type="button" class="primary" data-westbound-to="brookside">March to Brookside' +
          legDepartDaysHint("cantebury", "brookside") +
          "</button></div>" +
          renderLog();
        wireIlliriTabs(app);
        wireWestboundDepart(app);
        return;
      }

      state.illiriView = "castle";
      state.keepView = "hall";
      state.cityView = "shop";
      render();
      return;
    }

    if (state.phase === "travel") {
      if (state.transition && state.transition.kind === "depart" && state.transition.stage === "blackout") {
        app.innerHTML =
          transitionBlackoutHtml(
            "Leaving " + currentOriginLabel(),
            "The caravan marches " +
              travelDirectionClause(state.travelOrigin || "cantebury", currentDestination().key) +
              "."
          ) +
          renderLog();
        return;
      }
      if (state.transition && state.transition.kind === "depart" && state.transition.stage === "map") {
        app.innerHTML =
          '<div class="travel-map-intro">' +
          '<h2 class="panel-title">The trade road</h2>' +
          '<p class="map-intro-lead">Route set: ' +
          currentOriginLabel() +
          " to " +
          currentDestination().label +
          " (" +
          travelDirectionAdverb(state.travelOrigin || "cantebury", currentDestination().key) +
          "). " +
          currentRouteDays() +
          " travel days on this leg.</p>" +
          travelMapHtml(null) +
          "</div>" +
          renderLog();
        return;
      }
      if (state.transition && state.transition.kind === "encounter") {
        app.innerHTML = transitionEncounterHtml(state.transition) + renderLog();
        return;
      }
      var resumeOverlay =
        state.transition && state.transition.kind === "resume" ? transitionResumeOverlayHtml(state.transition) : "";
      app.innerHTML =
        travelSplashMarkup() +
        renderHeader() +
        "<h2 class=\"panel-title\">Travel</h2>" +
        "<p>Progress: " +
        state.travelDay +
        " / " +
        currentRouteDays() +
        " days complete. Each <b>Next day</b> consumes 1 supply (+1 MP; camp grants +2). Open <b>Inventory</b> for the trail ledger.</p>" +
        "<div class=\"actions\">" +
        '<button type="button" class="primary" id="nextDay">Next day</button>' +
        '<button type="button" id="travelCampBtn"' + (state.food > 0 ? "" : " disabled") + '>Camp...</button>' +
        '<button type="button" id="travelInventoryBtn">Inventory</button>' +
        "</div>" +
        (state.travelInventoryOpen ? inventoryScreenHtml() : "") +
        renderLog() +
        resumeOverlay +
        postBattleDialogOverlayHtml() +
        campDialogOverlayHtml();
      document.getElementById("nextDay").onclick = function () {
        if (state.transition) return;
        consumeTravelDaySupplies();
        if (allDead()) {
          state.gameoverMode = "loss";
          state.phase = "gameover";
          logLine("The expedition is lost.", "bad");
          render();
          return;
        }
        beginNextTravelDayMarch();
      };
      var travelCampBtn = document.getElementById("travelCampBtn");
      if (travelCampBtn) travelCampBtn.onclick = openCampDialog;
      var travelInvBtn = document.getElementById("travelInventoryBtn");
      if (travelInvBtn)
        travelInvBtn.onclick = function () {
          state.travelInventoryOpen = !state.travelInventoryOpen;
          if (!state.travelInventoryOpen) state.inventoryDetailOpen = false;
          render();
        };
      if (state.travelInventoryOpen) {
        wireInventoryScreen(app);
      }
      wirePostBattleDialog(app);
      wireCampDialog(app);
      return;
    }
    if (state.phase === "quest_trek") {
      if (state.transition && state.transition.kind === "encounter") {
        app.innerHTML = transitionEncounterHtml(state.transition) + renderLog();
        return;
      }
      var qResumeOverlay =
        state.transition && state.transition.kind === "resume" ? transitionResumeOverlayHtml(state.transition) : "";
      var qDef = state.quest ? questDef(state.quest.id) : null;
      var qDay = state.quest ? state.quest.dayProgress : 0;
      var qTotal = state.quest ? state.quest.totalDays : 5;
      var qBody =
        "<p>" + (qDef ? "<b>" + escapeHtml(qDef.name) + "</b> - " : "") +
        "Day <b>" + qDay + "</b> of <b>" + qTotal + "</b> through the mountain pass. " +
        "Each <b>Press on</b> consumes 1 supply and triggers an encounter. The final day reveals the quarry.</p>";
      var qActions =
        '<button type="button" class="primary" id="questAdvanceBtn"' +
        (state.food > 0 ? "" : " disabled") +
        '>Press on (day ' + (qDay + 1) + ')</button>' +
        '<button type="button" id="questCampBtn"' + (state.food > 0 ? "" : " disabled") + '>Camp...</button>' +
        '<button type="button" id="questRetreatBtn">Retreat (abandon quest)</button>' +
        '<button type="button" id="questInventoryBtn">Inventory</button>';
      var qFallen = state.party.filter(function (p) { return p && p.hp <= 0; });
      var qReviveBlock = "";
      if (qFallen.length > 0) {
        qReviveBlock = '<h3 class="church-section-title" style="margin-top:1rem">Revival in the field</h3>' +
          '<p>Spend a <b>Potion of Life</b> to bring a companion back at half HP.</p>' +
          '<div class="shop-block">';
        for (var qfi = 0; qfi < qFallen.length; qfi++) {
          var qfm = qFallen[qfi];
          qReviveBlock += '<div class="shop-row" style="flex-wrap:wrap;gap:.4rem">' +
            '<span>' + qfm.name + ' (' + roleLabel(qfm.role) + ')</span>' +
            '<button type="button" id="qstLifePot-' + qfm.id + '"' +
            (state.lifePotions > 0 ? "" : " disabled") +
            '>Use Life Potion (' + state.lifePotions + ')</button>' +
            '</div>';
        }
        qReviveBlock += '</div>';
      }
      app.innerHTML =
        renderHeader() +
        "<h2 class=\"panel-title\">Quest: mountain pass</h2>" +
        qBody +
        '<div class="actions">' + qActions + "</div>" +
        qReviveBlock +
        (state.travelInventoryOpen ? inventoryScreenHtml() : "") +
        renderLog() +
        qResumeOverlay +
        postBattleDialogOverlayHtml() +
        campDialogOverlayHtml();
      var qAdvBtn = document.getElementById("questAdvanceBtn");
      if (qAdvBtn) qAdvBtn.onclick = advanceQuestDay;
      var qCampBtn = document.getElementById("questCampBtn");
      if (qCampBtn) qCampBtn.onclick = openCampDialog;
      var qRetBtn = document.getElementById("questRetreatBtn");
      if (qRetBtn) qRetBtn.onclick = abandonQuest;
      var qInvBtn = document.getElementById("questInventoryBtn");
      if (qInvBtn)
        qInvBtn.onclick = function () {
          state.travelInventoryOpen = !state.travelInventoryOpen;
          if (!state.travelInventoryOpen) state.inventoryDetailOpen = false;
          render();
        };
      for (var qfi2 = 0; qfi2 < qFallen.length; qfi2++) {
        (function (fm) {
          var b = document.getElementById("qstLifePot-" + fm.id);
          if (b) b.onclick = function () { reviveWithLifePotionInField(fm.id); };
        })(qFallen[qfi2]);
      }
      if (state.travelInventoryOpen) {
        wireInventoryScreen(app);
      }
      wirePostBattleDialog(app);
      wireCampDialog(app);
      return;
    }
    if (state.phase === "adventure") {
      maybeTriggerElaraDialog();
      if (state.transition && state.transition.kind === "encounter") {
        app.innerHTML = transitionEncounterHtml(state.transition) + renderLog();
        return;
      }
      var advResumeOverlay =
        state.transition && state.transition.kind === "resume" ? transitionResumeOverlayHtml(state.transition) : "";
      var adv = state.adventure || { dir: "out", daysOut: 0, maxDays: 10, town: state.settlementTown, returnDays: 0 };
      var advTownLabel = locationLabel(adv.town || state.settlementTown || "cantebury");
      var advFallen = state.party.filter(function (p) { return p && p.hp <= 0; });
      var advReviveBlock = "";
      if (advFallen.length > 0) {
        advReviveBlock = '<h3 class="church-section-title" style="margin-top:1rem">Revival in the field</h3>' +
          '<p>Use a <b>Potion of Life</b> to bring a fallen companion back at half HP. Without one they must wait for the next town\'s chapel.</p>' +
          '<div class="shop-block">';
        for (var fi = 0; fi < advFallen.length; fi++) {
          var fm = advFallen[fi];
          advReviveBlock += '<div class="shop-row" style="flex-wrap:wrap;gap:.4rem">' +
            '<span>' + fm.name + ' (' + roleLabel(fm.role) + ')</span>' +
            '<button type="button" id="advLifePot-' + fm.id + '"' +
            (state.lifePotions > 0 ? "" : " disabled") +
            '>Use Life Potion (' + state.lifePotions + ')</button>' +
            '</div>';
        }
        advReviveBlock += '</div>';
      }
      var advBody, advActions;
      if (adv.dir === "out") {
        var advEncMult = adv.town === "cantebury" ? CANTEBURY_ADVENTURE_ENCOUNTER_MULT : 1;
        var advEncPct = (state.encounterChance * advEncMult * 100).toFixed(0);
        advBody =
          "<p>Adventuring near <b>" + advTownLabel + "</b>. Day " + adv.daysOut +
          " of up to " + adv.maxDays + ". Each <b>Push deeper</b> consumes 1 supply and rolls an encounter. Encounter chance: <b>" +
          advEncPct + "%</b>.</p>" +
          (adv.town === "cantebury"
            ? "<p class=\"hint\">Cantebury training grounds: <b>level 1</b> foes only; encounter pace is <b>80% slower</b> than other towns.</p>"
            : "") +
          (adv.daysOut > 0
            ? "<p class=\"hint\">Return trip will be " + adv.daysOut + " day(s), no encounters, 1 supply per day.</p>"
            : "");
        advActions =
          '<button type="button" class="primary" id="advancePushBtn"' +
          (state.food > 0 ? "" : " disabled") +
          '>Push deeper (day ' + (adv.daysOut + 1) + ')</button>' +
          '<button type="button" id="advCampBtn"' + (state.food > 0 ? "" : " disabled") + '>Camp...</button>' +
          '<button type="button" id="turnBackBtn">Return home (' + adv.daysOut + ' day' + (adv.daysOut !== 1 ? 's' : '') + ')</button>' +
          '<button type="button" id="advInventoryBtn">Inventory</button>';
      } else {
        advBody =
          "<p>Heading back to <b>" + advTownLabel + "</b>. The march home will take <b>" + Math.max(0, adv.returnDays) +
          "</b> day(s) and consume 1 supply per day. No encounters on the way back.</p>";
        advActions =
          '<button type="button" class="primary" id="advanceReturnBtn"' +
          (state.food > 0 ? "" : " disabled") +
          '>Return to ' + advTownLabel + ' (' + Math.max(0, adv.returnDays) + ' day' + (adv.returnDays !== 1 ? 's' : '') + ')</button>' +
          '<button type="button" id="advInventoryBtn">Inventory</button>';
      }
      app.innerHTML =
        renderHeader() +
        "<h2 class=\"panel-title\">Adventuring trek</h2>" +
        advBody +
        '<div class="actions">' + advActions + "</div>" +
        advReviveBlock +
        (state.travelInventoryOpen ? inventoryScreenHtml() : "") +
        renderLog() +
        advResumeOverlay +
        (state.elaraDialog ? elaraDialogOverlayHtml(state.elaraDialog) : "") +
        (state.confirmDialog ? confirmDialogOverlayHtml(state.confirmDialog) : "") +
        postBattleDialogOverlayHtml() +
        campDialogOverlayHtml();
      var pushBtn = document.getElementById("advancePushBtn");
      if (pushBtn) pushBtn.onclick = function () { advanceAdventureDay(); };
      var backBtn = document.getElementById("turnBackBtn");
      if (backBtn) backBtn.onclick = function () { turnBackAdventure(); };
      var retBtn = document.getElementById("advanceReturnBtn");
      if (retBtn) retBtn.onclick = function () { continueAdventureReturn(); };
      var advCampBtn = document.getElementById("advCampBtn");
      if (advCampBtn) advCampBtn.onclick = openCampDialog;
      var advInvBtn = document.getElementById("advInventoryBtn");
      if (advInvBtn)
        advInvBtn.onclick = function () {
          state.travelInventoryOpen = !state.travelInventoryOpen;
          if (!state.travelInventoryOpen) state.inventoryDetailOpen = false;
          render();
        };
      for (var afi = 0; afi < advFallen.length; afi++) {
        (function (fm) {
          var b = document.getElementById("advLifePot-" + fm.id);
          if (b) b.onclick = function () { reviveWithLifePotionInField(fm.id); };
        })(advFallen[afi]);
      }
      var elaraClose = document.getElementById("elaraDialogClose");
      if (elaraClose) elaraClose.onclick = function () { state.elaraDialog = null; render(); };
      if (state.confirmDialog) wireConfirmDialog(app);
      if (state.travelInventoryOpen) {
        wireInventoryScreen(app);
      }
      wirePostBattleDialog(app);
      wireCampDialog(app);
      return;
    }
    if (state.phase === "settlement") {
      if (state.settlementView === "quest" || state.settlementView === "memorial") {
        state.settlementView = state.settlementView === "memorial" ? "church" : "inventory";
      }
      var town = destinationForKey(state.settlementTown || "gustaf");
      app.innerHTML =
        endCitySplash() +
        renderHeader() +
        settlementTabStrip(town.key) +
        settlementMainPanelHtml(town) +
        renderLog() +
        (state.transition && state.transition.kind === "arrive" ? transitionArriveOverlayHtml(state.transition) : "") +
        (state.questDialog ? questDialogOverlayHtml(state.questDialog) : "") +
        npcDialogOverlayHtml(state.npcDialog) +
        postBattleDialogOverlayHtml();

      wireSettlementTabs(app);
      wirePostBattleDialog(app);
      var qAcceptBtn = app.querySelector('[id^="questAccept-"]');
      if (qAcceptBtn) {
        qAcceptBtn.onclick = function () {
          var qid = qAcceptBtn.id.replace("questAccept-", "");
          acceptQuest(qid);
        };
      }
      var qDeclineBtn = document.getElementById("questDecline");
      if (qDeclineBtn) qDeclineBtn.onclick = declineQuest;
      if (state.settlementView === "church") {
        wireSettlementChurchPanel(app);
      } else if (state.settlementView === "inn") {
        var innBtn = document.getElementById("settlementInnRest");
        if (innBtn) innBtn.onclick = restAtInn;
        var stableBtn = document.getElementById("settlementStableRest");
        if (stableBtn) stableBtn.onclick = restAtStables;
      } else if (state.settlementView === "tavern") {
        wireRosterEdit(app);
        wireTavernBarkeep(app);
        wireNpcDialog(app);
      } else if (state.settlementView === "shop") {
        wireSettlementShopPanel(app);
      } else if (state.settlementView === "keep") {
        wireKeepInterior(app, town.key);
        wireNpcDialog(app);
      } else if (state.settlementView === "inventory") {
        wireInventoryScreen(app);
        var qBegin = document.getElementById("questBegin");
        if (qBegin) qBegin.onclick = beginQuestTrek;
        var qAban = document.getElementById("questAbandon");
        if (qAban) qAban.onclick = abandonQuest;
      } else if (state.settlementView === "adventure") {
        var advBtn = document.getElementById("beginAdventureBtn");
        if (advBtn) advBtn.onclick = function () { beginAdventure(); };
      } else if (state.settlementView === "depart") {
        if (town.key === "new_isil") {
          wireNewIsilDepart(app);
        } else {
          wireWestboundDepart(app);
          wireEastboundDepart(app);
        }
      }
      return;
    }

    if (state.phase === "action") {
      var enc = state.pendingEncounter;
      if (enc && enc.kind === "ruins_discovery") {
        app.innerHTML =
          '<div class="scene scene-splash scene-ruins" role="img" aria-label="Ruins">' +
          '<div class="splash-badge">Strange ground</div>' +
          '<div class="splash-title">Ancient ruins</div>' +
          '<div class="splash-sub">Weathered stone juts from the earth</div>' +
          "</div>" +
          renderHeader() +
          "<h2 class=\"panel-title\">Ruins</h2>" +
          "<p>Rooms to explore: <b>" + state.ruinsRoomsRemaining + "</b> / " + state.ruinsRoomsTotal +
          ". Each room may trigger monsters (" +
          Math.round(SKELETON_FIGHT_CHANCE * 100) +
          "% chance). Gold caches are rare but worthwhile.</p>" +
          ruinsMinimapHtml() +
          ruinsNavigationPlaceholderHtml() +
          "<div class=\"actions\">" +
          "<button type=\"button\" id=\"searchRuins\">Explore current room</button>" +
          "<button type=\"button\" id=\"skipRuins\">Mark and leave</button>" +
          '<button type="button" id="ruinsInventoryBtn">Inventory</button>' +
          "</div>" +
          (state.travelInventoryOpen ? inventoryScreenHtml() : "") +
          renderLog();
        document.getElementById("searchRuins").onclick = function () {
          if (state.ruinsRoomsRemaining <= 0) {
            resolveRuinsSearchRewards();
            finishEncounterCommon();
            return;
          }
          var roomIdx = state.ruinsRoomsTotal - state.ruinsRoomsRemaining + 1;
          state.ruinsRoomsRemaining -= 1;
          if (Math.random() < SKELETON_FIGHT_CHANCE) {
            var pack = buildRandomMonsterEncounter("ruins");
            startTacticalCombat({ kind: "ruins_combat", label: "Ruins room " + roomIdx + " encounter", foes: pack.foes });
            render();
            return;
          }
          var roomGold = 0;
          var roomGems = 0;
          if (Math.random() < RUINS_GOLD_FIND_CHANCE) {
            roomGold = roadGoldBonus(rollInt(RUINS_GOLD_MIN, RUINS_GOLD_MAX));
            state.gold += roomGold;
          }
          if (Math.random() < 0.15) {
            roomGems = 1;
            state.gems += roomGems;
          }
          if (state.ruinsMap) markRuinsTileExplored(state.ruinsMap.playerX, state.ruinsMap.playerY);
          if (roomGold || roomGems) {
            logLine("Ruins room " + roomIdx + " cleared: +" + roomGold + " gold" + (roomGems ? ", +1 gem" : "") + ".", "good");
          } else {
            logLine("Ruins room " + roomIdx + " cleared: nothing of value.", "");
          }
          if (state.ruinsRoomsRemaining <= 0) {
            resolveRuinsSearchRewards();
            finishEncounterCommon();
          } else {
            render();
          }
        };
        document.getElementById("skipRuins").onclick = function () {
          logLine("Ruins marked on your map (" + state.ruinsRoomsRemaining + " room(s) left unexplored).", "");
          finishEncounterCommon();
        };
        var ruinsInvBtn = document.getElementById("ruinsInventoryBtn");
        if (ruinsInvBtn) {
          ruinsInvBtn.onclick = function () {
            state.travelInventoryOpen = !state.travelInventoryOpen;
            if (!state.travelInventoryOpen) state.inventoryDetailOpen = false;
            render();
          };
        }
        if (state.travelInventoryOpen) {
          wireInventoryScreen(app);
        }
        return;
      }

      if (state.combat) {
        var team = combatTeam();
        var activePlannerId = currentPlannerId();
        var activeChoice = activePlannerId ? choiceForMember(activePlannerId) : null;
        var activeMember = activePlannerId ? teamMemberById(activePlannerId) : null;
        var selectingAttackTarget = !!activeChoice && activeChoice.action === "attack" && !activeChoice.targetId;
        var selectingSpellFoe = !!activeChoice && activeChoice.action === "spell" && !activeChoice.targetId
          && activeMember && spellNeedsFoeTarget(activeMember.role, activeChoice.spellKind);
        var selectingSpellAlly = !!activeChoice && activeChoice.action === "spell" && !activeChoice.targetId
          && activeMember && spellNeedsAllyTarget(activeMember.role, activeChoice.spellKind);
        var selectingFoe = selectingAttackTarget || selectingSpellFoe;
        var selectedTargetId = activeChoice && activeChoice.targetId ? activeChoice.targetId : null;
        var foesHtml = state.combat.foes
          .map(function (f) {
            return foeCardHtml(f, selectingFoe, selectedTargetId === f.id);
          })
          .join("");
        var cards = team
          .map(function (m) {
            return battlePartyCard(m, activePlannerId, selectingSpellAlly);
          })
          .join("");
        var ready = allChoicesReady();
        var hint = "Pick actions in order, then End round.";
        if (activeMember && selectingAttackTarget) hint = "Choose a monster target for " + activeMember.name + ".";
        else if (activeMember && selectingSpellFoe) hint = "Choose which foe " + activeMember.name + " will cast on.";
        else if (activeMember && selectingSpellAlly) hint = "Choose which ally " + activeMember.name + " will heal.";
        else if (activeMember) hint = "Choose an action for " + activeMember.name + ".";
        var bossFight = state.combat && state.combat.kind === "new_isil_gate_boss";
        app.innerHTML =
          '<div class="scene scene-splash scene-battle" role="img" aria-label="Battle">' +
          '<div class="splash-badge">Skirmish</div>' +
          '<div class="splash-title">Battle</div>' +
          '<div class="splash-sub">Select each fighter\'s move in sequence</div>' +
          "</div>" +
          renderHeader() +
          "<h2 class=\"panel-title\">Battle - round " +
          state.combat.round +
          "</h2>" +
          "<p class=\"battle-lead\">" +
          (state.pendingEncounter ? state.pendingEncounter.label : "Fight") +
          "</p>" +
          '<div class="combat-stage">' +
          '<div class="foe-row">' +
          foesHtml +
          "</div>" +
          '<div class="battle-grid">' +
          cards +
          "</div>" +
          "</div>" +
          "<div class=\"actions battle-actions-row\">" +
          '<button type="button" id="fleeBtn"' + (bossFight ? " disabled" : "") + '>Flee</button>' +
          '<button type="button" id="autoRoundBtn">Auto</button>' +
          '<button type="button" class="primary" id="endRoundBtn"' +
          (ready ? "" : " disabled") +
          ">End round</button>" +
          "</div>" +
          "<p class=\"hint\">" +
          hint +
          "</p>" +
          renderLog();
        wireBattleActions(app);
        var fleeBtn = document.getElementById("fleeBtn");
        if (fleeBtn && !bossFight) fleeBtn.onclick = fleeEncounter;
        document.getElementById("endRoundBtn").onclick = commitCombatRound;
        return;
      }
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    logLine("Prepare in <span class=\"hi\">Cantebury</span>, then travel the route to Gustaf, Hollow Banks, Solem, and New Isil.", "");
    trackPlaytest("app_loaded", { version: GAME_VERSION });
    render();
  });
})();
