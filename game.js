/* Illirial Trail - skeleton demo (UTF-8, ASCII) */
(function () {
  "use strict";

  var CLASS_HP = { soldier: 10, priest: 5, mercenary: 7 };
  var ROUTE_DAYS = 5;
  var PARTY_MAX = 6;
  /* Quiet day ramps danger: +25 percentage points per day with no encounter (cap 95%). */
  var ENCOUNTER_BASE = 0.1;
  var ENCOUNTER_STEP = 0.25;
  var ENCOUNTER_CAP = 0.95;
  var RUINS_FIRST_CHANCE = 0.12;
  var SKELETON_FIGHT_CHANCE = 0.45;
  var WEAPON_TIERS = [
    { id: "knife", label: "Knife", grade: 0 },
    { id: "shortsword", label: "Shortsword", grade: 1 },
    { id: "war_axe", label: "War axe", grade: 2 },
    { id: "runesword", label: "Runesword", grade: 3 },
  ];

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

  function initialState() {
    return {
      phase: "story_illiri",
      gold: 500,
      gems: 0,
      food: 0,
      water: 0,
      weapons: 0,
      weaponInventory: [],
      party: createParty(),
      partyIdSeq: 6,
      illiriView: "prep",
      guest: null,
      travelDay: 0,
      encounterChance: ENCOUNTER_BASE,
      ruinsDiscovered: false,
      ruinsTravelDay: null,
      ruinsSearched: false,
      log: [],
      pendingEncounter: null,
      combat: null,
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
    var list = [];
    for (var i = 0; i < n; i++) {
      list.push({ id: "b" + i, name: "Bandit " + (i + 1), hp: 3, maxHp: 3, dmg: 1 });
    }
    return { kind: "bandits", label: n + " bandit(s)", foes: list };
  }

  function buildWolves() {
    var n = rollInt(3, 7);
    var list = [];
    for (var i = 0; i < n; i++) {
      list.push({ id: "w" + i, name: "Wolf " + (i + 1), hp: 2, maxHp: 2, dmg: 1 });
    }
    return { kind: "wolves", label: n + " wolves", foes: list };
  }

  function buildSkeletons() {
    var n = rollInt(1, 3);
    var list = [];
    for (var i = 0; i < n; i++) {
      list.push({ id: "s" + i, name: "Skeleton " + (i + 1), hp: 5, maxHp: 5, dmg: 2 });
    }
    return { kind: "skeletons", label: n + " skeleton(s)", foes: list };
  }

  function rollFieldEncounterType() {
    if (!state.ruinsDiscovered && Math.random() < RUINS_FIRST_CHANCE) return "ruins_discovery";
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
    if (member.role === "soldier") return 4;
    if (member.role === "mercenary") return 3;
    if (member.role === "priest") return isUndeadFight() ? 3 : 2;
    return 2;
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
    var goldGain = Math.floor(10 * mult);
    var gemGain = Math.floor(10 * mult);
    state.gold += goldGain;
    state.gems += gemGain;
    rollWeaponLoot(true);
    state.ruinsSearched = true;
    logLine("Ruins search complete: " + goldGain + " gold, " + gemGain + " gems.", "good");
  }

  function winCombatLoot(kind) {
    if (kind === "bandits") {
      var gold = rollInt(1, 4) * Math.max(1, mercenaryCount(state.party));
      state.gold += gold;
      logLine("Victory: +" + gold + " gold.", "good");
    }
    if (kind === "wolves" && Math.random() < 0.35) {
      state.food += 2;
      logLine("Victory: +2 food.", "good");
    }
    if (kind === "skeletons" || kind === "ruins_combat") {
      var g2 = rollInt(2, 6);
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

  function finishEncounterCommon() {
    state.pendingEncounter = null;
    state.combat = null;
    endOfDayPriestHealing();
    if (state.travelDay >= ROUTE_DAYS) {
      state.phase = "story_new_isil";
      logLine("<span class=\"hi\">You reach New Isil.</span>", "good");
    } else {
      state.phase = "travel";
    }
    render();
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

  function advanceTravelDay() {
    if (state.phase !== "travel") return;
    if (state.travelDay >= ROUTE_DAYS) return;
    var hadEncounter = rollTravelEncounter();
    state.travelDay++;
    logLine("Day " + state.travelDay + " of " + ROUTE_DAYS + " on the road.", "");
    if (hadEncounter) {
      var t = rollFieldEncounterType();
      if (t === "ruins_discovery") {
        state.ruinsDiscovered = true;
        state.ruinsTravelDay = state.travelDay;
        state.pendingEncounter = { kind: "ruins_discovery", label: "Mysterious ruins", foes: [] };
        state.phase = "action";
        render();
        return;
      }
      if (t === "bandits") startTacticalCombat(buildBandits());
      else startTacticalCombat(buildWolves());
      render();
      return;
    }
    logLine("Quiet travel.", "");
    endOfDayPriestHealing();
    if (state.travelDay >= ROUTE_DAYS) {
      state.phase = "story_new_isil";
      logLine("You reach New Isil.", "good");
    }
    render();
  }

  function buy(item) {
    if (state.gold < 1) return;
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
    state.illiriView = "prep";
    state.phase = "travel";
    state.travelDay = 0;
    state.encounterChance = ENCOUNTER_BASE;
    logLine("You depart Illirial for New Isil.", "hi");
    render();
  }

  function travelMapHtml() {
    var i;
    var segs = "";
    for (i = 1; i <= ROUTE_DAYS; i++) {
      var done = state.travelDay >= i;
      var cur = state.travelDay + 1 === i && state.phase === "travel";
      var ruinHere = state.ruinsDiscovered && state.ruinsTravelDay === i;
      segs +=
        '<div class="map-seg' +
        (done ? " done" : "") +
        (cur ? " current" : "") +
        '">' +
        '<span class="map-day">D' +
        i +
        "</span>" +
        (ruinHere ? '<span class="map-ruin" title="Ruins">R</span>' : "") +
        "</div>";
    }
    return (
      '<div class="travel-visual" aria-hidden="true">' +
      '<div class="map-row">' +
      '<div class="map-node start">Illirial</div>' +
      '<div class="map-track">' +
      segs +
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
      '<div class="splash-title">Illirial</div>' +
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
    var mult = lootMultiplier(state.party).toFixed(2);
    var ru = state.ruinsDiscovered ? "day " + state.ruinsTravelDay : "-";
    var partyBits = state.party
      .map(function (m) {
        var pct = Math.max(0, Math.round((100 * m.hp) / m.maxHp));
        return (
          "<li>" +
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
          hpBarHtml(pct) +
          "<span>" +
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
        hpBarHtml(Math.round((100 * state.guest.hp) / state.guest.maxHp)) +
        "<span>" +
        state.guest.hp +
        "/" +
        state.guest.maxHp +
        "</span></li>"
      : '<li class="role-guest"><em>Guest slot empty.</em></li>';

    var mapBlock = state.phase === "travel" || state.phase === "action" ? travelMapHtml() : "";

    return (
      mapBlock +
      "<h2 class=\"panel-title\">Party & resources</h2>" +
      "<div class=\"stats-grid\">" +
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
      "<ul class=\"party-list\">" +
      partyBits +
      guestLi +
      "</ul>"
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
        state = initialState();
        render();
      };
      return;
    }

    if (state.phase === "story_illiri") {
      if (state.illiriView === "tavern") {
        app.innerHTML =
          startCitySplash() +
          renderHeader() +
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
          "<div class=\"actions\">" +
          '<button type="button" id="leaveTavern">Return to town</button>' +
          "</div>" +
          renderLog();
        wireRosterEdit(app);
        document.getElementById("barkeepBtn").onclick = function () {
          logLine("The barkeep leans in: something stirs beyond the road.", "");
          render();
        };
        document.getElementById("leaveTavern").onclick = function () {
          state.illiriView = "prep";
          render();
        };
        return;
      }

      app.innerHTML =
        startCitySplash() +
        renderHeader() +
        "<h2 class=\"panel-title\">Illirial - preparation</h2>" +
        "<p>Prices: 1 gp each (food, water, weapon).</p>" +
        "<div class=\"shop-row\"><span>Food</span><button type=\"button\" id=\"buyFood\">Buy</button></div>" +
        "<div class=\"shop-row\"><span>Water</span><button type=\"button\" id=\"buyWater\">Buy</button></div>" +
        "<div class=\"shop-row\"><span>Weapon</span><button type=\"button\" id=\"buyWeapon\">Buy</button></div>" +
        "<div class=\"actions\">" +
        "<button type=\"button\" id=\"tavern\">Tavern</button>" +
        "<button type=\"button\" id=\"church\">Church</button>" +
        "<button type=\"button\" id=\"rest\">Rest</button>" +
        "<button type=\"button\" id=\"guestBtn\">" +
        (state.guest ? "Dismiss guest" : "Add test guest") +
        "</button>" +
        "<button type=\"button\" class=\"primary\" id=\"depart\">Depart</button>" +
        "</div>" +
        renderLog();
      document.getElementById("buyFood").onclick = function () {
        buy("food");
      };
      document.getElementById("buyWater").onclick = function () {
        buy("water");
      };
      document.getElementById("buyWeapon").onclick = function () {
        buy("weapon");
      };
      document.getElementById("tavern").onclick = function () {
        state.illiriView = "tavern";
        render();
      };
      document.getElementById("church").onclick = function () {
        logLine("Blessing received.", "good");
        render();
      };
      document.getElementById("rest").onclick = restAtInn;
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
      document.getElementById("depart").onclick = departIllirial;
      return;
    }

    if (state.phase === "travel") {
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
        renderLog();
      document.getElementById("nextDay").onclick = function () {
        consumeTravelDaySupplies();
        if (allDead()) {
          state.phase = "gameover";
          logLine("The expedition is lost.", "bad");
          render();
          return;
        }
        advanceTravelDay();
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
          '<div class="foe-row">' +
          foesHtml +
          "</div>" +
          '<div class="battle-grid">' +
          cards +
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
      app.innerHTML =
        endCitySplash() +
        renderHeader() +
        "<h2 class=\"panel-title\">New Isil</h2>" +
        "<p>Demo complete - you reached the endpoint.</p>" +
        "<div class=\"actions\"><button type=\"button\" class=\"primary\" id=\"restart\">Play again</button></div>" +
        renderLog();
      document.getElementById("restart").onclick = function () {
        state = initialState();
        render();
      };
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    logLine("Prepare in <span class=\"hi\">Illirial</span>, then depart toward New Isil.", "");
    render();
  });
})();
