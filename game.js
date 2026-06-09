/* Cantebury Trails - skeleton demo (UTF-8, ASCII) */
(function () {
  "use strict";

  var CLASS_HP = { soldier: 10, priest: 6, mercenary: 8, mage: 6 };
  var DRAGON_TEST_MODE = false;
  if (typeof window !== "undefined" && window.location && window.location.search) {
    DRAGON_TEST_MODE = /(?:^|[?&])dragonTest=1(?:&|$)/.test(window.location.search);
  }
  var CARAVAN_FOLLOWERS_TOTAL = 10;
  var SUPPLY_PEOPLE_PER_UNIT = 5;
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
  var DEFENSE_SIEGE_MS = 120000;
  var DEFENSE_WAVE_COUNT = 4;
  var DEFENSE_BREAK_MS = 20000;
  var GARRISON_RESIST_PER_DEFENDER = 0.05;

  /** Cantebury local scouting: 80% fewer adventure encounters (20% of normal rate). */
  var CANTEBURY_ADVENTURE_ENCOUNTER_MULT = 0.2;
  var RUINS_BASE_CHANCE = 0.18;
  var RUINS_DAY_BONUS = 0.12;
  var RUINS_MAX_CHANCE = 0.72;
  var RUINS_QUIET_DAY_CHANCE = 0.06;
  var SKELETON_FIGHT_CHANCE = 0.45;
  var ABANDONED_TOWN_RUINS_MONSTERS = ["Bandit", "Bandit Leader", "Bandit caster"];
  var RUINS_IMP_CHANCE = 0.28;
  var RUINS_HIGH_ATK_THRESHOLD = 8;
  var RUINS_GOLD_FIND_CHANCE = 0.25;
  var RUINS_GOLD_MIN = 4;
  var RUINS_GOLD_MAX = 10;
  var RUINS_GEM_FIND_CHANCE = 0.075;
  /** Ruins completion + per-room loot scaled to 50% of pre-6.3.1 values. */
  var RUINS_LOOT_MULTIPLIER = 0.5;
  /** Ruins grid minimap — off until shrine navigation is playable. */
  var RUINS_SHOW_MINIMAP = false;
  var LOOT_RARITY_WEIGHTS = (BALANCE_DATA && BALANCE_DATA.lootRarityWeights) || {
    common: 0.85,
    uncommon: 0.1,
    rare: 0.045,
    ultra_rare: 0.005,
  };
  var RARITY_DISPLAY = {
    common: "Common",
    uncommon: "Uncommon",
    rare: "Rare",
    ultra_rare: "Ultra rare",
  };
  function normalizeWeaponRarity(code) {
    if (!code) return "common";
    var c = String(code).trim().toLowerCase().replace(/\s+/g, "");
    if (c === "c") return "common";
    if (c === "u") return "uncommon";
    if (c === "r") return "rare";
    if (c === "ur") return "ultra_rare";
    return c;
  }
  function buildWeaponLootPools() {
    var pools = { common: [], uncommon: [], rare: [], ultra_rare: [] };
    var catalog = (BALANCE_DATA && BALANCE_DATA.equipmentCatalog) || [];
    for (var i = 0; i < catalog.length; i++) {
      var it = catalog[i];
      if (!it || it.slot !== "weapon" || !it.id) continue;
      var tier = normalizeWeaponRarity(it.rarity || "common");
      if (!pools[tier]) tier = "common";
      pools[tier].push(it.id);
    }
    var sheet = (BALANCE_DATA && BALANCE_DATA.weapons) || [];
    for (var wi = 0; wi < sheet.length; wi++) {
      var w = sheet[wi];
      if (!w || !w.id) continue;
      var wt = normalizeWeaponRarity(w.rarity || "common");
      if (!pools[wt]) wt = "common";
      if (pools[wt].indexOf(w.id) < 0) pools[wt].push(w.id);
    }
    return pools;
  }
  var WEAPON_LOOT_POOLS = buildWeaponLootPools();
  function rollLootRarityTier() {
    var w = LOOT_RARITY_WEIGHTS;
    var r = Math.random();
    if (r < w.common) return "common";
    r -= w.common;
    if (r < w.uncommon) return "uncommon";
    r -= w.uncommon;
    if (r < w.rare) return "rare";
    return "ultra_rare";
  }
  function pickWeaponLootItem() {
    var tier = rollLootRarityTier();
    var order = ["common", "uncommon", "rare", "ultra_rare"];
    var start = order.indexOf(tier);
    if (start < 0) start = 0;
    for (var i = start; i < order.length; i++) {
      var pool = WEAPON_LOOT_POOLS[order[i]];
      if (pool && pool.length) return pool[Math.floor(Math.random() * pool.length)];
    }
    for (var j = 0; j < order.length; j++) {
      var fallback = WEAPON_LOOT_POOLS[order[j]];
      if (fallback && fallback.length) return fallback[Math.floor(Math.random() * fallback.length)];
    }
    return null;
  }
  function rarityLabelForItem(def) {
    if (!def || !def.rarity) return "";
    return RARITY_DISPLAY[def.rarity] || def.rarity;
  }
  function grantWeaponGearDrop(sourceLabel) {
    var itemId = pickWeaponLootItem();
    if (!itemId) return false;
    var def = equipmentItemDef(itemId);
    if (!addWeaponToStash(itemId)) return false;
    var label = def ? def.label : itemId;
    var rarity = rarityLabelForItem(def);
    var src = sourceLabel ? sourceLabel + ": " : "Loot: ";
    var wdmg = equipmentDmgBonusValue(itemId);
    logLine(
      src +
        '<span class="hi">' +
        escapeHtml(label) +
        "</span>" +
        (rarity ? " (" + escapeHtml(rarity) + ")" : "") +
        (wdmg ? " (+" + wdmg + " dmg)" : "") +
        " — equip from Party inventory.",
      "good"
    );
    return itemId;
  }
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
  var STABILITY_TARGET_DAYS = (BALANCE_DATA && BALANCE_DATA.stabilityTargetDays) || 300;
  var FINAL_BOSS_MIN_DAYS = (BALANCE_DATA && BALANCE_DATA.finalBossMinDays) || 270;
  var SETTLER_REJOIN_COOLDOWN_DAYS = (BALANCE_DATA && BALANCE_DATA.settlerRejoinCooldownDays) || 365;
  var NEW_ISIL_BASE_POPULATION = 12;
  var LIFE_POTION_BUY_GP = 10;
  var KEW_KUMBER_LOOP_GRANT_GP = 100;
  var CHANCELLOR_GP_PER_CARAVAN_CIVILIAN = 10;
  var TAVERN_VETERAN_HIRE_GP = { 3: 50, 5: 100 };
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

  var BALANCE_WEAPONS = (BALANCE_DATA && BALANCE_DATA.weapons ? BALANCE_DATA.weapons : []).filter(function (w) {
    return w && w.id;
  });
  var WEAPON_SHEET_BY_ID = {};
  (function buildWeaponSheetIndex() {
    for (var wsi = 0; wsi < BALANCE_WEAPONS.length; wsi++) {
      var wrow = BALANCE_WEAPONS[wsi];
      if (wrow && wrow.id) WEAPON_SHEET_BY_ID[wrow.id] = wrow;
    }
  })();
  function weaponSheetDef(weaponId) {
    return weaponId ? WEAPON_SHEET_BY_ID[weaponId] || null : null;
  }
  function equipmentItemDef(itemId) {
    return itemId ? EQUIPMENT_BY_ID[itemId] || null : null;
  }
  function equipmentDmgBonusValue(itemId) {
    if (!itemId) return 0;
    var sheet = weaponSheetDef(itemId);
    if (sheet && sheet.dmgModifier != null && sheet.dmgModifier !== "") {
      var mod = Number(sheet.dmgModifier);
      if (!isNaN(mod)) return mod;
    }
    var def = equipmentItemDef(itemId);
    if (def && def.dmgBonus != null && def.dmgBonus !== "") {
      var bonus = Number(def.dmgBonus);
      if (!isNaN(bonus)) return bonus;
    }
    return 0;
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
  function equipmentDefBonus(member) {
    if (!member || !member.equipment) return 0;
    var def = equipmentItemDef(member.equipment.armor);
    if (def && def.defBonus) return def.defBonus;
    return 0;
  }
  function equipmentDmgBonus(member) {
    if (!member || !member.equipment) return 0;
    var sum = 0;
    for (var di = 0; di < EQUIPMENT_SLOTS.length; di++) {
      var slot = EQUIPMENT_SLOTS[di];
      var itemId = member.equipment[slot];
      if (slot === "weapon" && itemId) sum += equipmentDmgBonusValue(itemId);
      else {
        var ddef = equipmentItemDef(itemId);
        if (ddef && ddef.dmgBonus) sum += ddef.dmgBonus;
      }
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
    if (!state.gearStash) return false;
    var idx = state.gearStash.indexOf(itemId);
    if (idx < 0) return false;
    state.gearStash.splice(idx, 1);
    return true;
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
    var inStash = countStashItemId(itemId) > 0;
    if (inStash && !removeFromGearStash(itemId)) return false;
    member.equipment[slot] = itemId;
    refreshMemberDerivedStats(member);
    if (def.slot === "weapon") syncWeaponStockCounter();
    return true;
  }
  function countUnequippedStashWeapons() {
    var stash = gearStashList();
    var n = 0;
    for (var i = 0; i < stash.length; i++) {
      var def = equipmentItemDef(stash[i]);
      if (def && def.slot === "weapon") n++;
    }
    return n;
  }
  function syncWeaponStockCounter() {
    state.weapons = countUnequippedStashWeapons();
  }

  function isContinuingCaravanLoop() {
    return !!(
      state.loopLeaderSetup ||
      (state.caravanLoops || 0) > 0 ||
      (state.totalDaysElapsed || 0) > 0
    );
  }

  function snapshotCaravanTreasury() {
    return {
      gold: state.gold || 0,
      gems: state.gems || 0,
      food: state.food || 0,
      water: state.water || 0,
      healingPotions: state.healingPotions || 0,
      lifePotions: state.lifePotions || 0,
      gearStash: (state.gearStash || []).slice(),
      exoticWeaponStash: (state.exoticWeaponStash || []).slice(),
      weapons: state.weapons || 0,
    };
  }

  function restoreCaravanTreasury(treasury) {
    if (!treasury) return;
    state.gold = typeof treasury.gold === "number" ? treasury.gold : 0;
    state.gems = typeof treasury.gems === "number" ? treasury.gems : 0;
    state.food = typeof treasury.food === "number" ? treasury.food : 0;
    state.water = typeof treasury.water === "number" ? treasury.water : 0;
    state.healingPotions = typeof treasury.healingPotions === "number" ? treasury.healingPotions : 0;
    state.lifePotions = typeof treasury.lifePotions === "number" ? treasury.lifePotions : 0;
    state.gearStash = treasury.gearStash ? treasury.gearStash.slice() : [];
    state.exoticWeaponStash = treasury.exoticWeaponStash ? treasury.exoticWeaponStash.slice() : [];
    state.weapons = typeof treasury.weapons === "number" ? treasury.weapons : 0;
    syncWeaponStockCounter();
  }

  function stashMemberExoticWeapon(member) {
    if (!member || !member.exoticWeaponId) return;
    if (!state.exoticWeaponStash) state.exoticWeaponStash = [];
    state.exoticWeaponStash.push(member.exoticWeaponId);
    member.exoticWeaponId = null;
  }

  function caravanTreasurySummary(treasury) {
    treasury = treasury || snapshotCaravanTreasury();
    var stashCount = treasury.gearStash ? treasury.gearStash.length : 0;
    var exoticCount = treasury.exoticWeaponStash ? treasury.exoticWeaponStash.length : 0;
    return (
      formatGp(treasury.gold) + " gp, " +
      treasury.food + " supplies, " +
      treasury.healingPotions + " heal / " + treasury.lifePotions + " life potions, " +
      stashCount + " stash item" + (stashCount === 1 ? "" : "s") +
      (exoticCount ? ", " + exoticCount + " exotic weapon" + (exoticCount === 1 ? "" : "s") : "")
    );
  }

  function ensureNewIsilDepot() {
    if (!state.newIsilDepot || typeof state.newIsilDepot !== "object") {
      state.newIsilDepot = { gearStash: [], exoticWeaponStash: [], depositedOnLoop: 0 };
    }
    if (!Array.isArray(state.newIsilDepot.gearStash)) state.newIsilDepot.gearStash = [];
    if (!Array.isArray(state.newIsilDepot.exoticWeaponStash)) state.newIsilDepot.exoticWeaponStash = [];
    return state.newIsilDepot;
  }

  function newIsilDepotHasItems() {
    var depot = ensureNewIsilDepot();
    return depot.gearStash.length > 0 || depot.exoticWeaponStash.length > 0;
  }

  function newIsilDepotSummaryText() {
    var depot = ensureNewIsilDepot();
    var gearCount = depot.gearStash.length;
    var exoticCount = depot.exoticWeaponStash.length;
    if (!gearCount && !exoticCount) return "empty";
    var parts = [];
    if (gearCount) parts.push(gearCount + " gear item" + (gearCount === 1 ? "" : "s"));
    if (exoticCount) parts.push(exoticCount + " exotic weapon" + (exoticCount === 1 ? "" : "s"));
    return parts.join(", ");
  }

  function depositCaravanGearAtNewIsilDepot() {
    var depot = ensureNewIsilDepot();
    var moved = 0;
    if (state.gearStash && state.gearStash.length) {
      depot.gearStash = depot.gearStash.concat(state.gearStash);
      moved += state.gearStash.length;
      state.gearStash = [];
    }
    if (state.exoticWeaponStash && state.exoticWeaponStash.length) {
      depot.exoticWeaponStash = depot.exoticWeaponStash.concat(state.exoticWeaponStash);
      moved += state.exoticWeaponStash.length;
      state.exoticWeaponStash = [];
    }
    if (moved > 0) {
      depot.depositedOnLoop = state.caravanLoops || 0;
      depot.depositedOnDay = state.totalDaysElapsed || 0;
    }
    syncWeaponStockCounter();
    return moved;
  }

  function retrieveNewIsilDepot() {
    if (state.phase !== "settlement" || state.settlementTown !== "new_isil") return;
    var depot = ensureNewIsilDepot();
    if (!newIsilDepotHasItems()) {
      logLine("The colony locker is empty — nothing left from prior caravans.", "bad");
      render();
      return;
    }
    var gearCount = depot.gearStash.length;
    var exoticCount = depot.exoticWeaponStash.length;
    if (!state.gearStash) state.gearStash = [];
    if (!state.exoticWeaponStash) state.exoticWeaponStash = [];
    state.gearStash = state.gearStash.concat(depot.gearStash);
    state.exoticWeaponStash = state.exoticWeaponStash.concat(depot.exoticWeaponStash);
    depot.gearStash = [];
    depot.exoticWeaponStash = [];
    syncWeaponStockCounter();
    logLine(
      "<span class=\"hi\">Colony locker:</span> retrieved " +
        gearCount +
        " gear item" +
        (gearCount === 1 ? "" : "s") +
        (exoticCount ? " and " + exoticCount + " exotic weapon" + (exoticCount === 1 ? "" : "s") : "") +
        " for the march. Open <b>Inventory</b> to equip.",
      "good"
    );
    trackPlaytest("new_isil_depot_retrieved", { gear: gearCount, exotic: exoticCount, day: state.totalDaysElapsed || 0 });
    render();
  }

  function newIsilDepotPanelHtml() {
    if (!newIsilDepotHasItems()) return "";
    return (
      '<h3 class="roster-heading">Colony locker</h3>' +
      '<p class="hint">Gear from prior caravans is stored here: <b>' +
      escapeHtml(newIsilDepotSummaryText()) +
      "</b>. Retrieve it before marching east (or to re-equip before the next westward leg).</p>" +
      '<div class="actions"><button type="button" class="primary" id="retrieveNewIsilDepotBtn">Retrieve colony locker</button></div>'
    );
  }

  function addWeaponToStash(itemId) {
    var def = equipmentItemDef(itemId);
    if (!def || def.slot !== "weapon") return false;
    addToGearStash(itemId);
    syncWeaponStockCounter();
    return true;
  }
  function removeOneWeaponFromStash(weaponId) {
    if (!state.gearStash) return null;
    for (var i = state.gearStash.length - 1; i >= 0; i--) {
      var cid = state.gearStash[i];
      if (weaponId && cid !== weaponId) continue;
      var def = equipmentItemDef(cid);
      if (def && def.slot === "weapon") {
        state.gearStash.splice(i, 1);
        syncWeaponStockCounter();
        return cid;
      }
    }
    return null;
  }
  function migrateLegacyWeaponInventory() {
    if (!state.weaponInventory || !state.weaponInventory.length) {
      syncWeaponStockCounter();
      return;
    }
    for (var i = 0; i < state.weaponInventory.length; i++) {
      var itemId = state.weaponInventory[i];
      if (!equipmentItemDef(itemId)) {
        itemId = itemId === "settlement_blade" ? "settlement_blade" : "soldier_blade";
      }
      addToGearStash(itemId);
    }
    state.weaponInventory = [];
    syncWeaponStockCounter();
  }
  var LEGACY_GEAR_ID_MAP = { leather_coat: "leather_armor", chain_shirt: "chain_armor" };
  function migrateLegacyGearIds() {
    if (!state) return;
    function mapId(id) {
      return LEGACY_GEAR_ID_MAP[id] || id;
    }
    function mapList(list) {
      if (!list || !list.length) return list;
      var out = [];
      for (var i = 0; i < list.length; i++) out.push(mapId(list[i]));
      return out;
    }
    state.gearStash = mapList(state.gearStash || []);
    if (state.newIsilDepot && state.newIsilDepot.gearStash) {
      state.newIsilDepot.gearStash = mapList(state.newIsilDepot.gearStash);
    }
    if (state.party) {
      for (var pi = 0; pi < state.party.length; pi++) {
        var m = state.party[pi];
        if (!m || !m.equipment) continue;
        for (var si = 0; si < EQUIPMENT_SLOTS.length; si++) {
          var slot = EQUIPMENT_SLOTS[si];
          if (m.equipment[slot]) m.equipment[slot] = mapId(m.equipment[slot]);
        }
      }
    }
  }

  function ensureCampaignGearState() {
    migrateLegacyGearIds();
    if (!state.gearStash) state.gearStash = [];
    migrateLegacyWeaponInventory();
    if (state.party) {
      for (var pi = 0; pi < state.party.length; pi++) {
        ensureMemberEquipment(state.party[pi]);
        refreshMemberDerivedStats(state.party[pi]);
      }
    }
    reconcileGearStashWithEquipment();
  }
  function formatEquipmentLabel(def, itemId) {
    if (!def) return itemId || "empty";
    var label = def.label;
    if (def.rarity) label += " (" + rarityLabelForItem(def) + ")";
    var dmg = def.slot === "weapon" ? equipmentDmgBonusValue(itemId || def.id) : (def.dmgBonus || 0);
    if (dmg) label += " · +" + dmg + " dmg";
    if (def.hpBonus) label += " · +" + def.hpBonus + " HP";
    if (def.defBonus) label += " · +" + def.defBonus + " def";
    return label;
  }
  function memberEquippedWeaponSummary(member) {
    if (!member) return "";
    ensureMemberEquipment(member);
    var parts = [];
    var weaponId = member.equipment.weapon;
    var wdef = equipmentItemDef(weaponId);
    if (wdef) {
      var wdmg = equipmentDmgBonusValue(weaponId);
      parts.push(wdef.label + (wdmg ? " (+" + wdmg + " dmg)" : ""));
    }
    var exotic = exoticWeaponDef(member.exoticWeaponId);
    if (exotic) parts.push(exotic.label + " (+" + exotic.dmgBonus + " dmg)");
    return parts.length ? parts.join(" + ") : "unarmed";
  }
  function stashWeaponGroups() {
    var items = stashItemsForSlot("weapon");
    var order = [];
    var counts = {};
    for (var i = 0; i < items.length; i++) {
      var id = items[i];
      if (!counts[id]) {
        counts[id] = 0;
        order.push(id);
      }
      counts[id]++;
    }
    var groups = [];
    for (var gi = 0; gi < order.length; gi++) {
      groups.push({ id: order[gi], qty: counts[order[gi]] });
    }
    return groups;
  }
  function countStashItemId(itemId) {
    if (!itemId) return 0;
    var stash = gearStashList();
    var n = 0;
    for (var ci = 0; ci < stash.length; ci++) {
      if (stash[ci] === itemId) n++;
    }
    return n;
  }

  function equippedGearRows() {
    var rows = [];
    if (!state.party) return rows;
    for (var pi = 0; pi < state.party.length; pi++) {
      var m = state.party[pi];
      if (!m) continue;
      ensureMemberEquipment(m);
      for (var si = 0; si < EQUIPMENT_SLOTS.length; si++) {
        var slot = EQUIPMENT_SLOTS[si];
        var itemId = m.equipment[slot];
        if (!itemId) continue;
        var def = equipmentItemDef(itemId);
        rows.push({
          id: itemId,
          memberId: m.id,
          memberName: m.name,
          slot: slot,
          label: formatEquipmentLabel(def, itemId),
        });
      }
    }
    return rows;
  }

  function countEquippedItemId(itemId) {
    if (!itemId) return 0;
    var rows = equippedGearRows();
    var n = 0;
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].id === itemId) n++;
    }
    return n;
  }

  function reconcileGearStashWithEquipment() {
    var rows = equippedGearRows();
    var equippedCounts = {};
    for (var i = 0; i < rows.length; i++) {
      var id = rows[i].id;
      equippedCounts[id] = (equippedCounts[id] || 0) + 1;
    }
    var ids = Object.keys(equippedCounts);
    for (var j = 0; j < ids.length; j++) {
      var itemId = ids[j];
      var toStrip = equippedCounts[itemId];
      var stripped = 0;
      while (stripped < toStrip && countStashItemId(itemId) > 0) {
        if (removeFromGearStash(itemId)) stripped++;
        else break;
      }
    }
    syncWeaponStockCounter();
  }

  function sellableStashQty(itemId) {
    reconcileGearStashWithEquipment();
    return countStashItemId(itemId);
  }

  function sellableStashGroups() {
    reconcileGearStashWithEquipment();
    return stashGearGroups().filter(function (g) {
      return g.qty > 0;
    });
  }

  function gearLockerSellEnabled() {
    return state.phase === "settlement" || state.phase === "story_illiri";
  }

  function stashGearGroups() {
    var stash = gearStashList();
    var order = [];
    var counts = {};
    for (var i = 0; i < stash.length; i++) {
      var id = stash[i];
      if (!id) continue;
      if (!counts[id]) {
        counts[id] = 0;
        order.push(id);
      }
      counts[id]++;
    }
    var groups = [];
    for (var gi = 0; gi < order.length; gi++) {
      groups.push({ id: order[gi], qty: counts[order[gi]] });
    }
    return groups;
  }
  function gearSellPriceForId(itemId, vendorKind) {
    if (!itemId) return 0;
    var def = equipmentItemDef(itemId);
    if (!def) return 0;
    if (def.slot === "weapon") return weaponSellPriceForId(itemId);
    if (typeof def.sellPrice === "number") return def.sellPrice;
    var rarity = def.rarity || "common";
    if (rarity === "ultra_rare") return 8;
    if (rarity === "rare") return 4;
    if (rarity === "uncommon") return 2;
    return 1;
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
    if (role === "priest") {
      var priestGains = {
        strength: 0,
        intelligence: rollWeightedStatGain(p.intelligence || 0),
        stamina: 0,
        luck: 0,
      };
      var secondaryRoll = Math.random();
      if (secondaryRoll < 0.55 && (p.stamina || 0) > 0) {
        priestGains.stamina = rollWeightedStatGain(Math.min(1, p.stamina));
      } else if (secondaryRoll < 0.8 && (p.luck || 0) > 0) {
        priestGains.luck = rollWeightedStatGain(Math.min(1, p.luck));
      } else if ((p.strength || 0) > 0) {
        priestGains.strength = rollWeightedStatGain(Math.min(1, p.strength));
      }
      return priestGains;
    }
    return {
      strength: rollWeightedStatGain(p.strength || 0),
      intelligence: rollWeightedStatGain(p.intelligence || 0),
      stamina: rollWeightedStatGain(p.stamina || 0),
      luck: rollWeightedStatGain(p.luck || 0),
    };
  }
  var MAX_SUPPLIES = 30;
  var DEFAULT_RUIN_SITE_TYPES = {
    shrine: {
      label: "Shrine",
      splashTitle: "Roadside shrine",
      splashSub: "Weathered stone and faded ward-symbols",
      roomMin: 1,
      roomMax: 8,
      weight: 40,
      unit: "room",
    },
    temple: {
      label: "Temple",
      splashTitle: "Fallen temple",
      splashSub: "Collapsed vaults and broken idol halls",
      roomMin: 2,
      roomMax: 10,
      weight: 25,
      unit: "room",
    },
    ruined_castle: {
      label: "Ruined castle",
      splashTitle: "Ruined castle",
      splashSub: "Broken towers and gutted great halls",
      roomMin: 5,
      roomMax: 15,
      weight: 10,
      unit: "room",
    },
    abandoned_town: {
      label: "Abandoned town",
      splashTitle: "Abandoned town",
      splashSub: "Empty lanes and fire-blackened homes — not worth rebuilding",
      roomMin: 3,
      roomMax: 5,
      weight: 25,
      unit: "house",
      unitPlural: "houses",
    },
  };
  var RUIN_SITE_TYPES = (BALANCE_DATA && BALANCE_DATA.ruinSiteTypes) || DEFAULT_RUIN_SITE_TYPES;
  var BALANCE_MONSTERS = (BALANCE_DATA && BALANCE_DATA.monsters ? BALANCE_DATA.monsters : []).filter(function (m) {
    return m && m.name;
  });
  function shopPurchasableWeapons(vendorKind) {
    vendorKind = shopVendorKind(vendorKind);
    if (vendorKind !== "qm") return [];
    return BALANCE_WEAPONS.filter(function (w) {
      if (!w || !w.id) return false;
      var r = w.rarity || "common";
      return r === "rare" || r === "ultra_rare";
    })
      .map(function (w) {
        return {
          id: w.id,
          name: w.name,
          dmgModifier: w.dmgModifier,
          rarity: w.rarity,
          buyPrice: qmWeaponBuyPrice(w),
          sellPrice: qmWeaponSellPrice(w),
        };
      })
      .sort(function (a, b) {
        return (a.buyPrice || 0) - (b.buyPrice || 0);
      });
  }

  function shopPurchasableArmor() {
    return EQUIPMENT_CATALOG.filter(function (def) {
      return def && def.slot === "armor" && def.purchase && typeof def.buyPrice === "number" && def.buyPrice > 0;
    }).sort(function (a, b) {
      return (a.buyPrice || 0) - (b.buyPrice || 0);
    });
  }
  function weaponRarityForId(itemId) {
    var w = weaponSheetDef(itemId);
    if (w && w.rarity) return w.rarity;
    var def = equipmentItemDef(itemId);
    return (def && def.rarity) || "common";
  }

  function isRareItemId(itemId) {
    if (!itemId) return false;
    var r = weaponRarityForId(itemId);
    return r === "rare" || r === "ultra_rare";
  }

  function isCommonOrUncommonItemId(itemId) {
    if (!itemId) return false;
    var r = weaponRarityForId(itemId);
    return r === "common" || r === "uncommon";
  }

  function isRareWeaponId(itemId) {
    var def = equipmentItemDef(itemId);
    if (!def || def.slot !== "weapon") return false;
    return isRareItemId(itemId);
  }

  function qmWeaponBuyPrice(w) {
    if (!w) return 0;
    if (typeof w.buyPrice === "number" && w.buyPrice > 0) return w.buyPrice;
    var dmg = Number(w.dmgModifier) || 2;
    if (w.rarity === "ultra_rare") return 80 + dmg * 8;
    return 28 + dmg * 5;
  }

  function qmWeaponSellPrice(w) {
    if (!w) return 0;
    if (typeof w.sellPrice === "number" && w.sellPrice > 0) return w.sellPrice;
    return Math.max(4, Math.floor(qmWeaponBuyPrice(w) * 0.45));
  }

  function shopVendorKind(vendor) {
    return vendor === "qm" ? "qm" : "market";
  }

  function canVendorBuyStashItem(itemId, vendorKind) {
    var def = equipmentItemDef(itemId);
    if (!def) return false;
    vendorKind = shopVendorKind(vendorKind);
    if (vendorKind === "qm") return isRareItemId(itemId);
    return isCommonOrUncommonItemId(itemId);
  }

  function memberEquipSlotsSummary(member) {
    ensureMemberEquipment(member);
    var parts = [];
    var si;
    for (si = 0; si < EQUIPMENT_SLOTS.length; si++) {
      var slot = EQUIPMENT_SLOTS[si];
      var itemId = member.equipment[slot];
      var def = equipmentItemDef(itemId);
      var shortLabel = def ? def.label : "—";
      parts.push(EQUIPMENT_SLOT_LABELS[slot] + ": " + shortLabel);
    }
    var exotic = exoticWeaponDef(member.exoticWeaponId);
    if (exotic) parts.push("Exotic: " + exotic.label);
    return parts.join(" · ");
  }

  function memberPaperdollLoadoutHtml(member) {
    ensureMemberEquipment(member);
    var html = '<div class="paperdoll-loadout">';
    var si;
    for (si = 0; si < EQUIPMENT_SLOTS.length; si++) {
      var slot = EQUIPMENT_SLOTS[si];
      var itemId = member.equipment[slot];
      var def = equipmentItemDef(itemId);
      var stashOpts = stashItemsForSlot(slot);
      var optionHtml = '<option value="">From locker</option>';
      var oi;
      for (oi = 0; oi < stashOpts.length; oi++) {
        var oid = stashOpts[oi];
        var odef = equipmentItemDef(oid);
        optionHtml +=
          '<option value="' +
          escapeHtml(oid) +
          '">' +
          escapeHtml(formatEquipmentLabel(odef, oid)) +
          "</option>";
      }
      html +=
        '<div class="paperdoll-slot paperdoll-slot--' +
        slot +
        '">' +
        '<span class="paperdoll-slot-label">' +
        EQUIPMENT_SLOT_LABELS[slot] +
        "</span>" +
        '<span class="paperdoll-slot-item">' +
        escapeHtml(formatEquipmentLabel(def, itemId)) +
        "</span>";
      if (itemId) {
        html +=
          ' <button type="button" class="paperdoll-unequip" data-unequip-slot="' +
          escapeHtml(member.id) +
          '" data-slot="' +
          slot +
          '">Stow</button>';
      }
      if (slot === "weapon" && stashOpts.length) {
        html += '<div class="paperdoll-stash-btns">';
        var groups = stashWeaponGroups();
        var gi;
        for (gi = 0; gi < groups.length; gi++) {
          var grp = groups[gi];
          var wdef = equipmentItemDef(grp.id);
          var label = formatEquipmentLabel(wdef, grp.id);
          if (grp.qty > 1) label += " x" + grp.qty;
          html +=
            '<button type="button" class="inv-weapon-equip-btn" data-equip-weapon="' +
            escapeHtml(grp.id) +
            '" data-equip-member="' +
            escapeHtml(member.id) +
            '">Equip ' +
            escapeHtml(label) +
            "</button>";
        }
        html += "</div>";
      } else if (slot !== "weapon") {
        html +=
          ' <select data-equip-member="' +
          escapeHtml(member.id) +
          '" data-equip-slot="' +
          slot +
          '"' +
          (stashOpts.length ? "" : " disabled") +
          ">" +
          optionHtml +
          "</select>";
      }
      html += "</div>";
    }
    var exotic = exoticWeaponDef(member.exoticWeaponId);
    if (exotic) {
      html +=
        '<p class="paperdoll-exotic"><b>Exotic vault</b>: ' +
        escapeHtml(exotic.label) +
        " (+" +
        exotic.dmgBonus +
        ' dmg)</p>';
    }
    html += "</div>";
    return html;
  }

  function weaponSellPriceForId(weaponId) {
    var wdef = weaponSheetDef(weaponId);
    if (wdef && typeof wdef.sellPrice === "number") return wdef.sellPrice;
    if (isRareWeaponId(weaponId)) return qmWeaponSellPrice(wdef);
    return 1;
  }
  function countStashWeaponId(weaponId) {
    if (!weaponId) return 0;
    var stash = gearStashList();
    var n = 0;
    for (var ci = 0; ci < stash.length; ci++) {
      if (stash[ci] === weaponId) n++;
    }
    return n;
  }
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
  var MARCH_MS = 950;
  var ENCOUNTER_CUT_MS = 820;
  var RESUME_TRAVEL_MS = 520;
  var ARRIVE_CITY_MS = 900;

  function clearTransitionTimers() {
    var i;
    for (i = 0; i < transitionTimers.length; i++) clearTimeout(transitionTimers[i]);
    transitionTimers.length = 0;
  }

  function hasPendingTransitionTimers() {
    return transitionTimers.length > 0;
  }

  function isStaleMarchTransition() {
    return !!(state.transition && state.transition.kind === "march" && !hasPendingTransitionTimers());
  }

  function isStaleResumeTransition() {
    return !!(state.transition && state.transition.kind === "resume" && !hasPendingTransitionTimers());
  }

  function clearStaleTravelTransition() {
    if (isStaleMarchTransition() || isStaleResumeTransition()) {
      state.transition = null;
      return true;
    }
    return false;
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

  function caravanCivilianTotal() {
    ensureCaravanState();
    return Math.max(0, state.caravan.total || 0);
  }

  function caravanPeopleCount() {
    var n = livingPartyMembers().length;
    if (state.guest && state.guest.hp > 0) n++;
    n += caravanCivilianTotal();
    return n;
  }

  function dailySupplyConsumption() {
    var people = caravanPeopleCount();
    if (people <= 0) return 0;
    return Math.max(1, Math.ceil(people / SUPPLY_PEOPLE_PER_UNIT));
  }

  function dailySupplyCostLabel() {
    var cost = dailySupplyConsumption();
    return cost + " supply" + (cost === 1 ? "" : " bundles");
  }

  function caravanFarmerShare() {
    ensureCaravanState();
    var total = Math.max(1, state.caravan.total || CARAVAN_FOLLOWERS_TOTAL);
    return (state.caravan.farmers || 0) / total;
  }

  function caravanSupplySaveChance() {
    ensureCaravanState();
    return 0.12 + caravanFarmerShare() * 0.28;
  }

  function caravanForageSupplyChance() {
    ensureCaravanState();
    return 0.55 + caravanFarmerShare() * 0.2;
  }

  function caravanForageGoldChance() {
    ensureCaravanState();
    return 0.22 + (state.caravan.merchants / Math.max(1, state.caravan.total || CARAVAN_FOLLOWERS_TOTAL)) * 0.18;
  }

  function caravanCampHealBonus() {
    ensureCaravanState();
    return (state.caravan.artisans / Math.max(1, state.caravan.total || CARAVAN_FOLLOWERS_TOTAL)) * 0.12;
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
    if (!c.total) {
      return (
        '<section class="caravan-followers caravan-followers--empty">' +
        '<h3 class="roster-heading">Trail caravan (0 civilians)</h3>' +
        '<p class="roster-note">Settlers remain at <b>New Isil</b>. The fighting line marches alone until Cantebury assigns a new train on the next westward departure.</p>' +
        "</section>"
      );
    }
    return (
      '<section class="caravan-followers">' +
      '<h3 class="roster-heading">Trail caravan (' +
      c.total +
      " civilians)</h3>" +
      '<p class="roster-note">Farmers, artisans, and merchants march behind your fighters. They do not join tactical combat but support the train on the road. <b>1 supply feeds ' +
      SUPPLY_PEOPLE_PER_UNIT +
      ' people</b> per day — this leg needs <b>' +
      dailySupplyConsumption() +
      '</b> bundles for <b>' +
      caravanPeopleCount() +
      '</b> mouths.</p>' +
      '<ul class="caravan-followers-list">' +
      "<li><b>" +
      c.farmers +
      " farmers</b> — help stretch rations (" +
      Math.round(caravanSupplySaveChance() * 100) +
      "% chance to skip a day's supply cost; use <b>Stretch</b> below)</li>" +
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

  function balanceMonsterByName(name) {
    if (!name) return null;
    var target = String(name).toLowerCase().trim();
    var i;
    for (i = 0; i < BALANCE_MONSTERS.length; i++) {
      var row = BALANCE_MONSTERS[i];
      if (row && String(row.name || "").toLowerCase().trim() === target) return row;
    }
    return null;
  }

  function monsterAttackFromBalance(monOrName) {
    var mon = monOrName && typeof monOrName === "object" ? monOrName : balanceMonsterByName(monOrName);
    if (mon) {
      var atk = parseInt(mon.atk, 10);
      if (atk > 0) return atk;
    }
    return 2;
  }

  function monsterDamageForName(name) {
    return monsterAttackFromBalance(name);
  }

  function ruinSiteDef(typeKey) {
    return RUIN_SITE_TYPES[typeKey] || RUIN_SITE_TYPES.shrine || DEFAULT_RUIN_SITE_TYPES.shrine;
  }

  function ruinsUnitLabel(typeKey, count) {
    var def = ruinSiteDef(typeKey);
    var singular = def.unit || "room";
    if (count === 1) return singular;
    if (def.unitPlural) return def.unitPlural;
    return singular + "s";
  }

  function rollRuinsSiteType() {
    var keys = [];
    var total = 0;
    for (var key in RUIN_SITE_TYPES) {
      if (!RUIN_SITE_TYPES.hasOwnProperty(key)) continue;
      var weight = Math.max(0, parseInt(RUIN_SITE_TYPES[key].weight, 10) || 0);
      if (weight <= 0) continue;
      keys.push(key);
      total += weight;
    }
    if (!keys.length) return "shrine";
    if (total <= 0) return keys[rollInt(0, keys.length - 1)];
    var roll = Math.random() * total;
    var acc = 0;
    var i;
    for (i = 0; i < keys.length; i++) {
      acc += Math.max(0, parseInt(RUIN_SITE_TYPES[keys[i]].weight, 10) || 0);
      if (roll < acc) return keys[i];
    }
    return keys[keys.length - 1];
  }

  function rollRuinsRoomCountForType(typeKey) {
    var def = ruinSiteDef(typeKey);
    var min = Math.max(1, parseInt(def.roomMin, 10) || 1);
    var max = Math.max(min, parseInt(def.roomMax, 10) || min);
    return rollInt(min, max);
  }

  function currentRuinsSiteType() {
    return (state && state.ruinsType) || "shrine";
  }

  function ruinsSiteLabel(typeKey) {
    return ruinSiteDef(typeKey).label || "Ruins";
  }

  function ruinsExploreActionLabel(typeKey) {
    var unit = ruinSiteDef(typeKey).unit || "room";
    return unit === "house" ? "Search current house" : "Explore current room";
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
    var prev = pathPreviousTown(fromTownKey);
    return prev ? [prev] : [];
  }

  function totalEastboundDaysToCantebury(fromTownKey) {
    if (!fromTownKey || fromTownKey === "cantebury") return 0;
    var sum = 0;
    var key = fromTownKey;
    var guard = 0;
    while (key && key !== "cantebury" && guard < 16) {
      var prev = pathPreviousTown(key);
      if (!prev) break;
      sum += resolveLegRouteDays(key, prev);
      key = prev;
      guard++;
    }
    return Math.max(0, sum);
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

  var DEFAULT_TRAVEL_BIOMES = {
    forest: { label: "Forest", hint: "Timber closes in.", marchSpeed: 0.92 },
    desert: { label: "Desert", hint: "Dry wind and open grit.", marchSpeed: 0.85 },
    plains: { label: "Plains", hint: "Rolling grass and trade wind.", marchSpeed: 1.1 },
    mountains: { label: "Mountains", hint: "Stone passes and thin air.", marchSpeed: 0.75 },
    steppe: { label: "Steppe", hint: "Wide grass sea.", marchSpeed: 1.12 },
    tundra: { label: "Tundra", hint: "Frozen heath and brittle scrub.", marchSpeed: 0.8 },
    snowfields: { label: "Snowfields", hint: "White silence and deep drifts.", marchSpeed: 0.7 },
  };

  function travelBiomeCatalog() {
    return (BALANCE_DATA && BALANCE_DATA.travelBiomes) || DEFAULT_TRAVEL_BIOMES;
  }

  function travelLegBiomeMap() {
    return (BALANCE_DATA && BALANCE_DATA.trailLegBiomes) || {};
  }

  function biomeDef(biomeKey) {
    var catalog = travelBiomeCatalog();
    if (catalog && catalog[biomeKey]) return catalog[biomeKey];
    return DEFAULT_TRAVEL_BIOMES.plains;
  }

  function biomeLabel(biomeKey) {
    var def = biomeDef(biomeKey);
    return (def && def.label) || "Plains";
  }

  function biomeHint(biomeKey) {
    var def = biomeDef(biomeKey);
    return (def && def.hint) || "";
  }

  function legBiomeSequence(originKey, destinationKey) {
    var map = travelLegBiomeMap();
    var key = legRouteKey(originKey, destinationKey);
    if (map[key] && map[key].length) return map[key].slice();
    return ["plains", "forest"];
  }

  function biomeForLegTravelDay(dayNum, routeDays, originKey, destinationKey) {
    var seq = legBiomeSequence(originKey, destinationKey);
    if (!seq.length) return "plains";
    var day = Math.max(1, Math.min(dayNum, Math.max(1, routeDays)));
    var idx = Math.floor((day - 1) * seq.length / Math.max(1, routeDays));
    if (idx >= seq.length) idx = seq.length - 1;
    return seq[idx];
  }

  function campTravelLegDay() {
    var routeDays = Math.max(1, currentRouteDays());
    var done = state && typeof state.travelDay === "number" ? state.travelDay : 0;
    if (done <= 0) return 1;
    return Math.min(done, routeDays);
  }

  function currentTravelBiome() {
    var origin = (state && state.travelOrigin) || "cantebury";
    var dest = (state && state.travelDestination) || "gustaf";
    return biomeForLegTravelDay(campTravelLegDay(), currentRouteDays(), origin, dest);
  }

  function biomeMarchSpeed(biomeKey) {
    var def = biomeDef(biomeKey);
    if (def && typeof def.marchSpeed === "number" && def.marchSpeed > 0) return def.marchSpeed;
    return 1;
  }

  function biomeMarchSpeedHint(biomeKey) {
    var speed = biomeMarchSpeed(biomeKey);
    var pct = Math.round(speed * 100);
    if (speed > 1.02) return "Fast march — " + pct + "% pace";
    if (speed < 0.98) return "Slow march — " + pct + "% pace";
    return "Normal march — 100% pace";
  }

  function ensureLegMarchProgress() {
    if (typeof state.legMarchProgress !== "number" || state.legMarchProgress < 0) {
      state.legMarchProgress = state.travelDay || 0;
    }
  }

  function tryBiomeMarchAdvance() {
    if (state.phase !== "travel") return { ok: false };
    if (state.travelDay >= currentRouteDays()) return { ok: false, done: true };
    ensureLegMarchProgress();
    var routeDays = currentRouteDays();
    var nextDayIndex = Math.min(routeDays, (state.travelDay || 0) + 1);
    var biome = biomeForLegTravelDay(
      nextDayIndex,
      routeDays,
      state.travelOrigin || "cantebury",
      state.travelDestination || "gustaf"
    );
    var speed = biomeMarchSpeed(biome);
    var before = state.legMarchProgress;
    state.legMarchProgress += speed;
    var newCompleted = Math.min(routeDays, Math.floor(state.legMarchProgress + 1e-9));
    if (newCompleted <= state.travelDay) {
      var towardNext = Math.max(0, Math.round((state.legMarchProgress - Math.floor(before)) * 100));
      logLine(
        '<span class="hi">' +
          escapeHtml(biomeLabel(biome)) +
          "</span> slows the caravan — supplies spent, but only <b>" +
          towardNext +
          "%</b> of the next day's miles are cleared (" +
          Math.round(speed * 100) +
          "% pace). Camp or march again.",
        ""
      );
      trackPlaytest("biome_stalled_march", { biome: biome, speed: speed, progress: state.legMarchProgress });
      return { ok: false, stalled: true, biome: biome, speed: speed };
    }
    var daysGain = newCompleted - state.travelDay;
    if (daysGain > 1) {
      logLine(
        '<span class="hi">' +
          escapeHtml(biomeLabel(biome)) +
          "</span> carries the train quickly — <b>" +
          daysGain +
          "</b> days of road in one push (" +
          Math.round(speed * 100) +
          "% pace).",
        "good"
      );
    }
    return { ok: true, daysGain: daysGain, biome: biome, speed: speed };
  }

  function travelLegProgressText() {
    var routeDays = currentRouteDays();
    var done = state.travelDay || 0;
    ensureLegMarchProgress();
    var partial = Math.max(0, state.legMarchProgress - done);
    var text = done + " / " + routeDays + " days complete on this leg";
    if (partial >= 0.08) {
      text += ' <span class="hint">(' + Math.round(partial * 100) + "% toward next day)</span>";
    }
    return text;
  }

  function travelBiomePanelHtml() {
    var biomeKey = currentTravelBiome();
    var label = biomeLabel(biomeKey);
    var hint = biomeHint(biomeKey);
    return (
      '<div class="travel-biome-panel biome-' + escapeHtml(biomeKey) + '">' +
      '<span class="travel-biome-badge">' + escapeHtml(label) + "</span>" +
      (hint ? '<span class="travel-biome-hint">' + escapeHtml(hint) + "</span>" : "") +
      '<span class="travel-biome-speed hint">' + escapeHtml(biomeMarchSpeedHint(biomeKey)) + "</span>" +
      "</div>"
    );
  }

  var TRAVEL_BIOME_THEME_KEYS = ["plains", "forest", "desert", "mountains", "steppe", "tundra", "snowfields"];

  function syncTravelBiomeTheme() {
    var body = typeof document !== "undefined" ? document.body : null;
    var app = typeof document !== "undefined" ? document.getElementById("app") : null;
    var biome = state && state.phase === "travel" ? currentTravelBiome() : null;
    var i;
    for (i = 0; i < TRAVEL_BIOME_THEME_KEYS.length; i++) {
      if (body) body.classList.remove("biome-theme-" + TRAVEL_BIOME_THEME_KEYS[i]);
      if (app) app.classList.remove("app--biome-" + TRAVEL_BIOME_THEME_KEYS[i]);
    }
    if (!biome) return;
    if (body) body.classList.add("biome-theme-" + biome);
    if (app) app.classList.add("app--biome-" + biome);
  }

  function travelBiomeScreenWrap(innerHtml) {
    var biomeKey = currentTravelBiome();
    return (
      '<div class="travel-screen travel-screen--' +
      escapeHtml(biomeKey) +
      '">' +
      innerHtml +
      "</div>"
    );
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

  var NON_SPELLCASTER_ROLES = { mercenary: true, soldier: true };
  var SPELLCASTER_ROLES = { priest: true, mage: true };
  var ABILITY_ROLES = { soldier: true, mercenary: true };
  var CLEAVE_DAMAGE = 1;
  var COVER_ABSORB_RATIO = 0.75;
  var CRIT_CHANCE_PER_LUCK = 0.0025;
  var CRIT_DAMAGE_MULTIPLIER = 1.5;

  function memberHasSpells(role) {
    return !!SPELLCASTER_ROLES[role];
  }
  function memberHasAbilities(role) {
    return !!ABILITY_ROLES[role];
  }
  function abilityMaxApForRole(role) {
    if (ABILITY_ROLES[role]) return 3;
    return 0;
  }
  function abilityApCost(abilityKind) {
    if (abilityKind === "cleave") return 1;
    if (abilityKind === "cover") return 1;
    return 1;
  }
  function memberCanUseAbility(member, abilityKind) {
    if (!member || !abilityKind) return false;
    if (abilityKind === "cover" && member.role !== "soldier") return false;
    initMemberProgress(member);
    var cost = abilityApCost(abilityKind);
    if (!cost) return true;
    return (member.ap || 0) >= cost;
  }
  function spendAbilityAp(member, abilityKind) {
    if (!member) return false;
    var cost = abilityApCost(abilityKind);
    if (!cost) return true;
    if ((member.ap || 0) < cost) return false;
    member.ap = Math.max(0, (member.ap || 0) - cost);
    return true;
  }

  function abilityNeedsAllyTarget(abilityKind) {
    return abilityKind === "cover";
  }

  function pickCoverTargetForSoldier(soldierId) {
    var softRoles = { priest: true, mage: true };
    var team = combatTeam().filter(function (m) {
      return m.id !== soldierId && teamMemberById(m.id) && teamMemberById(m.id).hp > 0;
    });
    var soft = team.filter(function (m) {
      return softRoles[m.role || ""];
    });
    var pool = soft.length ? soft : team;
    if (!pool.length) return null;
    return pool.slice().sort(function (a, b) {
      return a.hp / a.maxHp - b.hp / b.maxHp;
    })[0];
  }

  function memberMaxMp(member) {
    if (!member) return 25;
    if (NON_SPELLCASTER_ROLES[member.role]) return 25;
    var mpPerInt = member.role === "priest" ? 3 : 5;
    if (member.stats && typeof member.stats.intelligence === "number") {
      return 25 + Math.max(0, member.stats.intelligence - 4) * mpPerInt;
    }
    var bonusInt = (member.bonus && member.bonus.intelligence) || 0;
    return 25 + bonusInt * mpPerInt;
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

  function applyLeaderIdentityToMember(member, lead) {
    if (!member || !lead) return;
    member.name = lead.name;
    member.role = lead.role;
    if (lead.gender) member.gender = lead.gender;
    if (lead.headshot) member.headshot = lead.headshot;
    member.bonus = {
      strength: (lead.bonus && lead.bonus.strength) || 0,
      intelligence: (lead.bonus && lead.bonus.intelligence) || 0,
      stamina: (lead.bonus && lead.bonus.stamina) || 0,
      luck: (lead.bonus && lead.bonus.luck) || 0,
    };
    if (lead.stats) {
      member.stats = cloneStats(lead.stats);
    } else {
      var leadBase = baseStatsForRole(member.role);
      member.stats = {
        strength: (leadBase.strength || 0) + member.bonus.strength,
        intelligence: (leadBase.intelligence || 0) + member.bonus.intelligence,
        stamina: (leadBase.stamina || 0) + member.bonus.stamina,
        luck: (leadBase.luck || 0) + member.bonus.luck,
      };
    }
    initMemberProgress(member);
    member.maxHp = memberMaxHp(member);
    member.hp = member.maxHp;
    member.maxMp = memberMaxMp(member);
    member.mp = member.maxMp;
  }

  function syncLeaderPartyMember() {
    if (!state.leaderProfile || !state.party || !state.party.length) return;
    var leader = state.party[0];
    if (!leader || leader.id !== "p0") return;
    applyLeaderIdentityToMember(leader, state.leaderProfile);
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
    var continuingCampaign = isContinuingCaravanLoop();
    var treasuryRestore = continuingCampaign && state.caravanTreasury ? state.caravanTreasury : null;
    state.leaderProfile = lead;
    state.newLeaderDraft = null;
    state.loopLeaderSetup = false;

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
      if (state.party[0]) applyLeaderIdentityToMember(state.party[0], lead);
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
      if (state.party[0]) applyLeaderIdentityToMember(state.party[0], lead);
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
    if (treasuryRestore) {
      restoreCaravanTreasury(treasuryRestore);
      state.caravanTreasury = null;
    }
    if (continuingCampaign) {
      replenishCaravanAtCantebury();
    }
    for (var pi = 0; pi < state.party.length; pi++) {
      var pm = state.party[pi];
      if (pi === 0) continue;
      initMemberProgress(pm);
      pm.hp = pm.maxHp;
      pm.mp = pm.maxMp;
    }
    assignMissingPartyPortraits();
    syncLeaderPartyMember();
    if (state.party[0] && state.leaderProfile) {
      if (!state.leaderProfile.gender) state.leaderProfile.gender = state.party[0].gender || "man";
      if (!state.leaderProfile.headshot) state.leaderProfile.headshot = state.party[0].headshot || "";
    }
    ensureCampaignGearState();
    state.inventoryFocusId = state.party[0].id;
    state.inventoryHealTargetId = state.party[0].id;
    state.inventoryDetailOpen = false;
    state.travelInventoryOpen = false;
    state.illiriView = "castle";
    state.keepView = "hall";
    state.cityView = "shop";
    state.onReturnMarch = false;
    state.settlementTown = null;
    state.travelOrigin = "cantebury";
    state.travelDestination = "gustaf";
    resetTrailPathForWestwardMarch();
    state.finalBossCleared = false;
    if (!continuingCampaign) {
      state.playthrough = claimPlaythroughNumber();
    }
    state.runId = "run-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
    state.phase = "story_illiri";
    if (continuingCampaign) {
      logLine(
        "Cantebury welcomes a new leader: <span class=\"hi\">" +
          lead.name +
          "</span> (" +
          roleLabel(lead.role) +
          "). Journey day " +
          (state.totalDaysElapsed || 0) +
          " / " +
          effectiveStabilityTarget() +
          " continues.",
        "good"
      );
      logLine(
        "Caravan treasury from prior loops: <span class=\"hi\">" + caravanTreasurySummary() + "</span>. Gear left at New Isil waits in the <b>colony locker</b> (Depart tab on your next harbor visit).",
        "hi"
      );
    } else {
      logLine("Caravan leader ready: <span class=\"hi\">" + lead.name + "</span> (" + roleLabel(lead.role) + ").", "good");
    }
    trackPlaytest("run_started", {
      leaderRole: lead.role,
      leaderSource: lead.source || "custom",
      partySize: state.party.length,
      playthrough: state.playthrough,
      version: GAME_VERSION,
      continuingCampaign: continuingCampaign,
      journeyDay: state.totalDaysElapsed || 0,
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
      legMarchProgress: 0,
      legRouteDays: 0,
      legDaysByRoute: {},
      encounterChance: ENCOUNTER_BASE,
      ruinsDiscovered: false,
      ruinsType: null,
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
      loopLeaderSetup: false,
      kewKumberGrantDue: 0,
      chancellorGrantDue: 0,
      stabilityTargetNotedAtNewIsil: false,
      settledCompanions: [],
      newIsilSettlers: [],
      newIsilGrowth: { population: NEW_ISIL_BASE_POPULATION },
      settlementSite: null,
      newIsilColony: defaultNewIsilColony(),
      gearStash: ["travel_knife", "leather_armor", "lucky_ring", "travel_charm"],
      exoticWeaponStash: [],
      caravanTreasury: null,
      newIsilDepot: { gearStash: [], exoticWeaponStash: [], depositedOnLoop: 0 },
      winReason: null,
      stableRestDays: 0,
      quest: null,
      questsCompleted: [],
      garrisonSupport: {},
      questDialog: null,
      npcDialog: null,
      caravan: defaultCaravanFollowers(),
    };
  }

  var HEADSTONE_STORAGE_KEY = "illirial.headstones";
  var HEADSTONE_STORAGE_BACKUP_KEY = "illirial.headstones.backup";
  var HEADSTONE_RELEASE_PHASE = "alpha";
  var PLAYTHROUGH_COUNTER_KEY = "illirial.playthrough.next";

  var CAMPAIGN_SAVE_LEGACY_KEY = "illirial.campaignSave";
  var CAMPAIGN_SAVE_KEY_PREFIX = "illirial.campaignSave.slot.";
  var CAMPAIGN_SAVE_ACTIVE_SLOT_KEY = "illirial.campaignSave.activeSlot";
  var CAMPAIGN_SAVE_SLOT_COUNT = 3;
  var CAMPAIGN_SAVE_FORMAT = 1;
  var _campaignSaveMigrated = false;
  var _campaignDiskSaveEnabled = null;
  var _campaignDiskSaveDir = "";

  function campaignDiskSavePing() {
    if (_campaignDiskSaveEnabled !== null) return _campaignDiskSaveEnabled;
    if (typeof XMLHttpRequest === "undefined") {
      _campaignDiskSaveEnabled = false;
      return false;
    }
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "/api/campaign-save/ping", false);
      xhr.send(null);
      if (xhr.status === 200) {
        var data = JSON.parse(xhr.responseText || "{}");
        _campaignDiskSaveEnabled = !!(data && data.ok);
        _campaignDiskSaveDir = (data && data.savesDir) || "";
      } else {
        _campaignDiskSaveEnabled = false;
      }
    } catch (e) {
      _campaignDiskSaveEnabled = false;
    }
    return _campaignDiskSaveEnabled;
  }

  function campaignDiskSaveDirHint() {
    return _campaignDiskSaveDir || "saves/";
  }

  function diskReadSlotRaw(slotIndex) {
    var idx = normalizeSaveSlotIndex(slotIndex);
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "/api/campaign-save/slot/" + idx, false);
      xhr.send(null);
      if (xhr.status === 404) return null;
      if (xhr.status !== 200) return null;
      return xhr.responseText || null;
    } catch (e) {
      return null;
    }
  }

  function diskWriteSlotRaw(slotIndex, jsonText) {
    var idx = normalizeSaveSlotIndex(slotIndex);
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("PUT", "/api/campaign-save/slot/" + idx, false);
      xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
      xhr.send(jsonText);
      return xhr.status >= 200 && xhr.status < 300;
    } catch (e) {
      return false;
    }
  }

  function diskDeleteSlot(slotIndex) {
    var idx = normalizeSaveSlotIndex(slotIndex);
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("DELETE", "/api/campaign-save/slot/" + idx, false);
      xhr.send(null);
      return xhr.status >= 200 && xhr.status < 300;
    } catch (e) {
      return false;
    }
  }

  function diskReadActiveSlot() {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "/api/campaign-save/active-slot", false);
      xhr.send(null);
      if (xhr.status !== 200) return null;
      var data = JSON.parse(xhr.responseText || "{}");
      if (data && typeof data.activeSlot === "number") return normalizeSaveSlotIndex(data.activeSlot);
      return null;
    } catch (e) {
      return null;
    }
  }

  function diskWriteActiveSlot(slotIndex) {
    var idx = normalizeSaveSlotIndex(slotIndex);
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("PUT", "/api/campaign-save/active-slot", false);
      xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
      xhr.send(JSON.stringify({ activeSlot: idx }));
      return xhr.status >= 200 && xhr.status < 300;
    } catch (e) {
      return false;
    }
  }

  function parseCampaignSaveRecord(raw, slotIndex) {
    if (!raw) return null;
    try {
      var parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (!parsed || parsed.format !== CAMPAIGN_SAVE_FORMAT || !parsed.state) return null;
      parsed.slotIndex = normalizeSaveSlotIndex(slotIndex);
      return parsed;
    } catch (e) {
      return null;
    }
  }

  function mirrorCampaignSaveToLocal(slotIndex, raw) {
    if (!campaignStorageAvailable() || !raw) return;
    try {
      localStorage.setItem(campaignSaveKeyForSlot(normalizeSaveSlotIndex(slotIndex)), raw);
    } catch (e) { /* ignore */ }
  }

  function campaignSaveStorageLabel() {
    return campaignDiskSavePing() ? "saved to disk (" + campaignDiskSaveDirHint() + ")" : "stored in this browser";
  }



  function campaignStorageAvailable() {
    try {
      return typeof localStorage !== "undefined";
    } catch (e) {
      return false;
    }
  }

  function campaignSaveKeyForSlot(slotIndex) {
    return CAMPAIGN_SAVE_KEY_PREFIX + String(slotIndex);
  }

  function normalizeSaveSlotIndex(slotIndex) {
    var n = parseInt(slotIndex, 10);
    if (isNaN(n) || n < 0) return 0;
    if (n >= CAMPAIGN_SAVE_SLOT_COUNT) return CAMPAIGN_SAVE_SLOT_COUNT - 1;
    return n;
  }

  function migrateLegacyCampaignSave() {
    if (_campaignSaveMigrated || !campaignStorageAvailable()) return;
    _campaignSaveMigrated = true;
    try {
      var legacy = localStorage.getItem(CAMPAIGN_SAVE_LEGACY_KEY);
      if (!legacy) return;
      if (!readCampaignSaveSlot(0)) {
        localStorage.setItem(campaignSaveKeyForSlot(0), legacy);
      }
      localStorage.removeItem(CAMPAIGN_SAVE_LEGACY_KEY);
    } catch (e) { /* ignore */ }
  }

  function getActiveSaveSlot() {
    migrateLegacyCampaignSave();
    if (campaignDiskSavePing()) {
      var diskSlot = diskReadActiveSlot();
      if (diskSlot !== null) {
        if (campaignStorageAvailable()) {
          try {
            localStorage.setItem(CAMPAIGN_SAVE_ACTIVE_SLOT_KEY, String(diskSlot));
          } catch (e) { /* ignore */ }
        }
        return diskSlot;
      }
    }
    if (!campaignStorageAvailable()) return 0;
    try {
      var raw = localStorage.getItem(CAMPAIGN_SAVE_ACTIVE_SLOT_KEY);
      return normalizeSaveSlotIndex(raw);
    } catch (e) {
      return 0;
    }
  }

  function setActiveSaveSlot(slotIndex) {
    var idx = normalizeSaveSlotIndex(slotIndex);
    if (campaignDiskSavePing()) diskWriteActiveSlot(idx);
    if (!campaignStorageAvailable()) return idx;
    try {
      localStorage.setItem(CAMPAIGN_SAVE_ACTIVE_SLOT_KEY, String(idx));
    } catch (e) { /* ignore */ }
    return idx;
  }

  function campaignLocationLabelForSave(savedState) {
    var s = savedState || state;
    if (!s) return "Unknown";
    if (s.phase === "story_illiri") return locationLabel("cantebury");
    if (s.phase === "settlement" && s.settlementTown) return locationLabel(s.settlementTown);
    if (s.phase === "travel") {
      return "Road: " + locationLabel(s.travelOrigin || "cantebury") + " \u2192 " + locationLabel(s.travelDestination || "gustaf");
    }
    if (s.phase === "new_game_setup") return "Cantebury (leader setup)";
    if (s.phase === "gameover") return s.gameoverMode === "win" ? "Campaign complete" : "Game over";
    if (s.phase === "adventure" && s.adventure && s.adventure.town) return "Adventure near " + locationLabel(s.adventure.town);
    return s.phase || "In progress";
  }

  function readCampaignSaveSlot(slotIndex) {
    migrateLegacyCampaignSave();
    var idx = normalizeSaveSlotIndex(slotIndex);
    if (campaignDiskSavePing()) {
      var diskRaw = diskReadSlotRaw(idx);
      var diskRec = parseCampaignSaveRecord(diskRaw, idx);
      if (diskRec) {
        mirrorCampaignSaveToLocal(idx, diskRaw);
        return diskRec;
      }
    }
    if (!campaignStorageAvailable()) return null;
    try {
      var raw = localStorage.getItem(campaignSaveKeyForSlot(idx));
      return parseCampaignSaveRecord(raw, idx);
    } catch (e) {
      return null;
    }
  }

  function readCampaignSaveRecord(slotIndex) {
    if (typeof slotIndex === "number" || typeof slotIndex === "string") {
      return readCampaignSaveSlot(slotIndex);
    }
    return readCampaignSaveSlot(getActiveSaveSlot());
  }

  function hasCampaignSaveInSlot(slotIndex) {
    return !!readCampaignSaveSlot(slotIndex);
  }

  function hasCampaignSave() {
    return hasAnyCampaignSave();
  }

  function hasAnyCampaignSave() {
    var i;
    for (i = 0; i < CAMPAIGN_SAVE_SLOT_COUNT; i++) {
      if (hasCampaignSaveInSlot(i)) return true;
    }
    return false;
  }

  function campaignSaveSummaryText(record) {
    var rec = record;
    if (!rec) rec = readCampaignSaveRecord();
    if (!rec || !rec.state) return "";
    var s = rec.state;
    var when = rec.savedAt ? new Date(rec.savedAt).toLocaleString() : "unknown time";
    var slotLabel =
      typeof rec.slotIndex === "number" ? "Slot " + (rec.slotIndex + 1) + " \u00b7 " : "";
    return (
      slotLabel +
      "Journey day " +
      (s.totalDaysElapsed || 0) +
      " \u00b7 " +
      campaignLocationLabelForSave(s) +
      " \u00b7 saved " +
      when
    );
  }

  function campaignSaveSlotLabel(slotIndex) {
    return "Slot " + (normalizeSaveSlotIndex(slotIndex) + 1);
  }

  function canSaveCampaignProgress() {
    if (!campaignStorageAvailable()) return false;
    if (state.phase === "gameover") return false;
    if (state.phase === "new_character") return false;
    return true;
  }

  function buildCampaignSavePayload(slotIndex) {
    clearTransitionTimers();
    state.transition = null;
    state.confirmDialog = null;
    state.postBattleDialog = null;
    state.campDialog = null;
    var snap = JSON.parse(JSON.stringify(state));
    snap.transition = null;
    snap.confirmDialog = null;
    snap.postBattleDialog = null;
    snap.elaraDialog = null;
    snap.questDialog = null;
    snap.npcDialog = null;
    return {
      format: CAMPAIGN_SAVE_FORMAT,
      gameVersion: GAME_VERSION,
      savedAt: Date.now(),
      slotIndex: normalizeSaveSlotIndex(slotIndex),
      state: snap,
    };
  }

  function saveCampaignProgress(slotIndex) {
    lastCampaignSaveBarKey = "";
    if (!canSaveCampaignProgress()) {
      logLine("Cannot save progress right now.", "bad");
      render();
      return false;
    }
    var idx = normalizeSaveSlotIndex(slotIndex == null ? getActiveSaveSlot() : slotIndex);
    try {
      var payload = buildCampaignSavePayload(idx);
      var jsonText = JSON.stringify(payload);
      if (campaignDiskSavePing()) {
        if (!diskWriteSlotRaw(idx, jsonText)) {
          logLine("Disk save failed; wrote to browser storage only.", "bad");
        }
      }
      if (campaignStorageAvailable()) {
        localStorage.setItem(campaignSaveKeyForSlot(idx), jsonText);
      }
      setActiveSaveSlot(idx);
      logLine(
        "<span class=\"hi\">" +
          campaignSaveSlotLabel(idx) +
          " saved.</span> " +
          campaignSaveSummaryText(payload) +
          " (" + campaignSaveStorageLabel() + ").",
        "good"
      );
      trackPlaytest("campaign_saved", {
        day: state.totalDaysElapsed || 0,
        phase: state.phase,
        slot: idx,
        version: GAME_VERSION,
      });
      render();
      return true;
    } catch (e) {
      lastCampaignSaveBarKey = "";
      logLine("Save failed \u2014 browser storage may be full or disabled.", "bad");
      render();
      return false;
    }
  }

  function restoreStateFromSave(savedState) {
    if (!savedState || typeof savedState !== "object") return false;
    clearTransitionTimers();
    state = savedState;
    state.transition = null;
    state.confirmDialog = null;
    state.postBattleDialog = null;
    state.elaraDialog = null;
    state.questDialog = null;
    state.npcDialog = null;
    if (!state.log || !state.log.length) state.log = [];
    if (!state.settledCompanions) state.settledCompanions = [];
    if (!state.garrisonSupport) state.garrisonSupport = {};
    if (!state.gearStash) state.gearStash = [];
    if (!state.exoticWeaponStash) state.exoticWeaponStash = [];
    ensureNewIsilDepot();
    ensureCampaignGearState();
    ensureSettledCompanions();
    ensureNewIsilColony();
    migrateColonyBuildingKeys(state.newIsilColony);
    recomputeColonyTier();
    syncNewIsilGrowthFromColony();
    ensureHeadstonesState();
    saveHeadstonesToStorage();
    if (state.party && state.party.length) {
      if (!state.inventoryFocusId || !teamMemberById(state.inventoryFocusId)) {
        state.inventoryFocusId = state.party[0].id;
      }
      if (!state.inventoryHealTargetId || !teamMemberById(state.inventoryHealTargetId)) {
        state.inventoryHealTargetId = state.party[0].id;
      }
    }
    syncLeaderPartyMember();
    processDailyDeath();
    return true;
  }

  function loadCampaignProgress(slotIndex, skipConfirm) {
    if (typeof slotIndex === "boolean") {
      skipConfirm = slotIndex;
      slotIndex = getActiveSaveSlot();
    }
    var idx = normalizeSaveSlotIndex(slotIndex == null ? getActiveSaveSlot() : slotIndex);
    var record = readCampaignSaveSlot(idx);
    if (!record || !record.state) {
      logLine(campaignSaveSlotLabel(idx) + " is empty.", "bad");
      render();
      return false;
    }
    var hasCurrentRun =
      state.phase !== "new_game_setup" ||
      (state.totalDaysElapsed || 0) > 0 ||
      (state.party && state.party.length > 1) ||
      state.leaderProfile;
    if (hasCurrentRun && !skipConfirm) {
      state.confirmDialog = {
        kind: "load_campaign",
        slotIndex: idx,
        title: "Load " + campaignSaveSlotLabel(idx) + "?",
        message:
          "Replace the current run with this save?<br><span class=\"hint\">" +
          escapeHtml(campaignSaveSummaryText(record)) +
          "</span>" +
          (record.gameVersion && record.gameVersion !== GAME_VERSION
            ? "<br><span class=\"hint\">Save was written on v" +
              escapeHtml(record.gameVersion) +
              "; current build is v" +
              escapeHtml(GAME_VERSION) +
              ".</span>"
            : ""),
        confirmLabel: "Load save",
        cancelLabel: "Cancel",
        onConfirm: "executeLoadCampaign",
      };
      render();
      return false;
    }
    if (!restoreStateFromSave(record.state)) {
      logLine("Save file could not be restored.", "bad");
      render();
      return false;
    }
    setActiveSaveSlot(idx);
    logLine(
      "<span class=\"hi\">" + campaignSaveSlotLabel(idx) + " loaded.</span> " + campaignSaveSummaryText(record),
      "good"
    );
    if (record.gameVersion && record.gameVersion !== GAME_VERSION) {
      logLine("Note: save came from v" + record.gameVersion + " (now running v" + GAME_VERSION + ").", "hi");
    }
    trackPlaytest("campaign_loaded", {
      day: state.totalDaysElapsed || 0,
      phase: state.phase,
      slot: idx,
      saveVersion: record.gameVersion,
      version: GAME_VERSION,
    });
    render();
    return true;
  }

  function clearCampaignSaveSlot(slotIndex) {
    var idx = normalizeSaveSlotIndex(slotIndex);
    if (campaignDiskSavePing()) diskDeleteSlot(idx);
    if (!campaignStorageAvailable()) return;
    try {
      localStorage.removeItem(campaignSaveKeyForSlot(idx));
    } catch (e) { /* ignore */ }
  }

  function clearCampaignSave() {
    clearCampaignSaveSlot(getActiveSaveSlot());
  }

  function openDeleteCampaignSaveConfirm(slotIndex) {
    var idx = normalizeSaveSlotIndex(slotIndex);
    if (!hasCampaignSaveInSlot(idx)) {
      logLine(campaignSaveSlotLabel(idx) + " is already empty.", "bad");
      render();
      return;
    }
    state.confirmDialog = {
      kind: "delete_campaign_slot",
      slotIndex: idx,
      title: "Delete " + campaignSaveSlotLabel(idx) + "?",
      message:
        "Remove this save from your browser? This cannot be undone.<br><span class=\"hint\">" +
        escapeHtml(campaignSaveSummaryText(readCampaignSaveSlot(idx))) +
        "</span>",
      confirmLabel: "Delete save",
      cancelLabel: "Keep save",
      onConfirm: "executeDeleteCampaignSlot",
    };
    render();
  }

  function deleteCampaignSaveSlot(slotIndex) {
    var idx = normalizeSaveSlotIndex(slotIndex);
    if (!hasCampaignSaveInSlot(idx)) {
      logLine(campaignSaveSlotLabel(idx) + " is already empty.", "bad");
      render();
      return false;
    }
    clearCampaignSaveSlot(idx);
    lastCampaignSaveBarKey = "";
    logLine("<span class=\"hi\">" + campaignSaveSlotLabel(idx) + " deleted.</span> Save removed from " + (campaignDiskSavePing() ? "disk and browser" : "this browser") + ".", "good");
    trackPlaytest("campaign_deleted", { slot: idx, version: GAME_VERSION });
    updateCampaignSaveBar();
    render();
    return true;
  }

  function startNewCampaignWipeSave() {
    clearTransitionTimers();
    state = initialState();
    logLine("New campaign started. Your three save slots are unchanged.", "hi");
    render();
  }

  function campaignSaveSlotRowHtml(slotIndex) {
    var idx = normalizeSaveSlotIndex(slotIndex);
    var active = getActiveSaveSlot() === idx;
    var record = readCampaignSaveSlot(idx);
    var occupied = !!(record && record.state);
    var summary = occupied
      ? escapeHtml(campaignSaveSummaryText(record))
      : "Empty";
    return (
      '<div class="save-slot' +
      (active ? " save-slot--active" : "") +
      (occupied ? "" : " save-slot--empty") +
      '" data-save-slot="' +
      idx +
      '">' +
      '<div class="save-slot-head">' +
      '<span class="save-slot-title">' +
      campaignSaveSlotLabel(idx) +
      (active ? ' <span class="save-slot-badge">active</span>' : "") +
      "</span>" +
      "</div>" +
      '<p class="save-slot-summary' +
      (occupied ? "" : " hint") +
      '">' +
      summary +
      "</p>" +
      '<div class="save-slot-actions actions">' +
      '<button type="button" class="act-btn' +
      (active ? " selected" : "") +
      '" data-select-save-slot="' +
      idx +
      '">Use slot</button>' +
      '<button type="button" data-load-save-slot="' +
      idx +
      '"' +
      (occupied ? "" : " disabled") +
      ">Load</button>" +
      '<button type="button" data-delete-save-slot="' +
      idx +
      '"' +
      (occupied ? "" : " disabled") +
      ">Delete</button>" +
      "</div>" +
      "</div>"
    );
  }

  function campaignSaveSlotsPanelHtml(compact) {
    var rows = "";
    var i;
    for (i = 0; i < CAMPAIGN_SAVE_SLOT_COUNT; i++) {
      rows += campaignSaveSlotRowHtml(i);
    }
    var active = getActiveSaveSlot();
    var storageNote = campaignDiskSavePing()
      ? "Saves on disk: <b>" + escapeHtml(campaignDiskSaveDirHint()) + "</b>. "
      : "";
    var lead = compact
      ? '<p class="hint campaign-save-lead">' + storageNote + "Up to 3 slots. Pick a slot, then save or load.</p>"
      : '<p class="campaign-save-lead">' + storageNote + "Campaign saves</p>";
    return (
      lead +
      '<div class="save-slots' +
      (compact ? " save-slots--compact" : "") +
      '">' +
      rows +
      "</div>" +
      '<p class="hint save-slot-active-note">Saving writes to <b>' +
      campaignSaveSlotLabel(active) +
      "</b>.</p>"
    );
  }

  function isCampaignPlayPhase() {
    return state.phase !== "new_game_setup" && state.phase !== "new_character";
  }

  function campaignSaveControlsHtml() {
    if (!isCampaignPlayPhase()) return "";
    var saveDisabled = canSaveCampaignProgress() ? "" : " disabled";
    var active = getActiveSaveSlot();
    var record = readCampaignSaveSlot(active);
    var loadDisabled = record && record.state ? "" : " disabled";
    var summary = record && record.state
      ? '<p class="campaign-save-summary">' + escapeHtml(campaignSaveSummaryText(record)) + "</p>"
      : '<p class="campaign-save-summary hint">' + campaignSaveSlotLabel(active) + " is empty.</p>";
    return (
      summary +
      '<div class="campaign-save-actions actions">' +
      '<button type="button" class="primary" id="campaignSaveBtn"' +
      saveDisabled +
      ">Save</button>" +
      '<button type="button" id="campaignLoadBtn"' +
      loadDisabled +
      ">Load</button>" +
      "</div>"
    );
  }

  function campaignSaveSetupHtml() {
    if (!hasAnyCampaignSave()) return "";
    return (
      '<div class="save-slots-setup">' +
      "<h3 class=\"panel-title\" style=\"margin-top:1rem\">Continue a saved game</h3>" +
      campaignSaveSlotsPanelHtml(true) +
      "</div>"
    );
  }

  var lastCampaignSaveBarKey = "";

  function campaignSaveBarCacheKey() {
    var parts = [isCampaignPlayPhase() ? "1" : "0", String(getActiveSaveSlot())];
    var si;
    for (si = 0; si < 3; si++) {
      var rec = readCampaignSaveSlot(si);
      parts.push(rec && rec.savedAt ? String(rec.savedAt) : "-");
    }
    return parts.join("|");
  }

  function updateCampaignSaveBar() {
    var bar = document.getElementById("campaignSaveBar");
    if (!bar) return;
    if (!isCampaignPlayPhase()) {
      if (bar.innerHTML || bar.style.display !== "none") {
        bar.innerHTML = "";
        bar.style.display = "none";
        lastCampaignSaveBarKey = "";
      }
      return;
    }
    var key = campaignSaveBarCacheKey();
    if (key === lastCampaignSaveBarKey && bar.innerHTML) return;
    lastCampaignSaveBarKey = key;
    bar.style.display = "";
    bar.innerHTML = campaignSaveControlsHtml();
    wireCampaignSaveControls(bar);
  }

  function ensureCampaignSaveBar() {
    var bar = document.getElementById("campaignSaveBar");
    if (bar) return bar;
    var app = document.getElementById("app");
    if (!app || !app.parentNode) return null;
    bar = document.createElement("div");
    bar.id = "campaignSaveBar";
    bar.className = "campaign-save-bar";
    bar.setAttribute("aria-label", "Campaign save controls");
    app.parentNode.insertBefore(bar, app);
    return bar;
  }

  function ensureConfirmOverlayHost() {
    var host = document.getElementById("confirmOverlayHost");
    if (host) return host;
    var app = document.getElementById("app");
    host = document.createElement("div");
    host.id = "confirmOverlayHost";
    if (app && app.parentNode) {
      app.parentNode.insertBefore(host, app.nextSibling);
    } else if (document.body) {
      document.body.appendChild(host);
    }
    return host;
  }

  function syncConfirmOverlay() {
    var host = ensureConfirmOverlayHost();
    if (!host) return;
    if (!state.confirmDialog) {
      host.innerHTML = "";
      return;
    }
    host.innerHTML = confirmDialogOverlayHtml(state.confirmDialog);
    wireConfirmDialog(host);
  }

  function wireCampaignSaveControls(root) {
    if (!root) return;
    var saveBtn = root.querySelector("#campaignSaveBtn");
    if (saveBtn) saveBtn.onclick = function () { saveCampaignProgress(getActiveSaveSlot()); };
    var loadBtn = root.querySelector("#campaignLoadBtn");
    if (loadBtn) {
      loadBtn.onclick = function () {
        loadCampaignProgress(getActiveSaveSlot(), false);
      };
    }
    var selectBtns = root.querySelectorAll("[data-select-save-slot]");
    var si;
    for (si = 0; si < selectBtns.length; si++) {
      selectBtns[si].onclick = (function (btn) {
        return function () {
          var slot = normalizeSaveSlotIndex(btn.getAttribute("data-select-save-slot"));
          setActiveSaveSlot(slot);
          logLine("Active save slot: <span class=\"hi\">" + campaignSaveSlotLabel(slot) + "</span>.", "");
          if (state.phase === "new_game_setup") render();
          else updateCampaignSaveBar();
        };
      })(selectBtns[si]);
    }
    var loadBtns = root.querySelectorAll("[data-load-save-slot]");
    var li;
    for (li = 0; li < loadBtns.length; li++) {
      loadBtns[li].onclick = (function (btn) {
        return function () {
          var slot = normalizeSaveSlotIndex(btn.getAttribute("data-load-save-slot"));
          setActiveSaveSlot(slot);
          loadCampaignProgress(slot, state.phase === "new_game_setup");
        };
      })(loadBtns[li]);
    }
    var deleteBtns = root.querySelectorAll("[data-delete-save-slot]");
    var di;
    for (di = 0; di < deleteBtns.length; di++) {
      deleteBtns[di].onclick = (function (btn) {
        return function () {
          openDeleteCampaignSaveConfirm(btn.getAttribute("data-delete-save-slot"));
        };
      })(deleteBtns[di]);
    }
  }


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

  /** Version as concatenated semver digits (e.g. 6.6.19 → 6619, 7.4.204 → 74204). */
  function versionMemorialCode(versionStr) {
    var cleaned = String(versionStr || GAME_VERSION || "0").replace(/[^0-9.]/g, "");
    var digits = cleaned.replace(/\./g, "");
    return digits || "0";
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
      return run + "." + padJourneyDaysForMemorial(days) + "." + String(hs.versionCode);
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
    return '<span class="hint">Date inscribed as playthrough.journeyDays.version (e.g. 3.12.6619 for v6.6.19).</span>';
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
    if (carryingFallenHomeFromAdventure()) return false;
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


  function isLastLegToNewIsil() {
    if (!state || state.onReturnMarch) return false;
    return (state.travelDestination || "") === "new_isil";
  }

  function isHighThreatMonster(mon) {
    if (!mon) return true;
    var atk = parseInt(mon.atk, 10) || 0;
    var lvl = parseInt(mon.level, 10) || 1;
    if (lvl >= 3) return true;
    if (atk >= RUINS_HIGH_ATK_THRESHOLD) return true;
    return false;
  }

  function ruinsMonsterPool(allowedLevels) {
    var pool = BALANCE_MONSTERS.filter(function (m) {
      if (!m || !m.name) return false;
      var lvl = (m && m.level) || 1;
      if (allowedLevels.indexOf(lvl) < 0) return false;
      if (!isLastLegToNewIsil() && isHighThreatMonster(m)) return false;
      return true;
    });
    if (currentRuinsSiteType() === "abandoned_town") {
      var bandits = pool.filter(function (m) {
        return ABANDONED_TOWN_RUINS_MONSTERS.indexOf(m.name) >= 0;
      });
      if (bandits.length) {
        pool = bandits.slice();
        var imp = balanceMonsterByName("Imp");
        if (imp && allowedLevels.indexOf(imp.level || 1) >= 0 && !isHighThreatMonster(imp)) {
          pool.push(imp);
        }
      }
    }
    if (!pool.length) {
      var fallbackBandit = balanceMonsterByName("Bandit");
      var fallbackImp = balanceMonsterByName("Imp");
      pool = [];
      if (fallbackBandit) pool.push(fallbackBandit);
      if (fallbackImp) pool.push(fallbackImp);
    }
    return pool;
  }

  function pickRuinsMonster(pool) {
    if (!pool || !pool.length) return { name: "Bandit", hp: 6, atk: 5, level: 2 };
    if (currentRuinsSiteType() === "abandoned_town") {
      if (Math.random() < RUINS_IMP_CHANCE) {
        for (var ii = 0; ii < pool.length; ii++) {
          if (pool[ii].name === "Imp") return pool[ii];
        }
      }
      var banditOnly = pool.filter(function (m) {
        return ABANDONED_TOWN_RUINS_MONSTERS.indexOf(m.name) >= 0;
      });
      if (banditOnly.length) return randomBalanceMonster(banditOnly);
    }
    return randomBalanceMonster(pool);
  }

  function isWolfMonsterName(name) {
    return (name || "").toLowerCase().indexOf("wolf") >= 0;
  }

  function isDragonMonsterName(name) {
    return (name || "").toLowerCase().indexOf("dragon") >= 0;
  }

  function isGreaterDragonName(name) {
    return (name || "").toLowerCase().indexOf("greater dragon") >= 0;
  }

  function isDragonFoe(foe) {
    return isDragonMonsterName(foe && foe.name);
  }

  function memberUsesMagicalWeapon(member) {
    if (!member) return false;
    if (member.exoticWeaponId) return true;
    ensureMemberEquipment(member);
    var weaponId = member.equipment && member.equipment.weapon;
    if (!weaponId) return false;
    var sheet = weaponSheetDef(weaponId);
    if (sheet && sheet.extras && sheet.extras.length) {
      var ei;
      for (ei = 0; ei < sheet.extras.length; ei++) {
        var extra = String(sheet.extras[ei] || "").toLowerCase();
        if (extra.indexOf("holy") >= 0 || extra.indexOf("magic") >= 0 || extra.indexOf("arcane") >= 0) {
          return true;
        }
      }
    }
    var eqDef = equipmentItemDef(weaponId);
    if (eqDef && eqDef.magical) return true;
    return false;
  }

  function dragonDamageReductionFor(foe, damageKind, member) {
    if (!isDragonFoe(foe)) return 0;
    var greater = isGreaterDragonName(foe.name);
    if (damageKind === "spell") return greater ? 0.65 : 0.5;
    if (damageKind === "weapon") {
      if (memberUsesMagicalWeapon(member)) return 0;
      return greater ? 0.35 : 0.3;
    }
    if (damageKind === "physical") return greater ? 0.35 : 0.3;
    return 0;
  }

  function applyDamageToFoe(foe, rawDmg, strikeOpts) {
    strikeOpts = strikeOpts || {};
    if (!foe || rawDmg <= 0) return { dmg: 0, resisted: false, drPct: 0 };
    var kind = strikeOpts.damageKind || "physical";
    var member = strikeOpts.member || null;
    var dr = dragonDamageReductionFor(foe, kind, member);
    if (dr <= 0) return { dmg: rawDmg, resisted: false, drPct: 0 };
    return { dmg: Math.max(1, Math.round(rawDmg * (1 - dr))), resisted: true, drPct: dr };
  }

  function dragonResistLogSuffix(strikeResult) {
    if (!strikeResult || !strikeResult.resisted) return "";
    return ", <span class=\"hint\">scales resist " + Math.round(strikeResult.drPct * 100) + "%</span>";
  }

  function partyLevelAverage() {
    var team = livingPartyMembers();
    if (!team.length) return 1;
    var sum = 0;
    var i;
    for (i = 0; i < team.length; i++) {
      initMemberProgress(team[i]);
      sum += team[i].level || 1;
    }
    return sum / team.length;
  }

  function dragonEncounterChancePct() {
    var avg = partyLevelAverage();
    if (avg < 2) return 0;
    return (avg - 1) * 0.25;
  }

  function dragonEncounterRollWins() {
    var pct = dragonEncounterChancePct();
    if (pct <= 0) return false;
    return Math.random() < pct / 100;
  }

  function buildDragonSchoolEncounter(opts) {
    opts = opts || {};
    var useGreater = opts.greater === true;
    if (opts.greater !== true && opts.greater !== false && Math.random() < 0.15) useGreater = true;
    var dragonName = useGreater ? "Greater Dragon" : "Dragon";
    var dragonHp = useGreater ? 150 : 100;
    var dragonDmg = useGreater ? 35 : 25;
    var escortPool = BALANCE_MONSTERS.filter(function (m) {
      if (!m || !m.name || isDragonMonsterName(m.name)) return false;
      return ((m && m.level) || 1) <= 2;
    });
    if (!escortPool.length) escortPool = [{ name: "Goblin", hp: 3, atk: 2, level: 1 }];
    var escortCount = 2;
    var list = [
      {
        id: "drag0",
        name: dragonName,
        hp: dragonHp,
        maxHp: dragonHp,
        dmg: dragonDmg,
        level: 3,
      },
    ];
    var ei;
    for (ei = 0; ei < escortCount; ei++) {
      var mon = randomBalanceMonster(escortPool);
      var baseHp = Math.max(1, parseInt(mon && mon.hp, 10) || 1);
      var scaled = Math.max(1, Math.round(baseHp * monsterHpMultiplierForProgress()));
      list.push({
        id: "dragE" + ei,
        name: mon.name,
        hp: scaled,
        maxHp: scaled,
        dmg: monsterAttackFromBalance(mon),
        level: (mon && mon.level) || 1,
      });
    }
    return {
      kind: "dragon_school",
      label: dragonName + " with escort",
      foes: list,
    };
  }

  function shouldTriggerDragonSchoolEncounter() {
    if (DRAGON_TEST_MODE || (state && state.forceDragonEncounter)) return true;
    if (!isLastLegToNewIsil()) return false;
    return dragonEncounterRollWins();
  }

  function queueDragonSchoolEncounter(cutawayTitle, cutawaySub) {
    queueEncounterCutaway(
      cutawayTitle || "Wings on the wind",
      cutawaySub || "A dragon descends with lesser beasts at its heels",
      function () {
        startTacticalCombat(buildDragonSchoolEncounter());
        if (state) state.forceDragonEncounter = false;
      }
    );
  }

  // Level gating per the design rules:
  // - Road, origin in {cantebury, gustaf}: only L1/L2 (you are still approaching Hollow Banks).
  // - Road, origin in {hollow_banks, solem}: 5% chance for L3 to join the L1/L2 pool.
  // - Ruins: L1/L2 by default; high atk / L3 foes only on the last westward leg to New Isil.
  // - Abandoned towns/villages in ruins: bandits + occasional imps.
  function allowedLevelsForRoadEncounter() {
    var origin = (state && state.travelOrigin) || "cantebury";
    if (origin === "hollow_banks" || origin === "solem") {
      if (Math.random() < 0.05) return [1, 2, 3];
    }
    return [1, 2];
  }

  function allowedLevelsForRuinsEncounter() {
    if (isLastLegToNewIsil()) return [1, 2, 3];
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
    var pool;
    if (sourceKind === "ruins") {
      pool = ruinsMonsterPool(allowed);
    } else {
      pool = BALANCE_MONSTERS.filter(function (m) {
        var lvl = (m && m.level) || 1;
        return allowed.indexOf(lvl) >= 0;
      });
      if (!pool.length) pool = BALANCE_MONSTERS.slice();
    }
    var archetype = sourceKind === "ruins" ? pickRuinsMonster(pool) : randomBalanceMonster(pool);
    var wolfPack =
      sourceKind === "ruins"
        ? currentRuinsSiteType() !== "abandoned_town" && isWolfMonsterName(archetype && archetype.name)
        : isWolfMonsterName(archetype && archetype.name);
    var n = wolfPack ? rollInt(3, 6) : rollInt(1, 4);
    if (hasBlessing("ward")) n = Math.max(wolfPack ? 3 : 1, n - 1);
    var wolfPool = pool.filter(function (m) {
      return isWolfMonsterName(m && m.name);
    });
    if (!wolfPool.length) wolfPool = [archetype];
    var list = [];
    for (var i = 0; i < n; i++) {
      var mon =
        wolfPack
          ? randomBalanceMonster(wolfPool)
          : sourceKind === "ruins"
            ? pickRuinsMonster(pool)
            : randomBalanceMonster(pool);
      var baseMonsterHp = Math.max(1, parseInt(mon && mon.hp, 10) || 1);
      var scaledMonsterHp = Math.max(1, Math.round(baseMonsterHp * monsterHpMultiplierForProgress()));
      list.push({
        id: "m" + i,
        name: mon.name,
        hp: scaledMonsterHp,
        maxHp: scaledMonsterHp,
        dmg: monsterAttackFromBalance(mon),
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
    refillPartyApForCombat();
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

  function findCombatFoeById(foeId) {
    if (!state.combat || !foeId) return null;
    var foes = state.combat.foes;
    for (var i = 0; i < foes.length; i++) {
      if (foes[i].id === foeId && foes[i].hp > 0) return foes[i];
    }
    return null;
  }

  function lowestHpFoe() {
    var foes = foesAlive();
    if (!foes.length) return null;
    var low = foes[0];
    for (var i = 1; i < foes.length; i++) {
      if (foes[i].hp < low.hp) low = foes[i];
    }
    return low;
  }

  function randomFoe() {
    var a = foesAlive();
    if (!a.length) return null;
    return a[rollInt(0, a.length - 1)];
  }

  function allFoesDefeated() {
    if (!state.combat || !state.combat.foes || !state.combat.foes.length) return true;
    for (var i = 0; i < state.combat.foes.length; i++) {
      if ((state.combat.foes[i].hp || 0) > 0) return false;
    }
    return true;
  }

  function syncCombatTargetsBeforeCommit() {
    if (!state.combat) return;
    var fallback = lowestHpFoe();
    if (!fallback) return;
    var team = combatTeam();
    var i, mid, rec, mem, patched;
    for (i = 0; i < team.length; i++) {
      mid = team[i].id;
      mem = teamMemberById(mid);
      if (!mem || mem.hp <= 0) continue;
      rec = choiceForMember(mid);
      if (!rec || !rec.action) continue;
      if (rec.action === "attack") {
        if (rec.targetId && findCombatFoeById(rec.targetId)) continue;
        state.combat.choices[mid] = { action: "attack", targetId: fallback.id };
        continue;
      }
      if (rec.action === "spell" && rec.spellKind && mem && spellNeedsFoeTarget(mem.role, rec.spellKind)) {
        if (rec.targetId && findCombatFoeById(rec.targetId)) continue;
        patched = { action: "spell", targetId: fallback.id, spellKind: rec.spellKind };
        state.combat.choices[mid] = patched;
      }
    }
  }

  function forceFillAllCombatChoices() {
    if (!state.combat) return;
    var foes = foesAlive();
    var team = combatTeam();
    var tgt = lowestHpFoe();
    var i, mid, mem;
    for (i = 0; i < team.length; i++) {
      mid = team[i].id;
      mem = teamMemberById(mid);
      if (!mem || mem.hp <= 0) continue;
      if (choiceComplete(mid)) continue;
      if (foes.length && tgt) {
        state.combat.choices[mid] = { action: "attack", targetId: tgt.id };
      } else {
        state.combat.choices[mid] = { action: "defend", targetId: null };
      }
    }
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
    return Math.max(1, d);
  }

  function intSpellBonus(member) {
    if (!member || !member.stats) return 0;
    var intel = member.stats.intelligence || 0;
    var excess = Math.max(0, intel - 4);
    var level = member.level || 1;
    var perPoint = level >= 10 ? 1 : 0.5;
    var bonus = Math.max(0, Math.floor(excess * perPoint));
    if (member.role === "priest") {
      return Math.min(bonus, level >= 10 ? 5 : 4);
    }
    return bonus;
  }

  function spellDamage(member) {
    return Math.max(1, 1 + intSpellBonus(member));
  }

  function spellHealAmount(member) {
    return Math.max(2, 2 + intSpellBonus(member));
  }

  function memberLuckStat(member) {
    if (!member) return 0;
    initMemberProgress(member);
    var luck = (member.stats && member.stats.luck) || 0;
    ensureMemberEquipment(member);
    if (member.equipment) {
      var si;
      for (si = 0; si < EQUIPMENT_SLOTS.length; si++) {
        var luckDef = equipmentItemDef(member.equipment[EQUIPMENT_SLOTS[si]]);
        if (luckDef && luckDef.luckBonus) luck += luckDef.luckBonus;
      }
    }
    return luck;
  }

  function critChanceForMember(member) {
    return memberLuckStat(member) * CRIT_CHANCE_PER_LUCK;
  }

  function rollCombatDamage(member, baseDmg) {
    var dmg = Math.max(1, baseDmg);
    var crit = Math.random() < critChanceForMember(member);
    if (crit) dmg = Math.max(1, Math.round(dmg * CRIT_DAMAGE_MULTIPLIER));
    return { dmg: dmg, crit: crit };
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
    var bonusRolls = fromRuins ? Math.max(0, Math.floor(mercs * RUINS_LOOT_MULTIPLIER)) : 0;
    var rolls = fromRuins ? Math.max(1, Math.floor(3 * RUINS_LOOT_MULTIPLIER) + bonusRolls) : 1;
    for (var i = 0; i < rolls; i++) {
      if (Math.random() < (fromRuins ? 0.55 : 0.35)) grantWeaponGearDrop(fromRuins ? "Ruins find" : "Loot");
    }
  }

  function resolveRuinsSearchRewards() {
    var mult = lootMultiplier(state.party);
    var goldGain = roadGoldBonus(Math.floor(10 * mult * RUINS_LOOT_MULTIPLIER));
    var gemGain = Math.floor(10 * mult * RUINS_LOOT_MULTIPLIER);
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
        grantWeaponGearDrop(foes[i].name + " drop");
      }
    }
  }

  function applyMemberLevelUp(m, opts) {
    opts = opts || {};
    m.level = (m.level || 1) + 1;
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
    if (!opts.quiet) {
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
    return { statGains: sg, hpGain: hpGain, mpGain: mpGain };
  }

  function simulateMemberToLevel(member, targetLevel) {
    initMemberProgress(member);
    targetLevel = Math.max(1, Math.min(MAX_LEVEL, targetLevel | 0));
    while ((member.level || 1) < targetLevel) {
      applyMemberLevelUp(member, { quiet: true });
    }
    member.xp = 0;
    member.hp = member.maxHp;
    member.mp = member.maxMp;
    return member;
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
        applyMemberLevelUp(m);
      }
    }
    if (gained) logLine("XP +" + amount + " awarded to active party (" + gained + " member(s)).", "good");
  }

  function fleeEncounter() {
    var defenseWave = state.combat && state.combat.kind === "quest_defense_wave";
    if (state.food > 0) state.food--;
    logLine("You flee, losing supplies.", "bad");
    state.encounterChance = ENCOUNTER_BASE;
    state.combat = null;
    state.pendingEncounter = null;
    state.transition = null;
    if (defenseWave && state.quest && state.quest.defense) {
      state.phase = "quest_defense";
      logLine("You fall back to the palisade — the raiders will surge again after a short breather.", "bad");
      beginGarrisonDefenseBreak(false);
      return;
    }
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

  function ensureSettledCompanions() {
    if (!state.settledCompanions) state.settledCompanions = [];
    if (state.newIsilSettlers && state.newIsilSettlers.length) {
      var legacy = state.newIsilSettlers;
      var li;
      for (li = 0; li < legacy.length; li++) {
        var legacySettler = legacy[li];
        if (!legacySettler.settledTown) legacySettler.settledTown = "new_isil";
        normalizeSettlerRecord(legacySettler);
        state.settledCompanions.push(legacySettler);
      }
      state.newIsilSettlers = [];
    }
  }

  function normalizeSettlerRecord(settler) {
    if (!settler) return settler;
    if (!settler.settledTown) settler.settledTown = "new_isil";
    if (typeof settler.settledOnDay !== "number") settler.settledOnDay = 0;
    if (typeof settler.rejoinEligibleOnDay !== "number") {
      settler.rejoinEligibleOnDay = settler.settledOnDay + SETTLER_REJOIN_COOLDOWN_DAYS;
    }
    if (settler.canRejoin === false && !settler.rejoined) settler.rejoined = true;
    if (settler.rejoined) settler.canRejoin = false;
    return settler;
  }

  function settlerRejoinDaysRemaining(settler) {
    normalizeSettlerRecord(settler);
    return Math.max(0, settler.rejoinEligibleOnDay - (state.totalDaysElapsed || 0));
  }

  function settlerCanRejoin(settler) {
    if (!settler || settler.rejoined) return false;
    normalizeSettlerRecord(settler);
    return (state.totalDaysElapsed || 0) >= settler.rejoinEligibleOnDay;
  }

  function settlersAtTown(townKey, includeRejoined) {
    ensureSettledCompanions();
    return state.settledCompanions.filter(function (s) {
      if (!s || s.settledTown !== townKey) return false;
      return includeRejoined ? true : !s.rejoined;
    });
  }

  function newIsilSettlerCount() {
    return settlersAtTown("new_isil", false).length;
  }


  var REMOTE_SETTLEMENT_TOWNS = (BALANCE_DATA && BALANCE_DATA.remoteSettlementTowns) || ["brookside", "glennhardt"];

  function colonyCfg() { return (BALANCE_DATA && BALANCE_DATA.newIsilColony) || {}; }
  function colonyBuildingDefs() { return colonyCfg().buildings || {}; }
  function settlementSitesCfg() { return colonyCfg().settlementSites || {}; }
  function settlementSiteDef(siteKey) {
    var key = siteKey || state.settlementSite;
    return settlementSitesCfg()[key] || {};
  }
  function needsSettlementSiteChoice() { return !state.settlementSite; }
  function settlementSiteLabel(siteKey) {
    var def = settlementSiteDef(siteKey);
    if (def.label) return def.label;
    if (siteKey === "coastal") return "Coastal cove";
    if (siteKey === "inland") return "Inland valley";
    if (siteKey === "mountain") return "Mountain pass";
    return "Unknown";
  }
  function settlementSiteChoiceButtonLabel(siteKey) {
    var def = settlementSiteDef(siteKey);
    if (def.choiceButton) return def.choiceButton;
    if (siteKey === "coastal") return "Commit to the coast";
    if (siteKey === "inland") return "Commit to the valley";
    if (siteKey === "mountain") return "Commit to the mountains";
    return "Commit to this site";
  }
  function isValidSettlementSiteKey(siteKey) {
    return !!(siteKey && settlementSitesCfg()[siteKey]);
  }
  function migrateColonyBuildingKeys(colony) {
    if (!colony || !colony.buildings) return;
    if (colony.buildings.docks !== undefined && colony.buildings.gateway === undefined) {
      colony.buildings.gateway = colony.buildings.docks;
      delete colony.buildings.docks;
    }
    if (colony.tier === "harbor") colony.tier = "city";
  }
  function defaultNewIsilColony() {
    var buildings = {}, defs = colonyBuildingDefs(), keys = Object.keys(defs), i;
    for (i = 0; i < keys.length; i++) buildings[keys[i]] = 0;
    return {
      population: NEW_ISIL_BASE_POPULATION, points: 0, tier: "camp", buildings: buildings,
      deliveredCivilians: 0, lastTickDay: 0, colonyLog: [], ralliedThisVisit: false,
    };
  }
  function ensureNewIsilColony() {
    if (!state.newIsilColony || typeof state.newIsilColony !== "object") state.newIsilColony = defaultNewIsilColony();
    var colony = state.newIsilColony;
    if (!colony.buildings) colony.buildings = defaultNewIsilColony().buildings;
    var dk = Object.keys(colonyBuildingDefs()), di;
    for (di = 0; di < dk.length; di++) if (typeof colony.buildings[dk[di]] !== "number") colony.buildings[dk[di]] = 0;
    if (typeof colony.population !== "number") colony.population = NEW_ISIL_BASE_POPULATION;
    if (typeof colony.points !== "number") colony.points = 0;
    if (!colony.tier) colony.tier = "camp";
    if (typeof colony.deliveredCivilians !== "number") colony.deliveredCivilians = 0;
    if (!Array.isArray(colony.colonyLog)) colony.colonyLog = [];
    if (typeof colony.ralliedThisVisit !== "boolean") {
      colony.ralliedThisVisit = !!colony.sparkedThisVisit;
      delete colony.sparkedThisVisit;
    }
    migrateColonyBuildingKeys(colony);
    return colony;
  }
  function settlerRoleBuildingKey(role) {
    var defs = colonyBuildingDefs(), keys = Object.keys(defs), i;
    for (i = 0; i < keys.length; i++) if (defs[keys[i]].roleBoost === role) return keys[i];
    return "fields";
  }
  function colonyMaxBuildingLevel() { return colonyCfg().maxBuildingLevel || 3; }
  function buildingDisplayLevel(progress) {
    return Math.min(colonyMaxBuildingLevel(), Math.floor(progress || 0));
  }
  function syncNewIsilGrowthFromColony() {
    ensureNewIsilColony();
    if (!state.newIsilGrowth) state.newIsilGrowth = { population: NEW_ISIL_BASE_POPULATION };
    state.newIsilGrowth.population = Math.max(NEW_ISIL_BASE_POPULATION, Math.round(state.newIsilColony.population));
  }
  function recomputeColonyPopulationFloor() {
    ensureNewIsilColony();
    var c = state.newIsilColony;
    var floor = NEW_ISIL_BASE_POPULATION + newIsilSettlerCount() + Math.floor((c.deliveredCivilians || 0) * 0.35);
    if (c.population < floor) c.population = floor;
  }
  function colonyTierDefs() {
    return colonyCfg().tiers || [
      { id: "camp", label: "Settlement camp", minPoints: 0 },
      { id: "hamlet", label: "Hamlet", minPoints: 45 },
      { id: "town", label: "Town", minPoints: 110 },
      { id: "city", label: "City", minPoints: 220 },
    ];
  }
  function recomputeColonyTier() {
    ensureNewIsilColony();
    var tiers = colonyTierDefs().slice().sort(function (a, b) { return (a.minPoints || 0) - (b.minPoints || 0); });
    var pts = state.newIsilColony.points || 0, tier = tiers[0] ? tiers[0].id : "camp", i;
    for (i = 0; i < tiers.length; i++) if (pts >= (tiers[i].minPoints || 0)) tier = tiers[i].id;
    if (tier === "harbor") tier = "city";
    state.newIsilColony.tier = tier;
  }
  function colonyTierLabel(tierId) {
    var site = settlementSiteDef(), custom = site.tierLabels && site.tierLabels[tierId];
    if (custom) return custom;
    var tiers = colonyTierDefs(), i;
    for (i = 0; i < tiers.length; i++) if (tiers[i].id === tierId) return tiers[i].label || tierId;
    return tierId || "Settlement camp";
  }
  function buildingDefForSite(buildingKey) {
    var base = colonyBuildingDefs()[buildingKey] || {}, site = settlementSiteDef();
    return {
      label: (site.buildingLabels && site.buildingLabels[buildingKey]) || base.label || buildingKey,
      blurb: (site.buildingBlurbs && site.buildingBlurbs[buildingKey]) || base.blurb || "",
      roleBoost: base.roleBoost, rallyGoldCost: base.rallyGoldCost || base.sparkGoldCost || 25,
    };
  }
  function pushColonyLog(message) {
    ensureNewIsilColony();
    if (!message) return;
    state.newIsilColony.colonyLog.unshift({ day: state.totalDaysElapsed || 0, text: message });
    if (state.newIsilColony.colonyLog.length > 12) state.newIsilColony.colonyLog.length = 12;
  }
  function colonyIsActive() {
    return !!(state.settlementSite && (state.caravanDeliveredToNewIsil || newIsilSettlerCount() > 0));
  }
  function syncNewIsilPopulation() {
    ensureNewIsilColony();
    syncNewIsilGrowthFromColony();
    recomputeColonyPopulationFloor();
  }
  function tickNewIsilColonyDay() {
    if (!colonyIsActive()) return;
    ensureNewIsilColony();
    var colony = state.newIsilColony, passive = colonyCfg().passive || {};
    var settlers = settlersAtTown("new_isil", false), nSettlers = settlers.length;
    var delivered = colony.deliveredCivilians || 0;
    var popGain = (passive.populationPerDayBase || 0.04) + nSettlers * (passive.populationPerSettlerPerDay || 0.22) + delivered * (passive.populationPerDeliveredCivilianPerDay || 0.04);
    colony.population = (colony.population || NEW_ISIL_BASE_POPULATION) + popGain;
    var ptGain = nSettlers * (passive.pointsPerSettlerPerDay || 0.18) + Math.round(colony.population) * (passive.pointsPerPopulationPerDay || 0.025);
    colony.points = (colony.points || 0) + ptGain;
    var bStep = (passive.buildingProgressPerDayPerSettler || 0.06), maxL = colonyMaxBuildingLevel(), si;
    for (si = 0; si < settlers.length; si++) {
      var bKey = settlerRoleBuildingKey(settlers[si].role);
      if (typeof colony.buildings[bKey] === "number") colony.buildings[bKey] = Math.min(maxL, colony.buildings[bKey] + bStep);
    }
    colony.lastTickDay = state.totalDaysElapsed || 0;
    recomputeColonyPopulationFloor();
    syncNewIsilGrowthFromColony();
    recomputeColonyTier();
  }
  function remoteOutpostPoints(townKey) {
    var cfg = colonyCfg().remoteOutpost || {}, settlers = settlersAtTown(townKey, false);
    var pts = settlers.length * (cfg.pointsPerSettler || 14), i, roleBonus = cfg.roleBonus || {};
    for (i = 0; i < settlers.length; i++) pts += roleBonus[settlers[i].role] || 0;
    return pts;
  }
  function totalRemoteOutpostPoints() {
    var total = 0, i;
    for (i = 0; i < REMOTE_SETTLEMENT_TOWNS.length; i++) total += remoteOutpostPoints(REMOTE_SETTLEMENT_TOWNS[i]);
    return total;
  }
  function totalRealmSettlementPoints() {
    ensureNewIsilColony();
    return Math.round((state.newIsilColony.points || 0) + totalRemoteOutpostPoints());
  }
  function settlementVistaHtml() {
    if (!state.settlementSite) return '<p class="hint">The founding site is chosen when you first reach the end of the trail.</p>';
    ensureNewIsilColony(); recomputeColonyTier();
    var colony = state.newIsilColony, tier = colony.tier || "camp", site = state.settlementSite;
    var keys = Object.keys(colonyBuildingDefs()), structures = "", ki, lv, bdef;
    for (ki = 0; ki < keys.length; ki++) {
      lv = buildingDisplayLevel(colony.buildings[keys[ki]] || 0);
      if (lv <= 0) continue;
      bdef = buildingDefForSite(keys[ki]);
      structures += '<div class="vista-bld vista-bld--' + escapeHtml(keys[ki]) + ' vista-bld--lv' + lv + '" title="' + escapeHtml(bdef.label + " (Lv " + lv + ")") + '"></div>';
    }
    return '<div class="settlement-vista settlement-vista--' + escapeHtml(site) + ' settlement-vista--tier-' + escapeHtml(tier) + '"><div class="vista-sky"></div><div class="vista-ground"></div><div class="vista-structures">' + structures + '</div><p class="vista-caption">' + escapeHtml(colonyTierLabel(tier)) + ' · ~' + Math.round(colony.population || NEW_ISIL_BASE_POPULATION) + ' souls</p></div>';
  }
  function rallyProjectPitch(buildingKey) {
    var site = settlementSiteDef(), pitches = site.buildingRallyPitch || {};
    if (pitches[buildingKey]) return pitches[buildingKey];
    var def = buildingDefForSite(buildingKey);
    return "Fund the " + def.label.toLowerCase() + " — " + (def.blurb || "settlers await caravan gold.");
  }
  function rallyProjectOptions() {
    ensureNewIsilColony();
    var colony = state.newIsilColony, maxL = colonyMaxBuildingLevel(), keys = Object.keys(colonyBuildingDefs());
    var eligible = [], i;
    for (i = 0; i < keys.length; i++) if ((colony.buildings[keys[i]] || 0) < maxL) eligible.push(keys[i]);
    for (i = eligible.length - 1; i > 0; i--) { var r = rollInt(0, i), t = eligible[i]; eligible[i] = eligible[r]; eligible[r] = t; }
    return eligible.slice(0, 3);
  }
  function rallyProjectCardsHtml() {
    if (!state.settlementSite) return "";
    ensureNewIsilColony();
    var colony = state.newIsilColony;
    if (colony.ralliedThisVisit) return '<p class="hint">You rallied the settlers this visit. They keep building while you march.</p>';
    var options = rallyProjectOptions();
    if (!options.length) return '<p class="hint">Every district is built out — passive growth continues on the road.</p>';
    var cards = options.map(function (key) {
      var def = buildingDefForSite(key), cost = def.rallyGoldCost || 25, pitch = rallyProjectPitch(key);
      var lv = buildingDisplayLevel(colony.buildings[key] || 0);
      return '<button type="button" class="rally-project-card"' + ((state.gold || 0) >= cost ? "" : " disabled") + ' data-rally-project="' + key + '"><span class="rally-project-title">' + escapeHtml(def.label) + (lv > 0 ? ' <span class="hint">Lv ' + lv + '</span>' : '') + '</span><span class="rally-project-pitch">' + escapeHtml(pitch) + '</span><span class="rally-project-cost">' + cost + ' gp from the caravan chest</span></button>';
    }).join("");
    return '<h3 class="roster-heading">Rally the settlers</h3><p class="town-lead">Choose <b>one</b> project to fund before you march again. Companions left behind and days on the road do the rest.</p><div class="rally-project-cards">' + cards + '</div>';
  }
  function chooseRallyProject(buildingKey) {
    if (state.phase !== "settlement" || state.settlementTown !== "new_isil") return false;
    ensureNewIsilColony();
    var colony = state.newIsilColony;
    if (colony.ralliedThisVisit) { logLine("You already rallied the settlers this visit.", "bad"); render(); return false; }
    var def = buildingDefForSite(buildingKey), maxL = colonyMaxBuildingLevel();
    if ((colony.buildings[buildingKey] || 0) >= maxL) { logLine(def.label + " is fully built for now.", "bad"); render(); return false; }
    var cost = Math.max(1, Math.round(def.rallyGoldCost || 25));
    if ((state.gold || 0) < cost) { logLine("Need " + cost + " gold to rally " + def.label + ".", "bad"); render(); return false; }
    state.gold -= cost;
    colony.ralliedThisVisit = true;
    var rally = colonyCfg().rally || colonyCfg().spark || {};
    colony.buildings[buildingKey] = Math.min(maxL, (colony.buildings[buildingKey] || 0) + (rally.progressBoost || 0.45));
    colony.points = (colony.points || 0) + (rally.pointsBonus || 10);
    pushColonyLog("Rally: " + def.label + " (day " + (state.totalDaysElapsed || 0) + ").");
    recomputeColonyTier(); syncNewIsilGrowthFromColony();
    logLine('<span class="hi">Settlers rallied:</span> ' + escapeHtml(rallyProjectPitch(buildingKey)) + " (" + cost + " gp).", "good");
    render(); return true;
  }
  function colonyEpilogueHtml() {
    ensureNewIsilColony();
    var colony = state.newIsilColony, realmPts = totalRealmSettlementPoints(), tier = colonyTierLabel(colony.tier);
    var siteName = state.settlementSite ? settlementSiteLabel() : "New Isil", body;
    if (realmPts >= 220) body = siteName + " stands as a <b>" + escapeHtml(tier) + "</b> — ward-lamps bright enough to guide the next caravan home.";
    else if (realmPts >= 110) body = "What began as a camp is now a <b>" + escapeHtml(tier) + "</b>. Timber gives way to masonry.";
    else if (realmPts >= 45) body = "A stubborn <b>" + escapeHtml(tier) + "</b> clings to the land you chose.";
    else if (realmPts > 0) body = siteName + " remains a <b>" + escapeHtml(tier) + "</b> — tents, hearths, and hope.";
    else body = "The trail ends, but your march left little stone behind.";
    return '<div class="colony-epilogue"><h3 class="roster-heading">Epilogue — what you built</h3><p>' + body + '</p><p class="hint">Settlement score: <b>' + Math.round(colony.points || 0) + '</b> · Realm total: <b>' + realmPts + '</b> · Population ~<b>' + Math.round(colony.population || NEW_ISIL_BASE_POPULATION) + '</b>.</p></div>';
  }
  function newIsilColonyPanelHtml() {
    ensureNewIsilColony(); syncNewIsilGrowthFromColony(); recomputeColonyTier();
    var colony = state.newIsilColony, tier = colonyTierLabel(colony.tier), settlers = settlersAtTown("new_isil", false);
    var siteLine = state.settlementSite ? '<span class="hint">Founding site: <b>' + escapeHtml(settlementSiteLabel()) + '</b> (locked for this campaign)</span>' : "";
    var settlerHtml = settlers.length === 0 ? '<p class="hint">No companions settled here yet.</p>' : '<ul>' + settlers.map(function (s) {
      return '<li><b>' + escapeHtml(s.name) + '</b> (' + roleLabel(s.role) + ') → ' + escapeHtml(buildingDefForSite(settlerRoleBuildingKey(s.role)).label) + '</li>';
    }).join("") + '</ul>';
    return '<p class="town-lead">While you march, the settlement <b>grows on its own</b>. Each visit, rally the settlers behind <b>one</b> project.</p>' + siteLine + '<div class="colony-summary"><span class="colony-tier-badge">' + escapeHtml(tier) + '</span><span>Population ~<b>' + Math.round(colony.population || NEW_ISIL_BASE_POPULATION) + '</b></span><span>Score <b>' + Math.round(colony.points || 0) + '</b></span></div><h3 class="roster-heading">The settlement</h3>' + settlementVistaHtml() + rallyProjectCardsHtml() + '<h3 class="roster-heading">Settlers at work</h3>' + settlerHtml;
  }
  function wireNewIsilColonyPanel(root) {
    if (!root) return;
    var btns = root.querySelectorAll("[data-rally-project]"), i;
    for (i = 0; i < btns.length; i++) btns[i].onclick = (function (btn) {
      return function () { chooseRallyProject(btn.getAttribute("data-rally-project")); };
    })(btns[i]);
  }
  function isPresetLeaderCampaign() {
    return !!(state.leaderProfile && state.leaderProfile.source === "preset");
  }

  function logPresetValeArcCompletion() {
    if (!isPresetLeaderCampaign()) return;
    logLine(
      '<span class="hi">Captain Vale\'s march is complete.</span> Every companion who crossed the Illirial Trail roots here at <b>' +
        settlementSiteLabel(state.settlementSite) +
        "</b>. The fighting line disbands; Cantebury will raise a new leader for the road west.",
      "good"
    );
    trackPlaytest("preset_vale_arc_completed", {
      day: state.totalDaysElapsed || 0,
      site: state.settlementSite || "",
      partySize: livingPartyMembers().length,
    });
  }

  function settlementSiteChoiceHtml() {
    var sites = settlementSitesCfg(), keys = Object.keys(sites), cards = "", i, def, key;
    for (i = 0; i < keys.length; i++) {
      key = keys[i];
      def = sites[key] || {};
      cards +=
        '<div class="settlement-choice-card"><h3>' +
        escapeHtml(def.choiceTitle || def.label || key) +
        '</h3><p>' +
        escapeHtml(def.choiceLead || "") +
        '</p><button type="button" class="primary" data-settlement-site="' +
        escapeHtml(key) +
        '">' +
        escapeHtml(settlementSiteChoiceButtonLabel(key)) +
        "</button></div>";
    }
    var presetNote = isPresetLeaderCampaign()
      ? '<p class="hint"><b>Captain Vale\'s caravan:</b> choose where New Isil roots, then visit the <b>Depart</b> tab to settle the full fighting line and complete her arc.</p>'
      : "";
    return (
      '<div class="settlement-site-choice">' +
      presetNote +
      '<p class="scene-lead"><span class="hi">We reached the end!</span></p>' +
      "<p>The valley, the coast, and the high pass all beckon — choose where generations will root.</p>" +
      '<div class="settlement-choice-cards">' +
      cards +
      '</div><p class="hint">This choice locks for the entire campaign.</p></div>'
    );
  }
  function chooseSettlementSite(siteKey) {
    if (!isValidSettlementSiteKey(siteKey)) return;
    state.settlementSite = siteKey; state.phase = "settlement"; state.settlementTown = "new_isil";
    deliverCaravanToNewIsil(); syncNewIsilPopulation(); ensureNewIsilColony();
    state.newIsilColony.ralliedThisVisit = false; state.settlementView = "colony";
    logLine('<span class="hi">Generations hence:</span> the caravan founds <b>' + settlementSiteLabel(siteKey) + '</b>.', "good");
    pushColonyLog("Founding: " + settlementSiteLabel(siteKey) + ".");
    if (isPresetLeaderCampaign()) {
      logLine('<span class="hi">Captain Vale</span> remains in command — rally the colony, then settle everyone on the <b>Depart</b> tab when ready.', 'hi');
    }
    render();
  }
  function wireSettlementSiteChoice(root) {
    if (!root) return;
    var btns = root.querySelectorAll("[data-settlement-site]"), i;
    for (i = 0; i < btns.length; i++) btns[i].onclick = (function (btn) {
      return function () { chooseSettlementSite(btn.getAttribute("data-settlement-site")); };
    })(btns[i]);
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
    if (state.phase === "settlement" && state.settlementTown === "new_isil" && livingPartyMembers().length > 0) {
      if (!state.stabilityTargetNotedAtNewIsil) {
        state.stabilityTargetNotedAtNewIsil = true;
        logLine(
          "<span class=\"hi\">Stability target reached</span> (journey day " +
            target +
            "). Settle your entire fighting line in New Isil to send a <b>fresh caravan</b> from Cantebury, or march eastbound with survivors.",
          "good"
        );
      }
    }
    return false;
  }

  function canteburyShouldAssignCivilianTrain() {
    if ((state.caravanLoops || 0) > 0) return true;
    if (state.loopLeaderSetup) return true;
    if (newIsilSettlerCount() > 0) return true;
    if (state.caravanDeliveredToNewIsil) return true;
    return false;
  }

  function deliverCaravanToNewIsil() {
    ensureCaravanState();
    state.caravanDeliveredToNewIsil = true;
    if (!state.caravan || state.caravan.total <= 0) return;
    var count = state.caravan.total;
    ensureNewIsilColony();
    state.newIsilColony.deliveredCivilians = (state.newIsilColony.deliveredCivilians || 0) + count;
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
    if (!canteburyShouldAssignCivilianTrain()) return;
    ensureCaravanState();
    if (state.caravan.total > 0) return;
    var n = rollInt(1, 15);
    state.caravan = rollNewCaravanFollowers(n);
    state.caravanDeliveredToNewIsil = true;
    queueChancellorCaravanGrant(n);
    logLine(
      "<span class=\"hi\">Cantebury:</span> the crown assigns <b>" +
        n +
        "</b> new civilians to your next westward march (" +
        caravanFollowersSummary() +
        "). Chancellor Venn holds travel stipends at the keep (" +
        CHANCELLOR_GP_PER_CARAVAN_CIVILIAN +
        " gp per civilian).",
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
      "<span class=\"hi\">Cantebury:</span> the fighting line returns from New Isil (loop " +
        state.caravanLoops +
        ") — <b>no civilian train</b> on the eastbound road. Settlers abroad: " +
        newIsilSettlerCount() +
        ". Cantebury will assign civilians when you march west again.",
      "good"
    );
    state.transition = { kind: "arrive", label: "Cantebury" };
    render();
    scheduleTransition(function () {
      state.transition = null;
      render();
    }, ARRIVE_CITY_MS);
  }

  function settleMemberAtTown(member, townKey) {
    if (townKey !== "new_isil") return false;
    if (!member || member.hp <= 0 || member.permadead) return false;
    ensureMemberEquipment(member);
    var slot;
    for (var s = 0; s < EQUIPMENT_SLOTS.length; s++) {
      slot = EQUIPMENT_SLOTS[s];
      if (member.equipment[slot]) addToGearStash(member.equipment[slot]);
      member.equipment[slot] = null;
    }
    stashMemberExoticWeapon(member);
    ensureSettledCompanions();
    var settledDay = state.totalDaysElapsed || 0;
    var town = destinationForKey(townKey || "new_isil");
    state.settledCompanions.push({
      id: member.id,
      name: member.name,
      role: member.role,
      settledOnDay: settledDay,
      settledTown: town.key,
      rejoinEligibleOnDay: settledDay + SETTLER_REJOIN_COOLDOWN_DAYS,
      rejoined: false,
      loop: state.caravanLoops || 0,
      stats: cloneStats(member.stats || baseStatsForRole(member.role)),
      bonus: member.bonus ? cloneStats(member.bonus) : null,
      headshot: member.headshot || "",
      gender: member.gender || "",
    });
    state.party = state.party.filter(function (m) {
      return m && m.id !== member.id;
    });
    syncNewIsilPopulation();
    logLine(
      member.name +
        " settles in " +
        town.label +
        ". They may rejoin the caravan after one year on the road (journey day " +
        (settledDay + SETTLER_REJOIN_COOLDOWN_DAYS) +
        ").",
      "good"
    );
    return true;
  }

  function settleMemberIntoNewIsil(member) {
    return settleMemberAtTown(member, "new_isil");
  }

  function livingPartyMembers() {
    return state.party.filter(function (m) {
      return m && m.hp > 0 && !m.permadead;
    });
  }
  function partyFallenMembers() {
    return state.party.filter(function (m) {
      return m && m.hp <= 0 && !m.permadead;
    });
  }

  function clearFallenDeathClock(m) {
    if (!m) return;
    m.deadSinceDay = undefined;
    m.deadSinceJourneyDay = undefined;
    clearMemberDeathSnapshot(m);
  }

  function ensureFallenJourneyClock(m) {
    if (!m || m.hp > 0) return;
    if (typeof m.deadSinceJourneyDay === "number") return;
    if (typeof m.diedJourneyDays === "number") {
      m.deadSinceJourneyDay = m.diedJourneyDays;
      return;
    }
    var journey = state.totalDaysElapsed || 0;
    m.deadSinceJourneyDay = journey;
    snapshotMemberDeathContext(m);
  }

  function fallenJourneyDaysDead(m) {
    ensureFallenJourneyClock(m);
    if (typeof m.deadSinceJourneyDay !== "number") return 0;
    return Math.max(0, (state.totalDaysElapsed || 0) - m.deadSinceJourneyDay);
  }

  function carryingFallenHomeFromAdventure() {
    if (!state.adventure) return false;
    if (partyAlive().length > 0) return false;
    return partyFallenMembers().length > 0;
  }

  function adventureReturnDaysLeft() {
    if (!state.adventure || state.adventure.dir !== "back") return 0;
    var left =
      state.adventure.returnDaysRemaining != null
        ? state.adventure.returnDaysRemaining
        : state.adventure.returnDays || 0;
    return Math.max(0, left);
  }

  function clearAdventureBlockers() {
    clearTransitionTimers();
    state.transition = null;
    state.confirmDialog = null;
    state.postBattleDialog = null;
    state.elaraDialog = null;
    state.campDialog = null;
    state.combat = null;
    state.pendingEncounter = null;
  }

  function maybeCompleteAdventureReturn() {
    if (!state.adventure || state.adventure.dir !== "back") return false;
    if (adventureReturnDaysLeft() > 0) return false;
    endAdventureBackInTown();
    return true;
  }

  function ensureAdventureReturnReady() {
    if (!state.adventure || state.adventure.dir !== "out") return false;
    if (!carryingFallenHomeFromAdventure()) return false;
    var daysOut = state.adventure.daysOut || 0;
    state.adventure.dir = "back";
    state.adventure.returnDays = daysOut;
    state.adventure.returnDaysRemaining = daysOut;
    if (daysOut <= 0) {
      endAdventureBackInTown();
      return true;
    }
    logLine(
      "Every fighter is down. The caravan binds the wounded and turns toward <span class=\"hi\">" +
        locationLabel(state.adventure.town) +
        "</span> — <b>" +
        daysOut +
        "</b> day(s) on the road. Reach the chapel in time (25 gp each).",
      "hi"
    );
    return false;
  }

  function retreatAdventureCombatToTown() {
    if (!state.adventure) return;
    clearAdventureBlockers();
    state.encounterChance = ENCOUNTER_BASE;
    executeAdventureReturn();
  }

  function transitionToCanteburyAfterFullSettlement() {
    clearTransitionTimers();
    syncNewIsilPopulation();
    trackPlaytest("caravan_loop_settled", {
      day: state.totalDaysElapsed || 0,
      caravanLoop: (state.caravanLoops || 0) + 1,
      settlers: newIsilSettlerCount(),
    });
    state.caravanLoops = (state.caravanLoops || 0) + 1;
    state.party = [];
    state.partyIdSeq = 0;
    state.leaderProfile = null;
    state.newLeaderDraft = null;
    state.guest = null;
    state.onReturnMarch = false;
    state.settlementTown = null;
    state.settlementView = "church";
    state.combat = null;
    state.pendingEncounter = null;
    state.adventure = null;
    state.quest = null;
    state.npcDialog = null;
    state.finalBossCleared = false;
    resetTrailPathForWestwardMarch();
    state.travelOrigin = "cantebury";
    state.travelDestination = "gustaf";
    state.travelDay = 0;
    state.inventoryFocusId = null;
    state.inventoryHealTargetId = null;
    state.inventoryDetailOpen = false;
    state.travelInventoryOpen = false;
    var depotMoved = depositCaravanGearAtNewIsilDepot();
    state.caravanTreasury = snapshotCaravanTreasury();
    state.loopLeaderSetup = true;
    state.caravanDeliveredToNewIsil = true;
    ensureCaravanState();
    if (state.caravan.total > 0) {
      deliverCaravanToNewIsil();
    }
    state.kewKumberGrantDue = (state.kewKumberGrantDue || 0) + KEW_KUMBER_LOOP_GRANT_GP;
    state.stabilityTargetNotedAtNewIsil = false;
    internPendingHeadstones();
    logLine(
      "<span class=\"hi\">New Isil:</span> every companion has settled. Cantebury will send a new leader west — journey day " +
        (state.totalDaysElapsed || 0) +
        " / " +
        effectiveStabilityTarget() +
        " continues (loop " +
        state.caravanLoops +
        ").",
      "good"
    );
    if (depotMoved > 0) {
      logLine(
        "<span class=\"hi\">Colony locker:</span> " +
          newIsilDepotSummaryText() +
          " held at the harbor for the next caravan to retrieve.",
        "hi"
      );
    }
    state.phase = "new_game_setup";
    state.transition = { kind: "arrive", label: "Cantebury" };
    render();
    scheduleTransition(function () {
      state.transition = null;
      render();
    }, ARRIVE_CITY_MS);
  }

  function settleMemberAtTownId(memberId, townKey) {
    if (state.phase !== "settlement" || state.settlementTown !== "new_isil") return;
    if (townKey !== "new_isil") {
      logLine("Companions may only settle at <span class=\"hi\">New Isil</span>, the harbor at the end of the trail.", "bad");
      render();
      return;
    }
    var member = null;
    for (var i = 0; i < state.party.length; i++) {
      if (state.party[i] && state.party[i].id === memberId) member = state.party[i];
    }
    if (!member || member.hp <= 0 || member.permadead) {
      logLine("Only living companions can settle in New Isil.", "bad");
      render();
      return;
    }
    if (!settleMemberAtTown(member, townKey)) return;
    if (livingPartyMembers().length === 0) {
      logPresetValeArcCompletion();
      transitionToCanteburyAfterFullSettlement();
      return;
    }
    render();
  }

  function settleMemberAtNewIsil(memberId) {
    settleMemberAtTownId(memberId, "new_isil");
  }

  function settleAllPartyAtNewIsil() {
    if (state.phase !== "settlement" || state.settlementTown !== "new_isil") return;
    var living = livingPartyMembers().slice();
    if (!living.length) {
      logLine("No living companions remain to settle.", "bad");
      render();
      return;
    }
    logPresetValeArcCompletion();
    for (var i = 0; i < living.length; i++) {
      settleMemberIntoNewIsil(living[i]);
    }
    transitionToCanteburyAfterFullSettlement();
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
    ensureSettledCompanions();
    var settler = null;
    var i;
    for (i = 0; i < state.settledCompanions.length; i++) {
      if (state.settledCompanions[i].id === settlerId) settler = state.settledCompanions[i];
    }
    if (!settler || settler.rejoined) return;
    if (state.settlementTown !== settler.settledTown) {
      logLine(
        settler.name +
          " settled in " +
          destinationForKey(settler.settledTown).label +
          ". Visit that town to invite them back.",
        "bad"
      );
      render();
      return;
    }
    if (!settlerCanRejoin(settler)) {
      logLine(
        settler.name +
          " is still putting down roots — " +
          settlerRejoinDaysRemaining(settler) +
          " journey day(s) remain before they can rejoin (−25% stats).",
        "bad"
      );
      render();
      return;
    }
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
    settler.rejoined = true;
    settler.canRejoin = false;
    logLine(
      settler.name +
        " rejoins the march after their year away, bearing a permanent toll on body and nerve (−25% stats).",
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
    if (origin === "cantebury") {
      resetTrailPathForWestwardMarch();
      replenishCaravanAtCantebury();
    }
    recordWestboundForkChoice(origin, townKey);
    state.travelOrigin = origin;
    state.travelDestination = townKey;
    state.onReturnMarch = false;
    departIllirial();
  }

  function departEastboundTo(townKey) {
    if (state.phase !== "settlement") return;
    var origin = state.settlementTown;
    if (origin === "new_isil") deliverCaravanToNewIsil();
    var allowed = eastboundRevisitTargets(origin);
    if (allowed.indexOf(townKey) < 0) {
      logLine("The trail home is marched one leg at a time — no shortcuts across the route.", "bad");
      render();
      return;
    }
    state.onReturnMarch = true;
    state.travelOrigin = origin;
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
      if (needsSettlementSiteChoice()) {
        state.phase = "settlement_site_choice";
        state.settlementTown = "new_isil";
        logLine("<span class=\"hi\">We reached the end!</span> Choose where generations will root.", "hi");
      } else {
        ensureNewIsilColony();
        state.newIsilColony.ralliedThisVisit = false;
        state.settlementView = colonyIsActive() ? "colony" : "depart";
        if (checkCampaignVictoryAtNewIsil()) { render(); return; }
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
      if (newIsilDepotHasItems()) {
        logLine(
          "<span class=\"hi\">Colony locker:</span> prior caravan gear is stored here (" +
            newIsilDepotSummaryText() +
            "). Open the <b>Depart</b> tab to retrieve before marching east.",
          "hi"
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
    if (state.phase === "quest_defense") {
      render();
      return;
    }
    if (state.quest && state.quest.status === "active" && state.phase === "quest_trek") {
      queueResumeTravel();
      return;
    }
    if (state.adventure) {
      if (state.adventure.dir === "out" && state.adventure.daysOut >= state.adventure.maxDays) {
        state.adventure.dir = "back";
        state.adventure.returnDays = state.adventure.daysOut;
        state.adventure.returnDaysRemaining = state.adventure.daysOut;
        logLine(
          "You've used all 10 adventuring days. Heading back to " +
            locationLabel(state.adventure.town) +
            " (" +
            state.adventure.returnDays +
            " day(s) home, encounters each day).",
          "hi"
        );
      }
      if (maybeCompleteAdventureReturn()) return;
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
    if (k === "quest_defense_wave") {
      state.encounterChance = ENCOUNTER_BASE;
      state.combat = null;
      state.pendingEncounter = null;
      state.transition = null;
      if (state.quest && state.quest.defense) {
        state.quest.defense.roundCompleted = (state.quest.defense.roundCompleted || 0) + 1;
        var rc = state.quest.defense.roundCompleted;
        logLine("Wave " + rc + " repelled (" + rc + "/" + DEFENSE_WAVE_COUNT + ").", "good");
        if (rc >= DEFENSE_WAVE_COUNT || Date.now() >= state.quest.defense.timerEndsAt) {
          finishGarrisonDefense();
          return;
        }
        state.phase = "quest_defense";
        beginGarrisonDefenseBreak(false);
        return;
      }
      finishGarrisonDefense();
      return;
    }
    state.encounterChance = ENCOUNTER_BASE;
    state.combat = null;
    state.pendingEncounter = null;
    if (k === "ruins_combat" && state.ruinsRoomsRemaining > 0) {
      var ruinsUnit = ruinsUnitLabel(currentRuinsSiteType(), state.ruinsRoomsRemaining);
      logLine(
        ruinsSiteLabel(currentRuinsSiteType()) +
          " " +
          ruinsUnit +
          " cleared. " +
          state.ruinsRoomsRemaining +
          " " +
          ruinsUnitLabel(currentRuinsSiteType(), state.ruinsRoomsRemaining) +
          " remain.",
        "good"
      );
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
    if (state.adventure && partyAlive().length === 0 && partyFallenMembers().length > 0) {
      for (var ti = 0; ti < state.party.length; ti++) {
        var tm = state.party[ti];
        if (!tm || tm.hp > 0) continue;
        if (typeof tm.deadSinceJourneyDay !== "number") {
          tm.deadSinceJourneyDay = state.totalDaysElapsed || 0;
          snapshotMemberDeathContext(tm);
        }
      }
      state.combat = null;
      state.pendingEncounter = null;
      state.encounterChance = ENCOUNTER_BASE;
      var advTown = state.adventure.town;
      var daysOut = state.adventure.daysOut || 0;
      var retLeft =
        state.adventure.dir === "back"
          ? state.adventure.returnDaysRemaining != null
            ? state.adventure.returnDaysRemaining
            : state.adventure.returnDays || 0
          : daysOut;
      if (retLeft <= 0) {
        logLine(
          "The party is down, but porters drag the fallen back into " +
            locationLabel(advTown) +
            ". The permadeath clock is running — visit the chapel immediately (25 gp revival).",
          "hi"
        );
        endAdventureBackInTown();
        render();
        return;
      }
      if (state.adventure.dir !== "back") {
        state.adventure.dir = "back";
        state.adventure.returnDays = daysOut;
        state.adventure.returnDaysRemaining = daysOut;
      }
      logLine(
        "Every fighter is down. The caravan binds the wounded and turns toward <span class=\"hi\">" +
          locationLabel(advTown) +
          "</span> — <b>" +
          retLeft +
          "</b> day(s) on the road — the <b>2-day permadeath clock</b> is already ticking. Reach the chapel in time (25 gp each) or use a life potion before they are lost.",
        "hi"
      );
      queueResumeTravel();
      render();
      return;
    }
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
    if (rec.action === "defend") return true;
    if (rec.action === "attack") {
      return !!rec.targetId;
    }
    if (rec.action === "item") return !!rec.itemKind;
    if (rec.action === "spell") {
      var mem = teamMemberById(memberId);
      if (!mem || !memberHasSpells(mem.role)) return false;
      if (!rec.spellKind) return false;
      if (spellNeedsFoeTarget(mem.role, rec.spellKind)) {
        return !!rec.targetId;
      }
      if (spellNeedsAllyTarget(mem.role, rec.spellKind)) {
        var ally = rec.targetId ? teamMemberById(rec.targetId) : null;
        return !!(ally && ally.hp > 0);
      }
      return true;
    }
    if (rec.action === "ability") {
      var memA = teamMemberById(memberId);
      if (!memA || !memberHasAbilities(memA.role)) return false;
      if (!rec.abilityKind) return false;
      if (abilityNeedsAllyTarget(rec.abilityKind)) {
        var coverAlly = rec.targetId ? teamMemberById(rec.targetId) : null;
        return !!(coverAlly && coverAlly.hp > 0 && rec.targetId !== memberId);
      }
      return true;
    }
    return false;
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
      if (m && memberHasSpells(m.role)) state.combat.choices[memberId] = { action: "spell", targetId: null, spellKind: null };
    } else if (action === "ability") {
      state.combat.choices[memberId] = { action: "ability", targetId: null, abilityKind: null };
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
    chooseCombatAllyTarget(allyId);
  }

  function chooseCombatAllyTarget(allyId) {
    if (!state.combat || !allyId) return;
    var current = currentPlannerId();
    if (!current) return;
    var rec = choiceForMember(current);
    if (!rec) return;
    var ally = teamMemberById(allyId);
    if (!ally || ally.hp <= 0) return;
    if (rec.action === "spell") {
      var caster = teamMemberById(current);
      if (!caster || !spellNeedsAllyTarget(caster.role, rec.spellKind)) return;
      state.combat.choices[current] = { action: "spell", targetId: allyId, spellKind: rec.spellKind || null };
    } else if (rec.action === "ability" && rec.abilityKind === "cover") {
      if (allyId === current) return;
      state.combat.choices[current] = { action: "ability", targetId: allyId, abilityKind: "cover" };
    } else {
      return;
    }
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

  function combatMemberIndex(memberId) {
    var team = combatTeam();
    for (var i = 0; i < team.length; i++) {
      if (team[i].id === memberId) return i;
    }
    return -1;
  }

  function clearCombatChoicesFromIndex(fromIdx) {
    if (!state.combat || fromIdx < 0) return;
    var team = combatTeam();
    for (var i = fromIdx; i < team.length; i++) {
      delete state.combat.choices[team[i].id];
    }
  }

  function cancelCombatMemberChoice(memberId) {
    if (!state.combat || !memberId) return;
    var idx = combatMemberIndex(memberId);
    if (idx < 0) return;
    clearCombatChoicesFromIndex(idx);
    render();
  }

  function cancelCurrentCombatStep() {
    var current = currentPlannerId();
    if (!current || !state.combat) return;
    var rec = choiceForMember(current);
    if (!rec || !rec.action) return;
    if (rec.targetId) {
      var cleared = { action: rec.action, targetId: null };
      if (rec.action === "spell") cleared.spellKind = rec.spellKind || null;
      if (rec.action === "item") cleared.itemKind = rec.itemKind || null;
      state.combat.choices[current] = cleared;
      render();
      return;
    }
    if (rec.itemKind) {
      state.combat.choices[current] = { action: "item", targetId: null, itemKind: null };
      render();
      return;
    }
    if (rec.spellKind) {
      state.combat.choices[current] = { action: "spell", targetId: null, spellKind: null };
      render();
      return;
    }
    if (rec.abilityKind) {
      state.combat.choices[current] = { action: "ability", targetId: null, abilityKind: null };
      render();
      return;
    }
    cancelCombatMemberChoice(current);
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


  function chooseAbilityOption(abilityKind) {
    if (!state.combat || !abilityKind) return;
    var current = currentPlannerId();
    if (!current) return;
    var rec = choiceForMember(current);
    if (!rec || rec.action !== "ability") return;
    state.combat.choices[current] = { action: "ability", targetId: null, abilityKind: abilityKind };
    render();
  }

  function allChoicesReady() {
    return currentPlannerId() === null;
  }

  function strikeFoe(foe, dmg, strikeOpts) {
    var applied = applyDamageToFoe(foe, dmg, strikeOpts);
    if (!foe || applied.dmg <= 0) return applied;
    foe.hp -= applied.dmg;
    if (foe.hp < 0) foe.hp = 0;
    return applied;
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



  function refillPartyApForCombat() {
    var i, m;
    for (i = 0; i < state.party.length; i++) {
      m = state.party[i];
      if (!m || m.permadead) continue;
      if (!memberHasAbilities(m.role)) continue;
      initMemberProgress(m);
      m.maxAp = abilityMaxApForRole(m.role);
      m.ap = m.maxAp;
    }
  }

  function executeCleaveAbility(member, ref) {
    var foes = foesAlive();
    if (!foes.length) {
      logLine(member.name + " cleaves but no foes remain.", "");
      return;
    }
    if (!memberCanUseAbility(ref, "cleave")) {
      logLine(member.name + " lacks AP for Cleave.", "bad");
      return;
    }
    if (!spendAbilityAp(ref, "cleave")) {
      logLine(member.name + " lacks AP for Cleave.", "bad");
      return;
    }
    var i, hitNames = [], critAny = false;
    for (i = 0; i < foes.length; i++) {
      var cleaveRoll = rollCombatDamage(member, CLEAVE_DAMAGE);
      if (cleaveRoll.crit) critAny = true;
      var cleaveHit = strikeFoe(foes[i], cleaveRoll.dmg, { damageKind: "physical", member: member });
      hitNames.push(
        foes[i].name +
          " (-" +
          cleaveHit.dmg +
          (cleaveRoll.crit ? " crit" : "") +
          (cleaveHit.resisted ? ", resist" : "") +
          ")"
      );
    }
    logLine(
      member.name +
        " uses Cleave — hits " +
        hitNames.join(", ") +
        " (" +
        abilityApCost("cleave") +
        " AP" +
        (critAny ? ", <span class=\"hi\">critical hit</span>" : "") +
        ").",
      critAny ? "good" : "hi"
    );
  }

  function executeCoverAbility(member, ref, protectedId) {
    if (member.role !== "soldier") {
      logLine(member.name + " cannot use Cover.", "bad");
      return;
    }
    if (!memberCanUseAbility(ref, "cover")) {
      logLine(member.name + " lacks AP for Cover.", "bad");
      return;
    }
    var protectedMember = teamMemberById(protectedId);
    if (!protectedMember || protectedMember.hp <= 0 || protectedId === member.id) {
      logLine(member.name + " cannot cover that ally.", "bad");
      return;
    }
    if (!spendAbilityAp(ref, "cover")) {
      logLine(member.name + " lacks AP for Cover.", "bad");
      return;
    }
    if (!state.combat.cover) state.combat.cover = {};
    state.combat.cover[protectedId] = member.id;
    logLine(
      member.name +
        " covers " +
        protectedMember.name +
        " — enemy hits on them this round deal " +
        Math.round(COVER_ABSORB_RATIO * 100) +
        "% damage to " +
        member.name +
        " instead (" +
        abilityApCost("cover") +
        " AP).",
      "hi"
    );
  }

  function executePartyActions() {
    var c = state.combat;
    c.defending = {};
    c.cover = {};
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
        var tgt = rec && rec.targetId ? findCombatFoeById(rec.targetId) : null;
        if (!tgt) tgt = randomFoe();
        if (!tgt) continue;
        var atkRoll = rollCombatDamage(m, attackDamage(m));
        var atkHit = strikeFoe(tgt, atkRoll.dmg, { damageKind: "weapon", member: m });
        logLine(
          m.name +
            " attacks " +
            tgt.name +
            " (-" +
            atkHit.dmg +
            (atkRoll.crit ? ", <span class=\"hi\">critical hit</span>" : "") +
            dragonResistLogSuffix(atkHit) +
            ").",
          atkRoll.crit ? "good" : "hi"
        );
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
              ? findCombatFoeById(chosenSparkId)
              : null;
            if (!sparkTarget) sparkTarget = randomFoe();
            if (sparkTarget) {
              var sparkRoll = rollCombatDamage(m, sparkDmg);
              var sparkHit = strikeFoe(sparkTarget, sparkRoll.dmg, { damageKind: "spell" });
              logLine(
                m.name +
                  " casts Spark on " +
                  sparkTarget.name +
                  " (-" +
                  sparkHit.dmg +
                  (sparkRoll.crit ? ", <span class=\"hi\">critical hit</span>" : "") +
                  dragonResistLogSuffix(sparkHit) +
                  ", 5 MP).",
                sparkRoll.crit ? "good" : "hi"
              );
            }
          }
        } else if (m.role === "mage") {
          ref.mp = Math.max(0, (ref.mp || 0) - 5);
          var fireDmg = spellDamage(m);
          var chosenFireId = rec && rec.targetId ? rec.targetId : null;
          var fireTarget = chosenFireId
            ? findCombatFoeById(chosenFireId)
            : null;
          if (!fireTarget) fireTarget = randomFoe();
          if (fireTarget) {
            var fireRoll = rollCombatDamage(m, fireDmg);
            var fireHit = strikeFoe(fireTarget, fireRoll.dmg, { damageKind: "spell" });
            logLine(
              m.name +
                " casts Fire on " +
                fireTarget.name +
                " (-" +
                fireHit.dmg +
                (fireRoll.crit ? ", <span class=\"hi\">critical hit</span>" : "") +
                dragonResistLogSuffix(fireHit) +
                ", 5 MP).",
              fireRoll.crit ? "good" : "hi"
            );
          }
        }
        continue;
      }
      if (act === "ability") {
        var abilityKind = rec && rec.abilityKind ? rec.abilityKind : "";
        if (abilityKind === "cleave") {
          executeCleaveAbility(m, ref);
        } else if (abilityKind === "cover") {
          executeCoverAbility(m, ref, rec && rec.targetId ? rec.targetId : null);
        } else {
          logLine(m.name + " has no ability selected.", "bad");
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
          clearFallenDeathClock(revived);
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
      var coverBy = c.cover && c.cover[v.id] ? c.cover[v.id] : null;
      var coverRef = coverBy ? teamMemberById(coverBy) : null;
      if (coverRef && coverRef.hp > 0) {
        var coverDmg = Math.max(0, Math.floor(dmg * COVER_ABSORB_RATIO));
        if (c.defending[coverBy]) coverDmg = Math.max(0, Math.floor(coverDmg / 2));
        var coverArmorDef = equipmentDefBonus(coverRef);
        if (coverArmorDef > 0) coverDmg = Math.max(0, coverDmg - coverArmorDef);
        damageMember(coverBy, coverDmg);
        logLine(
          f.name +
            " strikes at " +
            v.name +
            ", but " +
            coverRef.name +
            " covers — " +
            coverRef.name +
            " takes -" +
            coverDmg +
            " (75% of the hit).",
          "bad"
        );
        continue;
      }
      if (c.defending[v.id]) dmg = Math.max(0, Math.floor(dmg / 2));
      var armorDef = equipmentDefBonus(v);
      if (armorDef > 0) dmg = Math.max(0, dmg - armorDef);
      damageMember(v.id, dmg);
      logLine(f.name + " hits " + v.name + " (-" + dmg + ").", "bad");
    }
  }


  function fillMissingCombatChoicesBeforeCommit() {
    if (!state.combat) return;
    var foes = foesAlive();
    var team = combatTeam();
    var i, mid, mem, rec, tgt;
    for (i = 0; i < team.length; i++) {
      mid = team[i].id;
      if (choiceComplete(mid)) continue;
      mem = teamMemberById(mid);
      if (!mem || mem.hp <= 0) continue;
      rec = choiceForMember(mid);
      tgt = lowestHpFoe();
      if (!foes.length) {
        state.combat.choices[mid] = { action: "defend", targetId: null };
        continue;
      }
      if (rec && rec.action === "attack") {
        state.combat.choices[mid] = { action: "attack", targetId: tgt ? tgt.id : null };
        continue;
      }
      if (rec && rec.action === "spell" && memberHasSpells(mem.role)) {
        if (!rec.spellKind) {
          if (mem.role === "priest") {
            if ((mem.mp || 0) >= 5) {
              state.combat.choices[mid] = { action: "spell", targetId: tgt.id, spellKind: "spark" };
            } else {
              state.combat.choices[mid] = { action: "defend", targetId: null };
            }
          } else if (mem.role === "mage" && (mem.mp || 0) >= 5) {
            state.combat.choices[mid] = { action: "spell", targetId: tgt.id, spellKind: "fire" };
          } else {
            state.combat.choices[mid] = { action: "defend", targetId: null };
          }
          continue;
        }
        if (!rec.targetId) {
          if (spellNeedsAllyTarget(mem.role, rec.spellKind)) {
            var ally = lowestHpAlly();
            state.combat.choices[mid] = { action: "spell", targetId: ally ? ally.id : null, spellKind: rec.spellKind };
          } else if (spellNeedsFoeTarget(mem.role, rec.spellKind) && tgt) {
            state.combat.choices[mid] = { action: "spell", targetId: tgt.id, spellKind: rec.spellKind };
          }
          continue;
        }
      }
      if (rec && rec.action === "ability" && memberHasAbilities(mem.role)) {
        if (!rec.abilityKind) {
          if (mem.role === "soldier" && memberCanUseAbility(mem, "cover")) {
            var coverPick = pickCoverTargetForSoldier(mid);
            if (coverPick) {
              state.combat.choices[mid] = { action: "ability", targetId: coverPick.id, abilityKind: "cover" };
              continue;
            }
          }
          if (memberCanUseAbility(mem, "cleave")) {
            state.combat.choices[mid] = { action: "ability", targetId: null, abilityKind: "cleave" };
            continue;
          }
        }
        if (rec.abilityKind === "cover" && !rec.targetId) {
          var coverAllyPick = pickCoverTargetForSoldier(mid);
          state.combat.choices[mid] = {
            action: "ability",
            targetId: coverAllyPick ? coverAllyPick.id : null,
            abilityKind: "cover",
          };
          continue;
        }
      }
      if (rec && rec.action === "item" && !rec.itemKind) {
        if (state.healingPotions > 0 && mem.hp < mem.maxHp) {
          state.combat.choices[mid] = { action: "item", targetId: null, itemKind: "heal_potion" };
        } else {
          state.combat.choices[mid] = { action: "defend", targetId: null };
        }
        continue;
      }
      if (memberHasAbilities(mem.role) && memberCanUseAbility(mem, "cleave")) {
        state.combat.choices[mid] = { action: "ability", targetId: null, abilityKind: "cleave" };
      } else {
        state.combat.choices[mid] = { action: "attack", targetId: tgt ? tgt.id : null };
      }
    }
  }

  function commitCombatRound() {
    if (!state.combat) {
      logLine("No active battle to resolve.", "bad");
      render();
      return;
    }
    syncCombatTargetsBeforeCommit();
    fillMissingCombatChoicesBeforeCommit();
    forceFillAllCombatChoices();
    if (!allChoicesReady()) {
      var blocker = currentPlannerId();
      var blockerName = blocker && teamMemberById(blocker) ? teamMemberById(blocker).name : "A fighter";
      logLine("Auto-filled moves; resolving round…", "hi");
    }
    try {
      executePartyActions();
      state.combat.choices = {};

      if (allFoesDefeated() || !foesAlive().length) {
        tacticalWin();
        render();
        return;
      }

      enemyVolley();

      if (!combatTeam().filter(function (m) {
        return teamMemberById(m.id) && teamMemberById(m.id).hp > 0;
      }).length) {
        tacticalLoss();
        render();
        return;
      }

      if (!partyAlive().length) {
        tacticalLoss();
        render();
        return;
      }

      state.combat.round++;
      logLine("--- Round " + state.combat.round + " ---", "");
    } catch (err) {
      logLine("Round error: " + (err && err.message ? err.message : String(err)), "bad");
      if (typeof console !== "undefined" && console.error) console.error(err);
    }
    render();
  }

  function queueEncounterCutaway(title, subtitle, applyFn) {
    clearTransitionTimers();
    state.transition = null;
    applyFn();
    render();
  }

  function applyRuinsDiscoveryEncounter() {
    state.ruinsDiscovered = true;
    state.ruinsType = rollRuinsSiteType();
    state.ruinsTravelDay = state.travelDay;
    state.ruinsRoomsTotal = rollRuinsRoomCountForType(state.ruinsType);
    state.ruinsRoomsRemaining = state.ruinsRoomsTotal;
    initRuinsMap();
    var siteLabel = ruinsSiteLabel(state.ruinsType);
    state.pendingEncounter = { kind: "ruins_discovery", label: siteLabel, foes: [] };
    state.phase = "action";
    logLine(
      siteLabel +
        " mapped: " +
        state.ruinsRoomsTotal +
        " " +
        ruinsUnitLabel(state.ruinsType, state.ruinsRoomsTotal) +
        " detected.",
      "hi"
    );
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

  function processOverdueFallenIfNeeded() {
    if (!state.party || !state.party.length) return;
    for (var fi = 0; fi < state.party.length; fi++) {
      var fm = state.party[fi];
      if (fm && fm.hp <= 0 && !fm.permadead) {
        processDailyDeath();
        return;
      }
    }
  }

  function processDailyDeath() {
    ensureHeadstonesState();
    var droppedIds = [];
    for (var i = 0; i < state.party.length; i++) {
      var m = state.party[i];
      if (!m) continue;
      if (m.hp > 0) {
        clearFallenDeathClock(m);
        continue;
      }
      ensureFallenJourneyClock(m);
      if (typeof m.deadSinceJourneyDay !== "number") {
        m.deadSinceJourneyDay = state.totalDaysElapsed || 0;
        snapshotMemberDeathContext(m);
        logLine(m.name + " lies fallen. Revive within 2 journey days or they are lost.", "bad");
        continue;
      }
      var daysDead = fallenJourneyDaysDead(m);
      if (daysDead >= 2) {
        state.headstones.push(makeHeadstoneForMember(m));
        droppedIds.push(m.id);
        logLine(m.name + " was not revived in time. The body will be interred at the next town.", "bad");
        trackPlaytest("member_permadead", { memberId: m.id, role: m.role, day: state.totalDaysElapsed || 0 });
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
    if (state.party.length === 0 || (!anyAlive && !carryingFallenHomeFromAdventure())) {
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
    if (state.phase === "settlement_site_choice") {
      app.innerHTML = renderHeader() + "<h2 class=\"panel-title\">The end of the trail</h2>" + settlementSiteChoiceHtml() + renderLog();
      wireSettlementSiteChoice(app);
      return;
    }

    if (state.phase === "gameover") {
      render();
      return;
    }
    state.stableRestDays = 0;
    var marchedBiome = biomeForLegTravelDay(
      state.travelDay,
      currentRouteDays(),
      state.travelOrigin || "cantebury",
      state.travelDestination || "gustaf"
    );
    logLine(
      "Day " +
        state.travelDay +
        " of " +
        currentRouteDays() +
        ' on the road — <span class="hi">' +
        escapeHtml(biomeLabel(marchedBiome)) +
        "</span>.",
      ""
    );
    trackPlaytest("day_advanced", { day: state.travelDay, routeDays: currentRouteDays() });
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
    if (shouldTriggerDragonSchoolEncounter()) {
      queueDragonSchoolEncounter(
        "Dragon on the wind",
        "Day " + state.travelDay + " — scales and smoke above the road"
      );
      return;
    }
    var hadEncounter = rollTravelEncounter();
    if (hadEncounter) {
      var t = rollFieldEncounterType();
      if (t === "ruins_discovery") {
        queueEncounterCutaway("Ruins on the horizon", "Day " + state.travelDay + " - old stonework breaks the skyline", function () {
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
      logLine("Scouts spot ruins off-road.", "hi");
      queueEncounterCutaway("Ruins off the trail", "Day " + state.travelDay + " - a side path worth a look", function () {
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
    if (state.travelDay >= currentRouteDays()) {
      queueArrivalAtDestination();
      return;
    }
    clearTransitionTimers();
    state.transition = null;
    var adv = tryBiomeMarchAdvance();
    if (!adv.ok) {
      render();
      return;
    }
    var steps = adv.daysGain || 1;
    var i;
    for (i = 0; i < steps; i++) {
      if (state.phase !== "travel" || state.travelDay >= currentRouteDays()) break;
      runTravelDayResolution();
      if (state.transition) break;
      if (state.phase !== "travel") break;
    }
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
      state.adventure.returnDaysRemaining = state.adventure.daysOut;
      logLine(
        "You've used all 10 adventuring days. Heading back to " +
          locationLabel(state.adventure.town) +
          " (" +
          state.adventure.returnDays +
          " day(s) home, encounters each day).",
        "hi"
      );
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
      message:
        "The march home will take <b>" +
        daysCost +
        " day(s)</b>. Each leg rolls encounters like the outbound trek. Supplies help, but you can march home starving if you must — fallen companions travel with the caravan until the chapel (25 gp revival; no potion required).",
      confirmLabel: "Begin return march",
      cancelLabel: "Stay out",
      onConfirm: "executeAdventureReturn",
    };
    render();
  }

  function executeAdventureReturn() {
    clearAdventureBlockers();
    if (!state.adventure) {
      render();
      return;
    }
    var daysCost = state.adventure.dir === "out"
      ? state.adventure.daysOut
      : state.adventure.returnDaysRemaining != null
        ? state.adventure.returnDaysRemaining
        : state.adventure.returnDays;
    state.confirmDialog = null;
    if (daysCost <= 0) {
      endAdventureBackInTown();
      return;
    }
    state.adventure.dir = "back";
    state.adventure.returnDays = daysCost;
    state.adventure.returnDaysRemaining = daysCost;
    logLine(
      "You turn back toward " +
        locationLabel(state.adventure.town) +
        " — " +
        daysCost +
        " day(s) of road ahead, with encounters each day.",
      "hi"
    );
    render();
  }

  function advanceAdventureReturnDay() {
    if (state.phase !== "adventure" || !state.adventure || state.adventure.dir !== "back") return;
    if (typeof state.adventure.returnDaysRemaining !== "number") {
      state.adventure.returnDaysRemaining = state.adventure.returnDays || state.adventure.daysOut || 0;
    }
    var remaining = state.adventure.returnDaysRemaining;
    if (typeof remaining !== "number" || remaining <= 0) {
      endAdventureBackInTown();
      return;
    }
    consumeTravelDaySupplies();
    if (allDead()) {
      state.gameoverMode = "loss";
      state.phase = "gameover";
      logLine("The expedition is lost on the way home.", "bad");
      render();
      return;
    }
    state.adventure.returnDaysRemaining = remaining - 1;
    state.travelDay++;
    tickJourneyDay();
    state.stableRestDays = 0;
    applyTravelDayMpRegen();
    if (state.phase === "gameover") {
      render();
      return;
    }
    var legNum = state.adventure.returnDays - state.adventure.returnDaysRemaining;
    logLine(
      "Return march day " +
        legNum +
        " of " +
        state.adventure.returnDays +
        " toward " +
        locationLabel(state.adventure.town) +
        ".",
      ""
    );
    var hadEncounter = rollTravelEncounter();
    if (hadEncounter) {
      queueEncounterCutaway("Hostile creatures", "Return march day " + legNum + " — the road home offers no mercy", function () {
        startTacticalCombat(buildRandomMonsterEncounter("adventure"));
      });
      return;
    }
    logLine("Quiet march homeward.", "");
    endOfDayPriestHealing();
    if (maybeCompleteAdventureReturn()) return;
    render();
  }

  function cancelConfirmDialog() {
    state.confirmDialog = null;
    syncConfirmOverlay();
    render();
  }

  function turnBackAdventure() {
    if (state.phase !== "adventure" || !state.adventure) return;
    clearAdventureBlockers();
    if (carryingFallenHomeFromAdventure() || partyFallenMembers().length > 0) {
      executeAdventureReturn();
      return;
    }
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
    in_defense_of: {
      id: "in_defense_of",
      name: "In Defense of",
      giver: "barkeep",
      pitch: "A small garrison was hit in the night — beasts through the palisade. They need reinforcements now. Can you rush to them?",
      summary: "March 1–3 days to the garrison, then hold the walls: 2 minutes on the clock, four waves, roll 1–6 raiders each wave, 20-second breaks to heal between waves.",
      rewardGold: 25,
      type: "garrison_defense",
      monsterPool: ["Goblin", "Wolf", "Bandit", "Troll"],
    },
  };


  function questTypeOf(quest) {
    if (!quest) return "";
    var def = questDef(quest.id);
    return (def && def.type) || "";
  }

  function questIsGarrisonDefense(quest) {
    return questTypeOf(quest) === "garrison_defense";
  }

  function clearDefenseClock() {
    if (state.defenseClockId) {
      clearInterval(state.defenseClockId);
      state.defenseClockId = null;
    }
  }

  function ensureDefenseClock() {
    if (state.phase !== "quest_defense" || state.defenseClockId) return;
    state.defenseClockId = setInterval(function () {
      tickQuestDefenseClock();
    }, 250);
  }

  function defenseSecondsLeft(d, now) {
    return Math.max(0, Math.ceil(((d.timerEndsAt || 0) - now) / 1000));
  }

  function defenseBreakSecondsLeft(d, now) {
    return Math.max(0, Math.ceil(((d.breakEndsAt || 0) - now) / 1000));
  }

  function formatDefenseTimer(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function tickQuestDefenseClock() {
    if (!state.quest || !state.quest.defense) {
      clearDefenseClock();
      return;
    }
    if (state.combat || state.quest.defense.leaving) return;
    if (state.phase !== "quest_defense") return;
    var d = state.quest.defense;
    var now = Date.now();
    if (d.onBreak && d.breakEndsAt && now >= d.breakEndsAt) {
      d.onBreak = false;
      d.breakEndsAt = null;
      if (now >= d.timerEndsAt) {
        finishGarrisonDefense();
        return;
      }
      launchDefenseWave();
      return;
    }
    if (!d.onBreak && d.wavesStarted && now >= d.timerEndsAt) {
      finishGarrisonDefense();
      return;
    }
    var secLeft = defenseSecondsLeft(d, now);
    if (secLeft !== d._lastSecShown) {
      d._lastSecShown = secLeft;
      render();
    }
  }

  function buildGarrisonDefenseEncounter(count, waveNum) {
    var def = state.quest ? questDef(state.quest.id) : null;
    var poolNames = (def && def.monsterPool) || ["Goblin", "Wolf", "Bandit"];
    var pool = BALANCE_MONSTERS.filter(function (m) {
      return m && poolNames.indexOf(m.name) >= 0;
    });
    if (!pool.length) pool = BALANCE_MONSTERS.slice();
    var list = [];
    var i;
    for (i = 0; i < count; i++) {
      var mon = randomBalanceMonster(pool);
      var baseHp = Math.max(1, parseInt(mon && mon.hp, 10) || 1);
      var scaled = Math.max(1, Math.round(baseHp * monsterHpMultiplierForProgress() * 0.85));
      list.push({
        id: "gd" + waveNum + "_" + i,
        name: mon.name,
        hp: scaled,
        maxHp: scaled,
        dmg: monsterAttackFromBalance(mon),
        level: (mon && mon.level) || 1,
      });
    }
    return {
      kind: "quest_defense_wave",
      label: "Wave " + waveNum + " — " + count + " attacker" + (count > 1 ? "s" : ""),
      foes: list,
    };
  }

  function beginGarrisonDefenseBreak(isFirst) {
    if (!state.quest || !state.quest.defense) return;
    state.phase = "quest_defense";
    var d = state.quest.defense;
    d.onBreak = true;
    d.breakEndsAt = Date.now() + DEFENSE_BREAK_MS;
    logLine(
      isFirst
        ? '<span class="hi">Hold fast:</span> the first wave gathers — 20 seconds to bind wounds.'
        : '<span class="hi">Breather:</span> 20 seconds to heal before the next wave.',
      "hi"
    );
    ensureDefenseClock();
    render();
  }

  function launchDefenseWave() {
    if (!state.quest || !state.quest.defense || state.combat) return;
    var d = state.quest.defense;
    if (d.roundCompleted >= DEFENSE_WAVE_COUNT) {
      finishGarrisonDefense();
      return;
    }
    if (Date.now() >= d.timerEndsAt) {
      finishGarrisonDefense();
      return;
    }
    d.wavesStarted = true;
    d.onBreak = false;
    d.breakEndsAt = null;
    var waveNum = d.roundCompleted + 1;
    var n = rollInt(1, 6);
    logLine('<span class="hi">Wave ' + waveNum + ":</span> " + n + " raider" + (n > 1 ? "s" : "") + " hit the wall!", "bad");
    queueEncounterCutaway("Garrison defense", "Wave " + waveNum + " of " + DEFENSE_WAVE_COUNT, function () {
      startTacticalCombat(buildGarrisonDefenseEncounter(n, waveNum));
    });
  }

  function startGarrisonDefense() {
    clearDefenseClock();
    state.phase = "quest_defense";
    state.quest.status = "active";
    state.quest.defense = {
      roundCompleted: 0,
      timerEndsAt: Date.now() + DEFENSE_SIEGE_MS,
      breakEndsAt: null,
      onBreak: true,
      wavesStarted: false,
      leaving: false,
      leftBehindIds: [],
      _lastSecShown: -1,
    };
    logLine('<span class="hi">Reinforcements arrive!</span> Hold the garrison — <b>2 minutes</b> on the sand-glass, <b>' + DEFENSE_WAVE_COUNT + "</b> waves, heal in the <b>20s</b> lulls.", "good");
    beginGarrisonDefenseBreak(true);
  }

  function finishGarrisonDefense() {
    clearDefenseClock();
    if (!state.quest) return;
    if (!state.quest.defense) state.quest.defense = {};
    var d = state.quest.defense;
    d.onBreak = false;
    d.breakEndsAt = null;
    d.leaving = true;
    state.combat = null;
    state.pendingEncounter = null;
    state.transition = null;
    logLine('<span class="hi">The assault breaks!</span> Choose who stays to stiffen the garrison.', "good");
    render();
  }

  function garrisonResistChanceForTown(townKey) {
    var n = (state.garrisonSupport && state.garrisonSupport[townKey]) || 0;
    return Math.min(100, Math.round(n * GARRISON_RESIST_PER_DEFENDER * 100));
  }

  function toggleGarrisonLeaveBehind(memberId) {
    if (!state.quest || !state.quest.defense || !state.quest.defense.leaving) return;
    var d = state.quest.defense;
    if (!d.leftBehindIds) d.leftBehindIds = [];
    var idx = d.leftBehindIds.indexOf(memberId);
    if (idx >= 0) d.leftBehindIds.splice(idx, 1);
    else {
      if (livingPartyMembers().length <= 1) {
        logLine("At least one fighter must march on with the caravan.", "bad");
        render();
        return;
      }
      d.leftBehindIds.push(memberId);
    }
    render();
  }

  function confirmGarrisonLeaveBehind() {
    if (!state.quest || !state.quest.defense) return;
    var d = state.quest.defense;
    var ids = (d.leftBehindIds || []).slice();
    var town = state.quest.startedAt || state.settlementTown || "cantebury";
    if (!state.garrisonSupport) state.garrisonSupport = {};
    var left = 0;
    var i, member;
    for (i = 0; i < ids.length; i++) {
      member = teamMemberById(ids[i]);
      if (!member) continue;
      state.party = state.party.filter(function (p) { return p.id !== ids[i]; });
      logLine('<span class="hi">' + member.name + "</span> stays to hold the garrison walls.", "hi");
      left++;
    }
    if (left > 0) {
      state.garrisonSupport[town] = (state.garrisonSupport[town] || 0) + left;
      var pct = garrisonResistChanceForTown(town);
      logLine("The garrison gains <b>" + left + "</b> defender" + (left > 1 ? "s" : "") + " (+<b>" + Math.round(left * GARRISON_RESIST_PER_DEFENDER * 100) + "%</b> resist vs the next raid — full logic later). Town total: <b>" + pct + "%</b>.", "good");
    }
    if (state.party.length === 0) {
      state.gameoverMode = "loss";
      state.phase = "gameover";
      state.quest = null;
      logLine("Everyone stayed behind — the caravan has no line left.", "bad");
      render();
      return;
    }
    completeCurrentQuest();
  }

  function skipDefenseBreakEarly() {
    if (!state.quest || !state.quest.defense || !state.quest.defense.onBreak) return;
    if (Date.now() >= state.quest.defense.timerEndsAt) {
      finishGarrisonDefense();
      return;
    }
    state.quest.defense.breakEndsAt = Date.now();
    tickQuestDefenseClock();
  }

  function applyDefenseFieldHeal() {
    applyCampHealing(0.35);
    render();
  }

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
      if (forcedQuestId && questIsAvailable(forcedQuestId)) offers = [forcedQuestId];
      if (offers.length === 1) {
        var qd1 = questDef(offers[0]);
        if (qd1) {
          questOfferId = offers[0];
          text = qd1.pitch;
          summaryHtml =
            '<div class="hint" style="margin-top:.35rem">' + escapeHtml(qd1.summary) +
            ' Reward: <b style="color:#e8dcc8">' + qd1.rewardGold + " gp</b>.</div>";
        }
      } else if (offers.length > 1) {
        text = cfg.greet + " Two calls for steel reached the bar this week — take your pick.";
        summaryHtml = '<div class="quest-offer-list" style="margin-top:.5rem;display:flex;flex-direction:column;gap:.65rem">';
        var oi, qdo;
        for (oi = 0; oi < offers.length; oi++) {
          qdo = questDef(offers[oi]);
          if (!qdo) continue;
          summaryHtml +=
            '<div class="quest-offer-card" style="padding:.6rem .75rem;border:1px solid #4a3d2a;border-radius:8px;background:#1e1812">' +
            "<b>" + escapeHtml(qdo.name) + "</b><p class=\"hint\" style=\"margin:.25rem 0\">" + escapeHtml(qdo.summary) + "</p>" +
            '<p class="hint">Reward: <b style="color:#e8dcc8">' + qdo.rewardGold + " gp</b></p>" +
            '<button type="button" class="primary" data-offer-quest="' + escapeHtml(offers[oi]) + '">Accept — ' + escapeHtml(qdo.name) + "</button>" +
            "</div>";
        }
        summaryHtml += "</div>";
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
    var totalDays = def.totalDays;
    if (def.type === "garrison_defense") totalDays = rollInt(1, 3);
    state.quest = {
      id: questId,
      status: "accepted",
      dayProgress: 0,
      totalDays: totalDays,
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
    if (def && def.type === "garrison_defense") {
      logLine("You rush toward the raided garrison — <b>" + state.quest.totalDays + "</b> hard day(s) on the road.", "hi");
    } else {
      logLine("You set out for the mountain pass. " + (def ? def.totalDays : 5) + " days ahead.", "hi");
    }
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
    if (state.phase === "gameover") { render(); return; }
    applyTravelDayMpRegen();
    var def = questDef(state.quest.id);
    if (!def) {
      logLine("Quest data missing. Returning to town.", "bad");
      abandonQuest();
      return;
    }
    if (def.type === "garrison_defense") {
      if (state.quest.dayProgress >= state.quest.totalDays) {
        logLine('<span class="hi">The garrison!</span> Smoke on the horizon — you sprint the last mile.', "hi");
        startGarrisonDefense();
        return;
      }
      logLine("Forced march day " + state.quest.dayProgress + " of " + state.quest.totalDays + " toward the garrison.", "");
      render();
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
    clearDefenseClock();
    var def = state.quest ? questDef(state.quest.id) : null;
    var name = def ? def.name : "the quest";
    var town = (state.quest && state.quest.startedAt) || state.settlementTown || "cantebury";
    var qid = state.quest && state.quest.id;
    state.quest = null;
    var fallen = partyFallenMembers();
    if (town === "cantebury") {
      state.phase = "story_illiri";
      state.illiriView = fallen.length ? "castle" : "party";
      state.keepView = fallen.length ? "chapel" : (state.keepView || "hall");
      state.settlementTown = null;
    } else {
      state.phase = "settlement";
      state.settlementTown = town;
      state.settlementView = fallen.length ? "church" : "inventory";
    }
    state.encounterChance = ENCOUNTER_BASE;
    internPendingHeadstones();
    logLine("Abandoned " + name + ". You return to " + locationLabel(town) + " empty-handed.", "bad");
    if (fallen.length) {
      logLine("Fallen companions were carried back — the chapel can revive them.", "hi");
    }
    trackPlaytest("quest_abandoned", { questId: qid });
    render();
  }

  function completeCurrentQuest() {
    clearDefenseClock();
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
        dmg: monsterAttackFromBalance(mon),
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
        dmg: monsterAttackFromBalance(bossDef),
        level: bossDef.level || 3,
      });
    }
    return { kind: "quest_boss_drakes", label: def.bossLabel || (count + " " + bossDef.name), foes: foes };
  }

  function endAdventureBackInTown() {
    var town = state.adventure ? state.adventure.town : (state.settlementTown || "cantebury");
    var fallen = partyFallenMembers();
    trackPlaytest("adventure_ended", { town: town, fallen: fallen.length });
    state.adventure = null;
    if (town === "cantebury") {
      state.phase = "story_illiri";
      state.illiriView = fallen.length ? "castle" : "adventure";
      state.keepView = fallen.length ? "chapel" : (state.keepView || "hall");
      state.settlementTown = null;
    } else {
      state.phase = "settlement";
      state.settlementTown = town;
      state.settlementView = "church";
    }
    if (fallen.length) {
      logLine(
        fallen.length +
          " fallen companion" +
          (fallen.length > 1 ? "s were" : " was") +
          " carried home in time — revive at the chapel before the permadeath clock expires (25 gp each, or a life potion).",
        "hi"
      );
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
    executeLoadCampaign: function () {
      var dlg = state.confirmDialog;
      var slot = dlg && typeof dlg.slotIndex === "number" ? dlg.slotIndex : getActiveSaveSlot();
      state.confirmDialog = null;
      loadCampaignProgress(slot, true);
    },
    executeNewCampaign: function () {
      state.confirmDialog = null;
      startNewCampaignWipeSave();
    },
    executeDeleteCampaignSlot: function () {
      var dlg = state.confirmDialog;
      var slot = dlg && typeof dlg.slotIndex === "number" ? dlg.slotIndex : getActiveSaveSlot();
      state.confirmDialog = null;
      deleteCampaignSaveSlot(slot);
    },
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
            '<li><b>Rest only</b>: lose ' + dailySupplyCostLabel() + ', recover 50% of missing HP — you <b>stay put</b> on the trail.</li>' +
            '<li><b>Rest & forage</b>: lose 2 supplies, recover 25% of missing HP, chance to find supplies, gold, or gear — still no march.</li>' +
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
      if (state.gold < LIFE_POTION_BUY_GP) {
        logLine("Need " + LIFE_POTION_BUY_GP + " gp for a Potion of Life.", "bad");
        render();
        return;
      }
      state.gold -= LIFE_POTION_BUY_GP;
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

  function applySupplyStarvation(missingBundles, people) {
    var dmg = 2 * Math.max(1, missingBundles || 1);
    partyAlive().forEach(function (m) {
      m.hp = Math.max(0, m.hp - dmg);
    });
    if (state.guest && state.guest.hp > 0) {
      state.guest.hp = Math.max(0, state.guest.hp - dmg);
    }
    logLine(
      "Short rations for <b>" +
        people +
        "</b> mouths — need " +
        dailySupplyConsumption() +
        " supply bundles, but stores ran dry (-" +
        dmg +
        " HP fighters).",
      "bad"
    );
  }

  function consumeTravelDaySupplies() {
    var people = caravanPeopleCount();
    var cost = dailySupplyConsumption();
    if (cost <= 0) return;
    if (state.food > 0) {
      var stretch = state.rationMode === "stretch";
      var saveChance = stretch ? Math.min(0.85, caravanSupplySaveChance() + 0.35) : caravanSupplySaveChance();
      if (Math.random() < saveChance) {
        logLine(
          stretch
            ? "Farmers stretch the train's rations — no supplies spent today (" + people + " mouths fed on scraps)."
            : "Caravan drovers eke out the larder — no supplies spent today (" + people + " mouths).",
          ""
        );
        if (stretch) noteStretchedRationGrumbles();
        return;
      }
      if (state.food >= cost) {
        state.food -= cost;
        logLine(
          "Rations issued: <b>" +
            cost +
            "</b> supply bundle" +
            (cost === 1 ? "" : "s") +
            " for <b>" +
            people +
            "</b> mouths (1 bundle feeds " +
            SUPPLY_PEOPLE_PER_UNIT +
            ").",
          ""
        );
        if (stretch) state.stretchedRationDays = 0;
        return;
      }
      var had = state.food;
      state.food = 0;
      logLine(
        "Only <b>" +
          had +
          "</b> supply bundle" +
          (had === 1 ? "" : "s") +
          " left for <b>" +
          people +
          "</b> mouths — the train goes hungry.",
        "bad"
      );
      applySupplyStarvation(cost - had, people);
      return;
    }
    applySupplyStarvation(cost, people);
  }

  function tickJourneyDay() {
    if (typeof state.totalDaysElapsed !== "number") state.totalDaysElapsed = 0;
    state.totalDaysElapsed++;
    tickBlessingExpiry();
    tickNewIsilColonyDay();
    processDailyDeath();
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
      var forageWeaponId = grantWeaponGearDrop("Forage");
      if (forageWeaponId) {
        var fd = equipmentItemDef(forageWeaponId);
        bag.push("+1 " + (fd ? fd.label : "weapon"));
      }
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
    if (phase !== "travel") state.travelDay++;
    tickJourneyDay();
    state.stableRestDays = 0;
    if (state.phase === "gameover") { render(); return; }
    applyCampMpRegen();
    if (phase === "travel") {
      logLine(
        "You make camp without marching. Progress stays at <span class=\"hi\">" +
          travelLegProgressText() +
          "</span> — use <b>Next day</b> when you are ready to move.",
        ""
      );
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
    render();
  }

  function tavernRecruitGate(role) {
    if (state.phase === "settlement" && state.settlementView === "tavern") {
      if ((state.settlementRecruitSlots || 0) <= 0) {
        return "No recruits are available in this settlement right now.";
      }
      if (state.settlementRecruitMode === "soldier_only" && role !== "soldier") {
        return "Solem only has soldiers available for hire.";
      }
    }
    return "";
  }

  function tavernVeteranHireCost(targetLevel) {
    if (targetLevel === 3) return TAVERN_VETERAN_HIRE_GP[3] || 50;
    if (targetLevel === 5) return TAVERN_VETERAN_HIRE_GP[5] || 100;
    return 0;
  }

  function tavernVeteranHirePanelHtml(full) {
    var levels = [3, 5];
    var roles = PARTY_ROLES;
    var slotsBlocked =
      state.phase === "settlement" &&
      state.settlementView === "tavern" &&
      (state.settlementRecruitSlots || 0) <= 0;
    var html =
      '<div class="roster-veteran-hire">' +
      '<h4 class="roster-veteran-heading">Veteran hires</h4>' +
      '<p class="hint roster-veteran-note">Pay for road-tested fighters. Stats roll as if they leveled naturally (' +
      tavernVeteranHireCost(3) +
      " gp at level 3, " +
      tavernVeteranHireCost(5) +
      " gp at level 5).</p>";
    var li;
    for (li = 0; li < levels.length; li++) {
      var lvl = levels[li];
      var cost = tavernVeteranHireCost(lvl);
      html +=
        '<div class="roster-veteran-row">' +
        '<span class="roster-veteran-tier">Level ' +
        lvl +
        " · " +
        cost +
        " gp</span>";
      var ri;
      for (ri = 0; ri < roles.length; ri++) {
        var role = roles[ri];
        var roleBlocked =
          state.phase === "settlement" &&
          state.settlementView === "tavern" &&
          state.settlementRecruitMode === "soldier_only" &&
          role !== "soldier";
        var goldOk = (state.gold || 0) >= cost;
        var dis = full || slotsBlocked || !goldOk || roleBlocked ? " disabled" : "";
        html +=
          '<button type="button" class="roster-veteran-btn" data-hire-veteran-role="' +
          role +
          '" data-hire-veteran-level="' +
          lvl +
          '"' +
          dis +
          ">+ " +
          roleLabel(role) +
          "</button>";
      }
      html += "</div>";
    }
    html += "</div>";
    return html;
  }

  function hireTavernVeteran(role, targetLevel) {
    var cost = tavernVeteranHireCost(targetLevel);
    if (!(cost > 0)) return;
    if (state.party.length >= PARTY_MAX) {
      logLine("Party is full (" + PARTY_MAX + " members).", "bad");
      render();
      return;
    }
    var gateMsg = tavernRecruitGate(role);
    if (gateMsg) {
      logLine(gateMsg, "bad");
      render();
      return;
    }
    if ((state.gold || 0) < cost) {
      logLine("Need " + cost + " gp to hire a level " + targetLevel + " " + roleLabel(role) + ".", "bad");
      render();
      return;
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
    simulateMemberToLevel(fresh, targetLevel);
    state.gold -= cost;
    state.party.push(fresh);
    if (state.phase === "settlement" && state.settlementView === "tavern") {
      state.settlementRecruitSlots = Math.max(0, (state.settlementRecruitSlots || 0) - 1);
    }
    var st = fresh.stats || {};
    logLine(
      "Hired <span class=\"hi\">" +
        fresh.name +
        "</span>, level " +
        targetLevel +
        " " +
        roleLabel(role) +
        ", for " +
        cost +
        " gp — STR " +
        (st.strength || 0) +
        ", INT " +
        (st.intelligence || 0) +
        ", STAM " +
        (st.stamina || 0) +
        ", LUCK " +
        (st.luck || 0) +
        ".",
      "good"
    );
    trackPlaytest("tavern_veteran_hire", { role: role, level: targetLevel, cost: cost, stats: st });
    render();
  }

  function addPartyMember(role) {
    if (state.party.length >= PARTY_MAX) {
      logLine("Party is full (" + PARTY_MAX + " members).", "bad");
      return;
    }
    var gateMsg = tavernRecruitGate(role);
    if (gateMsg) {
      logLine(gateMsg, "bad");
      render();
      return;
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
          '<span class="roster-meta">Lv ' +
          (m.level || 1) +
          " · " +
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
      "</div>" +
      tavernVeteranHirePanelHtml(full)
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
      '<div>Progress: <b>' + (qd.type === "garrison_defense"
        ? "Rush: " + state.quest.dayProgress + " / " + state.quest.totalDays + " day(s) to the garrison"
        : state.quest.dayProgress + " / " + state.quest.totalDays + " days into the pass") +
        "</b></div>" +
      '<div class="hint">Reward on completion: ' + qd.rewardGold + ' gp.</div>' +
      '<div style="margin-top:.5rem;display:flex;gap:.4rem;flex-wrap:wrap">' +
      '<button type="button" class="primary" id="questBegin"' + (state.food > 0 ? "" : " disabled") + '>' +
      (qd.type === "garrison_defense"
        ? state.quest.dayProgress > 0
          ? "Resume rush"
          : "Rush to the garrison"
        : state.quest.dayProgress > 0
          ? "Resume trek"
          : "Set out for the pass") +
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
    if (townKey === "new_isil" && colonyIsActive()) html += tab("colony", "Colony");
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
        : '<p class="shopkeeper-lead">Market stalls — supplies, potions, and armor. Shopkeepers buy common and uncommon spare gear from your locker; rare items go to the quartermaster.</p>' +
          settlementShopPanelHtml('market');
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
    if (view === "shop") wireSettlementShopPanel(root, "market");
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
      '<div class="actions"><button type="button" id="churchBless">Receive blessing</button></div>' +
      revivalRitesPanelHtml()
    );
  }

  function revivalRitesPanelHtml() {
    var fallen = partyFallenMembers();
    var html = '<h3 class="church-section-title" style="margin-top:1rem">Revival rites</h3>' +
      '<p>Restore a fallen companion to full health for <b>25 gp</b>, or use a <b>Potion of Life</b> to bring them back at half HP.</p>';
    if (fallen.length === 0) {
      html += '<p class="hint">No one to revive.</p>';
    } else {
      html += '<div class="shop-block">';
      for (var i = 0; i < fallen.length; i++) {
        var m = fallen[i];
        var reviveDaysLeft = Math.max(0, 2 - fallenJourneyDaysDead(m));
        html += '<div class="shop-row" style="flex-wrap:wrap;gap:.4rem">' +
          '<span>' + m.name + ' (' + roleLabel(m.role) + ')' +
          (reviveDaysLeft <= 0
            ? ' — <b class="hi">revive now</b>'
            : ' — <span class="hint">' + reviveDaysLeft + ' journey day' + (reviveDaysLeft !== 1 ? 's' : '') + ' to revive</span>') +
          '</span>' +
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
    return html;
  }

  function wireRevivalRites(root) {
    if (!root) return;
    var fallen = partyFallenMembers();
    for (var ri = 0; ri < fallen.length; ri++) {
      (function (m) {
        var btn = root.querySelector("#reviveAtChurch-" + m.id);
        if (btn) btn.onclick = function () { reviveAtChurch(m.id); };
        var lifeBtn = root.querySelector("#reviveLifeAtChurch-" + m.id);
        if (lifeBtn) lifeBtn.onclick = function () { reviveWithLifePotionAtChurch(m.id); };
      })(fallen[ri]);
    }
  }

  function settlementChurchPanelHtml() {
    var html =
      '<div class="actions"><button type="button" id="settlementBless">Receive blessing</button></div>';
    var headstones = (state.headstones || []).filter(function (hs) {
      return hs && hs.town === state.settlementTown;
    });
    html += revivalRitesPanelHtml();
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


  function caravanLockerHtml(opts) {
    opts = opts || {};
    syncWeaponStockCounter();
    reconcileGearStashWithEquipment();
    var vendorKind = shopVendorKind(opts.vendor);
    var sellEnabled = typeof opts.sellEnabled === "boolean" ? opts.sellEnabled : gearLockerSellEnabled();
    var groups = sellableStashGroups();
    var cargoHint =
      vendorKind === "qm"
        ? "Quartermasters buy <b>rare</b> spare gear only. Equipped loadouts live on each fighter's paper doll in Inventory."
        : "Caravan cargo — spare gear the train carries. Market shopkeepers buy <b>common</b> and <b>uncommon</b> items. Equip from each fighter's paper doll in Inventory.";
    var html =
      '<h3 class="church-section-title shop-locker-title">Caravan locker</h3>' +
      '<p class="hint shop-locker-hint">' +
      cargoHint +
      "</p>" +
      '<p class="hint shop-locker-cargo">Supplies: <b>' +
      state.food +
      "</b> · Healing potions: <b>" +
      state.healingPotions +
      "</b> · Life potions: <b>" +
      state.lifePotions +
      "</b></p>";
    var gi;
    if (!groups.length) {
      html += '<p class="hint">Locker is empty.</p>';
      return html;
    }
    html +=
      '<p class="hint shop-locker-spare-title"><b>Cargo' +
      (sellEnabled ? (vendorKind === "qm" ? " — quartermaster buys rare gear only" : " — shopkeepers buy common & uncommon gear") : "") +
      "</b></p>" +
      '<div class="shop-block shop-locker-block shop-locker-spare">';
    for (gi = 0; gi < groups.length; gi++) {
      var grp = groups[gi];
      var def = equipmentItemDef(grp.id);
      if (!def) continue;
      var canSell = sellEnabled && canVendorBuyStashItem(grp.id, vendorKind);
      var sellPrice = canSell ? gearSellPriceForId(grp.id, vendorKind) : 0;
      var label = formatEquipmentLabel(def, grp.id);
      if (grp.qty > 1) label += " ×" + grp.qty;
      html +=
        '<div class="shop-inv-row">' +
        '<span class="shop-inv-label">' +
        escapeHtml(label) +
        "</span>" +
        '<span class="shop-inv-actions">';
      if (canSell) {
        html +=
          '<button type="button" class="shop-inv-sell-btn" data-shop-sell-item="' +
          escapeHtml(grp.id) +
          '" data-shop-sell-qty="1"' +
          (sellPrice > 0 ? "" : " disabled") +
          ">Sell 1 @ " +
          sellPrice +
          " gp</button>";
        if (grp.qty > 1) {
          html +=
            '<button type="button" class="shop-inv-sell-btn" data-shop-sell-item="' +
            escapeHtml(grp.id) +
            '" data-shop-sell-qty="all"' +
            (sellPrice > 0 ? "" : " disabled") +
            ">Sell all (" +
            sellPrice * grp.qty +
            " gp)</button>";
        }
      } else if (!sellEnabled) {
        html += '<span class="hint">Equip from paper doll · sell at town</span>';
      } else if (vendorKind === "market" && isRareItemId(grp.id)) {
        html += '<span class="hint">Sell rare gear at the quartermaster</span>';
      } else if (vendorKind === "qm" && isCommonOrUncommonItemId(grp.id)) {
        html += '<span class="hint">Sell at market stalls</span>';
      } else {
        html += '<span class="hint">Not bought here</span>';
      }
      html += "</span></div>";
    }
    html += "</div>";
    return html;
  }

  function shopCaravanLockerHtml(vendorKind) {
    return caravanLockerHtml({ sellEnabled: true, vendor: vendorKind });
  }

  function wireShopCaravanLocker(root) {
    if (!root) return;
    var btns = root.querySelectorAll("[data-shop-sell-item]");
    for (var bi = 0; bi < btns.length; bi++) {
      (function (btn) {
        btn.onclick = function () {
          sellGearFromStash(btn.getAttribute("data-shop-sell-item"), btn.getAttribute("data-shop-sell-qty"));
        };
      })(btns[bi]);
    }
  }


  function settlementArmorShopRowHtml() {
    var catalog = shopPurchasableArmor();
    if (!catalog.length) {
      return '<p class="hint">No armor is posted for sale at this shop.</p>';
    }
    var selectedId = state.shopArmorId || catalog[0].id;
    if (!equipmentItemDef(selectedId)) selectedId = catalog[0].id;
    var selected = equipmentItemDef(selectedId) || catalog[0];
    var opts = catalog
      .map(function (def) {
        return (
          '<option value="' +
          escapeHtml(def.id) +
          '"' +
          (def.id === selectedId ? " selected" : "") +
          ">" +
          escapeHtml(def.label) +
          " — " +
          def.buyPrice +
          " gp buy, +" +
          (def.defBonus || 0) +
          " def</option>"
        );
      })
      .join("");
    var buyPrice = selected.buyPrice || 1;
    var maxBuy = Math.floor(state.gold / buyPrice);
    var qtyCap = Math.max(maxBuy, 1);
    return (
      '<div class="shop-row shop-row-armor" style="flex-wrap:wrap;gap:.5rem;align-items:center">' +
      '<span class="shop-row-label" style="flex:1 1 14rem"><b>Armor</b></span>' +
      '<span class="shop-row-controls" style="display:flex;flex-wrap:wrap;gap:.4rem;align-items:center">' +
      '<select id="shopArmorPick" class="shop-qty" style="width:auto;max-width:16rem">' +
      opts +
      "</select>" +
      ' qty <input type="number" min="1" max="' +
      qtyCap +
      '" value="1" id="shopQty-armor" data-max-buy="' +
      maxBuy +
      '" class="shop-qty" style="width:4.5em" /> ' +
      keepQmMemberSelectHtml("shopEquipArmor") +
      ' <button type="button" id="shopBuyArmorStash"' +
      (maxBuy > 0 ? "" : " disabled") +
      ">Buy @ " +
      buyPrice +
      ' gp</button>' +
      ' <button type="button" id="shopBuyArmorEquip"' +
      (maxBuy > 0 ? "" : " disabled") +
      '>Buy & equip</button>' +
      "</span></div>"
    );
  }
  function settlementWeaponShopRowHtml(vendorKind) {
    syncWeaponStockCounter();
    vendorKind = shopVendorKind(vendorKind);
    var catalog = shopPurchasableWeapons(vendorKind);
    if (!catalog.length) {
      return "";
    }
    var selectedId = state.shopWeaponId || catalog[0].id;
    if (!weaponSheetDef(selectedId)) selectedId = catalog[0].id;
    var selected = weaponSheetDef(selectedId) || catalog[0];
    var opts = catalog
      .map(function (w) {
        return (
          '<option value="' +
          escapeHtml(w.id) +
          '"' +
          (w.id === selectedId ? " selected" : "") +
          ">" +
          escapeHtml(w.name) +
          " — " +
          w.buyPrice +
          " gp buy" +
          (w.dmgModifier ? ", +" + w.dmgModifier + " dmg" : "") +
          "</option>"
        );
      })
      .join("");
    var buyPrice = selected.buyPrice || 1;
    var maxBuy = Math.floor(state.gold / buyPrice);
    var qtyCap = Math.max(maxBuy, 1);
    return (
      '<div class="shop-row shop-row-weapon" style="flex-wrap:wrap;gap:.5rem;align-items:center">' +
      '<span class="shop-row-label" style="flex:1 1 14rem"><b>Rare weapons</b> <span class="hint">(quartermaster stock)</span></span>' +
      '<span class="shop-row-controls" style="display:flex;flex-wrap:wrap;gap:.4rem;align-items:center">' +
      '<select id="shopWeaponPick" class="shop-qty" style="width:auto;max-width:16rem">' +
      opts +
      "</select>" +
      ' qty <input type="number" min="1" max="' +
      qtyCap +
      '" value="1" id="shopQty-weapon" data-max-buy="' +
      maxBuy +
      '" class="shop-qty" style="width:4.5em" /> ' +
      keepQmMemberSelectHtml("shopEquipWeapon") +
      ' <button type="button" id="shopBuyWeaponStash"' +
      (maxBuy > 0 ? "" : " disabled") +
      ">Buy @ " +
      buyPrice +
      ' gp</button>' +
      ' <button type="button" id="shopBuyWeaponEquip"' +
      (maxBuy > 0 ? "" : " disabled") +
      '>Buy & equip</button>' +
      "</span></div>"
    );
  }

  function settlementShopPanelHtml(vendorKind) {
    vendorKind = shopVendorKind(vendorKind);
    var weaponRow = settlementWeaponShopRowHtml(vendorKind);
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
      weaponRow +
      settlementArmorShopRowHtml() +
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
        buyPrice: LIFE_POTION_BUY_GP,
        sellPrice: 7,
        maxBuy: Math.floor(state.gold / LIFE_POTION_BUY_GP),
        maxSell: state.lifePotions,
      }) +
      shopRowHtml({
        id: "gem",
        label: "Gem",
        count: state.gems,
        sellPrice: 5,
        maxSell: state.gems,
      }) +
      "</div>" +
      shopCaravanLockerHtml(vendorKind)
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
            ? '<p class="shopkeeper-lead">The citadel quartermaster stocks rare steel and buys rare spare gear from your locker.</p>' + settlementShopPanelHtml('qm') + keepQmExoticSectionHtml()
            : '<p class="shopkeeper-lead">The crown quartermaster stocks rare steel and buys rare spare gear from your locker.</p>' + settlementShopPanelHtml('qm') + keepQmExoticSectionHtml();
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


  function chancellorGrantForCaravanCivilians(n) {
    return Math.max(0, n) * CHANCELLOR_GP_PER_CARAVAN_CIVILIAN;
  }

  function queueChancellorCaravanGrant(n) {
    var add = chancellorGrantForCaravanCivilians(n);
    if (!(add > 0)) return;
    state.chancellorGrantDue = (state.chancellorGrantDue || 0) + add;
  }

  function applyChancellorCaravanGrantIfPending() {
    var due = state.chancellorGrantDue || 0;
    if (!(due > 0)) return 0;
    state.chancellorGrantDue = 0;
    state.gold = (state.gold || 0) + due;
    var civCount = state.caravan && state.caravan.total > 0 ? state.caravan.total : 0;
    logLine(
      "Chancellor Aldric Venn counts <b>" +
        civCount +
        "</b> civilians on the manifest and pays <span class=\"hi\">" +
        due +
        " gp</span> (" +
        CHANCELLOR_GP_PER_CARAVAN_CIVILIAN +
        " gp each) atop the crown's base stipend.",
      "good"
    );
    trackPlaytest("chancellor_caravan_grant", {
      gold: due,
      civilians: civCount,
      loop: state.caravanLoops || 0,
      day: state.totalDaysElapsed || 0,
    });
    return due;
  }

  function applyKewKumberLoopGrantIfPending() {
    var due = state.kewKumberGrantDue || 0;
    if (!(due > 0)) return 0;
    state.kewKumberGrantDue = 0;
    state.gold = (state.gold || 0) + due;
    logLine(
      "Governor Kew Kumber presses <span class=\"hi\">" + due + " gp</span> into the new caravan's purse — crown support after your last companions rooted in New Isil.",
      "good"
    );
    trackPlaytest("kew_kumber_loop_grant", { gold: due, loop: state.caravanLoops || 0, day: state.totalDaysElapsed || 0 });
    return due;
  }

  function pickNpcDialogueLine(def, dialogKey) {
    var lines = (def && def.lines) || [];
    if (!lines.length) return "";
    if (dialogKey === "cantebury_governor") {
      if ((state.totalDaysElapsed || 0) >= STABILITY_TARGET_DAYS - 10) return lines[lines.length - 1];
      if ((state.caravanLoops || 0) > 0) return lines[Math.min(3, lines.length - 1)];
    }
    if (dialogKey === "cantebury_chancellor") {
      if ((state.chancellorGrantDue || 0) > 0) return lines[0];
      if (newIsilSettlerCount() > 0) return lines[Math.min(1, lines.length - 1)];
    }
    return lines[rollInt(0, lines.length - 1)];
  }

  function openKeepNpcDialog(dialogKey) {
    var def = npcDialogueDef(dialogKey);
    if (!def) return;
    var grantAmt = 0;
    if (dialogKey === "cantebury_governor") grantAmt = applyKewKumberLoopGrantIfPending();
    else if (dialogKey === "cantebury_chancellor") grantAmt = applyChancellorCaravanGrantIfPending();
    var text = pickNpcDialogueLine(def, dialogKey);
    if (dialogKey === "cantebury_governor" && grantAmt > 0) {
      text =
        "Word reached Cantebury that your last fighters stayed to build New Isil. The crown sets aside " +
        grantAmt +
        " gold for whoever leads the next westward train — take it, and keep the road open.";
    }
    if (dialogKey === "cantebury_chancellor" && grantAmt > 0) {
      var civCount = state.caravan && state.caravan.total > 0 ? state.caravan.total : 0;
      text =
        "Your manifest lists " +
        civCount +
        " civilians marching west. The crown pays ten gold per soul on the train — " +
        grantAmt +
        " gold in all, on top of the hundred already set aside for the caravan.";
    }
    state.npcDialog = {
      speaker: def.speaker,
      title: def.title,
      portrait: def.portrait,
      text: text,
    };
    render();
  }

  function eastboundRevisitDepartHtml(fromTownKey) {
    var targets = eastboundRevisitTargets(fromTownKey);
    if (!targets.length) return "";
    var reverseKey = targets[0];
    var dest = destinationForKey(reverseKey);
    var totalHome = totalEastboundDaysToCantebury(fromTownKey);
    return (
      '<p class="town-lead">Eastbound — march the trail home <b>one leg at a time</b>, with the same road days and encounter risk as the westward march.</p>' +
      '<p class="hint">Next hop: <b>' +
      dest.label +
      "</b>" +
      legDepartDaysHint(fromTownKey, reverseKey) +
      (totalHome > 0
        ? ". Full return to Cantebury from here: ~<b>" + totalHome + "</b> journey day(s) across all remaining legs."
        : "") +
      "</p>" +
      '<div class="actions" style="flex-wrap:wrap;gap:.4rem">' +
      '<button type="button" class="primary" data-eastbound-to="' +
      reverseKey +
      '">March to ' +
      dest.label +
      legDepartDaysHint(fromTownKey, reverseKey) +
      "</button></div>"
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
    if (state.settlementView === "colony" && townKey === "new_isil") return head + newIsilColonyPanelHtml();
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
      return head + '<p class="shopkeeper-lead">Restock supplies and armor; shopkeepers buy common and uncommon spare gear from your locker.</p>' + settlementShopPanelHtml('market');
    }
    if (state.settlementView === "inventory") {
      return (
        '<h2 class="panel-title">Party & resources</h2>' +
        resourcesStatsGridHtml() +
        caravanLockerHtml({ sellEnabled: true }) +
        inventoryScreenHtml() +
        questPanelHtml()
      );
    }
    if (state.settlementView === "adventure") {
      return (
        head +
        '<p class="town-lead">Strike out for an adventuring trek. Up to <b>10 days</b> exploring the wilds near ' +
        locationLabel(townKey) +
        ". Each day spent outbound rolls an encounter. Turning back marches home one day at a time with the same encounter risk and supply cost.</p>" +
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

  function settlerStatusLabel(settler) {
    if (settler.rejoined) return "rejoined";
    if (settlerCanRejoin(settler)) return "eligible";
    return settlerRejoinDaysRemaining(settler) + " day(s) until rejoin";
  }

  function settlementCompanionPanelHtml(townKey) {
    ensureSettledCompanions();
    var town = destinationForKey(townKey);
    var settlersHere = settlersAtTown(townKey, false);
    var settlerList =
      settlersHere.length === 0
        ? '<p class="hint">No companions settled here yet.</p>'
        : "<ul>" +
          settlersHere
            .map(function (s) {
              return (
                "<li><b>" +
                escapeHtml(s.name) +
                "</b> (" +
                roleLabel(s.role) +
                ") — settled day " +
                (s.settledOnDay || "?") +
                ", rejoin " +
                settlerStatusLabel(s) +
                "</li>"
              );
            })
            .join("") +
          "</ul>";
    var partyRows = "";
    if (townKey === "new_isil") {
      partyRows = state.party
        .map(function (m) {
          if (!m || m.hp <= 0) return "";
          return (
            '<div class="shop-row" style="align-items:center;gap:.5rem">' +
            "<span><b>" +
            escapeHtml(m.name) +
            "</b> (" +
            roleLabel(m.role) +
            ")</span>" +
            '<button type="button" data-settle-at-town="new_isil" data-settle-member="' +
            m.id +
            '">Settle in New Isil</button>' +
            "</div>"
          );
        })
        .join("");
    }
    var rejoinRows = settlersHere
      .map(function (s) {
        var eligible = settlerCanRejoin(s);
        var status = eligible ? settlerStatusLabel(s) : settlerRejoinDaysRemaining(s) + " day(s) left";
        return (
          '<div class="shop-row" style="align-items:center;gap:.5rem">' +
          "<span><b>" +
          escapeHtml(s.name) +
          "</b> (" +
          roleLabel(s.role) +
          ", settled — " +
          status +
          ")</span>" +
          '<button type="button" data-rejoin-settler="' +
          s.id +
          '"' +
          (eligible ? "" : " disabled") +
          ">Rejoin caravan (−25% stats)</button>" +
          "</div>"
        );
      })
      .join("");
    return (
      '<p class="hint">Companions who settle must wait <b>one year</b> (' +
      SETTLER_REJOIN_COOLDOWN_DAYS +
      " journey days) before rejoining. After that, invite them back here for a permanent −25% stat penalty.</p>" +
      "<h3 class=\"roster-heading\">Settled in " +
      escapeHtml(town.label) +
      "</h3>" +
      settlerList +
      (partyRows
        ? "<h3 class=\"roster-heading\">Caravan — settle companions</h3>" + partyRows
        : "") +
      (rejoinRows ? "<h3 class=\"roster-heading\">Invite settlers back</h3>" + rejoinRows : "")
    );
  }

  function wireSettlementCompanionActions(root) {
    var settleBtns = root.querySelectorAll("[data-settle-at-town][data-settle-member]");
    var i;
    for (i = 0; i < settleBtns.length; i++) {
      settleBtns[i].onclick = (function (btn) {
        return function () {
          settleMemberAtTownId(btn.getAttribute("data-settle-member"), btn.getAttribute("data-settle-at-town"));
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
  }

  function newIsilDepartPanelHtml() {
    syncNewIsilPopulation();
    var pop = state.newIsilGrowth ? state.newIsilGrowth.population : NEW_ISIL_BASE_POPULATION;
    var settlersHere = settlersAtTown("new_isil", false);
    var partyRows = state.party.some(function (m) {
      return m && m.hp > 0;
    });
    return (
      '<p class="town-lead">New Isil is the harbor goal. <b>Leave everyone behind</b> here — when the fighting line is fully settled, Cantebury raises a <b>new leader and fresh party</b> while journey day <b>' +
      (state.totalDaysElapsed || 0) +
      " / " +
      effectiveStabilityTarget() +
      '</b> keeps counting. Or keep fighters and march <b>eastbound</b> home; on later visits you may invite settlers back after their year away (−25% stats).</p>' +
      '<p><b>Harbor population:</b> ' +
      pop +
      " (+" +
      settlersHere.length +
      " from your caravans)</p>" +
      settlementCompanionPanelHtml("new_isil") +
      (partyRows
        ? '<div class="actions"><button type="button" class="primary" id="settleAllAtNewIsilBtn">' +
          (isPresetLeaderCampaign()
            ? 'Complete Captain Vale\'s arc — settle entire caravan'
            : 'Leave everyone in New Isil — new party at Cantebury') +
          '</button></div>' +
          (isPresetLeaderCampaign()
            ? '<p class="hint">Captain Elara Vale stays in command until everyone settles. Cantebury sends a <b>new</b> leader for the next westward march.</p>'
            : '')
        : "") +
      newIsilDepotPanelHtml() +
      "<h3 class=\"roster-heading\">Eastbound depart</h3>" +
      (partyRows
        ? eastboundRevisitDepartHtml("new_isil")
        : '<p class="hint">No fighters remain — settle everyone above or invite settlers back before marching east.</p>') +
      '<p class="hint">Journey day ' +
      (state.totalDaysElapsed || 0) +
      " / " +
      effectiveStabilityTarget() +
      (mustDefeatFinalHarborBoss() ? " — defeat Kew Kumber on the final westward leg (day " + FINAL_BOSS_MIN_DAYS + "+)" : "") +
      ".</p>"
    );
  }

  function wireNewIsilDepart(root) {
    var settleAllBtn = root.querySelector("#settleAllAtNewIsilBtn");
    if (settleAllBtn) settleAllBtn.onclick = settleAllPartyAtNewIsil;
    var depotBtn = root.querySelector("#retrieveNewIsilDepotBtn");
    if (depotBtn) depotBtn.onclick = retrieveNewIsilDepot;
    wireSettlementCompanionActions(root);
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
      var offerBtns = root.querySelectorAll("[data-offer-quest]");
    var ob;
    for (ob = 0; ob < offerBtns.length; ob++) {
      offerBtns[ob].onclick = (function (btn) {
        return function () {
          acceptQuest(btn.getAttribute("data-offer-quest"));
        };
      })(offerBtns[ob]);
    }
  }
    var offerBtns = root.querySelectorAll("[data-offer-quest]");
    var ob;
    for (ob = 0; ob < offerBtns.length; ob++) {
      offerBtns[ob].onclick = (function (btn) {
        return function () {
          acceptQuest(btn.getAttribute("data-offer-quest"));
        };
      })(offerBtns[ob]);
    }
  }

  function settlementTavernHtml(townKey) {
    return (
      '<p class="tavern-lead">Fresh crews trade stories and caravan contracts. The barkeep eyes you over a mug.</p>' +
      '<div class="tavern-choice-row">' +
      '<button type="button" class="primary" id="barkeepBtn">Talk to the barkeep</button>' +
      "</div>" +
      rosterEditHtml("Tavern roster", settlementRecruitNote(townKey)) +
      (townKey === "new_isil"
        ? '<div class="sheet-divider"></div><p class="hint">To settle companions, use the <b>Depart</b> tab.</p>'
        : '<p class="hint" style="margin-top:1rem">Companions settle only at <b>New Isil</b> (Depart tab there).</p>')
    );
  }

  function wireTavernBarkeep(root) {
    var barkeepBtn = root.querySelector("#barkeepBtn");
    if (barkeepBtn) barkeepBtn.onclick = function () { openBarkeepDialog(); };
  }

  function wireCanteburyBlessing(root) {
    wireRevivalRites(root);
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
    wireRevivalRites(root);
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

  function wireSettlementWeaponShop(root) {
    var pick = root.querySelector("#shopWeaponPick");
    if (pick) {
      pick.onchange = function () {
        state.shopWeaponId = pick.value;
        render();
      };
    }
    var buyStash = root.querySelector("#shopBuyWeaponStash");
    var buyEquip = root.querySelector("#shopBuyWeaponEquip");
    var weaponId = pick ? pick.value : state.shopWeaponId;
    if (buyStash) {
      buyStash.onclick = function () {
        buySettlementWeapon(weaponId, readShopQty("weapon"), null);
      };
    }
    if (buyEquip) {
      buyEquip.onclick = function () {
        var memSel = root.querySelector("#shopEquipWeapon");
        buySettlementWeapon(weaponId, readShopQty("weapon"), memSel ? memSel.value : null);
      };
    }
  }


  function wireSettlementArmorShop(root) {
    var pick = root.querySelector("#shopArmorPick");
    if (pick) {
      pick.onchange = function () {
        state.shopArmorId = pick.value;
        render();
      };
    }
    var buyStash = root.querySelector("#shopBuyArmorStash");
    var buyEquip = root.querySelector("#shopBuyArmorEquip");
    var armorId = pick ? pick.value : state.shopArmorId;
    if (buyStash) {
      buyStash.onclick = function () {
        buySettlementArmor(armorId, readShopQty("armor"), null);
      };
    }
    if (buyEquip) {
      buyEquip.onclick = function () {
        var memSel = root.querySelector("#shopEquipArmor");
        buySettlementArmor(armorId, readShopQty("armor"), memSel ? memSel.value : null);
      };
    }
  }

  function wireSettlementShopPanel(root, vendorKind) {
    state.shopVendorKind = shopVendorKind(vendorKind);
    wireShopRow("supplies", buySettlementSupplies, sellSettlementSupplies);
    if (state.shopVendorKind === "qm") wireSettlementWeaponShop(root);
    wireSettlementArmorShop(root);
    wireShopRow("healPotion", buySettlementHealPotion, sellSettlementHealPotion);
    wireShopRow("lifePotion", buySettlementLifePotion, sellSettlementLifePotion);
    wireShopRow("gem", null, sellSettlementGem);
    wireShopCaravanLocker(root);
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
      wireSettlementShopPanel(root, "qm");
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

  function buySettlementWeapon(weaponId, qty, equipMemberId) {
    qty = Math.max(0, parseInt(qty, 10) || 1);
    var wdef = weaponSheetDef(weaponId);
    var qmRare = wdef && isRareWeaponId(weaponId);
    if (!wdef || (state.shopVendorKind !== "qm" && (!wdef.purchase || !(wdef.buyPrice > 0))) || (state.shopVendorKind === "qm" && !qmRare)) {
      logLine("That weapon is not sold here.", "bad");
      render();
      return;
    }
    if (!equipmentItemDef(weaponId)) {
      logLine("Weapon " + (wdef.name || weaponId) + " is not in the equipment catalog yet.", "bad");
      render();
      return;
    }
    var buyPrice = state.shopVendorKind === "qm" ? qmWeaponBuyPrice(wdef) : wdef.buyPrice;
    var affordable = Math.floor(state.gold / buyPrice);
    var actual = Math.min(qty, affordable);
    if (actual <= 0) {
      logLine("Need " + buyPrice + " gp to buy a " + wdef.name + ".", "bad");
      render();
      return;
    }
    var member = equipMemberId ? teamMemberById(equipMemberId) : null;
    if (equipMemberId && !member) {
      logLine("Pick a party member to equip the " + wdef.name + ".", "bad");
      render();
      return;
    }
    state.gold -= actual * buyPrice;
    var equipped = 0;
    var stashed = 0;
    for (var i = 0; i < actual; i++) {
      if (member && addWeaponToStash(weaponId) && equipItemOnMember(member, "weapon", weaponId)) {
        equipped++;
      } else if (addWeaponToStash(weaponId)) {
        stashed++;
      }
    }
    var msg =
      "Bought " +
      actual +
      " " +
      wdef.name +
      (actual > 1 ? "s" : "") +
      " for " +
      actual * buyPrice +
      " gp.";
    if (equipped) msg += " " + member.name + " equipped " + equipped + ".";
    if (stashed) msg += " " + stashed + " stowed in the caravan locker — equip from the paper doll.";
    logLine(msg, "good");
    render();
  }


  function buySettlementArmor(armorId, qty, equipMemberId) {
    qty = Math.max(0, parseInt(qty, 10) || 1);
    var adef = equipmentItemDef(armorId);
    if (!adef || adef.slot !== "armor" || !adef.purchase || !(adef.buyPrice > 0)) {
      logLine("That armor is not sold in town shops.", "bad");
      render();
      return;
    }
    var buyPrice = adef.buyPrice;
    var affordable = Math.floor(state.gold / buyPrice);
    var actual = Math.min(qty, affordable);
    if (actual <= 0) {
      logLine("Need " + buyPrice + " gp to buy " + adef.label + ".", "bad");
      render();
      return;
    }
    var member = equipMemberId ? teamMemberById(equipMemberId) : null;
    if (equipMemberId && !member) {
      logLine("Pick a party member to equip the " + adef.label + ".", "bad");
      render();
      return;
    }
    state.gold -= actual * buyPrice;
    var equipped = 0;
    var stashed = 0;
    for (var i = 0; i < actual; i++) {
      addToGearStash(armorId);
      if (member && equipItemOnMember(member, "armor", armorId)) {
        equipped++;
      } else {
        stashed++;
      }
    }
    var msg =
      "Bought " +
      actual +
      " " +
      adef.label +
      (actual > 1 ? " suits" : "") +
      " for " +
      actual * buyPrice +
      " gp.";
    if (equipped) msg += " " + member.name + " equipped " + equipped + ".";
    if (stashed) msg += " " + stashed + " in gear stash — open Party to equip.";
    logLine(msg, "good");
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
    var affordable = Math.floor(state.gold / LIFE_POTION_BUY_GP);
    var actual = Math.min(qty, affordable);
    if (actual <= 0) {
      logLine("Need " + LIFE_POTION_BUY_GP + " gp for a Potion of Life.", "bad");
      render();
      return;
    }
    state.gold -= actual * LIFE_POTION_BUY_GP;
    state.lifePotions += actual;
    logLine("Bought " + actual + " Potion of Life for " + (actual * LIFE_POTION_BUY_GP) + " gp.", "good");
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

  function sellSettlementWeapon(weaponId, qty) {
    qty = Math.max(0, parseInt(qty, 10) || 1);
    syncWeaponStockCounter();
    var wdef = weaponSheetDef(weaponId);
    var label = wdef ? wdef.name : weaponId || "weapon";
    var sellPrice = weaponSellPriceForId(weaponId);
    var available = countStashWeaponId(weaponId);
    var actual = Math.min(qty, available);
    if (actual <= 0) {
      logLine("No " + label + " in the gear stash to sell.", "bad");
      render();
      return;
    }
    var sold = 0;
    var goldGain = 0;
    for (var i = 0; i < actual; i++) {
      if (removeOneWeaponFromStash(weaponId)) {
        sold++;
        goldGain += sellPrice;
      }
    }
    if (sold <= 0) {
      logLine("No " + label + " in the gear stash to sell.", "bad");
      render();
      return;
    }
    state.gold += goldGain;
    logLine(
      "Sold " + sold + " " + label + (sold > 1 ? "s" : "") + " from stash for " + goldGain + " gp.",
      "good"
    );
    render();
  }

  function sellGearFromStash(itemId, qty) {
    var def = equipmentItemDef(itemId);
    if (!def) {
      logLine("That item is not in the caravan locker.", "bad");
      render();
      return;
    }
    var vendorKind = state.shopVendorKind || "market";
    if (!canVendorBuyStashItem(itemId, vendorKind)) {
      if (vendorKind === "market" && isRareItemId(itemId)) {
        logLine("Shopkeepers only buy common and uncommon gear — try the quartermaster for rare items.", "bad");
      } else if (vendorKind === "qm" && isCommonOrUncommonItemId(itemId)) {
        logLine("The quartermaster only buys rare gear — sell common and uncommon items at market stalls.", "bad");
      } else {
        logLine("This shop won't buy that item.", "bad");
      }
      render();
      return;
    }
    var sellPrice = gearSellPriceForId(itemId, vendorKind);
    if (!(sellPrice > 0)) {
      logLine("The shopkeeper will not buy that item.", "bad");
      render();
      return;
    }
    reconcileGearStashWithEquipment();
    var available = sellableStashQty(itemId);
    if (available <= 0) {
      if (countEquippedItemId(itemId) > 0) {
        logLine((def.label || itemId) + " is equipped — only spare copies in the locker can be sold.", "bad");
      } else {
        logLine("No " + (def.label || itemId) + " left in the locker to sell.", "bad");
      }
      render();
      return;
    }
    var want = qty;
    if (want === "all" || want === "ALL") want = available;
    else want = Math.max(1, parseInt(want, 10) || 1);
    var actual = Math.min(want, available);
    var sold = 0;
    var goldGain = 0;
    for (var si = 0; si < actual; si++) {
      if (removeFromGearStash(itemId)) {
        sold++;
        goldGain += sellPrice;
        if (def.slot === "weapon") syncWeaponStockCounter();
      }
    }
    if (sold <= 0) {
      logLine("Could not sell " + (def.label || itemId) + ".", "bad");
      render();
      return;
    }
    state.gold += goldGain;
    logLine(
      "Sold " + sold + " " + def.label + (sold > 1 ? "s" : "") + " for " + goldGain + " gp.",
      "good"
    );
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
    clearFallenDeathClock(m);
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
    clearFallenDeathClock(m);
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
    clearFallenDeathClock(m);
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
    var vetBtns = root.querySelectorAll("[data-hire-veteran-role]");
    var vi;
    for (vi = 0; vi < vetBtns.length; vi++) {
      vetBtns[vi].onclick = (function (btn) {
        return function () {
          hireTavernVeteran(btn.getAttribute("data-hire-veteran-role"), parseInt(btn.getAttribute("data-hire-veteran-level"), 10));
        };
      })(vetBtns[vi]);
    }
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
    state.legMarchProgress = 0;
    state.encounterChance = ENCOUNTER_BASE;
    state.ruinsDiscovered = false;
    state.ruinsType = null;
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
      replenishCaravanAtCantebury();
    }
    var hadLeg = !!(state.legDaysByRoute && state.legDaysByRoute[legRouteKey(originKey, dest.key)]);
    state.legRouteDays = resolveLegRouteDays(originKey, dest.key);
    applyDepartBossGateForLeg(dest, originKey);
    var originLabel = currentOriginLabel();
    var legNote =
      isEastboundLeg(originKey, dest.key)
        ? ", same leg length as your westward hop on this road (" +
          state.legRouteDays +
          " day" +
          (state.legRouteDays === 1 ? "" : "s") +
          " eastbound)"
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
      var segBiome = biomeForLegTravelDay(
        i,
        routeDays,
        state.travelOrigin || "cantebury",
        state.travelDestination || "gustaf"
      );
      segs +=
        '<div class="map-seg map-seg--' +
        escapeHtml(segBiome) +
        (done ? " done" : "") +
        (cur ? " current" : "") +
        (marchingSeg ? " map-seg-marching" : "") +
        '">' +
        '<span class="map-day">D' +
        i +
        "</span>" +
        '<span class="map-biome" title="' +
        escapeHtml(biomeLabel(segBiome)) +
        '">' +
        escapeHtml(biomeLabel(segBiome).charAt(0)) +
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
        ? " (eastbound — one leg homeward; encounters roll each day as on the westward march)"
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
    var leg = campTravelLegDay();
    var biomeKey = currentTravelBiome();
    var biomeName = biomeLabel(biomeKey);
    return (
      '<div class="scene scene-splash scene-travel scene-biome-' +
      escapeHtml(biomeKey) +
      '" role="img" aria-label="Travel in ' +
      escapeHtml(biomeName) +
      '">' +
      '<div class="splash-badge">' +
      escapeHtml(biomeName) +
      "</div>" +
      '<div class="splash-title">The road</div>' +
      '<div class="splash-sub">Leg ' +
      leg +
      " of " +
      currentRouteDays() +
      " — " +
      escapeHtml(biomeHint(biomeKey) || "miles roll on under open sky") +
      "</div>" +
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
    syncLeaderPartyMember();
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
      soldier: "Keeps the line under pressure — cleave, cover for squishy allies, and vanguard drills.",
      priest: "Carries old rites, mends wounds, and steadies morale on the road.",
      mercenary: "Scouts the trail and cuts with cleave — abilities, not spells.",
      mage: "Shapes fire and spark at range while the civilian train marches behind.",
    };
    var skillsByRole = {
      soldier: ["Shield wall", "Cleave", "Vanguard drills"],
      priest: ["Field medicine", "Rite of warding", "Camp counsel"],
      mercenary: ["Trail scouting", "Cleave", "Loot appraisal"],
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

  function memberWeaponEquipBlockHtml(member) {
    ensureMemberEquipment(member);
    var equippedId = member.equipment.weapon;
    var equippedDef = equipmentItemDef(equippedId);
    var html =
      '<div class="inv-weapon-block">' +
      '<p class="inv-equip-row"><b>Weapon</b>: ' +
      escapeHtml(formatEquipmentLabel(equippedDef, equippedId)) +
      (equippedId
        ? ' <button type="button" data-unequip-slot="' +
          escapeHtml(member.id) +
          '" data-slot="weapon">Unequip</button>'
        : ' <span class="hint">unarmed</span>') +
      "</p>";
    var groups = stashWeaponGroups();
    if (groups.length) {
      html += '<p class="hint inv-weapon-hint">Unequipped blades in the caravan locker:</p><div class="inv-weapon-stash">';
      for (var gi = 0; gi < groups.length; gi++) {
        var grp = groups[gi];
        var wdef = equipmentItemDef(grp.id);
        var label = formatEquipmentLabel(wdef, grp.id);
        if (grp.qty > 1) label += " x" + grp.qty;
        html +=
          '<button type="button" class="inv-weapon-equip-btn" data-equip-weapon="' +
          escapeHtml(grp.id) +
          '" data-equip-member="' +
          escapeHtml(member.id) +
          '">Equip ' +
          escapeHtml(label) +
          "</button>";
      }
      html += "</div>";
    } else {
      html += '<p class="hint">No spare weapons in stash. Buy at a settlement shop or win loot on the road.</p>';
    }
    html += "</div>";
    return html;
  }

  function memberEquipmentPanelHtml(member) {
    return (
      '<h4 class="paperdoll-heading">Paper doll — loadout</h4>' +
      '<p class="hint">Gear worn by this fighter. Pull spare pieces from the caravan locker below the roster.</p>' +
      memberPaperdollLoadoutHtml(member)
    );
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
            '<span class="inv-open-sub inv-open-equip">' +
            escapeHtml(memberEquipSlotsSummary(m)) +
            "</span>" +
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
        caravanLockerHtml({ sellEnabled: gearLockerSellEnabled(), vendor: "market" }) +
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
      wireShopCaravanLocker(root);
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
        clearFallenDeathClock(m);
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
    var weaponEquipBtns = root.querySelectorAll("[data-equip-weapon]");
    for (var wb = 0; wb < weaponEquipBtns.length; wb++) {
      weaponEquipBtns[wb].onclick = (function (btn) {
        return function () {
          var itemId = btn.getAttribute("data-equip-weapon");
          var mid = btn.getAttribute("data-equip-member");
          var mem = inventoryMemberById(mid);
          if (!mem || !itemId) return;
          if (equipItemOnMember(mem, "weapon", itemId)) {
            var def = equipmentItemDef(itemId);
            logLine(mem.name + " equips " + (def ? def.label : itemId) + ".", "good");
          }
          render();
        };
      })(weaponEquipBtns[wb]);
    }
    var equipSelects = root.querySelectorAll("select[data-equip-member]");
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

  function describeCombatChoice(member, rec) {
    if (!rec || !rec.action) return "";
    var act = rec.action;
    if (act === "defend") return "Defending";
    if (act === "attack") {
      var foe = rec.targetId ? findCombatFoeById(rec.targetId) : null;
      if (!foe && rec.targetId && state.combat) {
        var fs = state.combat.foes;
        for (var fi = 0; fi < fs.length; fi++) {
          if (fs[fi].id === rec.targetId) {
            foe = fs[fi];
            break;
          }
        }
      }
      return foe ? "Attack → " + foe.name : "Attack (pick target)";
    }
    if (act === "spell") {
      var sk = rec.spellKind || "spell";
      if (spellNeedsFoeTarget(member.role, sk)) {
        var sf = rec.targetId ? findCombatFoeById(rec.targetId) : null;
        return sf ? sk + " → " + sf.name : sk + " (pick foe)";
      }
      if (spellNeedsAllyTarget(member.role, sk)) {
        var al = rec.targetId ? teamMemberById(rec.targetId) : null;
        return al ? "Heal → " + al.name : "Heal (pick ally)";
      }
      return sk;
    }
    if (act === "ability") {
      if (rec.abilityKind === "cover") {
        var cov = rec.targetId ? teamMemberById(rec.targetId) : null;
        return cov ? "Cover → " + cov.name : "Cover (pick ally)";
      }
      return rec.abilityKind || "Ability";
    }
    if (act === "item") return rec.itemKind || "Item";
    return act;
  }

  function battlePartyCard(m, activeMemberId, allyTargetMode) {
    var ref = teamMemberById(m.id);
    if (!ref) return "";
    var pct = Math.round((100 * ref.hp) / ref.maxHp);
    var rec = choiceForMember(m.id);
    var act = rec && rec.action ? rec.action : null;
    var isActive = activeMemberId === m.id;
    var canBeAllyTarget =
      !!allyTargetMode &&
      ref.hp > 0 &&
      !(allyTargetMode === "cover" && m.id === activeMemberId);
    var healSelfLabel = m.id === activeMemberId && allyTargetMode === "heal" ? "Heal self" : "Target heal";
    var allyTargetBtn = canBeAllyTarget
      ? '<button type="button" class="act-btn primary" data-ally-target="' + m.id + '" style="margin-top:.35rem">' +
        (allyTargetMode === "cover" ? "Cover this ally" : healSelfLabel) +
        "</button>"
      : "";
    var actions = ["attack", "defend"];
    if (memberHasSpells(m.role)) actions.push("spell");
    if (memberHasAbilities(m.role)) actions.push("ability");
    actions.push("item");
    var labels = { attack: "Attack", defend: "Defend", spell: "Spell", ability: "Ability", item: "Item" };
    var btns = "";
    var itemMenu = "";
    var spellMenu = "";
    var abilityMenu = "";
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
    if (isActive && act === "ability" && memberHasAbilities(m.role)) {
      var selectedAbility = rec && rec.abilityKind ? rec.abilityKind : "";
      initMemberProgress(ref);
      var apLine = "AP " + (ref.ap || 0) + "/" + (ref.maxAp || abilityMaxApForRole(m.role));
      var cleaveAp = abilityApCost("cleave");
      var cleaveDisabled = memberCanUseAbility(ref, "cleave") ? "" : " disabled";
      var coverAp = abilityApCost("cover");
      var coverDisabled = memberCanUseAbility(ref, "cover") ? "" : " disabled";
      abilityMenu =
        '<div class="battle-item-menu">' +
        '<p class="hint" style="margin:0 0 .35rem">' + apLine + "</p>" +
        '<button type="button" class="act-btn' + (selectedAbility === "cleave" ? " selected" : "") + '" data-ability-choice="cleave"' + cleaveDisabled + ">Cleave (" + CLEAVE_DAMAGE + " dmg each foe, " + cleaveAp + " AP)</button>" +
        (m.role === "soldier"
          ? '<button type="button" class="act-btn' + (selectedAbility === "cover" ? " selected" : "") + '" data-ability-choice="cover"' + coverDisabled + ">Cover ally (you take 75% of hits on them, " + coverAp + " AP)</button>"
          : "") +
        "</div>";
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
      '<div class="battle-status">' +
      '<div class="battle-hp">' +
      ref.hp +
      "/" +
      ref.maxHp +
      "</div>" +
      (memberHasSpells(m.role)
        ? '<div class="battle-mp">' +
          (ref.mp || 0) +
          "/" +
          (ref.maxMp || memberMaxMp(ref)) +
          "</div>"
        : "") +
      "</div>" +
      "</div>" +
      '<div class="battle-actions">' +
      btns +
      spellMenu +
      abilityMenu +
      itemMenu +
      allyTargetBtn +
      (isActive && rec && rec.action
        ? '<button type="button" class="act-btn combat-cancel-btn" data-combat-cancel-step="' +
          m.id +
          '">Cancel</button>'
        : "") +
      (choiceComplete(m.id) && rec
        ? '<p class="combat-choice-lock">' + escapeHtml(describeCombatChoice(m, rec)) + "</p>"
        : "") +
      (!isActive && choiceComplete(m.id)
        ? '<button type="button" class="act-btn combat-cancel-btn" data-combat-undo="' +
          m.id +
          '">Undo</button>'
        : "") +
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
    var ru = state.ruinsDiscovered
      ? ruinsSiteLabel(currentRuinsSiteType()) + " (day " + state.ruinsTravelDay + ")"
      : "-";
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
      '</b> <span class="stat-hint">(' +
      dailySupplyCostLabel() +
      "/day)</span></div>" +
      "<div class=\"stat\">Caravan: <b>" +
      (state.caravan ? state.caravan.total : 0) +
      "</b> <span class=\"stat-hint\">civilians</span></div>" +
      "<div class=\"stat\">Weapons (stash): <b>" +
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
    var foes = foesAlive();
    var team = combatTeam();
    var tgt = lowestHpFoe();
    var i, mid, mem;
    for (i = 0; i < team.length; i++) {
      mid = team[i].id;
      mem = teamMemberById(mid);
      if (!mem || mem.hp <= 0) continue;
      if (!foes.length) {
        state.combat.choices[mid] = { action: "defend", targetId: null };
        continue;
      }
      state.combat.choices[mid] = {
        action: "attack",
        targetId: tgt ? tgt.id : foes[0].id,
      };
    }
    logLine(
      "Auto: every fighter attacks" + (tgt ? " <span class=\"hi\">" + escapeHtml(tgt.name) + "</span>" : "") + ".",
      "hi"
    );
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
    var abilityBtns = root.querySelectorAll("[data-ability-choice]");
    for (var abi = 0; abi < abilityBtns.length; abi++) {
      abilityBtns[abi].onclick = (function (ab) {
        return function () {
          chooseAbilityOption(ab.getAttribute("data-ability-choice"));
        };
      })(abilityBtns[abi]);
    }
    var allyTargets = root.querySelectorAll("[data-ally-target]");
    for (var at = 0; at < allyTargets.length; at++) {
      allyTargets[at].onclick = (function (ab) {
        return function () {
          chooseSpellAllyTarget(ab.getAttribute("data-ally-target"));
        };
      })(allyTargets[at]);
    }
    var cancelSteps = root.querySelectorAll("[data-combat-cancel-step]");
    for (var ci = 0; ci < cancelSteps.length; ci++) {
      cancelSteps[ci].onclick = function () {
        cancelCurrentCombatStep();
      };
    }
    var undoBtns = root.querySelectorAll("[data-combat-undo]");
    for (var ui = 0; ui < undoBtns.length; ui++) {
      undoBtns[ui].onclick = (function (btn) {
        return function () {
          cancelCombatMemberChoice(btn.getAttribute("data-combat-undo"));
        };
      })(undoBtns[ui]);
    }

    var autoBtn = root.querySelector("#autoRoundBtn");
    if (autoBtn) autoBtn.onclick = autoPlanRemainingChoices;
  }

  function render() {
    var app = document.getElementById("app");
    if (!app) return;
    syncTravelBiomeTheme();
    ensureCampaignSaveBar();
    updateCampaignSaveBar();
    syncConfirmOverlay();
    processOverdueFallenIfNeeded();

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
            "</b>.</p>" +
            colonyEpilogueHtml()
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
      if (state.confirmDialog) wireConfirmDialog(app);
      return;
    }

    if (state.phase === "new_game_setup") {
      var setupLead =
        (state.caravanLoops || 0) > 0 || (state.totalDaysElapsed || 0) > 0
          ? "<p class=\"town-lead\">Your last caravan settled entirely in New Isil. Journey day <b>" +
            (state.totalDaysElapsed || 0) +
            " / " +
            effectiveStabilityTarget() +
            "</b> continues — choose who leads the next march from Cantebury.</p>" +
            '<p class="hint">Caravan treasury carries over: <b>' +
            caravanTreasurySummary(state.caravanTreasury || null) +
            "</b>.</p>"
          : "<p class=\"town-lead\">Choose how to set your caravan leader before departing Cantebury.</p>";
      app.innerHTML =
        startCitySplash() +
        "<h2 class=\"panel-title\">" +
        ((state.caravanLoops || 0) > 0 ? "New caravan from Cantebury" : "Start a new caravan") +
        "</h2>" +
        setupLead +
        "<div class=\"actions\">" +
        '<button type="button" id="newLeaderBtn"' +
        (hasAnyCampaignSave() ? "" : ' class="primary"') +
        ">Create new character</button>" +
        '<button type="button" id="presetLeaderBtn"' +
        (hasAnyCampaignSave() ? "" : "") +
        ">Use preset leader</button>" +
        "</div>" +
        campaignSaveSetupHtml() +
        renderLog();
      wireCampaignSaveControls(app);
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
      if (state.confirmDialog) wireConfirmDialog(app);
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
        "<p class=\"town-lead\">Define the character who leads " +
        ((state.caravanLoops || 0) > 0 ? "the next westward caravan" : "the first caravan") +
        ".</p>" +
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
          ' days</b> the first time you march each hop; eastbound legs use the same per-hop length and daily encounter rolls, marched one town at a time.</p>' +
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
      if (state.travelDay >= currentRouteDays()) {
        queueArrivalAtDestination();
        return;
      }
      clearStaleTravelTransition();
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
        app.innerHTML = travelBiomeScreenWrap(
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
          renderLog()
        );
        return;
      }
      if (state.transition && state.transition.kind === "encounter") {
        app.innerHTML = transitionEncounterHtml(state.transition) + renderLog();
        return;
      }
      var resumeOverlay =
        state.transition && state.transition.kind === "resume" ? transitionResumeOverlayHtml(state.transition) : "";
      var travelFallen = partyFallenMembers();
      var travelFallenHint = travelFallen.length
        ? '<p class="hint"><b>' + travelFallen.length + " fallen companion" + (travelFallen.length > 1 ? "s" : "") +
          "</b> travel with the caravan — revive at the next town chapel (25 gp or a Potion of Life). You do not need to revive before marching.</p>"
        : "";
      app.innerHTML = travelBiomeScreenWrap(
        travelSplashMarkup() +
        renderHeader() +
        "<h2 class=\"panel-title\">Travel</h2>" +
        travelBiomePanelHtml() +
        "<p>Progress: " +
        travelLegProgressText() +
        ". <b>Next day</b> marches forward (" + dailySupplyCostLabel() + ", +1 MP). <b>Camp</b> rests in place (" + dailySupplyCostLabel() + " + optional forage, healing, +2 MP) — journey time still passes, but you do not move until you march.</p>" +
        travelFallenHint +
        "<div class=\"actions\">" +
        '<button type="button" class="primary" id="nextDay">Next day</button>' +
        '<button type="button" id="travelCampBtn"' + (state.food > 0 ? "" : " disabled") + '>Camp...</button>' +
        '<button type="button" id="travelInventoryBtn">Inventory</button>' +
        "</div>" +
        (state.travelInventoryOpen ? inventoryScreenHtml() : "") +
        renderLog() +
        resumeOverlay +
        postBattleDialogOverlayHtml() +
        campDialogOverlayHtml()
      );
      document.getElementById("nextDay").onclick = function () {
        if (state.transition) {
          if (isStaleResumeTransition()) state.transition = null;
          else if (state.transition.kind === "depart" || state.transition.kind === "arrive") return;
          else state.transition = null;
        }
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

    if (state.phase === "quest_defense") {
      ensureDefenseClock();
      if (state.transition && state.transition.kind === "encounter") {
        app.innerHTML = transitionEncounterHtml(state.transition) + renderLog();
        return;
      }
      var qDefD = state.quest ? questDef(state.quest.id) : null;
      var dfn = state.quest && state.quest.defense ? state.quest.defense : null;
      var nowD = Date.now();
      var timerSec = dfn ? defenseSecondsLeft(dfn, nowD) : 0;
      var breakSec = dfn && dfn.onBreak ? defenseBreakSecondsLeft(dfn, nowD) : 0;
      var waveDone = dfn ? dfn.roundCompleted || 0 : 0;
      var townD = state.quest ? state.quest.startedAt || "cantebury" : "cantebury";
      var header =
        renderHeader() +
        '<h2 class="panel-title">In Defense of — garrison siege</h2>' +
        '<div class="defense-hud">' +
        '<div class="defense-hud-timer">Sand-glass: <b>' + formatDefenseTimer(timerSec) + "</b></div>" +
        '<div class="defense-hud-waves">Waves repelled: <b>' + waveDone + "/" + DEFENSE_WAVE_COUNT + "</b></div>" +
        (dfn && dfn.onBreak
          ? '<div class="defense-hud-break">Lull: <b>' + breakSec + "s</b> to heal</div>"
          : '<div class="defense-hud-break">Fighting!</div>') +
        "</div>";
      var body = "";
      var actions = "";
      if (dfn && dfn.leaving) {
        var leftIds = dfn.leftBehindIds || [];
        var resistPct = garrisonResistChanceForTown(townD);
        var pendingBonus = leftIds.length * Math.round(GARRISON_RESIST_PER_DEFENDER * 100);
        body =
          "<p><b>The assault breaks.</b> Leave fighters to stiffen the walls — each defender adds <b>5%</b> resist chance vs the next raid (logic coming later).</p>" +
          '<p class="hint">Current garrison roster at ' + escapeHtml(locationLabel(townD)) + ": <b>" + resistPct + '%</b> resist chance. This stay: +' + pendingBonus + "%.</p>";
        var partyRows = state.party
          .map(function (m) {
            if (!m || m.hp <= 0) return "";
            var sel = leftIds.indexOf(m.id) >= 0;
            return (
              '<div class="shop-row" style="flex-wrap:wrap;gap:.4rem">' +
              "<span><b>" + escapeHtml(m.name) + "</b> (" + roleLabel(m.role) + ")</span>" +
              '<button type="button" class="act-btn' + (sel ? " selected" : "") + '" data-garrison-leave="' + m.id + '">' +
              (sel ? "Staying behind" : "Leave behind") +
              "</button></div>"
            );
          })
          .join("");
        body += '<div class="shop-block">' + (partyRows || "<p class=\"hint\">No one fit to stay.</p>") + "</div>";
        actions =
          '<button type="button" class="primary" id="garrisonConfirmBtn">March on &amp; collect reward</button>' +
          '<button type="button" id="garrisonSkipLeaveBtn">Take everyone (no garrison bonus)</button>';
      } else if (dfn && dfn.onBreak) {
        body =
          "<p>Monsters hammer the palisade. Use the lull to bind wounds — the next wave comes automatically when the break ends.</p>" +
          '<p class="hint">Field heal restores ~35% of missing HP.</p>';
        actions =
          '<button type="button" class="primary" id="defenseHealBtn">Tend wounds</button>' +
          '<button type="button" id="defenseSkipBreakBtn">Ready early</button>' +
          '<button type="button" id="defenseAbandonBtn">Flee the garrison</button>' +
          '<button type="button" id="defenseInventoryBtn">Inventory</button>';
      } else {
        body = "<p>Hold the wall — waves strike without warning while the sand-glass runs.</p>";
        actions = '<button type="button" id="defenseAbandonBtn">Flee the garrison</button>';
      }
      app.innerHTML =
        header + body + '<div class="actions">' + actions + "</div>" +
        (state.travelInventoryOpen ? inventoryScreenHtml() : "") +
        renderLog() +
        postBattleDialogOverlayHtml();
      var healB = document.getElementById("defenseHealBtn");
      if (healB) healB.onclick = applyDefenseFieldHeal;
      var skipB = document.getElementById("defenseSkipBreakBtn");
      if (skipB) skipB.onclick = skipDefenseBreakEarly;
      var abn = document.getElementById("defenseAbandonBtn");
      if (abn) abn.onclick = abandonQuest;
      var invB = document.getElementById("defenseInventoryBtn");
      if (invB)
        invB.onclick = function () {
          state.travelInventoryOpen = !state.travelInventoryOpen;
          if (!state.travelInventoryOpen) state.inventoryDetailOpen = false;
          render();
        };
      var leaveBtns = app.querySelectorAll("[data-garrison-leave]");
      var lb;
      for (lb = 0; lb < leaveBtns.length; lb++) {
        leaveBtns[lb].onclick = (function (btn) {
          return function () {
            toggleGarrisonLeaveBehind(btn.getAttribute("data-garrison-leave"));
          };
        })(leaveBtns[lb]);
      }
      var confB = document.getElementById("garrisonConfirmBtn");
      if (confB) confB.onclick = confirmGarrisonLeaveBehind;
      var skipLeave = document.getElementById("garrisonSkipLeaveBtn");
      if (skipLeave)
        skipLeave.onclick = function () {
          if (state.quest && state.quest.defense) state.quest.defense.leftBehindIds = [];
          confirmGarrisonLeaveBehind();
        };
      if (state.travelInventoryOpen) wireInventoryScreen(app);
      wirePostBattleDialog(app);
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
        (qDef && qDef.type === "garrison_defense"
          ? "Forced march: day <b>" + qDay + "</b> of <b>" + qTotal + "</b> to the raided garrison. Each <b>Press on</b> spends " + dailySupplyCostLabel() + " — no ambushes until you arrive."
          : "Day <b>" + qDay + "</b> of <b>" + qTotal + "</b> through the mountain pass. Each <b>Press on</b> consumes " + dailySupplyCostLabel() + " and triggers an encounter. The final day reveals the quarry.") +
        "</p>";
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
          '<p>Fallen companions can be carried to the nearest chapel. A <b>Potion of Life</b> revives them here at half HP.</p>' +
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
        "<h2 class=\"panel-title\">Quest: " + (qDef && qDef.type === "garrison_defense" ? "rush to the garrison" : "mountain pass") + "</h2>" +
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
      if (state.combat && partyAlive().length === 0 && partyFallenMembers().length > 0) {
        tacticalLoss();
        return;
      }
      if (maybeCompleteAdventureReturn()) return;
      if (ensureAdventureReturnReady()) return;
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
          '<p>Fallen companions travel with the caravan, but the <b>2 journey-day permadeath clock still runs</b> — each day on the road or at the inn counts. Revive in the field with a <b>Potion of Life</b>, or reach the town <b>chapel</b> in time (<b>25 gp</b> each).</p>' +
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
          " of up to " + adv.maxDays + ". Each <b>Push deeper</b> consumes " + dailySupplyCostLabel() + " and rolls an encounter. Encounter chance: <b>" +
          advEncPct + "%</b>.</p>" +
          (adv.town === "cantebury"
            ? "<p class=\"hint\">Cantebury training grounds: <b>level 1</b> foes only; encounter pace is <b>80% slower</b> than other towns.</p>"
            : "") +
          (adv.daysOut > 0
            ? "<p class=\"hint\">Return march: " + adv.daysOut + " day(s) homeward, one day per step, with encounters.</p>"
            : "");
        var advNeedRetreat = advFallen.length > 0 && (carryingFallenHomeFromAdventure() || state.lifePotions <= 0);
        advActions =
          (advNeedRetreat
            ? '<button type="button" class="primary" id="turnBackBtn">Retreat to ' + advTownLabel + " (" + adv.daysOut + " day" + (adv.daysOut !== 1 ? "s" : "") + ")</button>"
            : '<button type="button" class="primary" id="advancePushBtn"' +
              (state.food > 0 ? "" : " disabled") +
              ">Push deeper (day " +
              (adv.daysOut + 1) +
              ")</button>") +
          (advNeedRetreat
            ? ""
            : '<button type="button" id="advCampBtn"' + (state.food > 0 ? "" : " disabled") + ">Camp...</button>") +
          (advNeedRetreat
            ? ""
            : '<button type="button" id="turnBackBtn">Return home (' + adv.daysOut + " day" + (adv.daysOut !== 1 ? "s" : "") + ")</button>") +
          (advFallen.length && state.lifePotions <= 0
            ? ' <span class="hint">No life potions — reach the chapel before the 2-day clock runs out (25 gp each).</span>'
            : '') +
          '<button type="button" id="advInventoryBtn">Inventory</button>';
      } else {
        var retLeft = Math.max(0, adv.returnDaysRemaining != null ? adv.returnDaysRemaining : adv.returnDays || 0);
        advBody =
          "<p>Heading back to <b>" +
          advTownLabel +
          "</b>. <b>" +
          retLeft +
          "</b> day(s) of road remain — each day rolls an encounter" +
          (state.food > 0 ? " and usually costs " + dailySupplyCostLabel() + "." : ". You are out of supplies; the living take HP damage per short day but can still march.") +
          "</p>";
        advActions =
          (retLeft > 0
            ? '<button type="button" class="primary" id="advanceReturnBtn">March home (1 day)</button>'
            : '<button type="button" class="primary" id="enterTownBtn">Enter ' + advTownLabel + " (chapel revival)</button>") +
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
      if (retBtn) retBtn.onclick = function () { advanceAdventureReturnDay(); };
      var enterTownBtn = document.getElementById("enterTownBtn");
      if (enterTownBtn) enterTownBtn.onclick = function () { endAdventureBackInTown(); };
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
    if (state.phase === "settlement_site_choice") {
      app.innerHTML =
        endCitySplash() +
        renderHeader() +
        "<h2 class=\"panel-title\">The end of the trail</h2>" +
        settlementSiteChoiceHtml() +
        renderLog() +
        (state.transition && state.transition.kind === "arrive" ? transitionArriveOverlayHtml(state.transition) : "");
      wireSettlementSiteChoice(app);
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
        wireSettlementShopPanel(app, "market");
      } else if (state.settlementView === "keep") {
        wireKeepInterior(app, town.key);
        wireNpcDialog(app);
      } else if (state.settlementView === "inventory") {
        wireInventoryScreen(app);
        state.shopVendorKind = gearLockerSellEnabled() ? "market" : "market";
        wireShopCaravanLocker(app);
        var qBegin = document.getElementById("questBegin");
        if (qBegin) qBegin.onclick = beginQuestTrek;
        var qAban = document.getElementById("questAbandon");
        if (qAban) qAban.onclick = abandonQuest;
      } else if (state.settlementView === "colony") {
        wireNewIsilColonyPanel(app);
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
      if (state.adventure && state.combat && partyAlive().length === 0 && partyFallenMembers().length > 0) {
        tacticalLoss();
        return;
      }
      if (state.adventure && !state.combat && !state.pendingEncounter) {
        state.phase = "adventure";
        render();
        return;
      }
      var enc = state.pendingEncounter;
      if (enc && enc.kind === "ruins_discovery") {
        var ruinsType = currentRuinsSiteType();
        var ruinsDef = ruinSiteDef(ruinsType);
        var unitPlural = ruinsUnitLabel(ruinsType, 2);
        var unitSingular = ruinsUnitLabel(ruinsType, 1);
        app.innerHTML =
          '<div class="scene scene-splash scene-ruins" role="img" aria-label="' +
          escapeHtml(ruinsDef.label) +
          '">' +
          '<div class="splash-badge">Strange ground</div>' +
          '<div class="splash-title">' +
          escapeHtml(ruinsDef.splashTitle || ruinsDef.label) +
          "</div>" +
          '<div class="splash-sub">' +
          escapeHtml(ruinsDef.splashSub || "Weathered stone juts from the earth") +
          "</div>" +
          "</div>" +
          renderHeader() +
          "<h2 class=\"panel-title\">" +
          escapeHtml(ruinsDef.label) +
          "</h2>" +
          "<p>" +
          (unitSingular === "house" ? "Houses to search" : "Rooms to explore") +
          ": <b>" +
          state.ruinsRoomsRemaining +
          "</b> / " +
          state.ruinsRoomsTotal +
          ". Each " +
          unitSingular +
          " may host foes (" +
          Math.round(SKELETON_FIGHT_CHANCE * 100) +
          "% chance" +
          (ruinsType === "abandoned_town" ? " — bandits and occasional imps in forsaken streets" : "") +
          "). Gold caches are rare but worthwhile.</p>" +
          ruinsMinimapHtml() +
          ruinsNavigationPlaceholderHtml() +
          "<div class=\"actions\">" +
          '<button type="button" id="searchRuins">' +
          escapeHtml(ruinsExploreActionLabel(ruinsType)) +
          "</button>" +
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
          var areaLabel = ruinsSiteLabel(currentRuinsSiteType());
          var unitLabel = ruinsUnitLabel(currentRuinsSiteType(), 1);
          state.ruinsRoomsRemaining -= 1;
          if (Math.random() < SKELETON_FIGHT_CHANCE) {
            var pack = buildRandomMonsterEncounter("ruins");
            startTacticalCombat({
              kind: "ruins_combat",
              label: areaLabel + " " + unitLabel + " " + roomIdx + " encounter",
              foes: pack.foes,
            });
            render();
            return;
          }
          var roomGold = 0;
          var roomGems = 0;
          if (Math.random() < RUINS_GOLD_FIND_CHANCE) {
            roomGold = roadGoldBonus(rollInt(RUINS_GOLD_MIN, RUINS_GOLD_MAX));
            state.gold += roomGold;
          }
          if (Math.random() < RUINS_GEM_FIND_CHANCE) {
            roomGems = 1;
            state.gems += roomGems;
          }
          if (state.ruinsMap) markRuinsTileExplored(state.ruinsMap.playerX, state.ruinsMap.playerY);
          var roomWeapon = false;
          if (Math.random() < 0.12) roomWeapon = grantWeaponGearDrop(areaLabel + " " + unitLabel + " " + roomIdx);
          if (roomGold || roomGems || roomWeapon) {
            var bits = [];
            if (roomGold) bits.push("+" + roomGold + " gold");
            if (roomGems) bits.push("+1 gem");
            if (roomWeapon) bits.push("weapon");
            logLine(
              areaLabel +
                " " +
                unitLabel +
                " " +
                roomIdx +
                " cleared: " +
                bits.join(", ") +
                ".",
              "good"
            );
          } else {
            logLine(areaLabel + " " + unitLabel + " " + roomIdx + " cleared: nothing of value.", "");
          }
          if (state.ruinsRoomsRemaining <= 0) {
            resolveRuinsSearchRewards();
            finishEncounterCommon();
          } else {
            render();
          }
        };
        document.getElementById("skipRuins").onclick = function () {
          logLine(
            ruinsSiteLabel(currentRuinsSiteType()) +
              " marked on your map (" +
              state.ruinsRoomsRemaining +
              " " +
              unitPlural +
              " left unexplored).",
            ""
          );
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
        var selectingCoverAlly = !!activeChoice && activeChoice.action === "ability" && activeChoice.abilityKind === "cover" && !activeChoice.targetId;
        var selectingAllyTarget = selectingSpellAlly ? "heal" : selectingCoverAlly ? "cover" : "";
        var selectingFoe = selectingAttackTarget || selectingSpellFoe;
        var selectedTargetId = activeChoice && activeChoice.targetId ? activeChoice.targetId : null;
        var foesHtml = state.combat.foes
          .map(function (f) {
            return foeCardHtml(f, selectingFoe, selectedTargetId === f.id);
          })
          .join("");
        var cards = team
          .map(function (m) {
            return battlePartyCard(m, activePlannerId, selectingAllyTarget);
          })
          .join("");
        var ready = allChoicesReady();
        var hint = "Pick each fighter's action in order, then End round to strike.";
        if (foesAlive().length === 1) {
          hint += " One foe remains — finish everyone's choices, then End round.";
        }
        if (activeMember && activeChoice && activeChoice.action) {
          hint = "Use Cancel on " + activeMember.name + " to change ability or target.";
        }
        if (activeMember && selectingAttackTarget) hint = "Choose a monster target for " + activeMember.name + " (or Cancel).";
        else if (activeMember && selectingSpellFoe) hint = "Choose which foe " + activeMember.name + " will cast on (or Cancel).";
        else if (activeMember && selectingSpellAlly) hint = "Choose who " + activeMember.name + " will heal — yourself or an ally (or Cancel).";
        else if (activeMember && selectingCoverAlly) hint = "Choose who " + activeMember.name + " will cover this round (or Cancel).";
        else if (activeMember) hint = "Choose an action for " + activeMember.name + ".";
        else if (ready) hint = "Everyone is set — press <b>End round</b> to strike (damage applies now).";
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
          '<div class="combat-enemy-band">' +
          '<p class="combat-enemy-band-title">Enemies</p>' +
          '<div class="foe-row">' +
          foesHtml +
          "</div>" +
          "</div>" +
          '<div class="combat-party-band">' +
          '<p class="combat-party-band-title">Your party</p>' +
          '<div class="battle-grid">' +
          cards +
          "</div>" +
          "</div>" +
          "</div>" +
          "<div class=\"actions battle-actions-row\">" +
          '<button type="button" id="fleeBtn"' + (bossFight ? " disabled" : "") + '>Flee</button>' +
          (state.adventure ? '<button type="button" id="adventureRetreatBtn">Retreat to town</button>' : '') +
          '<button type="button" id="autoRoundBtn">Auto</button>' +
          '<button type="button" class="primary end-round-btn' + (ready ? " end-round-btn--ready" : " end-round-btn--wait") +
          '" id="endRoundBtn">End round</button>' +
          "</div>" +
          "<p class=\"hint\">" +
          hint +
          "</p>" +
          renderLog();
        wireBattleActions(app);
        var fleeBtn = document.getElementById("fleeBtn");
        if (fleeBtn && !bossFight) fleeBtn.onclick = fleeEncounter;
        var advRetreatBtn = document.getElementById("adventureRetreatBtn");
        if (advRetreatBtn) advRetreatBtn.onclick = retreatAdventureCombatToTown;
        return;
      }
    }
  }

  document.addEventListener(
    "click",
    function (ev) {
      var t = ev.target;
      if (!t || !t.closest) return;
      var endBtn = t.closest("#endRoundBtn");
      if (!endBtn || !state.combat) return;
      if (endBtn.disabled) return;
      ev.preventDefault();
      ev.stopPropagation();
      commitCombatRound();
    },
    true
  );

  function forceDragonSchoolNow() {
    if (state.combat) {
      logLine("Already in combat.", "bad");
      render();
      return;
    }
    startTacticalCombat(buildDragonSchoolEncounter({ greater: true }));
    logLine("<span class=\"hi\">Test:</span> dragon school encounter (Greater Dragon + escorts).", "hi");
    render();
  }

  if (typeof window !== "undefined") {
    window.__illirialForceDragon = forceDragonSchoolNow;
    window.__illirialQueueDragon = function () {
      if (state.phase !== "travel") {
        logLine("Travel on the road first, or call __illirialForceDragon() for an instant fight.", "bad");
        render();
        return;
      }
      state.forceDragonEncounter = true;
      logLine("Next travel day march will trigger a dragon school.", "hi");
      render();
    };
  }

  document.addEventListener("DOMContentLoaded", function () {
    ensureCampaignSaveBar();
    logLine("Prepare in <span class=\"hi\">Cantebury</span>, then travel the route to Gustaf, Hollow Banks, Solem, and New Isil.", "");
    if (DRAGON_TEST_MODE) {
      logLine(
        "<span class=\"hi\">Dragon test mode:</span> each travel day march triggers a dragon school. Console: <code>__illirialForceDragon()</code> for an instant fight.",
        "hi"
      );
    }
    if (campaignDiskSavePing()) {
      logLine("Campaign saves write to disk: <span class=\"hi\">" + escapeHtml(campaignDiskSaveDirHint()) + "</span> (3 slots).", "hi");
    } else if (hasAnyCampaignSave()) {
      logLine("Saved game(s) in this browser — pick a slot under the save panel (up to 3).", "hi");
    }
    trackPlaytest("app_loaded", { version: GAME_VERSION });
    render();
  });
})();
