    if (state.phase === "paladin_trek") {
      if (state.transition && state.transition.kind === "encounter") {
        app.innerHTML = transitionEncounterHtml(state.transition) + renderLog();
        return;
      }
      ensurePaladinQuestState();
      var pt = state.paladinQuest.trek;
      var atJephro = pt && pt.leg === "at_jephro";
      var body = atJephro
        ? "<p>Camp at <b>Jephro</b>.</p>" + paladinJephroPanelHtml()
        : "<p><b>" + escapeHtml(paladinTrekLabel()) + "</b> — day <b>" + (pt ? pt.dayProgress : 0) + "</b> / <b>" + (pt ? pt.totalDays : 0) + "</b>.</p>";
      var actions = atJephro
        ? '<button type="button" id="paladinInventoryBtn">Inventory</button>'
        : '<button type="button" class="primary" id="paladinAdvanceBtn"' + (state.food > 0 ? "" : " disabled") + '>Press on</button><button type="button" id="paladinCampBtn"' + (state.food > 0 ? "" : " disabled") + '>Camp</button><button type="button" id="paladinInventoryBtn">Inventory</button>';
      app.innerHTML = renderHeader() + '<h2 class="panel-title">Silver Blades trial</h2>' + body + '<div class="actions">' + actions + '</div>' + (state.travelInventoryOpen ? inventoryScreenHtml() : "") + renderLog() + postBattleDialogOverlayHtml() + campDialogOverlayHtml();
      if (!atJephro) {
        var pAdv = document.getElementById("paladinAdvanceBtn");
        if (pAdv) pAdv.onclick = advancePaladinTrekDay;
        var pCamp = document.getElementById("paladinCampBtn");
        if (pCamp) pCamp.onclick = openCampDialog;
      }
      var pInv = document.getElementById("paladinInventoryBtn");
      if (pInv) pInv.onclick = function () { state.travelInventoryOpen = !state.travelInventoryOpen; if (!state.travelInventoryOpen) state.inventoryDetailOpen = false; render(); };
      var jG = document.getElementById("paladinJephroGhosts"); if (jG) jG.onclick = paladinJephroGhosts;
      var jL = document.getElementById("paladinJephroLumber"); if (jL) jL.onclick = paladinJephroLumberDay;
      var jU = document.getElementById("paladinJephroMinesUnlock"); if (jU) jU.onclick = function () { ensurePaladinQuestState(); state.paladinQuest.jephro.minesUnlocked = true; render(); };
      var jM = document.getElementById("paladinJephroMineNode"); if (jM) jM.onclick = paladinJephroMineNode;
      var jLeave = document.getElementById("paladinJephroLeave");
      if (jLeave) jLeave.onclick = function () { ensurePaladinQuestState(); state.paladinQuest.status = "phase2_return"; state.paladinQuest.trek = { leg: "back_solem2", dayProgress: 0, totalDays: 5, giantWave: 0 }; render(); };
      if (state.travelInventoryOpen) wireInventoryScreen(app);
      wirePostBattleDialog(app);
      wireCampDialog(app);
      return;
    }
