(function () {
  "use strict";

  const STORAGE_KEY = "cf-pickems-state-v1";
  const TOTAL_SLOTS = GROUPS.length * GROUPS[0].teams.length; // 16
  const MAX_TOTAL_SCORE = GROUPS.length * 40; // 160

  let currentMode = "predict"; // 'predict' | 'actual'
  const sortableInstances = [];

  // ---------- Storage ----------
  function emptyState() {
    const picks = {};
    const actual = {};
    GROUPS.forEach((g) => {
      picks[g.id] = [];
      actual[g.id] = [];
    });
    return { picks, actual };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return emptyState();
      const parsed = JSON.parse(raw);
      const base = emptyState();
      GROUPS.forEach((g) => {
        if (Array.isArray(parsed.picks && parsed.picks[g.id])) base.picks[g.id] = parsed.picks[g.id];
        if (Array.isArray(parsed.actual && parsed.actual[g.id])) base.actual[g.id] = parsed.actual[g.id];
      });
      return base;
    } catch (e) {
      return emptyState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* ignore persistence errors (e.g. storage disabled) */
    }
  }

  let state = loadState();

  // ---------- Helpers ----------
  function teamsOf(groupId) {
    return GROUPS.find((g) => g.id === groupId).teams;
  }

  function teamById(groupId, teamId) {
    return teamsOf(groupId).find((t) => t.id === teamId);
  }

  function stateKeyForMode(mode) {
    return mode === "actual" ? "actual" : "picks";
  }

  function poolTeamsFor(groupId, mode) {
    const placed = state[stateKeyForMode(mode)][groupId];
    return teamsOf(groupId).filter((t) => placed.indexOf(t.id) === -1);
  }

  // ---------- Chip rendering ----------
  function chipInner(team, opts) {
    const rank = opts.rankIndex != null ? `<span class="rank-num">${opts.rankIndex + 1}</span>` : "";
    const points =
      opts.scoreInfo != null
        ? `<span class="team-points">${opts.scoreInfo.points > 0 ? "+" : ""}${opts.scoreInfo.points}</span>`
        : "";
    const initials = (team.short || team.name.slice(0, 3)).slice(0, 3).toUpperCase();
    return `${rank}<span class="team-logo" style="background:${team.color}">${initials}</span><span class="team-name">${team.name}</span>${points}`;
  }

  function makeChip(team, opts) {
    const li = document.createElement("li");
    li.className = "team-chip";
    li.dataset.teamId = team.id;
    li.innerHTML = chipInner(team, opts || {});
    return li;
  }

  // ---------- Build a group card ----------
  function buildGroupCard(group) {
    const card = document.createElement("div");
    card.className = "group-card";
    card.innerHTML = `
      <div class="group-card-header">
        <h2>${group.name}</h2>
        <span class="group-status-tag" id="tag-${group.id}"></span>
      </div>
      <div class="pool-section">
        <div class="section-label">CHƯA XẾP HẠNG</div>
        <ul class="pool-list" id="pool-${group.id}"></ul>
      </div>
      <div class="standings-section">
        <div class="section-label">BẢNG XẾP HẠNG (KÉO THẢ ĐỂ DỰ ĐOÁN)</div>
        <ul class="standings-list" id="standings-${group.id}"></ul>
      </div>
    `;

    const poolEl = card.querySelector(`#pool-${group.id}`);
    const standingsEl = card.querySelector(`#standings-${group.id}`);

    poolTeamsFor(group.id, currentMode).forEach((team) => {
      poolEl.appendChild(makeChip(team, {}));
    });

    state[stateKeyForMode(currentMode)][group.id].forEach((teamId, idx) => {
      const team = teamById(group.id, teamId);
      if (team) standingsEl.appendChild(makeChip(team, { rankIndex: idx }));
    });

    return card;
  }

  // ---------- Sync DOM -> state after drag ----------
  function handleGroupChange(groupId) {
    const standingsEl = document.getElementById(`standings-${groupId}`);
    const order = Array.from(standingsEl.children).map((li) => li.dataset.teamId);
    state[stateKeyForMode(currentMode)][groupId] = order;
    saveState();
    updateChipVisuals(groupId);
    updateGroupTag(groupId);
    updateFooterProgress();
    updateTotalScore();
  }

  function updateChipVisuals(groupId) {
    const standingsEl = document.getElementById(`standings-${groupId}`);
    const picks = state.picks[groupId];
    const actual = state.actual[groupId];
    const hasActual = actual.length === teamsOf(groupId).length;
    const scoreResult =
      currentMode === "predict" && hasActual ? computeGroupScore(picks, actual) : null;

    Array.from(standingsEl.children).forEach((li, idx) => {
      const team = teamById(groupId, li.dataset.teamId);
      const info = scoreResult ? scoreResult.perTeam[team.id] : null;
      li.className = "team-chip" + (info ? ` status-${info.status}` : "");
      li.innerHTML = chipInner(team, { rankIndex: idx, scoreInfo: info });
    });
  }

  function updateGroupTag(groupId) {
    const tagEl = document.getElementById(`tag-${groupId}`);
    const placed = state[stateKeyForMode(currentMode)][groupId];
    const total = teamsOf(groupId).length;

    tagEl.className = "group-status-tag";
    if (currentMode === "actual") {
      if (placed.length === total) {
        tagEl.textContent = "Kết Quả Đã Nhập";
        tagEl.classList.add("complete");
      } else {
        tagEl.textContent = "";
      }
      return;
    }

    const actual = state.actual[groupId];
    const hasActual = actual.length === total;
    if (hasActual) {
      const result = computeGroupScore(state.picks[groupId], actual);
      if (result.total === result.maxTotal) {
        tagEl.textContent = `Hoàn Hảo ${result.total}đ`;
        tagEl.classList.add("perfect");
      } else {
        tagEl.textContent = `${result.total}/${result.maxTotal}đ`;
        tagEl.classList.add("complete");
      }
    } else if (placed.length === total) {
      tagEl.textContent = "Đã Xếp Hạng";
      tagEl.classList.add("complete");
    } else {
      tagEl.textContent = "";
    }
  }

  function updateFooterProgress() {
    const filled = GROUPS.reduce((sum, g) => sum + state.picks[g.id].length, 0);
    const pct = Math.round((filled / TOTAL_SLOTS) * 100);
    document.getElementById("progress-text").textContent = `${filled} / ${TOTAL_SLOTS} lựa chọn đã hoàn thành`;
    document.getElementById("progress-fill").style.width = `${pct}%`;
    document.getElementById("progress-pct").textContent = `${pct}%`;
    const footer = document.querySelector(".progress-footer");
    footer.classList.toggle("done", filled === TOTAL_SLOTS);
    if (filled === TOTAL_SLOTS) {
      document.getElementById("progress-text").textContent = "✓ Đã hoàn thành tất cả lựa chọn!";
    }
  }

  function updateTotalScore() {
    let total = 0;
    GROUPS.forEach((g) => {
      const actual = state.actual[g.id];
      if (actual.length === g.teams.length) {
        total += computeGroupScore(state.picks[g.id], actual).total;
      }
    });
    document.getElementById("total-score").textContent = `${total} đ`;
    document.getElementById("total-score-2").textContent = total;
    document.getElementById("total-max").textContent = MAX_TOTAL_SCORE;
  }

  // ---------- Sortable wiring ----------
  function destroySortables() {
    sortableInstances.forEach((s) => s.destroy());
    sortableInstances.length = 0;
  }

  function wireSortables() {
    GROUPS.forEach((group) => {
      const poolEl = document.getElementById(`pool-${group.id}`);
      const standingsEl = document.getElementById(`standings-${group.id}`);
      const groupName = `grp-${group.id}-${currentMode}`;

      const common = {
        group: groupName,
        animation: 150,
        ghostClass: "sortable-ghost",
        dragClass: "sortable-drag",
        onEnd: () => handleGroupChange(group.id),
      };

      sortableInstances.push(new Sortable(poolEl, common));
      sortableInstances.push(new Sortable(standingsEl, common));
    });
  }

  // ---------- Full render ----------
  function renderAll() {
    destroySortables();
    const grid = document.getElementById("groups-grid");
    grid.innerHTML = "";
    GROUPS.forEach((group) => grid.appendChild(buildGroupCard(group)));
    wireSortables();
    GROUPS.forEach((group) => {
      updateChipVisuals(group.id);
      updateGroupTag(group.id);
    });
    updateFooterProgress();
    updateTotalScore();
  }

  // ---------- Mode tabs ----------
  const hints = {
    predict:
      'Kéo đội từ danh sách "Chưa Xếp Hạng" vào "Bảng Xếp Hạng" theo đúng thứ tự bạn dự đoán đội đó sẽ về đích (hạng 1 trên cùng). Khi đã nhập kết quả thực tế, điểm số sẽ tự động hiển thị.',
    actual:
      'Kéo thả để nhập thứ hạng THỰC TẾ của từng bảng sau khi vòng bảng kết thúc. Dữ liệu này dùng để chấm điểm cho các dự đoán của bạn.',
  };

  document.querySelectorAll(".mode-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentMode = btn.dataset.mode;
      document.querySelectorAll(".mode-tab").forEach((b) => b.classList.toggle("active", b === btn));
      document.getElementById("mode-hint").textContent = hints[currentMode];
      document.getElementById("reset-btn").textContent =
        currentMode === "actual" ? "Xóa Kết Quả" : "Làm Lại";
      renderAll();
    });
  });

  // ---------- Reset ----------
  document.getElementById("reset-btn").addEventListener("click", () => {
    const isActual = currentMode === "actual";
    const msg = isActual
      ? "Xóa toàn bộ kết quả thực tế đã nhập?"
      : "Xóa toàn bộ dự đoán của bạn?";
    if (!confirm(msg)) return;
    GROUPS.forEach((g) => {
      state[stateKeyForMode(currentMode)][g.id] = [];
    });
    saveState();
    renderAll();
  });

  // ---------- Init ----------
  renderAll();
})();
