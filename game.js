/* Cantebury Trails - skeleton demo (UTF-8, ASCII) */
(function () {
  "use strict";

  var CLASS_HP = { soldier: 10, priest: 5, mercenary: 7 };
  var ROUTE_DAYS = 5;
  var PARTY_MAX = 6;
  var STAT_KEYS = ["strength", "intelligence", "stamina", "luck"];
  var BALANCE_DATA =
    typeof window !== "undefined" && window.ILLIRIAL_BALANCE
      ? window.ILLIRIAL_BALANCE
      : {
          version: "0.3.0-alpha",
          classCreationBonusPoints: 3,
          classes: {
            soldier: { final: { strength: 7, intelligence: 3, stamina: 5, luck: 4 } },
            priest: { final: { strength: 4, intelligence: 6, stamina: 4, luck: 5 } },
            mercenary: { final: { strength: 6, intelligence: 3, stamina: 5, luck: 5 } },
          },
          monsters: [],
          weapons: [],
        };
  var GAME_VERSION = BALANCE_DATA.version || "0.3.0-alpha";
  var CLASS_BONUS_POINTS = BALANCE_DATA.classCreationBonusPoints || 3;
  var CLASS_BASE_STATS = {
    soldier: (BALANCE_DATA.classes && BALANCE_DATA.classes.soldier && BALANCE_DATA.classes.soldier.final) || { strength: 7, intelligence: 3, stamina: 5, luck: 4 },
    priest: (BALANCE_DATA.classes && BALANCE_DATA.classes.priest && BALANCE_DATA.classes.priest.final) || { strength: 4, intelligence: 6, stamina: 4, luck: 5 },
    mercenary: (BALANCE_DATA.classes && BALANCE_DATA.classes.mercenary && BALANCE_DATA.classes.mercenary.final) || { strength: 6, intelligence: 3, stamina: 5, luck: 5 },
  };
  var PRESET_LEADER = {
    name: "Captain Elara Vale",
    role: "soldier",
    age: 31,
    hometown: "Cantebury",
    bio: "A veteran caravan captain who has crossed the trade road through flood, famine, and war.",
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


  function createParty() {
    var roles = ["soldier", "soldier", "soldier", "priest", "priest", "mercenary"];
    var out = [];
    for (var i = 0; i < roles.length; i++) {
      var role = roles[i];
      out.push({
        id: "p" + i,
        name: role.charAt(0).toUpperCase() + role.slice(1) + " " + (i + 1),
        role: role,
        hp: CLASS_HP[role],
        maxHp: CLASS_HP[role],
      });
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
      state.party = createParty();
      state.partyIdSeq = state.party.length;
      state.party[0].name = lead.name;
      state.party[0].role = lead.role;
      state.party[0].maxHp = CLASS_HP[lead.role];
      state.party[0].hp = state.party[0].maxHp;
      logLine("Preset caravan assembled with a full party.", "good");
    } else {
      state.party = [
        {
          id: "p0",
          name: lead.name,
          role: lead.role,
          hp: CLASS_HP[lead.role],
          maxHp: CLASS_HP[lead.role],
        },
      ];
      state.partyIdSeq = 1;
      logLine("You begin with only your leader. Recruit companions in the tavern before departure.", "hi");
    }

    state.inventoryFocusId = state.party[0].id;
    state.inventoryDetailOpen = false;
    state.illiriView = "church";
    state.phase = "story_illiri";
    logLine("Caravan leader ready: <span class=\"hi\">" + lead.name + "</span> (" + roleLabel(lead.role) + ").", "good");
  }

  function initialState() {
    return {
      phase: "new_game_setup",
      gold: 500,
      gems: 0,
      food: 0,
      water: 0,
      weapons: 0,
      weaponInventory: [],
      party: createParty(),
      partyIdSeq: 6,
      illiriView: "church",
      guest: null,
      travelDay: 0,
      encounterChance: ENCOUNTER_BASE,
      ruinsDiscovered: false,
      ruinsTravelDay: null,
      ruinsSearched: false,
      log: [],
      pendingEncounter: null,
      combat: null,
      transition: null,
      blessing: null,
      leaderProfile: null,
      newLeaderDraft: null,
      inventoryFocusId: "p0",
      dollStyleByMember: {},
      inventoryDetailOpen: false,
    };
  }

  var state = initialState();

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
    var priests = state.party.filter(function (p) {
      return p.role === "priest" && p.hp > 0;
    });
    if (!priests.length) return;
    var healTotal = priests.length * 2;
    var remaining = healTotal;
    while (remaining > 0) {
      var hurt = state.party
        .filter(function (p) {
          return p.hp > 0 && p.hp < p.maxHp;
        })
        .sort(function (a, b) {
          return a.hp - b.hp;
        });
      if (!hurt.length) break;
      hurt[0].hp = Math.min(hurt[0].maxHp, hurt[0].hp + 1);
      remaining--;
    }
    logLine("Priests mend wounds (end of day): up to <span class=\"hi\">" + healTotal + " HP</span> restored.", "good");
  }

  function rollTravelEncounter() {
    if (Math.random() < state.encounterChance) {
      state.encounterChance = ENCOUNTER_BASE;
      return true;
    }
    state.encounterChance = Math.min(state.encounterChance + ENCOUNTER_STEP, ENCOUNTER_CAP);
    return false;
  }

  function buildBandits() {
    var n = rollInt(1, 5);
    if (hasBlessing("ward")) n = Math.max(1, n - 1);
    var list = [];
    for (var i = 0; i < n; i++) {
      list.push({ id: "b" + i, name: "Bandit " + (i + 1), hp: 3, maxHp: 3, dmg: 1 });
    }
    return { kind: "bandits", label: n + " bandit(s)", foes: list };
  }

  function buildWolves() {
    var n = rollInt(3, 7);
    if (hasBlessing("ward")) n = Math.max(1, n - 1);
    var list = [];
    for (var i = 0; i < n; i++) {
      list.push({ id: "w" + i, name: "Wolf " + (i + 1), hp: 2, maxHp: 2, dmg: 1 });
    }
    return { kind: "wolves", label: n + " wolves", foes: list };
  }

  function buildSkeletons() {
    var n = rollInt(1, 3);
    if (hasBlessing("ward")) n = Math.max(1, n - 1);
    var list = [];
    for (var i = 0; i < n; i++) {
      list.push({ id: "s" + i, name: "Skeleton " + (i + 1), hp: 5, maxHp: 5, dmg: 2 });
    }
    return { kind: "skeletons", label: n + " skeleton(s)", foes: list };
  }

  function ruinsDiscoveryChance() {
    var byDay = RUINS_BASE_CHANCE + Math.max(0, state.travelDay - 1) * RUINS_DAY_BONUS;
    return Math.min(byDay, RUINS_MAX_CHANCE);
  }

  function rollFieldEncounterType() {
    if (!state.ruinsDiscovered && Math.random() < ruinsDiscoveryChance()) return "ruins_discovery";
    return Math.random() < 0.5 ? "bandits" : "wolves";
  }

  function startTacticalCombat(enc) {
    state.phase = "action";
    state.pendingEncounter = enc;
    state.combat = {
      kind: enc.kind,
      foes: enc.foes.map(function (f) {
        return { id: f.id, name: f.name, hp: f.hp, maxHp: f.maxHp, dmg: f.dmg };
      }),
      choices: {},
      defending: {},
      round: 1,
    };
    logLine("<span class=\"hi\">Battle:</span> " + enc.label + ". Choose actions, then End round.", "");
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
      state.food += 2;
      logLine("Victory: +2 food.", "good");
    }
    if (kind === "skeletons" || kind === "ruins_combat") {
      var g2 = roadGoldBonus(rollInt(2, 6));
      state.gold += g2;
      logLine("Victory: +" + g2 + " gold (old coins).", "good");
    }
  }

  function fleeEncounter() {
    if (state.food > 0) state.food--;
    if (Math.random() < 0.3 && state.water > 0) state.water--;
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

  function queueArrivalAtNewIsil() {
    clearTransitionTimers();
    state.phase = "story_new_isil";
    state.transition = { kind: "arrive", label: "New Isil" };
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
    if (state.travelDay >= ROUTE_DAYS) {
      logLine("<span class=\"hi\">You reach New Isil.</span>", "good");
      queueArrivalAtNewIsil();
    } else {
      queueResumeTravel();
    }
  }

  function tacticalWin() {
    var k = state.combat.kind;
    winCombatLoot(k);
    if (k === "ruins_combat") resolveRuinsSearchRewards();
    state.encounterChance = ENCOUNTER_BASE;
    state.combat = null;
    state.pendingEncounter = null;
    finishEncounterCommon();
  }

  function tacticalLoss() {
    state.phase = "gameover";
    logLine("The party has fallen.", "bad");
    state.combat = null;
    state.pendingEncounter = null;
    render();
  }

  function setChoice(memberId, action) {
    if (!state.combat) return;
    var ok = false;
    var team = combatTeam();
    for (var i = 0; i < team.length; i++) {
      if (team[i].id === memberId) ok = true;
    }
    if (!ok) return;
    state.combat.choices[memberId] = action;
    render();
  }

  function allChoicesReady() {
    if (!state.combat) return false;
    var team = combatTeam();
    for (var i = 0; i < team.length; i++) {
      if (!state.combat.choices[team[i].id]) return false;
    }
    return true;
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
      var act = c.choices[m.id];
      var ref = teamMemberById(m.id);
      if (!ref || ref.hp <= 0) continue;

      if (act === "defend") {
        c.defending[m.id] = true;
        logLine(m.name + " defends.", "");
        continue;
      }
      if (act === "attack") {
        var tgt = randomFoe();
        if (!tgt) continue;
        var d = attackDamage(m);
        strikeFoe(tgt, d);
        logLine(m.name + " attacks " + tgt.name + " (-" + d + ").", "hi");
        continue;
      }
      if (act === "spell") {
        if (m.role === "priest") {
          var ally = lowestHpAlly();
          if (ally) {
            healMember(ally.id, 5);
            logLine(m.name + " casts Mend on " + ally.name + " (+5 HP).", "good");
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
        if (state.food > 0) {
          state.food--;
          healMember(m.id, 5);
          logLine(m.name + " eats rations (+5 HP).", "good");
        } else if (state.water > 0) {
          state.water--;
          healMember(m.id, 3);
          logLine(m.name + " drinks water (+3 HP).", "good");
        } else if (state.weapons > 0) {
          state.weapons--;
          var boss = strongestFoe();
          if (boss) {
            strikeFoe(boss, 7);
            logLine(m.name + " uses a spare blade on " + boss.name + " (-7).", "hi");
          }
        } else {
          logLine(m.name + " has no items to use.", "bad");
        }
        continue;
      }
    }
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
      var v = live[rollInt(0, live.length - 1)];
      var dmg = f.dmg;
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
    state.pendingEncounter = { kind: "ruins_discovery", label: "Mysterious ruins", foes: [] };
    state.phase = "action";
  }

  function runTravelDayResolution() {
    if (state.phase !== "travel") return;
    if (state.travelDay >= ROUTE_DAYS) return;
    state.travelDay++;
    logLine("Day " + state.travelDay + " of " + ROUTE_DAYS + " on the road.", "");
    var hadEncounter = rollTravelEncounter();
    if (hadEncounter) {
      var t = rollFieldEncounterType();
      if (t === "ruins_discovery") {
        queueEncounterCutaway("Ruins on the horizon", "Day " + state.travelDay + " - old stonework breaks the skyline", function () {
          applyRuinsDiscoveryEncounter();
        });
        return;
      }
      if (t === "bandits") {
        queueEncounterCutaway("Ambush", "Day " + state.travelDay + " - blades in the dust", function () {
          startTacticalCombat(buildBandits());
        });
        return;
      }
      queueEncounterCutaway("Wolves in the brush", "Day " + state.travelDay + " - eyes in the tall grass", function () {
        startTacticalCombat(buildWolves());
      });
      return;
    }
    if (!state.ruinsDiscovered && Math.random() < RUINS_QUIET_DAY_CHANCE) {
      logLine("Scouts spot old stonework off-road.", "hi");
      queueEncounterCutaway("Strange ground", "Day " + state.travelDay + " - a side path worth a look", function () {
        applyRuinsDiscoveryEncounter();
      });
      return;
    }
    logLine("Quiet travel.", "");
    endOfDayPriestHealing();
    if (state.travelDay >= ROUTE_DAYS) {
      logLine("You reach New Isil.", "good");
      queueArrivalAtNewIsil();
    } else {
      render();
    }
  }

  function beginNextTravelDayMarch() {
    if (state.phase !== "travel") return;
    if (state.travelDay >= ROUTE_DAYS) return;
    clearTransitionTimers();
    state.transition = { kind: "march", fromD: state.travelDay, toD: state.travelDay + 1 };
    render();
    scheduleTransition(function () {
      state.transition = null;
      runTravelDayResolution();
    }, MARCH_MS);
  }

  function buy(item) {
    if (state.gold < 1) {
      logLine("The shopkeeper shrugs: you need at least <span class=\"hi\">1 gp</span>.", "bad");
      return;
    }
    state.gold--;
    if (item === "food") state.food++;
    if (item === "water") state.water++;
    if (item === "weapon") {
      state.weapons++;
      state.weaponInventory.push("knife");
    }
    logLine("Bought 1 " + item + ".", "");
    render();
  }

  function restAtInn() {
    state.party.forEach(function (m) {
      m.hp = m.maxHp;
    });
    if (state.guest) state.guest.hp = state.guest.maxHp;
    logLine("Full rest at the inn.", "good");
    render();
  }

  function consumeTravelDaySupplies() {
    if (state.food > 0) state.food--;
    else {
      partyAlive().forEach(function (m) {
        m.hp = Math.max(0, m.hp - 2);
      });
      logLine("Starvation (-2 HP each, hungry).", "bad");
    }
    if (state.water > 0) state.water--;
    else {
      partyAlive().forEach(function (m) {
        m.hp = Math.max(0, m.hp - 1);
      });
      logLine("Thirst (-1 HP each).", "bad");
    }
  }

  function addPartyMember(role) {
    if (state.party.length >= PARTY_MAX) {
      logLine("Party is full (" + PARTY_MAX + " members).", "bad");
      return;
    }
    var id = "p" + state.partyIdSeq++;
    state.party.push({
      id: id,
      name: role.charAt(0).toUpperCase() + role.slice(1) + " " + id.slice(1),
      role: role,
      hp: CLASS_HP[role],
      maxHp: CLASS_HP[role],
    });
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
      tab("inventory", "Inventory & Dolls") +
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
  }

  function departIllirial() {
    clearTransitionTimers();
    state.illiriView = "church";
    state.phase = "travel";
    state.travelDay = 0;
    state.encounterChance = ENCOUNTER_BASE;
    state.transition = { kind: "depart", stage: "blackout" };
    logLine("You depart Cantebury for New Isil.", "hi");
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
      '<p class="transition-sheet-sub">The harbor opens ahead</p></div>'
    );
  }

  function travelMapHtml(march) {
    march = march || null;
    var i;
    var segs = "";
    var marching = march && march.kind === "march";
    for (i = 1; i <= ROUTE_DAYS; i++) {
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
    var leg = marching ? Math.min(Math.max(march.fromD, 0), ROUTE_DAYS - 1) : -1;
    var caravan =
      marching && leg >= 0
        ? '<div class="map-caravan map-caravan--leg-' + leg + '" aria-hidden="true"><span class="map-caravan-dot"></span></div>'
        : "";
    return (
      '<div class="travel-visual" aria-hidden="true">' +
      '<div class="map-row">' +
      '<div class="map-node start">Cantebury</div>' +
      '<div class="map-track map-track--rel">' +
      segs +
      caravan +
      "</div>" +
      '<div class="map-node end">New Isil</div>' +
      "</div>" +
      '<p class="map-caption">Five days on the trade road. Each quiet day adds <b>+25%</b> to the next day\'s encounter roll (max 95%). A fight resets tension.</p>' +
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
    var leg = Math.min(Math.max(state.travelDay, 0) + 1, ROUTE_DAYS);
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
      ROUTE_DAYS +
      " - weather and miles change each dawn</div>" +
      "</div>"
    );
  }

  function endCitySplash() {
    return (
      '<div class="scene scene-splash scene-end-city" role="img" aria-label="Destination city">' +
      '<div class="splash-badge">Harbor</div>' +
      '<div class="splash-title">New Isil</div>' +
      '<div class="splash-sub">End city - spires above the bay</div>' +
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
    return "Traveler";
  }

  function roleDollStyles(role) {
    if (role === "soldier") return ["classic", "veteran", "warden"];
    if (role === "priest") return ["classic", "scribe", "oracle"];
    if (role === "mercenary") return ["classic", "raider", "ranger"];
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
      return {
        age: state.leaderProfile.age,
        hometown: state.leaderProfile.hometown,
        bio: state.leaderProfile.bio,
        skills: m.role === "priest" ? ["Field medicine", "Rite of warding", "Camp counsel"] : m.role === "mercenary" ? ["Trail scouting", "Quick draw", "Loot appraisal"] : ["Shield wall", "Road discipline", "Vanguard drills"],
        traits: m.role === "priest" ? ["Patient", "Observant", "Composed"] : m.role === "mercenary" ? ["Pragmatic", "Bold", "Wry"] : ["Steady", "Protective", "Direct"],
        stats: st,
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
    return {
      age: age,
      hometown: hometown,
      bio: bioByRole[m.role] || "A hardened road traveler.",
      skills: skillsByRole[m.role] || ["Adaptable", "Resilient", "Focused"],
      traits: traitsByRole[m.role] || ["Stoic", "Reliable", "Calm"],
      stats: {
        strength: 4,
        intelligence: 4,
        stamina: 4,
        luck: 4,
      },
    };
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

    return (
      '<section class="sheet-wrap sheet-wrap--single">' +
      '<div class="sheet-card">' +
      '<div class="actions"><button type="button" id="invBack">Back to roster</button></div>' +
      '<div class="sheet-top">' +
      '<div class="sheet-portrait" role="img" aria-label="portrait">' +
      '<div class="sheet-doll avatar avatar-' +
      focus.role +
      ' doll-' +
      focus.role +
      '-' +
      roleStyle +
      '">' +
      focus.role.charAt(0).toUpperCase() +
      "</div>" +
      '<div class="sheet-style-chip">' +
      roleStyle +
      "</div>" +
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
      "</p>" +
      '<p><b>paper doll</b> <span class="inv-style-btn-row">' +
      styleChoices +
      "</span></p>" +
      "</div>" +
      "</div>" +
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

  function foeCardHtml(f) {
    var pct = Math.round((100 * f.hp) / f.maxHp);
    return (
      '<div class="foe-card">' +
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
      "</div>"
    );
  }

  function battlePartyCard(m) {
    var ref = teamMemberById(m.id);
    if (!ref) return "";
    var pct = Math.round((100 * ref.hp) / ref.maxHp);
    var ch = state.combat ? state.combat.choices[m.id] : null;
    var actions = ["attack", "defend", "spell", "item"];
    var labels = { attack: "Attack", defend: "Defend", spell: "Spell", item: "Item" };
    var btns = "";
    var a;
    for (a = 0; a < actions.length; a++) {
      var key = actions[a];
      var on = ch === key ? " selected" : "";
      btns +=
        '<button type="button" class="act-btn' +
        on +
        '" data-mid="' +
        m.id +
        '" data-act="' +
        key +
        '">' +
        labels[key] +
        "</button>";
    }
    return (
      '<div class="battle-card">' +
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
      "<div class=\"stat\">Food: <b>" +
      state.food +
      "</b></div>" +
      "<div class=\"stat\">Water: <b>" +
      state.water +
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
      "</div>" +
      "<ul class=\"party-list party-list-compact\">" +
      partyBits +
      guestLi +
      "</ul></div>"
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

  function wireBattleActions(root) {
    var btns = root.querySelectorAll(".act-btn");
    for (var i = 0; i < btns.length; i++) {
      btns[i].onclick = (function (b) {
        return function () {
          setChoice(b.getAttribute("data-mid"), b.getAttribute("data-act"));
        };
      })(btns[i]);
    }
  }

  function render() {
    var app = document.getElementById("app");
    if (!app) return;

    if (state.phase === "gameover") {
      app.innerHTML =
        renderHeader() +
        "<p>Game over.</p><div class=\"actions\"><button type=\"button\" class=\"primary\" id=\"btnRestart\">Restart</button></div>" +
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
        beginRunWithLeader(PRESET_LEADER);
        render();
      };
      return;
    }

    if (state.phase === "new_character") {
      var draft = currentLeaderDraft();
      var baseStats = baseStatsForRole(draft.role);
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
        '>Mercenary</option></select></label>' +
        '<label>Age <input id="leadAge" type="number" min="16" max="70" value="' +
        draft.age +
        '"></label>' +
        '<label>Hometown <input id="leadTown" maxlength="32" value="' +
        (draft.hometown || "") +
        '"></label>' +
        '<label>Biography <textarea id="leadBio" rows="4" maxlength="240" placeholder="A short backstory...">' +
        (draft.bio || "") +
        '</textarea></label>' +
        '<div class="char-stat-wrap">' +
        '<p class="char-stat-head">Bonus points remaining: <b>' +
        remainPts +
        '</b> / 4</p>' +
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
          '<button type="button" id="innRest">Rest (full heal)</button>' +
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
          "<h2 class=\"panel-title\">Inventory & Paper Doll Studio</h2>" +
          "<p class=\"town-lead\">Review your party roster, resources, and travel odds before heading out.</p>" +
          renderHeader() +
          inventoryScreenHtml() +
          renderLog();
        wireIlliriTabs(app);
        wireInventoryScreen(app);
        wireHeaderPartyOpen(app);
        return;
      }

      if (state.illiriView === "depart") {
        app.innerHTML =
          startCitySplash() +
          illiriTabStrip() +
          "<h2 class=\"panel-title\">Depart</h2>" +
          "<p class=\"town-lead\">The east gate opens on the trade road — five days to New Isil if the miles are kind.</p>" +
          "<div class=\"actions\">" +
          '<button type="button" class="primary" id="departBtn">Leave Cantebury</button>' +
          "</div>" +
          renderLog();
        wireIlliriTabs(app);
        document.getElementById("departBtn").onclick = departIllirial;
        var openInvDepart = document.getElementById("openInvFromDepart");
        if (openInvDepart) openInvDepart.onclick = openInventoryView;
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
            "Recruit soldiers, priests, or mercenaries. Up to " +
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
            state.guest = { id: "g1", name: "Guest: Guide", role: "soldier", hp: 10, maxHp: 10 };
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
          "<p class=\"shopkeeper-lead\">A lean shopkeeper counts coins beside sacks of grain and stoppered waterskins. " +
          "\"Road fare and spare steel—<span class=\"hi\">1 gp</span> each, same as the quartermaster posted.\"</p>" +
          "<p class=\"shop-gold-line\">Your purse: <b>" +
          state.gold +
          "</b> gp</p>" +
          "<div class=\"shop-block\">" +
          "<div class=\"shop-row\"><span>Food (rations)</span><button type=\"button\" id=\"buyFood\">Buy 1 gp</button></div>" +
          "<div class=\"shop-row\"><span>Water (skins)</span><button type=\"button\" id=\"buyWater\">Buy 1 gp</button></div>" +
          "<div class=\"shop-row\"><span>Weapon (basic blade)</span><button type=\"button\" id=\"buyWeapon\">Buy 1 gp</button></div>" +
          "</div>" +
          '<div class="actions"><button type="button" id="openInvFromShop">Inventory & dolls</button></div>' +
          renderLog();
        wireIlliriTabs(app);
        var openInvShop = document.getElementById("openInvFromShop");
        if (openInvShop) openInvShop.onclick = openInventoryView;
        document.getElementById("buyFood").onclick = function () {
          buy("food");
        };
        document.getElementById("buyWater").onclick = function () {
          buy("water");
        };
        document.getElementById("buyWeapon").onclick = function () {
          buy("weapon");
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
          transitionBlackoutHtml("Leaving Cantebury", "Torches, gate chains, then darkness and the open east.") +
          renderLog();
        return;
      }
      if (state.transition && state.transition.kind === "depart" && state.transition.stage === "map") {
        app.innerHTML =
          '<div class="travel-map-intro">' +
          '<h2 class="panel-title">The trade road</h2>' +
          '<p class="map-intro-lead">Your caravan joins the eastbound line. Five days to New Isil on the posted route.</p>' +
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
        ROUTE_DAYS +
        " days complete. Each <b>Next day</b> consumes 1 food and 1 water. Encounter chance shown above rises after quiet days.</p>" +
        "<div class=\"actions\"><button type=\"button\" class=\"primary\" id=\"nextDay\">Next day</button></div>" +
        renderLog() +
        resumeOverlay;
      document.getElementById("nextDay").onclick = function () {
        if (state.transition) return;
        consumeTravelDaySupplies();
        if (allDead()) {
          state.phase = "gameover";
          logLine("The expedition is lost.", "bad");
          render();
          return;
        }
        beginNextTravelDayMarch();
      };
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
          "<p>Search uses the day. " +
          Math.round(SKELETON_FIGHT_CHANCE * 100) +
          "% chance of 1-3 skeletons (5 HP each).</p>" +
          "<div class=\"actions\">" +
          "<button type=\"button\" id=\"searchRuins\">Search ruins</button>" +
          "<button type=\"button\" id=\"skipRuins\">Mark and leave</button>" +
          "</div>" +
          renderLog();
        document.getElementById("searchRuins").onclick = function () {
          if (Math.random() < SKELETON_FIGHT_CHANCE) {
            var sk = buildSkeletons();
            startTacticalCombat({ kind: "ruins_combat", label: sk.label, foes: sk.foes });
            render();
          } else {
            resolveRuinsSearchRewards();
            finishEncounterCommon();
          }
        };
        document.getElementById("skipRuins").onclick = function () {
          logLine("Ruins marked on your map (pinned to this day).", "");
          finishEncounterCommon();
        };
        return;
      }

      if (state.combat) {
        var foesHtml = state.combat.foes.map(foeCardHtml).join("");
        var team = combatTeam();
        var cards = team.map(battlePartyCard).join("");
        var ready = allChoicesReady();
        app.innerHTML =
          '<div class="scene scene-splash scene-battle" role="img" aria-label="Battle">' +
          '<div class="splash-badge">Skirmish</div>' +
          '<div class="splash-title">Battle</div>' +
          '<div class="splash-sub">Choose actions for each fighter, then End round</div>' +
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
          '<button type="button" id="fleeBtn">Flee</button>' +
          '<button type="button" class="primary" id="endRoundBtn"' +
          (ready ? "" : " disabled") +
          ">End round</button>" +
          "</div>" +
          "<p class=\"hint\">Pick Attack, Defend, Spell, or Item for each fighter, then End round.</p>" +
          renderLog();
        wireBattleActions(app);
        document.getElementById("fleeBtn").onclick = fleeEncounter;
        document.getElementById("endRoundBtn").onclick = commitCombatRound;
        return;
      }
    }

    if (state.phase === "story_new_isil") {
      var arriveOv =
        state.transition && state.transition.kind === "arrive" ? transitionArriveOverlayHtml(state.transition) : "";
      app.innerHTML =
        endCitySplash() +
        renderHeader() +
        "<h2 class=\"panel-title\">New Isil</h2>" +
        "<p>Demo complete - you reached the endpoint.</p>" +
        "<div class=\"actions\"><button type=\"button\" class=\"primary\" id=\"restart\">Play again</button></div>" +
        renderLog() +
        arriveOv;
      document.getElementById("restart").onclick = function () {
        clearTransitionTimers();
        state = initialState();
        render();
      };
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    logLine("Prepare in <span class=\"hi\">Cantebury</span>, then depart toward New Isil.", "");
    render();
  });
})();
