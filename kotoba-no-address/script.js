(function () {
  const data = window.CIPHER_MAP_DATA;
  const state = {
    groups: [],
    selectedCandidates: []
  };

  const views = {
    home: document.getElementById("homeView"),
    create: document.getElementById("createView"),
    search: document.getElementById("searchView")
  };

  const modeButtons = Array.from(document.querySelectorAll("[data-view]"));
  const kanaInput = document.getElementById("kanaInput");
  const createInputNotice = document.getElementById("createInputNotice");
  const goSearchButton = document.getElementById("goSearchButton");
  const tokenRow = document.getElementById("tokenRow");
  const selectedText = document.getElementById("selectedText");
  const choiceList = document.getElementById("choiceList");
  const cipherResultBox = document.getElementById("cipherResultBox");
  const cipherOutput = document.getElementById("cipherOutput");
  const undoLast = document.getElementById("undoLast");
  const clearSelection = document.getElementById("clearSelection");
  const copyButton = document.getElementById("copyButton");
  const cipherInput = document.getElementById("cipherInput");
  const translateButton = document.getElementById("translateButton");
  const translationResultBox = document.getElementById("translationResultBox");
  const translationOutput = document.getElementById("translationOutput");
  const analysisOutput = document.getElementById("analysisOutput");
  const xSelect = document.getElementById("xSelect");
  const ySelect = document.getElementById("ySelect");
  const foundCard = document.getElementById("foundCard");
  const toast = document.getElementById("toast");

  const flatCells = [];
  const kanaIndex = new Map();
  const addressIndex = new Map();
  const voicedKana = {
    か: "が", き: "ぎ", く: "ぐ", け: "げ", こ: "ご",
    さ: "ざ", し: "じ", す: "ず", せ: "ぜ", そ: "ぞ",
    た: "だ", ち: "ぢ", つ: "づ", て: "で", と: "ど",
    は: "ば", ひ: "び", ふ: "ぶ", へ: "べ", ほ: "ぼ"
  };
  const semiVoicedKana = {
    は: "ぱ", ひ: "ぴ", ふ: "ぷ", へ: "ぺ", ほ: "ぽ"
  };
  const dakutenParts = {
    が: ["か", "゛"], ぎ: ["き", "゛"], ぐ: ["く", "゛"], げ: ["け", "゛"], ご: ["こ", "゛"],
    ざ: ["さ", "゛"], じ: ["し", "゛"], ず: ["す", "゛"], ぜ: ["せ", "゛"], ぞ: ["そ", "゛"],
    だ: ["た", "゛"], ぢ: ["ち", "゛"], づ: ["つ", "゛"], で: ["て", "゛"], ど: ["と", "゛"],
    ば: ["は", "゛"], び: ["ひ", "゛"], ぶ: ["ふ", "゛"], べ: ["へ", "゛"], ぼ: ["ほ", "゛"],
    ぱ: ["は", "゜"], ぴ: ["ひ", "゜"], ぷ: ["ふ", "゜"], ぺ: ["へ", "゜"], ぽ: ["ほ", "゜"]
  };

  data.cells.forEach((row, yIndex) => {
    row.forEach((cell, xIndex) => {
      const x = data.xAxis[xIndex];
      const y = data.yAxis[yIndex];
      const record = {
        x,
        y,
        xId: x.id,
        yId: y.id,
        kana: cell ? cell.kana : null,
        animal: cell ? cell.animal : "⭐",
        unused: !cell
      };
      flatCells.push(record);
      if (cell) {
        kanaIndex.set(cell.kana, record);
        addressIndex.set(`${x.id}-${y.id}`, record);
      }
    });
  });

  function candidatesFor(cell) {
    return [
      `${cell.xId}${cell.yId}`,
      `${cell.x.en}${cell.yId}`,
      `${cell.xId}${cell.y.en}`,
      `${cell.x.en}${cell.y.en}`,
      `${cell.x.emoji}${cell.y.emoji}`
    ];
  }

  function isCipherLikeInput(value) {
    const compact = value.replace(/\s/g, "");
    if (!compact) {
      return false;
    }
    const axisEmojis = [...data.xAxis, ...data.yAxis].map((axis) => axis.emoji.replace("️", ""));
    const hasAxisEmoji = Array.from(compact).some((char) => axisEmojis.includes(char));
    const hasOnlyCodeText = /^[0-9A-Za-z]+$/.test(compact);
    return hasAxisEmoji || hasOnlyCodeText;
  }

  function setCreateNotice(visible) {
    createInputNotice.hidden = !visible;
  }

  function setCipherResult(value) {
    const hasValue = Boolean(value);
    cipherResultBox.hidden = !hasValue;
    copyButton.disabled = !hasValue;
    cipherOutput.textContent = hasValue ? value : "";
  }

  function setTranslationResult(value) {
    const hasValue = Boolean(value);
    translationResultBox.hidden = !hasValue;
    translationOutput.textContent = hasValue ? value : "";
  }

  function showView(name) {
    Object.entries(views).forEach(([key, view]) => {
      view.classList.toggle("is-active", key === name);
    });
    modeButtons.forEach((button) => {
      if (button.dataset.view) {
        button.classList.toggle("is-active", button.dataset.view === name);
      }
    });
  }

  function buildMap(targetId, options) {
    const map = document.getElementById(targetId);
    map.innerHTML = "";

    const corner = document.createElement("div");
    corner.className = "corner-cell";
    corner.textContent = "X軸 → / Y軸 ↓";
    map.appendChild(corner);

    data.xAxis.forEach((axis) => {
      const el = document.createElement("div");
      el.className = "axis-cell x-axis";
      el.innerHTML = `<span class="axis-key">X${axis.id}</span>&nbsp;<span>${axis.emoji}</span>&nbsp;<span class="axis-name">${axis.jp}</span>`;
      map.appendChild(el);
    });

    data.yAxis.forEach((axis) => {
      const yEl = document.createElement("div");
      yEl.className = "axis-cell y-axis";
      yEl.innerHTML = `<span class="axis-key">Y${axis.id}</span><span>${axis.emoji}</span><span class="axis-name">${axis.jp}</span>`;
      map.appendChild(yEl);

      data.xAxis.forEach((x) => {
        const cell = flatCells.find((item) => item.xId === x.id && item.yId === axis.id);
        const button = document.createElement("button");
        button.type = "button";
        button.className = `kana-cell${cell.unused ? " is-unused" : ""}`;
        button.dataset.x = cell.xId;
        button.dataset.y = cell.yId;
        button.disabled = cell.unused && options.mode === "create";
        button.innerHTML = cell.unused
          ? `<span class="kana">⭐</span><span class="coords">X${cell.xId} / Y${cell.yId}</span>`
          : `<span class="kana">${cell.kana}</span><span class="animal">${cell.animal}</span><span class="coords">X${cell.xId} / Y${cell.yId}</span>`;
        if (!cell.unused && options.onCellClick) {
          button.addEventListener("click", () => options.onCellClick(cell));
        }
        map.appendChild(button);
      });
    });
  }

  function syncMapSelection() {
    const keys = new Set(state.groups.flatMap((group) => group.parts).map((cell) => `${cell.xId}-${cell.yId}`));
    document.querySelectorAll("#createMap .kana-cell").forEach((el) => {
      el.classList.toggle("is-selected", keys.has(`${el.dataset.x}-${el.dataset.y}`));
    });
  }

  function groupFromParts(displayKana, partChars) {
    const parts = partChars.map((char) => kanaIndex.get(char));
    if (parts.some((part) => !part)) {
      return null;
    }
    return { displayKana, parts };
  }

  function groupForChar(char) {
    if (dakutenParts[char]) {
      return groupFromParts(char, dakutenParts[char]);
    }
    const cell = kanaIndex.get(char);
    return cell ? { displayKana: char, parts: [cell] } : null;
  }

  function setGroups(groups) {
    state.groups = groups;
    state.selectedCandidates = groups.map((group) => group.parts.map((cell) => candidatesFor(cell)[0]));
    renderSelections();
  }

  function appendCell(cell) {
    state.groups.push({ displayKana: cell.kana, parts: [cell] });
    state.selectedCandidates.push([candidatesFor(cell)[0]]);
    kanaInput.value = state.groups.map((group) => group.displayKana).join("");
    renderSelections();
  }

  function removeLastGroup() {
    if (!state.groups.length) {
      return;
    }
    state.groups.pop();
    state.selectedCandidates.pop();
    kanaInput.value = state.groups.map((group) => group.displayKana).join("");
    setCreateNotice(false);
    renderSelections();
  }

  function renderSelections() {
    tokenRow.innerHTML = state.groups.length
      ? state.groups.flatMap((group) => group.parts).map((cell) => `<span class="token-chip">${cell.kana}</span>`).join("")
      : `<span class="token-empty">ここに暗号にする文字が並びます</span>`;

    selectedText.textContent = state.groups.length
      ? state.groups.map((group) => {
        const addresses = group.parts.map((cell) => {
          return `${cell.kana} → ${cell.x.key} / ${cell.y.key} → ${cell.x.emoji}${cell.x.jp} × ${cell.y.emoji}${cell.y.jp}`;
        }).join(" + ");
        return group.parts.length > 1 ? `${group.displayKana} → ${addresses}` : addresses;
      }).join(" / ")
      : "まだありません";

    choiceList.innerHTML = "";
    if (!state.groups.length) {
      choiceList.innerHTML = `<div class="empty-choice">ことばを入れるか、地図の島をタップしてください</div>`;
    }

    state.groups.forEach((group, groupIndex) => {
      const card = document.createElement("section");
      card.className = "choice-card";
      const partLabel = group.parts.length > 1
        ? `<small>${group.parts.map((cell) => cell.kana).join(" + ")}</small>`
        : `<small>${group.parts[0].animal}</small>`;
      const parts = group.parts.map((cell, partIndex) => {
        const buttons = candidatesFor(cell).map((candidate) => {
          const selected = state.selectedCandidates[groupIndex][partIndex] === candidate ? " is-selected" : "";
          return `<button class="candidate-button${selected}" type="button" data-group="${groupIndex}" data-part="${partIndex}" data-candidate="${candidate}">${candidate}</button>`;
        }).join("");
        return `
          <div class="part-box">
            <div class="part-address">
              <strong>${cell.kana}</strong>
              <span>${cell.x.emoji} ${cell.x.jp} × ${cell.y.emoji} ${cell.y.jp}</span>
            </div>
            <div class="candidate-grid">${buttons}</div>
          </div>
        `;
      }).join("");
      card.innerHTML = `
        <div class="choice-title">
          <h3>${group.displayKana}</h3>
          ${partLabel}
        </div>
        <div class="part-stack">${parts}</div>
      `;
      choiceList.appendChild(card);
    });

    const output = state.selectedCandidates.flat().join("");
    setCipherResult(output);

    syncMapSelection();
  }

  function parseInput(value) {
    if (isCipherLikeInput(value)) {
      setCreateNotice(true);
      setGroups([]);
      return;
    }
    setCreateNotice(false);

    const groups = [];
    const missing = [];
    Array.from(value.replace(/\s/g, "")).forEach((char) => {
      const group = groupForChar(char);
      if (group) {
        groups.push(group);
      } else {
        missing.push(char);
      }
    });
    if (missing.length) {
      showToast(`未登録の文字: ${missing.join(" ")}`);
    }
    setGroups(groups);
  }

  function populateSelects() {
    xSelect.innerHTML = data.xAxis.map((axis) => `<option value="${axis.id}">X${axis.id} ${axis.emoji} ${axis.jp} / ${axis.en}</option>`).join("");
    ySelect.innerHTML = data.yAxis.map((axis) => `<option value="${axis.id}">Y${axis.id} ${axis.emoji} ${axis.jp} / ${axis.en}</option>`).join("");
  }

  function updateFoundCell() {
    const xId = Number(xSelect.value);
    const yId = Number(ySelect.value);
    const cell = flatCells.find((item) => item.xId === xId && item.yId === yId);

    document.querySelectorAll("#searchMap .kana-cell").forEach((el) => {
      el.classList.toggle("is-found", Number(el.dataset.x) === xId && Number(el.dataset.y) === yId);
    });

    foundCard.innerHTML = cell.unused
      ? `<span>見つかった文字</span><strong>⭐</strong><small>X${xId} × Y${yId} は未使用スペース</small>`
      : `<span>見つかった文字</span><strong>${cell.kana} ${cell.animal}</strong><small>${cell.x.emoji}${cell.x.jp} × ${cell.y.emoji}${cell.y.jp}</small>`;
  }

  function clearTranslationHighlight() {
    document.querySelectorAll("#searchMap .kana-cell").forEach((el) => {
      el.classList.remove("is-translated");
      el.removeAttribute("data-translation-order");
    });
  }

  function highlightTranslatedCells(cells) {
    clearTranslationHighlight();
    const ordersByKey = new Map();
    cells.forEach((cell, index) => {
      const key = `${cell.xId}-${cell.yId}`;
      const orders = ordersByKey.get(key) || [];
      orders.push(index + 1);
      ordersByKey.set(key, orders);
    });

    ordersByKey.forEach((orders, key) => {
      const [xId, yId] = key.split("-");
      const el = document.querySelector(`#searchMap .kana-cell[data-x="${xId}"][data-y="${yId}"]`);
      if (!el) return;
      el.classList.add("is-translated");
      el.dataset.translationOrder = orders.join(",");
    });
  }

  function parseEmojiAddresses(value) {
    const compact = value.replace(/\s/g, "");
    const chars = Array.from(compact).filter((char) => char !== "️");
    const parsed = [];
    const errors = [];

    for (let index = 0; index < chars.length; index += 2) {
      const xEmoji = chars[index];
      const yEmoji = chars[index + 1];
      if (!xEmoji || !yEmoji) {
        errors.push("最後の住所が途中で終わっています");
        break;
      }

      const x = data.xAxis.find((axis) => axis.emoji.replace("️", "") === xEmoji);
      const y = data.yAxis.find((axis) => axis.emoji.replace("️", "") === yEmoji);
      if (!x || !y) {
        errors.push(`${xEmoji}${yEmoji} は読めません`);
        continue;
      }

      const cell = addressIndex.get(`${x.id}-${y.id}`);
      if (!cell || cell.unused) {
        errors.push(`${xEmoji}${yEmoji} は未使用スペースです`);
        continue;
      }

      parsed.push(cell);
    }

    return { parsed, errors };
  }

  function applyKanaHelpers(kanaList) {
    const result = [];
    kanaList.forEach((kana) => {
      if (kana === "゛" || kana === "゜") {
        const previous = result.pop();
        if (!previous) {
          result.push(kana);
          return;
        }
        const combined = kana === "゛" ? voicedKana[previous] : semiVoicedKana[previous];
        result.push(combined || previous + kana);
        return;
      }
      result.push(kana);
    });
    return result.join("");
  }

  function translateCipher() {
    const { parsed, errors } = parseEmojiAddresses(cipherInput.value);
    const kanaList = parsed.map((cell) => cell.kana);
    const result = applyKanaHelpers(kanaList);

    setTranslationResult(result);
    analysisOutput.textContent = kanaList.length
      ? `${kanaList.join(" / ")}`
      : "まだありません";
    highlightTranslatedCells(parsed);

    if (errors.length) {
      showToast(errors[0]);
    } else if (result) {
      showToast("翻訳しました");
    }
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 1800);
  }

  modeButtons.forEach((button) => {
    button.addEventListener("click", () => showView(button.dataset.view));
  });

  kanaInput.addEventListener("input", (event) => parseInput(event.target.value));

  choiceList.addEventListener("click", (event) => {
    const button = event.target.closest(".candidate-button");
    if (!button) return;
    state.selectedCandidates[Number(button.dataset.group)][Number(button.dataset.part)] = button.dataset.candidate;
    renderSelections();
  });

  undoLast.addEventListener("click", removeLastGroup);

  clearSelection.addEventListener("click", () => {
    kanaInput.value = "";
    setCreateNotice(false);
    setGroups([]);
  });

  goSearchButton.addEventListener("click", () => {
    cipherInput.value = kanaInput.value;
    showView("search");
    if (cipherInput.value.trim()) {
      translateCipher();
    }
  });

  copyButton.addEventListener("click", async () => {
    const value = state.selectedCandidates.flat().join("");
    if (!value) {
      showToast("コピーする暗号文がありません");
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      showToast("コピーしました");
    } catch (error) {
      showToast("コピーできませんでした。暗号文を選択してコピーしてください");
    }
  });

  xSelect.addEventListener("change", updateFoundCell);
  ySelect.addEventListener("change", updateFoundCell);
  translateButton.addEventListener("click", translateCipher);

  buildMap("createMap", { mode: "create", onCellClick: appendCell });
  buildMap("searchMap", { mode: "search" });
  populateSelects();
  setCreateNotice(false);
  setGroups([]);
  updateFoundCell();
})();
