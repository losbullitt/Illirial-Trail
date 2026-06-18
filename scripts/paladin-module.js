  // >>> PALADIN QUEST MODULE
  var PALADIN_MIN_LEVEL = 10;
  var PALADIN_MIN_STAT = 12;

  function defaultPaladinQuestState() {
    return {
      status: "idle",
      candidateId: null,
      yosefDeclineCount: 0,
      declineLocked: false,
      hasGiantsHead: false,
      hasDarkTome: false,
      tomeDelivered: false,
      yosefVisitCount: 0,
      jephro: { ghostsComplete: false, lumberComplete: false, lumberDays: 0, minesUnlocked: false, minesSearched: 0, ingotsFound: 0 },
      trek: null,
    };
  }

  function ensurePaladinQuestState() {
    if (!state.paladinQuest || typeof state.paladinQuest !== "object") {
      state.paladinQuest = defaultPaladinQuestState();
      return;
    }
    var pq = state.paladinQuest;
    if (!pq.jephro) pq.jephro = defaultPaladinQuestState().jephro;
    if (typeof pq.yosefDeclineCount !== "number") pq.yosefDeclineCount = 0;
    if (typeof pq.declineLocked !== "boolean") pq.declineLocked = false;
  }

  function paladinEligibleMembers() {
    return (state.party || []).filter(function (m) {
      if (!m || m.hp <= 0 || m.permadead) return false;
      if (m.role !== "soldier") return false;
      if ((m.level || 1) < PALADIN_MIN_LEVEL) return false;
      initMemberProgress(m);
      var st = memberBaseStats(m);
      return (st.strength || 0) >= PALADIN_MIN_STAT && (st.stamina || 0) >= PALADIN_MIN_STAT;
    });
  }

  function paladinCandidateMember() {
    ensurePaladinQuestState();
    if (state.paladinQuest.candidateId) {
      var c = teamMemberById(state.paladinQuest.candidateId);
      if (c && c.hp > 0) return c;
    }
    var eligible = paladinEligibleMembers();
    return eligible.length ? eligible[0] : null;
  }

  function memberDisplayName(member) {
    if (!member) return "";
    return member.name + (member.titleSuffix || "");
  }

  function yosefOfferVisible() {
    ensurePaladinQuestState();
    var pq = state.paladinQuest;
    if (pq.status === "completed" || pq.status === "failed_withheld_tome") return false;
    if (pq.declineLocked) {
      var anyNewL10 = (state.party || []).some(function (m) {
        return m && (m.level || 1) >= PALADIN_MIN_LEVEL && m.id !== pq.candidateId;
      });
      if (!anyNewL10) return false;
      pq.declineLocked = false;
      pq.yosefDeclineCount = 0;
    }
    if (pq.status === "idle" && paladinEligibleMembers().length) return true;
    return pq.status === "phase1" || pq.status === "phase1_return" || pq.status === "phase2" || pq.status === "phase2_return" || pq.status === "waiting_for_opening" || pq.status === "phase3" || pq.status === "phase3_return";
  }

  function buildPaladinFoes(monsterName, count, kind) {
    var bossDef = null, i;
    for (i = 0; i < BALANCE_MONSTERS.length; i++) {
      if (BALANCE_MONSTERS[i] && BALANCE_MONSTERS[i].name === monsterName) { bossDef = BALANCE_MONSTERS[i]; break; }
    }
    if (!bossDef) bossDef = { name: monsterName, hp: 20, atk: 8, level: 3 };
    var list = [], j;
    for (j = 0; j < count; j++) {
      var baseHp = Math.max(1, parseInt(bossDef.hp, 10) || 20);
      var scaled = Math.max(1, Math.round(baseHp * monsterHpMultiplierForProgress() * 1.15));
      list.push({ id: "pf" + j, name: bossDef.name, hp: scaled, maxHp: scaled, dmg: monsterAttackFromBalance(bossDef), level: bossDef.level || 3 });
    }
    return { kind: kind || "paladin_combat", label: count + " " + monsterName + (count > 1 ? "s" : ""), foes: list };
  }

  function openPaladinNpcDialog(spec) { state.npcDialog = spec; render(); }

  function paladinYosefDialogMode() {
    ensurePaladinQuestState();
    var pq = state.paladinQuest;
    if (pq.status === "idle") return "apply";
    if (pq.status === "phase1_return" && pq.hasGiantsHead) return "turnin_giants";
    if (pq.status === "phase2_return") return "turnin_jephro";
    if (pq.status === "waiting_for_opening") return "waiting";
    if (pq.status === "phase3_return" && pq.hasDarkTome) return "turnin_tome";
    if (pq.status === "phase3_return") return "turnin_empty";
    if (pq.status === "phase1") return "brief_giants";
    if (pq.status === "phase2") return "brief_jephro";
    return "apply";
  }

  function openYosefDialog() {
    ensurePaladinQuestState();
    var pq = state.paladinQuest, mode = paladinYosefDialogMode(), text = "", buttons = [];
    if (mode === "apply") {
      text = paladinEligibleMembers().length ? "Do you want to give more to your people?" : "Return when a soldier stands ready — level ten, strength and stamina twelve or better.";
      buttons = paladinEligibleMembers().length ? [{ id: "paladinYosefNo", label: "Not now" }, { id: "paladinYosefYes", label: "Yes — we will serve", primary: true }] : [{ id: "paladinClose", label: "Understood" }];
    } else if (mode === "brief_giants") {
      text = "Thornwall sent riders — giants took the lower storehouses. Five pinned in the ward chapel. Bring me a giant's head.";
      buttons = [{ id: "paladinClose", label: "We march" }];
    } else if (mode === "turnin_giants") {
      text = "You kept your word. Jephro waits in the Helsfort hills. Ghosts first, then timber, then the mines.";
      buttons = [{ id: "paladinGiantsTurnIn", label: "Hand over the giant's head", primary: true }];
    } else if (mode === "brief_jephro") {
      text = "Complete Jephro's tasks, then return.";
      buttons = [{ id: "paladinClose", label: "Understood" }];
    } else if (mode === "turnin_jephro") {
      pq.yosefVisitCount = (pq.yosefVisitCount || 0) + 1;
      text = "Positions filled while you were away. Next time you are in town, I will let you know if something opens.";
      pq.status = "waiting_for_opening"; pq.trek = null;
      buttons = [{ id: "paladinClose", label: "We will wait" }];
    } else if (mode === "waiting") {
      pq.yosefVisitCount = (pq.yosefVisitCount || 0) + 1;
      if (pq.yosefVisitCount >= 2) { text = "Lady Stillwater's guards fell ill on the Gustaf road. Rare Air."; pq.status = "phase3"; }
      else text = "Nothing yet. March your loop.";
      buttons = [{ id: "paladinClose", label: "Understood" }];
    } else if (mode === "turnin_tome") {
      text = "Did you retrieve anything?";
      buttons = [{ id: "paladinTomeNo", label: "Nothing of note" }, { id: "paladinTomeYes", label: "Yes — the dark tome", primary: true }];
    } else if (mode === "turnin_empty") {
      text = "Did you retrieve anything?";
      buttons = [{ id: "paladinTomeNo", label: "Nothing" }, { id: "paladinTomeLie", label: "We found nothing", primary: true }];
    }
    openPaladinNpcDialog({ speaker: "Yosef", title: "Silver Blades — guest officer", portrait: "", text: text, paladinButtons: buttons });
  }

  function openLadyStillwaterDialog() {
    openPaladinNpcDialog({ speaker: "Lady Stillwater", title: "Gustaf road — miasma", portrait: "", text: "My guards retch blood at the marsh edge. A Naga carries a stolen tome. Will you clear the marsh?", paladinButtons: [{ id: "paladinStillwaterNo", label: "Not now" }, { id: "paladinStillwaterYes", label: "We will hunt the Naga", primary: true }] });
  }

  function openReginaldDialog() {
    var cand = paladinCandidateMember();
    openPaladinNpcDialog({ speaker: "Reginald the Hawk", title: "Paladin Lord", portrait: "", text: "Kneel, " + (cand ? cand.name : "soldier") + ". Your oath is to the people who never see the paladin coming.", paladinButtons: [{ id: "paladinKnight", label: "Receive knighting", primary: true }] });
  }

  function startPaladinCandidate(memberId) {
    var m = teamMemberById(memberId);
    if (!m) return;
    ensurePaladinQuestState();
    state.paladinQuest.candidateId = m.id;
    state.paladinQuest.status = "phase1";
    state.paladinQuest.trek = null;
    logLine("<span class=\"hi\">Silver Blades:</span> " + escapeHtml(m.name) + " begins The Giant Question.", "good");
    state.npcDialog = null;
    openYosefDialog();
  }

  function paladinDeclineYosef() {
    ensurePaladinQuestState();
    var pq = state.paladinQuest;
    pq.yosefDeclineCount = (pq.yosefDeclineCount || 0) + 1;
    if (pq.yosefDeclineCount >= 3) { pq.declineLocked = true; logLine("Yosef turns away — the Silver Blades will not ask again until a new champion rises.", "bad"); }
    else logLine("Yosef nods. The offer remains — for now.", "");
    state.npcDialog = null; render();
  }

  function paladinAcceptApply() {
    var eligible = paladinEligibleMembers();
    if (!eligible.length) return;
    if (eligible.length === 1) { startPaladinCandidate(eligible[0].id); return; }
    var picks = eligible.map(function (m) { return '<button type="button" class="primary" data-paladin-pick="' + escapeHtml(m.id) + '">' + escapeHtml(m.name) + " (Lv " + m.level + ")</button>"; }).join(" ");
    state.npcDialog = { speaker: "Yosef", title: "Choose your candidate", portrait: "", text: "Which soldier stands for the Silver Blades?", summaryHtml: '<div class="actions" style="flex-wrap:wrap;gap:.4rem;margin:.5rem 0">' + picks + "</div>", paladinButtons: [{ id: "paladinClose", label: "Cancel" }] };
    render();
  }

  function paladinTurnInGiantsHead() {
    ensurePaladinQuestState();
    state.paladinQuest.hasGiantsHead = false;
    state.paladinQuest.status = "phase2";
    state.paladinQuest.trek = null;
    state.npcDialog = null;
    logLine("Yosef accepts the giant's head. March to Jephro.", "good");
    render();
  }

  function paladinDeliverTome() {
    ensurePaladinQuestState();
    state.paladinQuest.hasDarkTome = false;
    state.paladinQuest.tomeDelivered = true;
    state.paladinQuest.status = "ready_for_cantebury";
    state.npcDialog = null;
    logLine("Ride for Cantebury — Reginald the Hawk awaits.", "good");
    render();
  }

  function paladinWithholdTome() {
    ensurePaladinQuestState();
    state.paladinQuest.status = "failed_withheld_tome";
    state.paladinQuest.hasDarkTome = false;
    state.gold = (state.gold || 0) + 50;
    state.npcDialog = null;
    logLine("Yosef pays fifty gold. The Silver Blades path ends here.", "bad");
    render();
  }

  function performPaladinKnighting() {
    ensurePaladinQuestState();
    var m = paladinCandidateMember();
    if (!m || m.role !== "soldier") { logLine("No candidate remains to knight.", "bad"); state.npcDialog = null; render(); return; }
    initMemberProgress(m);
    if (!m.bonus) m.bonus = { strength: 0, intelligence: 0, stamina: 0, luck: 0 };
    m.bonus.stamina = (m.bonus.stamina || 0) + 10;
    m.role = "paladin";
    m.titleSuffix = " of the Silver Blades";
    refreshMemberDerivedStats(m);
    m.hp = m.maxHp; m.mp = m.maxMp;
    state.paladinQuest.status = "completed";
    state.npcDialog = null;
    logLine("<span class=\"hi\">Knighting:</span> " + escapeHtml(memberDisplayName(m)) + " rises as a Paladin of the Silver Blades.", "good");
    render();
  }

  function paladinTrekLabel() {
    ensurePaladinQuestState();
    var t = state.paladinQuest.trek;
    if (!t) return "Silver Blades trial";
    var map = { out_giants: "March to Thornwall", at_thornwall: "Thornwall siege", back_solem: "Return to Solem", out_jephro: "March to Jephro", at_jephro: "Jephro outpost", back_solem2: "Return from Jephro", out_marsh: "Marsh approach", at_marsh: "Naga marsh", back_solem3: "Return to report" };
    return map[t.leg] || "Silver Blades trial";
  }

  function beginPaladinTrek() {
    ensurePaladinQuestState();
    var pq = state.paladinQuest;
    if (state.food <= 0) { logLine("You need supplies before marching.", "bad"); render(); return; }
    if (state.quest) { logLine("Finish or abandon your tavern quest first.", "bad"); render(); return; }
    var leg = null, total = 3;
    if (pq.status === "phase1") { leg = "out_giants"; total = 3; }
    else if (pq.status === "phase1_return") { leg = "back_solem"; total = 3; }
    else if (pq.status === "phase2") { leg = "out_jephro"; total = 5; }
    else if (pq.status === "phase2_return") { leg = "back_solem2"; total = 5; }
    else if (pq.status === "phase3") { leg = "out_marsh"; total = 1; }
    else if (pq.status === "phase3_return") { leg = "back_solem3"; total = 3; }
    else return;
    pq.trek = { leg: leg, dayProgress: 0, totalDays: total, giantWave: 0 };
    state.phase = "paladin_trek";
    state.travelInventoryOpen = false;
    state.inventoryDetailOpen = false;
    logLine("<span class=\"hi\">Silver Blades:</span> " + paladinTrekLabel() + " — " + total + " day(s).", "hi");
    render();
  }

  function finishPaladinTrekToSettlement(townKey) {
    ensurePaladinQuestState();
    var pq = state.paladinQuest, leg = pq.trek && pq.trek.leg;
    pq.trek = null;
    state.phase = "settlement";
    state.settlementTown = townKey || "solem";
    state.settlementView = "keep";
    state.keepView = "hall";
    if (leg === "back_solem") { pq.status = "phase1_return"; pq.hasGiantsHead = true; logLine("You reach Solem with a giant's head.", "good"); }
    else if (leg === "back_solem2") { pq.status = "phase2_return"; logLine("You climb back to Solem citadel.", "good"); }
    else if (leg === "back_solem3") { pq.status = "phase3_return"; logLine("Marsh mud on your boots — Yosef awaits.", "good"); }
    internPendingHeadstones();
    render();
  }

  function advancePaladinTrekDay() {
    if (state.phase !== "paladin_trek" || state.transition) return;
    ensurePaladinQuestState();
    var pq = state.paladinQuest, trek = pq.trek;
    if (!trek) return;
    consumeTravelDaySupplies();
    if (allDead()) { state.gameoverMode = "loss"; state.phase = "gameover"; render(); return; }
    trek.dayProgress++;
    tickJourneyDay();
    applyTravelDayMpRegen();
    if (trek.leg === "at_jephro") { render(); return; }
    if (trek.dayProgress >= trek.totalDays) {
      if (trek.leg === "out_giants") {
        trek.leg = "at_thornwall"; trek.dayProgress = 0;
        queueEncounterCutaway("Giants at the chapel", "Wave one — two giants", function () { startTacticalCombat(buildPaladinFoes("Giant", 2, "paladin_giant_wave1")); });
        return;
      }
      if (trek.leg === "out_jephro") { trek.leg = "at_jephro"; trek.dayProgress = 0; logLine("<span class=\"hi\">Jephro:</span> Helsfort outpost.", "hi"); render(); return; }
      if (trek.leg === "out_marsh") {
        trek.leg = "at_marsh"; trek.dayProgress = 0;
        queueEncounterCutaway("Marsh edge", "The Naga rises", function () { startTacticalCombat(buildPaladinFoes("Naga", 1, "paladin_naga_boss")); });
        return;
      }
      if (trek.leg === "back_solem" || trek.leg === "back_solem2" || trek.leg === "back_solem3") { finishPaladinTrekToSettlement("solem"); return; }
    }
    logLine(paladinTrekLabel() + ": day " + trek.dayProgress + " of " + trek.totalDays + ".", "");
    render();
  }

  function onPaladinGiantWave1Win() {
    ensurePaladinQuestState();
    queueEncounterCutaway("Second wave", "Three more giants", function () { startTacticalCombat(buildPaladinFoes("Giant", 3, "paladin_giant_wave2")); });
  }

  function onPaladinGiantWave2Win() {
    ensurePaladinQuestState();
    var pq = state.paladinQuest;
    pq.trek = { leg: "back_solem", dayProgress: 0, totalDays: 3, giantWave: 2 };
    pq.status = "phase1_return";
    logLine("You claim a giant's head and turn homeward.", "good");
    state.phase = "paladin_trek";
    render();
  }

  function onPaladinNagaWin() {
    ensurePaladinQuestState();
    var pq = state.paladinQuest;
    pq.hasDarkTome = true;
    pq.trek = { leg: "back_solem3", dayProgress: 0, totalDays: 3, giantWave: 0 };
    pq.status = "phase3_return";
    logLine("The Naga falls. A dark tome lies in the reeds.", "good");
    state.phase = "paladin_trek";
    state.combat = null;
    render();
  }

  function paladinJephroPanelHtml() {
    ensurePaladinQuestState();
    var j = state.paladinQuest.jephro, html = '<h3 class="church-section-title">Jephro tasks</h3><ul class="roster-edit">';
    html += "<li>Ghosts that Pray — " + (j.ghostsComplete ? "done" : "pending") + "</li>";
    html += "<li>Lumbering Woods — " + (j.lumberComplete ? "done" : j.lumberDays + "/2") + "</li>";
    html += "<li>Mind Your Mines — " + (j.minesUnlocked ? j.minesSearched + "/5" : "locked") + "</li></ul><div class=\"actions\">";
    if (!j.ghostsComplete) html += '<button type="button" class="primary" id="paladinJephroGhosts">Graveyard vigil</button>';
    else if (!j.lumberComplete) html += '<button type="button" class="primary" id="paladinJephroLumber">Timber day</button>';
    else if (!j.minesUnlocked) html += '<button type="button" class="primary" id="paladinJephroMinesUnlock">Enter mines</button>';
    else if (j.minesSearched < 5) html += '<button type="button" class="primary" id="paladinJephroMineNode">Search node</button>';
    else html += '<button type="button" class="primary" id="paladinJephroLeave">March to Solem</button>';
    return html + "</div>";
  }

  function paladinJephroGhosts() {
    queueEncounterCutaway("Graveyard", "Ghosts that Pray", function () { startTacticalCombat(buildPaladinFoes("Ghost", 4, "paladin_ghosts")); });
  }

  function paladinJephroLumberDay() {
    ensurePaladinQuestState();
    var j = state.paladinQuest.jephro;
    j.lumberDays = (j.lumberDays || 0) + 1;
    if (j.lumberDays >= 2) j.lumberComplete = true;
    logLine("Lumbering Woods: day " + j.lumberDays + "/2.", j.lumberComplete ? "good" : "");
    render();
  }

  function paladinJephroMineNode() {
    ensurePaladinQuestState();
    var j = state.paladinQuest.jephro;
    j.minesSearched = (j.minesSearched || 0) + 1;
    if (Math.random() < 0.1) { j.ingotsFound = (j.ingotsFound || 0) + 1; logLine("Rare ingot found!", "good"); }
    else logLine("Mine node " + j.minesSearched + "/5 — no ingot.", "");
    render();
  }

  function onPaladinGhostWin() {
    ensurePaladinQuestState();
    state.paladinQuest.jephro.ghostsComplete = true;
    state.combat = null;
    state.phase = "paladin_trek";
    logLine("The ghosts settle.", "good");
    render();
  }

  function paladinPanelHtml() {
    ensurePaladinQuestState();
    var pq = state.paladinQuest;
    if (pq.status === "idle" || pq.status === "completed" || pq.status === "failed_withheld_tome") return "";
    var cand = paladinCandidateMember();
    var lines = { phase1: "March to Thornwall for the giant hunt.", phase1_return: "Turn in at Yosef (Solem keep).", phase2: "March to Jephro.", phase2_return: "Report to Yosef.", waiting_for_opening: "Visit Yosef again for orders.", phase3: "Rare Air near Gustaf.", phase3_return: "Report to Yosef with the tome.", ready_for_cantebury: "Reginald the Hawk at Cantebury castle." };
    var canMarch = /^(phase1|phase1_return|phase2|phase2_return|phase3|phase3_return)$/.test(pq.status);
    var html = '<h3 class="church-section-title" style="margin-top:1.5rem">A Paladin\'s Tale</h3><p class="hint">' + escapeHtml(lines[pq.status] || "Trial in progress.") + (cand ? " Candidate: <b>" + escapeHtml(cand.name) + "</b>." : "") + "</p>";
    if (canMarch && state.phase !== "paladin_trek") html += '<div class="actions"><button type="button" class="primary" id="paladinBeginTrek"' + (state.food > 0 ? "" : " disabled") + ">Set out</button></div>";
    return html;
  }

  function maybeTriggerPaladinRareAir() {
    ensurePaladinQuestState();
    if (state.paladinQuest.status !== "phase3" || state.phase !== "travel") return false;
    if (currentDestination().key !== "gustaf") return false;
    if (state.travelDay !== Math.max(0, currentRouteDays() - 1)) return false;
    queueEncounterCutaway("Roadside", "Lady Stillwater", function () {
      state.phase = "settlement"; state.settlementTown = "gustaf"; state.settlementView = "depart";
      openLadyStillwaterDialog();
    });
    return true;
  }

  function handlePaladinNpcAction(actionId) {
    if (actionId === "paladinYosefYes") paladinAcceptApply();
    else if (actionId === "paladinYosefNo") paladinDeclineYosef();
    else if (actionId === "paladinGiantsTurnIn") paladinTurnInGiantsHead();
    else if (actionId === "paladinTomeYes") paladinDeliverTome();
    else if (actionId === "paladinTomeNo" || actionId === "paladinTomeLie") paladinWithholdTome();
    else if (actionId === "paladinStillwaterYes") { state.npcDialog = null; beginPaladinTrek(); }
    else if (actionId === "paladinStillwaterNo") { state.npcDialog = null; render(); }
    else if (actionId === "paladinKnight") performPaladinKnighting();
    else { state.npcDialog = null; render(); }
  }

  function wirePaladinNpcDialog(root) {
    if (!root || !state.npcDialog) return;
    var picks = root.querySelectorAll("[data-paladin-pick]"), pi;
    for (pi = 0; pi < picks.length; pi++) picks[pi].onclick = (function (btn) { return function () { startPaladinCandidate(btn.getAttribute("data-paladin-pick")); }; })(picks[pi]);
    var btns = state.npcDialog.paladinButtons || [], bi;
    for (bi = 0; bi < btns.length; bi++) (function (b) {
      var el = root.querySelector("#" + b.id);
      if (el) el.onclick = function () { handlePaladinNpcAction(b.id); };
    })(btns[bi]);
  }

  function paladinUsesMpForAbilities(role) { return role === "paladin"; }
  function paladinSpellHealAmount(member) { return Math.max(4, 4 + intSpellBonus(member)); }
  // <<< PALADIN QUEST MODULE
