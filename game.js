/* Cantebury Trails - skeleton demo (UTF-8, ASCII) */
(function () {
  "use strict";

  var CLASS_HP = { soldier: 10, priest: 6, mercenary: 8, farmer: 9, artisan: 8, merchant: 8, mage: 6 };
  var DEFAULT_ROUTE_DAYS = 10;
  var DESTINATIONS = {
    gustaf: { key: "gustaf", label: "Gustaf", subtitle: "Stone quays and wind-bent banners", badge: "Port" },
    hollow_banks: { key: "hollow_banks", label: "Hollow Banks", subtitle: "Reed marsh and fogbound piers", badge: "Frontier" },
    solem: { key: "solem", label: "Solem", subtitle: "Hill citadel above the river forks", badge: "Citadel" },
    new_isil: { key: "new_isil", label: "New Isil", subtitle: "End city - spires above the bay", badge: "Harbor" },
  };
  var PARTY_MAX = 6;
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
    farmer: (BALANCE_DATA.classes && BALANCE_DATA.classes.farmer && BALANCE_DATA.classes.farmer.final) || { strength: 5, intelligence: 4, stamina: 6, luck: 4 },
    artisan: (BALANCE_DATA.classes && BALANCE_DATA.classes.artisan && BALANCE_DATA.classes.artisan.final) || { strength: 4, intelligence: 6, stamina: 3, luck: 6 },
    merchant: (BALANCE_DATA.classes && BALANCE_DATA.classes.merchant && BALANCE_DATA.classes.merchant.final) || { strength: 3, intelligence: 5, stamina: 5, luck: 6 },
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
  var RUINS_BASE_CHANCE = 0.18;
  var RUINS_DAY_BONUS = 0.12;
  var RUINS_MAX_CHANCE = 0.72;
  var RUINS_QUIET_DAY_CHANCE = 0.06;
  var SKELETON_FIGHT_CHANCE = 0.45;
  var WEAPON_TIERS = [
    { id: "knife", label: "Knife", grade: 0 },
    { id: "shortsword", label: "Shortsword", grade: 1 },
    { id: "war_axe", label: "War axe", grade: 2 },
    { id: "runesword", label: "Runesword", grade: 3 },
  ];
  var XP_PER_LEVEL = 3;
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
    return 1 + 0.05 * mercenaryCount(party);
  }


  function blessingTypeLabel(type) {
    if (type === "attack") return "War blessing (+1 attack power)";
    if (type === "gold") return "Prosperity blessing (+gold found on the road)";
    if (type === "ward") return "Ward blessing (fewer enemies engage)";
    return "None";
  }

  function hasBlessing(type) {
    return !!state.blessing && state.blessing === type;
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

  function rollSettlementRecruitSlots(townKey) {
    if (townKey === "solem") return rollInt(2, 3);
    if (townKey === "gustaf" || townKey === "hollow_banks") {
      var r = Math.random();
      if (r < 0.65) return 0;
      if (r < 0.92) return 1;
      return 2;
    }
    return PARTY_MAX;
  }

  function settlementRecruitMode(townKey) {
    if (townKey === "solem") return "soldier_only";
    if (townKey === "gustaf" || townKey === "hollow_banks") return "limited";
    return "open";
  }

  function settlementRecruitNote(townKey) {
    if (townKey === "solem") return "Solem can field 2-3 new soldiers this stay. Slots left: " + (state.settlementRecruitSlots || 0) + ".";
    if (townKey === "gustaf" || townKey === "hollow_banks") return "Travelers are scarce here. Random local recruits this stay: " + (state.settlementRecruitSlots || 0) + ".";
    return "Recruit soldiers, priests, mercenaries, farmers, artisans, merchants, or mages.";
  }

  function destinationForKey(key) {
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

  function routeDaysForLeg(originKey, destinationKey) {
    if (destinationKey === "gustaf") return 6;
    if (destinationKey === "hollow_banks") return 10;
    if (destinationKey === "solem") return 8;
    if (destinationKey === "new_isil") return 9;
    return DEFAULT_ROUTE_DAYS;
  }

  function rollRouteDaysForDestination(destinationKey) {
    if (destinationKey === "gustaf") return rollInt(1, 6);
    if (destinationKey === "hollow_banks") return rollInt(1, 10);
    if (destinationKey === "solem") return rollInt(1, 8);
    if (destinationKey === "new_isil") return rollInt(1, 9);
    return DEFAULT_ROUTE_DAYS;
  }

  function nextTrailDestinationFrom(originKey) {
    if (originKey === "cantebury") return DESTINATIONS.gustaf;
    if (originKey === "gustaf") return DESTINATIONS.hollow_banks;
    if (originKey === "hollow_banks") return DESTINATIONS.solem;
    if (originKey === "solem") return DESTINATIONS.new_isil;
    return null;
  }

  function trailLegIndex(originKey) {
    if (originKey === "gustaf") return 1;
    if (originKey === "hollow_banks") return 2;
    if (originKey === "solem") return 3;
    return 0;
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
    return routeDaysForLeg(origin, dest);
  }

  function levelKValue(level) {
    var tune = BALANCE_DATA && BALANCE_DATA.hpGrowthTuning ? BALANCE_DATA.hpGrowthTuning : null;
    var model = tune && tune.selectedModel ? tune.selectedModel : "optimal";
    if (model === "conservative") return Math.ceil(1.2 * level) + 2;
    if (model === "optimalA") return level;
    return level + 1;
  }

  function memberBaseStats(member) {
    if (member && member.id === "p0" && state && state.leaderProfile && state.leaderProfile.stats) {
      return cloneStats(state.leaderProfile.stats);
    }
    return baseStatsForRole(member && member.role ? member.role : "soldier");
  }

  function memberMaxMp(member) {
    return 25;
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
    if (typeof member.maxHp !== "number" || member.maxHp < 1) member.maxHp = CLASS_HP[member.role] || 1;
    if (typeof member.hp !== "number" || member.hp < 0) member.hp = member.maxHp;
    var nextMaxMp = memberMaxMp(member);
    member.maxMp = nextMaxMp;
    if (typeof member.mp !== "number" || member.mp < 0) member.mp = member.maxMp;
    if (member.mp > member.maxMp) member.mp = member.maxMp;
    if (member.hp > member.maxHp) member.hp = member.maxHp;
    return member;
  }

  function createParty() {
    var roles = ["soldier", "soldier", "soldier", "priest", "priest", "mercenary"];
    var out = [];
    var used = {};
    for (var i = 0; i < roles.length; i++) {
      var role = roles[i];
      var portrait = pickUniquePortrait(role, null, used);
      out.push(
        initMemberProgress({
          id: "p" + i,
          name: role.charAt(0).toUpperCase() + role.slice(1) + " " + (i + 1),
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
    return {
      name: src.name,
      role: src.role,
      age: src.age,
      hometown: src.hometown,
      bio: src.bio,
      gender: src.gender || "man",
      headshot: src.headshot || "",
      stats: src.stats ? cloneStats(src.stats) : baseStatsForRole(src.role),
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
      var presetRoles = ["soldier", "soldier", "soldier", "priest", "priest", "mercenary"];
      var presetParty = [];
      for (var pr = 0; pr < presetRoles.length; pr++) {
        var role = presetRoles[pr];
        presetParty.push(
          initMemberProgress({
            id: "p" + pr,
            name: role.charAt(0).toUpperCase() + role.slice(1) + " " + (pr + 1),
            role: role,
            hp: CLASS_HP[role] || 8,
            maxHp: CLASS_HP[role] || 8,
          })
        );
      }
      state.party = presetParty;
      state.partyIdSeq = state.party.length;
      if (state.party[0]) {
        state.party[0].name = lead.name;
        state.party[0].role = lead.role;
        state.party[0].maxHp = CLASS_HP[lead.role] || state.party[0].maxHp || 10;
        state.party[0].hp = state.party[0].maxHp;
      }
      logLine("Preset caravan assembled with a full party.", "good");
    } else {
      state.party = [
        initMemberProgress({
          id: "p0",
          name: lead.name,
          role: lead.role,
          hp: CLASS_HP[lead.role],
          maxHp: CLASS_HP[lead.role],
        }),
      ];
      state.partyIdSeq = 1;
      logLine("You begin with only your leader. Recruit companions in the tavern before departure.", "hi");
    }

    state.food = Math.min(MAX_SUPPLIES, state.food + (state.water || 0));
    state.water = 0;
    if (state.party[0]) {
      if (!state.party[0].gender) state.party[0].gender = lead.gender || "man";
      if (!state.party[0].headshot && lead.headshot) state.party[0].headshot = lead.headshot;
    }
    for (var pi = 0; pi < state.party.length; pi++) initMemberProgress(state.party[pi]);
    assignMissingPartyPortraits();
    if (state.party[0] && state.leaderProfile) {
      if (!state.leaderProfile.gender) state.leaderProfile.gender = state.party[0].gender || "man";
      if (!state.leaderProfile.headshot) state.leaderProfile.headshot = state.party[0].headshot || "";
    }
    state.inventoryFocusId = state.party[0].id;
    state.inventoryHealTargetId = state.party[0].id;
    state.inventoryDetailOpen = false;
    state.travelInventoryOpen = false;
    state.illiriView = "church";
    state.phase = "story_illiri";
    logLine("Caravan leader ready: <span class=\"hi\">" + lead.name + "</span> (" + roleLabel(lead.role) + ").", "good");
    trackPlaytest("run_started", {
      leaderRole: lead.role,
      leaderSource: lead.source || "custom",
      partySize: state.party.length,
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
      partyIdSeq: 6,
      illiriView: "church",
      travelOrigin: "cantebury",
      travelDestination: "gustaf",
      guest: null,
      travelDay: 0,
      legRouteDays: 0,
      encounterChance: ENCOUNTER_BASE,
      ruinsDiscovered: false,
      ruinsTravelDay: null,
      ruinsSearched: false,
      ruinsRoomsTotal: 0,
      ruinsRoomsRemaining: 0,
      log: [],
      pendingEncounter: null,
      combat: null,
      transition: null,
      blessing: null,
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
    };
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
    if (id === "guest" && state.guest) state.guest.hp = m.hp;
  }

  function endOfDayPriestHealing() {
    return;
  }

  function rollTravelEncounter() {
    if (Math.random() < state.encounterChance) {
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

  function buildRandomMonsterEncounter(sourceKind) {
    var lateLeg = state.travelOrigin === "hollow_banks" || state.travelOrigin === "solem";
    var pool = BALANCE_MONSTERS.slice();
    if (lateLeg) {
      var tough = pool.filter(function (m) {
        return Math.max(1, parseInt(m && m.hp, 10) || 1) >= 10;
      });
      if (tough.length) pool = tough;
    }
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
        },
        { id: "boss-lich-1", name: "Lich King", hp: 30, maxHp: 30, dmg: 4 },
        { id: "boss-lich-2", name: "Lich King", hp: 30, maxHp: 30, dmg: 4 },
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
    state.combat = {
      kind: enc.kind,
      foes: enc.foes.map(function (f) {
        return { id: f.id, name: f.name, hp: f.hp, maxHp: f.maxHp, dmg: f.dmg, portrait: f.portrait || "" };
      }),
      choices: {},
      defending: {},
      round: 1,
    };
    logLine("<span class=\"hi\">Battle:</span> " + enc.label + ". Choose actions, then End round.", "");
    trackPlaytest("combat_started", {
      kind: enc.kind,
      label: enc.label,
      foeCount: enc.foes ? enc.foes.length : 0,
      day: state.travelDay,
    });
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

  function attackDamage(member) {
    var d;
    if (member.role === "soldier") d = 4;
    else if (member.role === "mercenary") d = 3;
    else if (member.role === "priest") d = isUndeadFight() ? 3 : 2;
    else d = 2;
    if (hasBlessing("attack")) d += 1;
    return d;
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

  function winCombatLoot(kind) {
    if (kind === "bandits") {
      var gold = roadGoldBonus(rollInt(1, 4) * Math.max(1, mercenaryCount(state.party)));
      state.gold += gold;
      logLine("Victory: +" + gold + " gold.", "good");
    }
    if (kind === "wolves" && Math.random() < 0.35) {
      var wolfSupplies = addSupplies(2);
      if (wolfSupplies > 0) logLine("Victory: +" + wolfSupplies + " supplies.", "good");
      else logLine("Victory spoils found, but supplies are already full.", "");
    }
    if (kind === "skeletons" || kind === "ruins_combat") {
      var g2 = roadGoldBonus(rollInt(2, 6));
      state.gold += g2;
      logLine("Victory: +" + g2 + " gold (old coins).", "good");
    }
  }

  function applyMonsterDrops(foes) {
    if (!foes || !foes.length) return;
    for (var i = 0; i < foes.length; i++) {
      var name = (foes[i].name || "").toLowerCase();
      var r = Math.random();
      if (name.indexOf("bandit") >= 0) {
        if (r < 0.75) {
          var g = roadGoldBonus(rollInt(1, 5));
          state.gold += g;
          logLine("Bandit drop: +" + g + " gold.", "good");
        } else if (r < 0.975) {
          var gm = rollInt(1, 3);
          state.gems += gm;
          logLine("Bandit drop: +" + gm + " gem(s).", "good");
        } else {
          state.weapons += 1;
          state.weaponInventory.push("rare_drop");
          logLine("Bandit drop: rare weapon found.", "good");
        }
        continue;
      }
      var clericLike =
        name.indexOf("cleric") >= 0 || name.indexOf("mage") >= 0 || name.indexOf("knight") >= 0 || name.indexOf("soldier") >= 0;
      if (clericLike) {
        if (r < 0.99) {
          var g2 = roadGoldBonus(rollInt(1, 7));
          state.gold += g2;
          logLine(foes[i].name + " drop: +" + g2 + " gold.", "good");
        } else {
          var gm2 = rollInt(1, 3);
          state.gems += gm2;
          logLine(foes[i].name + " drop: +" + gm2 + " gem(s).", "good");
        }
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
      while (m.xp >= XP_PER_LEVEL) {
        m.xp -= XP_PER_LEVEL;
        m.level += 1;
        var hpGain = hpGainOnLevel(m);
        m.maxHp += hpGain;
        m.hp = Math.min(m.maxHp, m.hp + hpGain);
        var prevMaxMp = m.maxMp || 0;
        m.maxMp = memberMaxMp(m);
        var mpGain = Math.max(0, m.maxMp - prevMaxMp);
        m.mp = Math.min(m.maxMp, (m.mp || 0) + mpGain);
        logLine(
          m.name +
            " levels up to <span class=\"hi\">" +
            m.level +
            "</span> (+" +
            hpGain +
            " HP, +" +
            mpGain +
            " MP).",
          "good"
        );
        trackPlaytest("member_leveled", {
          memberId: m.id,
          role: m.role,
          level: m.level,
          hpGain: hpGain,
          mpGain: mpGain,
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
    state.phase = "travel";
    state.transition = { kind: "resume", label: "On the road again" };
    render();
    scheduleTransition(function () {
      state.transition = null;
      render();
    }, RESUME_TRAVEL_MS);
  }

  function queueArrivalAtDestination() {
    clearTransitionTimers();
    var dest = currentDestination();
    var finalLeg = dest.key === "new_isil";
    if (finalLeg) {
      trackPlaytest("run_completed", { day: state.travelDay, routeDays: currentRouteDays(), destination: dest.key, origin: state.travelOrigin || "cantebury" });
      state.gameoverMode = "win";
      state.phase = "gameover";
      logLine("<span class=\"hi\">Run complete:</span> you reached New Isil.", "good");
      render();
      return;
    }
    trackPlaytest("leg_completed", { day: state.travelDay, routeDays: currentRouteDays(), destination: dest.key, origin: state.travelOrigin || "cantebury" });
    state.phase = "settlement";
    state.settlementTown = dest.key;
    state.settlementView = "church";
    state.settlementRecruitSlots = rollSettlementRecruitSlots(dest.key);
    state.settlementRecruitMode = settlementRecruitMode(dest.key);
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
    trackPlaytest("combat_won", { kind: k, foesDefeated: foesDefeated, day: state.travelDay });
    if (foesDefeated > 0) grantXp(foesDefeated);
    applyMonsterDrops(defeatedFoes);
    if (k === "new_isil_gate_boss") {
      state.finalBossCleared = true;
      logLine("SK Kew Kumber is defeated. The road to New Isil is open.", "good");
    }
    winCombatLoot(k);
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
    finishEncounterCommon();
  }

  function tacticalLoss() {
    trackPlaytest("combat_lost", {
      kind: state.combat && state.combat.kind ? state.combat.kind : "unknown",
      day: state.travelDay,
    });
    state.gameoverMode = "loss";
    state.phase = "gameover";
    logLine("The party has fallen.", "bad");
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

  function choiceComplete(memberId) {
    var rec = choiceForMember(memberId);
    if (!rec || !rec.action) return false;
    if (rec.action === "attack") return !!rec.targetId;
    if (rec.action === "item") return !!rec.itemKind;
    if (rec.action === "spell") {
      var mem = teamMemberById(memberId);
      if (mem && (mem.role === "priest" || mem.role === "mage")) return !!rec.spellKind;
    }
    return true;
  }

  function currentPlannerId() {
    if (!state.combat) return null;
    var team = combatTeam();
    for (var i = 0; i < team.length; i++) {
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
    if (!rec || rec.action !== "attack") return;
    var foes = foesAlive();
    var target = null;
    for (var i = 0; i < foes.length; i++) {
      if (foes[i].id === foeId) target = foes[i];
    }
    if (!target) return;
    state.combat.choices[current] = { action: "attack", targetId: foeId };
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
            var ally2 = lowestHpAlly();
            if (ally2) {
              ref.mp = Math.max(0, (ref.mp || 0) - 5);
              healMember(ally2.id, 4);
              logLine(m.name + " casts Heal on " + ally2.name + " (+4, 5 MP).", "good");
            } else {
              logLine(m.name + " casts Heal but no one is injured.", "");
            }
          } else {
            ref.mp = Math.max(0, (ref.mp || 0) - 5);
            var sparkTarget = randomFoe();
            if (sparkTarget) {
              strikeFoe(sparkTarget, 2);
              logLine(m.name + " casts Spark on " + sparkTarget.name + " (-2, 5 MP).", "hi");
            }
          }
        } else if (m.role === "mage") {
          ref.mp = Math.max(0, (ref.mp || 0) - 5);
          var fireTarget = randomFoe();
          if (fireTarget) {
            strikeFoe(fireTarget, 2);
            logLine(m.name + " casts Fire on " + fireTarget.name + " (-2, 5 MP).", "hi");
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
            return p.hp <= 0;
          });
          if (!fallen.length || state.lifePotions <= 0) {
            logLine(m.name + " cannot use Potion of Life right now.", "bad");
            continue;
          }
          state.lifePotions--;
          var revived = fallen[0];
          revived.hp = Math.max(1, Math.ceil(revived.maxHp * 0.5));
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
    var preferredRoles = { priest: true, mage: true, farmer: true, artisan: true, merchant: true };
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
    state.pendingEncounter = { kind: "ruins_discovery", label: "Mysterious ruins", foes: [] };
    state.phase = "action";
    logLine("Ruins mapped: " + state.ruinsRoomsTotal + " room(s) detected.", "hi");
  }

  function runTravelDayResolution() {
    if (state.phase !== "travel") return;
    if (state.travelDay >= currentRouteDays()) return;
    state.travelDay++;
    logLine("Day " + state.travelDay + " of " + currentRouteDays() + " on the road.", "");
    trackPlaytest("day_advanced", { day: state.travelDay, routeDays: currentRouteDays() });
    var preFinalDay = Math.max(1, currentRouteDays() - 1);
    if (currentDestination().key === "new_isil" && !state.finalBossCleared && state.travelDay === preFinalDay) {
      queueEncounterCutaway(
        "Dark standard ahead",
        "SK Kew Kumber blocks the final road to New Isil",
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

  function restAtInn() {
    if (state.gold >= 10) {
      var cost = Math.max(1, Math.ceil(state.gold * 0.1));
      if (state.gold < cost) {
        logLine("Not enough gold for an inn room.", "bad");
        render();
        return;
      }
      state.gold -= cost;
      state.party.forEach(function (m) {
        if (m.hp > 0) m.hp = m.maxHp;
      });
      if (state.guest && state.guest.hp > 0) state.guest.hp = state.guest.maxHp;
      logLine("Inn stay complete (-" + cost + " gp). Living members restored to full HP.", "good");
      render();
      return;
    }

    state.party.forEach(function (m) {
      if (m.hp <= 0) return;
      var missing = Math.max(0, m.maxHp - m.hp);
      var gain = Math.ceil(missing * 0.5);
      m.hp = Math.min(m.maxHp, m.hp + gain);
    });
    if (state.guest && state.guest.hp > 0) {
      var gMissing = Math.max(0, state.guest.maxHp - state.guest.hp);
      state.guest.hp = Math.min(state.guest.maxHp, state.guest.hp + Math.ceil(gMissing * 0.5));
    }
    logLine("Low funds: the stable grants a rough rest (50% missing HP recovered).", "");
    render();
  }

  function consumeTravelDaySupplies() {
    if (state.food > 0) state.food--;
    else {
      partyAlive().forEach(function (m) {
        m.hp = Math.max(0, m.hp - 2);
      });
      logLine("No supplies (-2 HP each).", "bad");
    }
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
    state.party.push(
      initMemberProgress({
        id: id,
        name: role.charAt(0).toUpperCase() + role.slice(1) + " " + id.slice(1),
        role: role,
        gender: portrait.gender,
        headshot: portrait.headshot,
        hp: CLASS_HP[role],
        maxHp: CLASS_HP[role],
      })
    );
    if (state.phase === "settlement" && state.settlementView === "tavern") {
      state.settlementRecruitSlots = Math.max(0, (state.settlementRecruitSlots || 0) - 1);
    }
    logLine("Recruited a " + role + " (" + id + ").", "good");
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
      '<button type="button" id="addFarmer"' +
      dis +
      ">+ Farmer</button>" +
      '<button type="button" id="addArtisan"' +
      dis +
      ">+ Artisan</button>" +
      '<button type="button" id="addMerchant"' +
      dis +
      ">+ Merchant</button>" +
      '<button type="button" id="addMage"' +
      dis +
      ">+ Mage</button>" +
      "</div>"
    );
  }

  function illiriTabStrip() {
    var v = state.illiriView;
    function tab(which, label) {
      return (
        '<button type="button" role="tab" class="' +
        ("illiri-tab" + (v === which ? " illiri-tab-active" : "")) +
        '" data-illiri-tab="' +
        which +
        '" aria-selected="' +
        (v === which ? "true" : "false") +
        '">' +
        label +
        "</button>"
      );
    }
    return (
      '<nav class="illiri-tabs" role="tablist" aria-label="Cantebury">' +
      tab("church", "Church") +
      tab("inn", "Inn") +
      tab("shop", "Shop") +
      tab("tavern", "Tavern") +
      tab("inventory", "Inventory") +
      tab("depart", "Depart") +
      "</nav>"
    );
  }

  function openInventoryView() {
    state.illiriView = "inventory";
    render();
  }

  function wireIlliriTabs(root) {
    var tabs = root.querySelectorAll("[data-illiri-tab]");
    var i;
    for (i = 0; i < tabs.length; i++) {
      tabs[i].onclick = (function (el) {
        return function () {
          state.illiriView = el.getAttribute("data-illiri-tab");
          render();
        };
      })(tabs[i]);
    }
  }

  function settlementTabStrip() {
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
    return (
      '<div class="illiri-tabs">' +
      tab("church", "Church") +
      tab("inn", "Inn") +
      tab("tavern", "Tavern") +
      tab("shop", "Shop") +
      tab("inventory", "Inventory") +
      tab("depart", "Depart") +
      "</div>"
    );
  }

  function wireSettlementTabs(root) {
    var tabs = root.querySelectorAll("[data-settlement-tab]");
    var i;
    for (i = 0; i < tabs.length; i++) {
      tabs[i].onclick = (function (el) {
        return function () {
          state.settlementView = el.getAttribute("data-settlement-tab") || "church";
          render();
        };
      })(tabs[i]);
    }
  }

  function buySettlementSupplies() {
    if (state.gold < 1) {
      logLine("Need 1 gp to buy supplies.", "bad");
      render();
      return;
    }
    if (state.food >= MAX_SUPPLIES) {
      logLine("Supplies are already at max capacity (" + MAX_SUPPLIES + ").", "bad");
      render();
      return;
    }
    state.gold -= 1;
    addSupplies(1);
    logLine("Bought 1 supply.", "good");
    render();
  }

  function buySettlementWeapon() {
    if (state.gold < 3) {
      logLine("Need 3 gp to buy a weapon.", "bad");
      render();
      return;
    }
    state.gold -= 3;
    state.weapons += 1;
    state.weaponInventory.push("settlement_blade");
    logLine("Bought 1 weapon for 3 gp.", "good");
    render();
  }

  function sellSettlementGem() {
    if (state.gems < 1) {
      logLine("No gems to sell.", "bad");
      render();
      return;
    }
    state.gems -= 1;
    state.gold += 5;
    logLine("Sold 1 gem for 5 gp.", "good");
    render();
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
    var addF = root.querySelector("#addFarmer");
    var addA = root.querySelector("#addArtisan");
    var addMer = root.querySelector("#addMerchant");
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
    if (addF)
      addF.onclick = function () {
        addPartyMember("farmer");
      };
    if (addA)
      addA.onclick = function () {
        addPartyMember("artisan");
      };
    if (addMer)
      addMer.onclick = function () {
        addPartyMember("merchant");
      };
    if (addMage)
      addMage.onclick = function () {
        addPartyMember("mage");
      };
  }

  function departIllirial() {
    clearTransitionTimers();
    state.illiriView = "church";
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
    state.transition = { kind: "depart", stage: "blackout" };
    var dest = currentDestination();
    state.legRouteDays = rollRouteDaysForDestination(dest.key);
    state.finalBossCleared = dest.key !== "new_isil";
    var originLabel = currentOriginLabel();
    logLine("You depart " + originLabel + " for " + dest.label + ".", "hi");
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
      '<p class="map-caption">' + routeDays + ' days on the trade road. Each quiet day adds <b>+25%</b> to the next day\'s encounter roll (max 95%). A fight resets tension.</p>' +
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
    if (role === "farmer") return "Farmer";
    if (role === "artisan") return "Artisan";
    if (role === "merchant") return "Merchant";
    if (role === "mage") return "Mage";
    return "Traveler";
  }

  function headshotUrl(filename) {
    return filename ? "images/headshot/" + encodeURIComponent(filename) : "";
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
    else if (role === "farmer") keys = ["farmer"];
    else if (role === "artisan") keys = ["artisan"];
    else if (role === "merchant") keys = ["merchant"];
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
    if (role === "farmer") return ["classic", "homestead", "fieldhand"];
    if (role === "artisan") return ["classic", "guild", "maker"];
    if (role === "merchant") return ["classic", "ledger", "broker"];
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
      var st = cloneStats(state.leaderProfile.stats || baseStatsForRole(state.leaderProfile.role));
      initMemberProgress(m);
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
        xpToLevel: XP_PER_LEVEL,
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
    };
    var skillsByRole = {
      soldier: ["Shield wall", "Road discipline", "Vanguard drills"],
      priest: ["Field medicine", "Rite of warding", "Camp counsel"],
      mercenary: ["Trail scouting", "Quick draw", "Loot appraisal"],
    };
    var traitsByRole = {
      soldier: ["Steady", "Protective", "Direct"],
      priest: ["Patient", "Observant", "Composed"],
      mercenary: ["Pragmatic", "Bold", "Wry"],
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
      stats: {
        strength: 4,
        intelligence: 4,
        stamina: 4,
        luck: 4,
      },
      level: m.level,
      xp: m.xp,
      xpToLevel: XP_PER_LEVEL,
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
    if (state.phase === "travel") return true;
    return !!(state.phase === "action" && state.pendingEncounter && state.pendingEncounter.kind === "ruins_discovery");
  }

  function inventoryScreenHtml() {
    ensureInventoryFocus();
    var focus = inventoryMemberById(state.inventoryFocusId);
    if (!focus) return "";

    if (!state.inventoryDetailOpen) {
      var cards = state.party
        .map(function (m) {
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
            "</span>" +
            "</span>" +
            "</button>"
          );
        })
        .join("");

      return (
        '<section class="sheet-wrap sheet-wrap--single">' +
        '<div class="sheet-card">' +
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
      var priestHealControls =
        focus.role === "priest"
          ? '<label class="inv-heal-target">Heal target <select id="invHealTarget"' +
            (healableTargets.length ? "" : " disabled") +
            ">" +
            healTargetOptions +
            '</select></label><button type="button" id="invCastHeal"' +
            (canPriestCastHeal ? "" : " disabled") +
            '>Cast Heal (+4 HP, 5 MP)</button>'
          : "";
      travelPotionActions =
        '<div class="actions">' +
        '<button type="button" id="invUseHealPotion"' + (state.healingPotions > 0 && focus.hp > 0 && focus.hp < focus.maxHp ? "" : " disabled") + '>Use Healing Potion (' + state.healingPotions + ')</button>' +
        '<button type="button" id="invUseLifePotion"' + (state.lifePotions > 0 && focus.hp <= 0 ? "" : " disabled") + '>Use Life Potion (' + state.lifePotions + ')</button>' +
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
      (prof.xpToLevel || XP_PER_LEVEL) +
      "</p>" +
      "</div>" +
      "</div>" +
      travelPotionActions +
      '<div class="sheet-divider"></div>' +
      '<div class="sheet-sections">' +
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
        if (!m || m.hp > 0 || state.lifePotions <= 0) return;
        state.lifePotions--;
        m.hp = Math.max(1, Math.ceil(m.maxHp * 0.5));
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
        target.hp = Math.min(target.maxHp, target.hp + 4);
        state.inventoryHealTargetId = target.id;
        logLine(priest.name + " casts Heal on " + target.name + " (+4 HP, 5 MP).", "good");
        render();
      };
    }
    var healTarget = root.querySelector("#invHealTarget");
    if (healTarget) {
      healTarget.onchange = function () {
        state.inventoryHealTargetId = healTarget.value;
      };
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

  function battlePartyCard(m, activeMemberId) {
    var ref = teamMemberById(m.id);
    if (!ref) return "";
    var pct = Math.round((100 * ref.hp) / ref.maxHp);
    var rec = choiceForMember(m.id);
    var act = rec && rec.action ? rec.action : null;
    var isActive = activeMemberId === m.id;
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
      if (m.role === "priest") {
        var spellDisabled = (ref.mp || 0) >= 5 ? "" : " disabled";
        spellMenu =
          '<div class="battle-item-menu">' +
          '<button type="button" class="act-btn' + (selectedSpell === "spark" ? " selected" : "") + '" data-spell-choice="spark"' + spellDisabled + '>Spark (2 dmg, 5 MP)</button>' +
          '<button type="button" class="act-btn' + (selectedSpell === "heal" ? " selected" : "") + '" data-spell-choice="heal"' + spellDisabled + '>Heal (+4 HP, 5 MP)</button>' +
          "</div>";
      } else if (m.role === "mage") {
        var fireDisabled = (ref.mp || 0) >= 5 ? "" : " disabled";
        spellMenu =
          '<div class="battle-item-menu">' +
          '<button type="button" class="act-btn' + (selectedSpell === "fire" ? " selected" : "") + '" data-spell-choice="fire"' + fireDisabled + '>Fire (2 dmg, 5 MP)</button>' +
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
      "</div>" +
      "</div>"
    );
  }

  function renderHeader() {
    var combatUi = state.phase === "action" && state.combat;
    var mult = lootMultiplier(state.party).toFixed(2);
    var ru = state.ruinsDiscovered ? "day " + state.ruinsTravelDay : "-";
    var bless = blessingTypeLabel(state.blessing);
    var leaderLine = state.leaderProfile ? state.leaderProfile.name + " (" + roleLabel(state.leaderProfile.role) + ")" : "Unassigned";
    var canOpenFromHeader = state.phase === "story_illiri" && state.illiriView === "inventory";
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
          m.hp +
          "/" +
          m.maxHp +
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
        state.guest.hp +
        "/" +
        state.guest.maxHp +
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
      "<h2 class=\"panel-title panel-title-party\">Party & resources</h2>" +
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
      "<div class=\"stat\">Weapons: <b>" +
      state.weapons +
      "</b></div>" +
      "<div class=\"stat\">Merc loot: <b>x" +
      mult +
      "</b></div>" +
      "<div class=\"stat\">Next day encounter: <b>" +
      (state.encounterChance * 100).toFixed(0) +
      "%</b> <span class=\"stat-hint\">(+25% per quiet day)</span></div>" +
      "<div class=\"stat\">Ruins: <b>" +
      ru +
      "</b></div>" +
      "<div class=\"stat\">Version: <b>v" +
      GAME_VERSION +
      "</b></div>" +
      "</div>" +
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
    var autoBtn = root.querySelector("#autoRoundBtn");
    if (autoBtn) autoBtn.onclick = autoPlanRemainingChoices;
  }

  function render() {
    var app = document.getElementById("app");
    if (!app) return;

    if (state.phase === "gameover") {
      var overText = state.gameoverMode === "win" ? "Run complete. New Isil reached." : "Game over.";
      app.innerHTML =
        renderHeader() +
        "<p>" + overText + "</p><div class=\"actions\"><button type=\"button\" class=\"primary\" id=\"btnRestart\">Restart</button></div>" +
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
        '>Mercenary</option><option value="farmer"' +
        (draft.role === "farmer" ? " selected" : "") +
        '>Farmer</option><option value="artisan"' +
        (draft.role === "artisan" ? " selected" : "") +
        '>Artisan</option><option value="merchant"' +
        (draft.role === "merchant" ? " selected" : "") +
        '>Merchant</option><option value="mage"' +
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
          source: "custom",
        });
        render();
      };
      return;
    }

    if (state.phase === "story_illiri") {
      if (state.illiriView === "church") {
        app.innerHTML =
          startCitySplash() +
          illiriTabStrip() +
          "<h2 class=\"panel-title\">Church</h2>" +
          "<p class=\"town-lead\">Cool stone, thin tapers, a priest murmurs over travelers bound east.</p>" +
          "<div class=\"actions\">" +
          '<button type="button" id="churchBless">Receive blessing</button>' +
          "</div>" +
          renderLog();
        wireIlliriTabs(app);
        document.getElementById("churchBless").onclick = function () {
          if (state.blessing) {
            logLine("You already carry a blessing: <span class=\"hi\">" + blessingTypeLabel(state.blessing) + "</span>.", "");
            render();
            return;
          }
          var r = Math.random();
          if (r < 0.3) state.blessing = "attack";
          else if (r < 0.5) state.blessing = "gold";
          else if (r < 0.6) state.blessing = "ward";
          else state.blessing = null;

          if (state.blessing) {
            logLine("Blessing granted: <span class=\"hi\">" + blessingTypeLabel(state.blessing) + "</span>.", "good");
          } else {
            logLine("The prayer brings calm, but no lasting boon this time.", "");
          }
          render();
        };
        var openInvChurch = document.getElementById("openInvFromChurch");
        if (openInvChurch) openInvChurch.onclick = openInventoryView;
        return;
      }

      if (state.illiriView === "inn") {
        app.innerHTML =
          startCitySplash() +
          illiriTabStrip() +
          "<h2 class=\"panel-title\">Inn</h2>" +
          "<p class=\"town-lead\">Straw beds and a hearth. The host keeps a fair price for a night that mends bone and nerve.</p>" +
          "<div class=\"actions\">" +
          '<button type="button" id="innRest">Rest at inn</button>' +
          "</div>" +
          renderLog();
        wireIlliriTabs(app);
        document.getElementById("innRest").onclick = restAtInn;
        var openInvInn = document.getElementById("openInvFromInn");
        if (openInvInn) openInvInn.onclick = openInventoryView;
        return;
      }

      if (state.illiriView === "inventory") {
        app.innerHTML =
          startCitySplash() +
          illiriTabStrip() +
          "<h2 class=\"panel-title\">Inventory</h2>" +
          "<p class=\"town-lead\">Review your party roster, resources, and travel odds before heading out.</p>" +
          renderHeader() +
          inventoryScreenHtml() +
          renderLog();
        wireIlliriTabs(app);
        wireInventoryScreen(app);
        wireHeaderPartyOpen(app);
        return;
      }

      if (state.illiriView === "data") {
        app.innerHTML =
          startCitySplash() +
          illiriTabStrip() +
          "<h2 class=\"panel-title\">Balance Data</h2>" +
          "<p class=\"town-lead\">Review spreadsheet-loaded balancing data in a separate screen.</p>" +
          balanceDataScreenHtml() +
          renderLog();
        wireIlliriTabs(app);
        return;
      }
      if (state.illiriView === "depart") {
        app.innerHTML =
          startCitySplash() +
          illiriTabStrip() +
          "<h2 class=\"panel-title\">Depart</h2>" +
          "<p class=\"town-lead\">The east gate opens on a fixed trial route: Cantebury to Gustaf to Hollow Banks to Solem to New Isil (40 days total).</p>" +
          '<p><b>Current leg:</b> Cantebury to Gustaf (10 travel days)</p>' +
          "<div class=\"actions\">" +
          '<button type="button" class="primary" id="departBtn">Leave Cantebury</button>' +
          "</div>" +
          renderLog();
        wireIlliriTabs(app);
        document.getElementById("departBtn").onclick = function () {
          state.travelOrigin = "cantebury";
          state.travelDestination = "gustaf";
          departIllirial();
        };
        return;
      }

      if (state.illiriView === "tavern") {
        app.innerHTML =
          startCitySplash() +
          illiriTabStrip() +
          "<h2 class=\"panel-title\">Tavern</h2>" +
          "<p class=\"tavern-lead\">Dim light, spilled ale, dice in the corner. The barkeep knows everyone who marches the trade road.</p>" +
          "<div class=\"tavern-choice-row\">" +
          '<button type="button" class="primary" id="barkeepBtn">Talk to the barkeep</button>' +
          "</div>" +
          rosterEditHtml(
            "Add / remove party members",
            "Recruit soldiers, priests, mercenaries, farmers, artisans, merchants, or mages. Up to " +
              PARTY_MAX +
              " in the traveling party (guest not counted). At least one must stay."
          ) +
          "<div class=\"actions tavern-guest-actions\">" +
          "<button type=\"button\" id=\"guestBtn\">" +
          (state.guest ? "Dismiss guest" : "Add test guest") +
          "</button>" +
          "</div>" +
          renderLog();
        wireIlliriTabs(app);
        wireRosterEdit(app);
        document.getElementById("barkeepBtn").onclick = function () {
          logLine("The barkeep leans in: something stirs beyond the road.", "");
          render();
        };
        var openInvTavern = document.getElementById("openInvFromTavern");
        if (openInvTavern) openInvTavern.onclick = openInventoryView;
        document.getElementById("guestBtn").onclick = function () {
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
        return;
      }

      if (state.illiriView === "shop") {
        app.innerHTML =
          startCitySplash() +
          illiriTabStrip() +
          "<h2 class=\"panel-title\">Trader's stall</h2>" +
          "<p class=\"shopkeeper-lead\">A lean shopkeeper counts coins beside stacked supply bundles. " +
          "\"Road fare—<span class=\"hi\">1 gp</span> per supply, same as the quartermaster posted.\"</p>" +
          "<p class=\"shop-gold-line\">Your purse: <b>" +
          state.gold +
          "</b> gp</p>" +
          "<div class=\"shop-block\">" +
          "<div class=\"shop-row\"><span>Supplies</span><button type=\"button\" id=\"buyFood\">Buy 1 gp</button></div>" +
          "<div class=\"shop-row\"><span>Potion of Healing (+3 HP)</span><button type=\"button\" id=\"buyHealPotion\">Buy 5 gp</button></div>" +
          "<div class=\"shop-row\"><span>Potion of Life (revive 50%)</span><button type=\"button\" id=\"buyLifePotion\">Buy 15 gp</button></div>" +
          "</div>" +
          '<div class="actions"><button type="button" id="openInvFromShop">Inventory</button></div>' +
          renderLog();
        wireIlliriTabs(app);
        var openInvShop = document.getElementById("openInvFromShop");
        if (openInvShop) openInvShop.onclick = openInventoryView;
        document.getElementById("buyFood").onclick = function () {
          buy("food");
        };
        document.getElementById("buyHealPotion").onclick = function () {
          buy("heal_potion");
        };
        document.getElementById("buyLifePotion").onclick = function () {
          buy("life_potion");
        };
        return;
      }

      state.illiriView = "church";
      render();
      return;
    }

    if (state.phase === "travel") {
      if (state.transition && state.transition.kind === "depart" && state.transition.stage === "blackout") {
        app.innerHTML =
          transitionBlackoutHtml("Leaving " + currentOriginLabel(), "The caravan sets out for " + currentDestination().label + ".") +
          renderLog();
        return;
      }
      if (state.transition && state.transition.kind === "depart" && state.transition.stage === "map") {
        app.innerHTML =
          '<div class="travel-map-intro">' +
          '<h2 class="panel-title">The trade road</h2>' +
          '<p class="map-intro-lead">Route set: ' + currentOriginLabel() + ' to ' + currentDestination().label + '. ' + currentRouteDays() + ' travel days on this leg.</p>' +
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
        " days complete. Each <b>Next day</b> consumes 1 supply. Encounter chance shown above rises after quiet days.</p>" +
        "<div class=\"actions\">" +
        '<button type="button" class="primary" id="nextDay">Next day</button>' +
        '<button type="button" id="travelInventoryBtn">Inventory</button>' +
        "</div>" +
        (state.travelInventoryOpen ? inventoryScreenHtml() : "") +
        renderLog() +
        resumeOverlay;
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
      return;
    }
    if (state.phase === "settlement") {
      var town = destinationForKey(state.settlementTown || "gustaf");
      app.innerHTML =
        endCitySplash() +
        renderHeader() +
        settlementTabStrip() +
        '<h2 class="panel-title">' + town.label + '</h2>' +
        (state.settlementView === "church"
          ? '<p class="town-lead">A quiet chapel waits by the market road.</p><div class="actions"><button type="button" id="settlementBless">Receive blessing</button></div>'
          : state.settlementView === "inn"
            ? '<p class="town-lead">A warm inn offers cots, stew, and a safe night to recover.</p><div class="actions"><button type="button" id="settlementInnRest">Rest at inn</button></div>'
          : state.settlementView === "tavern"
            ? '<p class="tavern-lead">Fresh crews trade stories and caravan contracts.</p>' +
              rosterEditHtml(
                "Tavern roster",
                settlementRecruitNote(town.key)
              )
            : state.settlementView === "shop"
              ? '<p class="shopkeeper-lead">Restock before the next leg: supplies, weapons, and potions.</p>' +
                '<p class="shop-gold-line">Your purse: <b>' +
                state.gold +
                '</b> gp | Gems: <b>' +
                state.gems +
                '</b></p>' +
                '<div class="shop-block">' +
                '<div class="shop-row"><span>Supplies</span><button type="button" id="settlementBuySupply">Buy 1 gp</button></div>' +
                '<div class="shop-row"><span>Potion of Healing (+3 HP)</span><button type="button" id="settlementBuyHealPotion">Buy 5 gp</button></div>' +
                '<div class="shop-row"><span>Potion of Life (revive 50%)</span><button type="button" id="settlementBuyLifePotion">Buy 15 gp</button></div>' +
                '<div class="shop-row"><span>Weapon</span><button type="button" id="settlementBuyWeapon">Buy 3 gp</button></div>' +
                '<div class="shop-row"><span>Sell gem</span><button type="button" id="settlementSellGem">Sell 1 gem (5 gp)</button></div>' +
                '</div>'
            : state.settlementView === "inventory"
              ? '<h2 class="panel-title">Inventory</h2>' +
                inventoryScreenHtml()
              : town.key === "gustaf"
                ? '<p class="town-lead">Gustaf is resupplied. Continue your caravan to Hollow Banks.</p><div class="actions"><button type="button" class="primary" id="continueTrailBtn">Depart for Hollow Banks</button></div>'
                : town.key === "hollow_banks"
                  ? '<p class="town-lead">Hollow Banks marks the midpoint. Press on to Solem.</p><div class="actions"><button type="button" class="primary" id="continueTrailBtn">Depart for Solem</button></div>'
                  : '<p class="town-lead">Solem resupplied. One final push leads to New Isil.</p><div class="actions"><button type="button" class="primary" id="continueTrailBtn">Depart for New Isil</button></div>') +
        renderLog() +
        (state.transition && state.transition.kind === "arrive" ? transitionArriveOverlayHtml(state.transition) : "");

      wireSettlementTabs(app);
      if (state.settlementView === "church") {
        document.getElementById("settlementBless").onclick = function () {
          if (state.blessing) {
            logLine("You already carry a blessing: <span class=\"hi\">" + blessingTypeLabel(state.blessing) + "</span>.", "");
            render();
            return;
          }
          var r = Math.random();
          if (r < 0.3) state.blessing = "attack";
          else if (r < 0.5) state.blessing = "gold";
          else if (r < 0.6) state.blessing = "ward";
          else state.blessing = null;
          if (state.blessing) logLine("Blessing granted: <span class=\"hi\">" + blessingTypeLabel(state.blessing) + "</span>.", "good");
          else logLine("The prayer brings calm, but no lasting boon this time.", "");
          render();
        };
      } else if (state.settlementView === "inn") {
        document.getElementById("settlementInnRest").onclick = restAtInn;
      } else if (state.settlementView === "tavern") {
        wireRosterEdit(app);
      } else if (state.settlementView === "shop") {
        document.getElementById("settlementBuySupply").onclick = buySettlementSupplies;
        document.getElementById("settlementBuyHealPotion").onclick = function () { buy("heal_potion"); };
        document.getElementById("settlementBuyLifePotion").onclick = function () { buy("life_potion"); };
        document.getElementById("settlementBuyWeapon").onclick = buySettlementWeapon;
        document.getElementById("settlementSellGem").onclick = sellSettlementGem;
      } else if (state.settlementView === "inventory") {
        wireInventoryScreen(app);
      } else if (state.settlementView === "depart") {
        var nextDest = nextTrailDestinationFrom(town.key);
        if (nextDest) {
          document.getElementById("continueTrailBtn").onclick = function () {
            state.travelOrigin = town.key;
            state.travelDestination = nextDest.key;
            departIllirial();
          };
        } else {
          document.getElementById("restart").onclick = function () {
            clearTransitionTimers();
            state = initialState();
            assignMissingPartyPortraits();
            render();
          };
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
          "% chance).</p>" +
          "<div class=\"actions\">" +
          "<button type=\"button\" id=\"searchRuins\">Search ruins</button>" +
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
          var roomGold = roadGoldBonus(rollInt(1, 2));
          var roomGems = Math.random() < 0.25 ? 1 : 0;
          state.gold += roomGold;
          state.gems += roomGems;
          logLine("Ruins room " + roomIdx + " cleared: +" + roomGold + " gold" + (roomGems ? ", +1 gem" : "") + ".", "good");
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
        var selectingTarget = !!activeChoice && activeChoice.action === "attack" && !activeChoice.targetId;
        var selectedTargetId = activeChoice && activeChoice.targetId ? activeChoice.targetId : null;
        var foesHtml = state.combat.foes
          .map(function (f) {
            return foeCardHtml(f, selectingTarget, selectedTargetId === f.id);
          })
          .join("");
        var cards = team
          .map(function (m) {
            return battlePartyCard(m, activePlannerId);
          })
          .join("");
        var ready = allChoicesReady();
        var activeMember = activePlannerId ? teamMemberById(activePlannerId) : null;
        var hint = "Pick actions in order, then End round.";
        if (activeMember && selectingTarget) hint = "Choose a monster target for " + activeMember.name + ".";
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
