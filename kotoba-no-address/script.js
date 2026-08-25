(function () {
  const data = window.CIPHER_MAP_DATA;
  const state = {
    groups: [],
    selectedCandidates: []
  };

  const views = {
    home: document.getElementById("homeView"),
    create: document.getElementById("createView"),
    search: document.getElementById("searchView"),
    challenge: document.getElementById("challengeView")
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
  const createXPicker = document.getElementById("createXPicker");
  const createYPicker = document.getElementById("createYPicker");
  const addAddressButton = document.getElementById("addAddressButton");
  const xSelect = document.getElementById("xSelect");
  const ySelect = document.getElementById("ySelect");
  const foundCard = document.getElementById("foundCard");
  const challengeLevel = document.getElementById("challengeLevel");
  const challengeLength = document.getElementById("challengeLength");
  const startChallengeButton = document.getElementById("startChallengeButton");
  const challengeMeta = document.getElementById("challengeMeta");
  const challengeQuestion = document.getElementById("challengeQuestion");
  const hintButton = document.getElementById("hintButton");
  const challengeAnswerInput = document.getElementById("challengeAnswerInput");
  const challengeTokenRow = document.getElementById("challengeTokenRow");
  const challengeUndoButton = document.getElementById("challengeUndoButton");
  const challengeClearButton = document.getElementById("challengeClearButton");
  const checkAnswerButton = document.getElementById("checkAnswerButton");
  const challengeResult = document.getElementById("challengeResult");
  const nextQuestionButton = document.getElementById("nextQuestionButton");
  const challengeScore = document.getElementById("challengeScore");
  const toast = document.getElementById("toast");

  const flatCells = [];
  const kanaIndex = new Map();
  const addressIndex = new Map();
  const expressionIndex = new Map();
  let expressionKeys = [];
  const createAddressChoice = {
    xId: 1,
    yId: 1
  };
  const challengeState = {
    cells: [],
    answerGroups: [],
    expected: "",
    score: 0,
    lastFirstKey: null
  };
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

  function lookupKey(value) {
    return value.replace(/\uFE0F/g, "");
  }

  function compactExpression(value) {
    return lookupKey(value).replace(/\s/g, "");
  }

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
        mark: cell ? cell.mark : null,
        empty: cell ? cell.empty : null,
        animal: cell ? cell.animal : "⭐",
        unused: !cell || Boolean(cell.empty)
      };
      record.value = record.kana || record.mark || null;
      flatCells.push(record);
      if (cell && !record.unused) {
        if (record.value) {
          kanaIndex.set(lookupKey(record.value), record);
        }
        addressIndex.set(`${x.id}-${y.id}`, record);
      }
    });
  });

  const candidateTypes = [
    { id: "number", label: "数字", make: (cell) => `${cell.xId}${cell.yId}` },
    { id: "xySlash", label: "X/Y", make: (cell) => `X${cell.xId}/Y${cell.yId}` },
    { id: "xyCompact", label: "XY", make: (cell) => `X${cell.xId}Y${cell.yId}` },
    { id: "hyphen", label: "数字-数字", make: (cell) => `${cell.xId}-${cell.yId}` },
    { id: "englishNumber", label: "英語+数字", make: (cell) => `${cell.x.en}${cell.yId}` },
    { id: "numberEnglish", label: "数字+英語", make: (cell) => `${cell.xId}${cell.y.en}` },
    { id: "englishEnglish", label: "英語+英語", make: (cell) => `${cell.x.en}${cell.y.en}` },
    { id: "axisEmoji", label: "絵文字", make: (cell) => `${cell.x.emoji}${cell.y.emoji}` },
    { id: "cellMark", label: "マーク", make: (cell) => cell.mark || null }
  ];

  function candidateOptionsFor(cell) {
    const seen = new Set();
    return candidateTypes
      .map((type) => ({ type: type.id, label: type.label, value: type.make(cell) }))
      .filter((candidate) => {
        if (!candidate.value || seen.has(candidate.value)) {
          return false;
        }
        seen.add(candidate.value);
        return true;
      });
  }

  function candidatesFor(cell) {
    return candidateOptionsFor(cell).map((candidate) => candidate.value);
  }

  function buildExpressionIndex() {
    expressionIndex.clear();
    flatCells.forEach((cell) => {
      if (cell.unused) return;
      candidateOptionsFor(cell).forEach((candidate) => {
        expressionIndex.set(compactExpression(candidate.value), cell);
      });
    });
    expressionKeys = Array.from(expressionIndex.keys()).sort((a, b) => b.length - a.length);
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
    corner.innerHTML = "X軸（曜日）→<br>Y軸（干支）↓";
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
        button.className = `kana-cell${cell.unused ? " is-unused" : ""}${cell.mark ? " is-mark" : ""}`;
        button.dataset.x = cell.xId;
        button.dataset.y = cell.yId;
        button.disabled = cell.unused && options.mode === "create";
        button.innerHTML = cell.unused
          ? `<span class="kana">${cell.empty || "⭐"}</span><span class="coords">X${cell.xId} / Y${cell.yId}</span>`
          : `<span class="kana">${cell.value}</span>${cell.animal ? `<span class="animal">${cell.animal}</span>` : ""}<span class="coords">X${cell.xId} / Y${cell.yId}</span>`;
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
    const parts = partChars.map((char) => kanaIndex.get(lookupKey(char)));
    if (parts.some((part) => !part)) {
      return null;
    }
    return { displayKana, parts };
  }

  function groupForChar(char) {
    if (dakutenParts[char]) {
      return groupFromParts(char, dakutenParts[char]);
    }
    const cell = kanaIndex.get(lookupKey(char));
    return cell ? { displayKana: cell.value, parts: [cell] } : null;
  }

  function setGroups(groups) {
    state.groups = groups;
    state.selectedCandidates = groups.map((group) => group.parts.map((cell) => candidatesFor(cell)[0]));
    renderSelections();
  }

  function appendCell(cell) {
    state.groups.push({ displayKana: cell.value, parts: [cell] });
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
      ? state.groups.flatMap((group) => group.parts).map((cell) => `<span class="token-chip">${cell.value}</span>`).join("")
      : `<span class="token-empty">ここに暗号にする文字が並びます</span>`;

    selectedText.textContent = state.groups.length
      ? state.groups.map((group) => {
        const addresses = group.parts.map((cell) => {
          return `${cell.value} → ${cell.x.key} / ${cell.y.key} → ${cell.x.emoji}${cell.x.jp} × ${cell.y.emoji}${cell.y.jp}`;
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
        ? `<small>${group.parts.map((cell) => cell.value).join(" + ")}</small>`
        : `<small>${group.parts[0].animal || "マーク"}</small>`;
      const parts = group.parts.map((cell, partIndex) => {
        const buttons = candidateOptionsFor(cell).map((candidate) => {
          const selected = state.selectedCandidates[groupIndex][partIndex] === candidate.value ? " is-selected" : "";
          return `<button class="candidate-button${selected}" type="button" data-group="${groupIndex}" data-part="${partIndex}" data-type="${candidate.type}" data-candidate="${candidate.value}">${candidate.value}</button>`;
        }).join("");
        return `
          <div class="part-box">
            <div class="part-address">
              <strong>${cell.value}</strong>
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

  function renderCreateAddressPickers() {
    createXPicker.innerHTML = data.xAxis.map((axis) => {
      const selected = axis.id === createAddressChoice.xId ? " is-selected" : "";
      return `<button class="address-pick-button${selected}" type="button" data-axis="x" data-id="${axis.id}">X${axis.id}</button>`;
    }).join("");

    createYPicker.innerHTML = data.yAxis.map((axis) => {
      const selected = axis.id === createAddressChoice.yId ? " is-selected" : "";
      return `<button class="address-pick-button${selected}" type="button" data-axis="y" data-id="${axis.id}">Y${axis.id}</button>`;
    }).join("");
  }

  function handleCreateAddressPick(event) {
    const button = event.target.closest(".address-pick-button");
    if (!button) return;
    const id = Number(button.dataset.id);
    if (button.dataset.axis === "x") {
      createAddressChoice.xId = id;
    } else {
      createAddressChoice.yId = id;
    }
    renderCreateAddressPickers();
  }

  function appendPickedAddress() {
    const cell = addressIndex.get(`${createAddressChoice.xId}-${createAddressChoice.yId}`);
    if (!cell || cell.unused) {
      showToast("この住所はまだ使えません");
      return;
    }
    appendCell(cell);
  }

  function updateFoundCell() {
    const xId = Number(xSelect.value);
    const yId = Number(ySelect.value);
    const cell = flatCells.find((item) => item.xId === xId && item.yId === yId);

    document.querySelectorAll("#searchMap .kana-cell").forEach((el) => {
      el.classList.toggle("is-found", Number(el.dataset.x) === xId && Number(el.dataset.y) === yId);
    });

    foundCard.innerHTML = cell.unused
      ? `<span>見つかった文字</span><strong>${cell.empty || "⭐"}</strong><small>X${xId} × Y${yId} は未使用スペース</small>`
      : `<span>見つかった文字</span><strong>${cell.value} ${cell.animal || ""}</strong><small>${cell.x.emoji}${cell.x.jp} × ${cell.y.emoji}${cell.y.jp}</small>`;
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

  function parseCipherAddresses(value) {
    const compact = compactExpression(value);
    const parsed = [];
    const errors = [];
    let index = 0;

    while (index < compact.length) {
      const foundKey = expressionKeys.find((key) => compact.startsWith(key, index));
      if (!foundKey) {
        errors.push(`${compact.slice(index, index + 8)} は読めません`);
        break;
      }
      parsed.push(expressionIndex.get(foundKey));
      index += foundKey.length;
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

  function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function cellKey(cell) {
    return `${cell.xId}-${cell.yId}`;
  }

  function usableChallengeCells() {
    return flatCells.filter((cell) => !cell.unused && cell.value);
  }

  function wordToChallengeCells(word) {
    const cells = [];
    Array.from(word.replace(/\s/g, "")).forEach((char) => {
      const group = groupForChar(char);
      if (group) {
        cells.push(...group.parts);
      }
    });
    return cells;
  }

  function challengeWords() {
    return (window.CHALLENGE_WORDS || []).filter((word) => {
      const cells = wordToChallengeCells(word);
      return cells.length > 0 && applyKanaHelpers(cells.map((cell) => cell.value)) === word;
    });
  }

  function randomChallengeCells(count) {
    const usable = usableChallengeCells();
    const cells = [];
    let previousKey = challengeState.lastFirstKey;

    for (let index = 0; index < count; index += 1) {
      const choices = usable.filter((cell) => cellKey(cell) !== previousKey);
      const cell = randomItem(choices.length ? choices : usable);
      cells.push(cell);
      previousKey = cellKey(cell);
    }

    return cells;
  }

  function candidateByType(cell, type) {
    return candidateOptionsFor(cell).find((candidate) => candidate.type === type);
  }

  function challengeExpressionFor(cell, level) {
    if (level === "1") {
      return cell.mark || cell.animal || candidateByType(cell, "axisEmoji").value;
    }
    if (level === "2") {
      return candidateByType(cell, "number").value;
    }
    if (level === "3") {
      return candidateByType(cell, "xySlash").value;
    }
    if (level === "4") {
      return candidateByType(cell, "englishEnglish").value;
    }

    return randomItem(candidateOptionsFor(cell)).value;
  }

  function clearChallengeHighlight() {
    document.querySelectorAll("#challengeMap .kana-cell").forEach((el) => {
      el.classList.remove("is-translated", "is-selected");
      el.removeAttribute("data-translation-order");
    });
  }

  function highlightChallengeCells() {
    clearChallengeHighlight();
    const ordersByKey = new Map();
    challengeState.cells.forEach((cell, index) => {
      const key = cellKey(cell);
      const orders = ordersByKey.get(key) || [];
      orders.push(index + 1);
      ordersByKey.set(key, orders);
    });
    ordersByKey.forEach((orders, key) => {
      const [xId, yId] = key.split("-");
      const el = document.querySelector(`#challengeMap .kana-cell[data-x="${xId}"][data-y="${yId}"]`);
      if (!el) return;
      el.classList.add("is-translated");
      el.dataset.translationOrder = orders.join(",");
    });
  }

  function renderChallengeAnswer() {
    challengeTokenRow.innerHTML = challengeState.answerGroups.length
      ? challengeState.answerGroups.map((cell) => `<span class="token-chip">${cell.value}</span>`).join("")
      : `<span class="token-empty">地図で押したこたえが並びます</span>`;
  }

  function currentChallengeAnswer() {
    const typed = challengeAnswerInput.value.replace(/\s/g, "");
    const tapped = challengeState.answerGroups.map((cell) => cell.value).join("");
    return applyKanaHelpers(Array.from(typed + tapped));
  }

  function resetChallengeAnswer() {
    challengeState.answerGroups = [];
    challengeAnswerInput.value = "";
    challengeResult.hidden = true;
    challengeResult.textContent = "";
    challengeResult.classList.remove("is-wrong");
    nextQuestionButton.hidden = true;
    renderChallengeAnswer();
  }

  function renderChallengeQuestion() {
    const level = challengeLevel.value;
    const lengthLabel = challengeLength.options[challengeLength.selectedIndex].textContent;
    challengeMeta.textContent = `${level === "max" ? "MAX" : `LEVEL ${level}`} / ${lengthLabel}`;
    challengeQuestion.innerHTML = challengeState.cells
      .map((cell) => `<span class="question-piece">${challengeExpressionFor(cell, level)}</span>`)
      .join("");
  }

  function generateChallenge() {
    const length = challengeLength.value;
    if (length === "word") {
      const words = challengeWords();
      const usableWords = words.length ? words : ["ねこ"];
      const choices = usableWords.filter((word) => {
        const cells = wordToChallengeCells(word);
        return cells[0] && cellKey(cells[0]) !== challengeState.lastFirstKey;
      });
      const word = randomItem(choices.length ? choices : usableWords);
      challengeState.cells = wordToChallengeCells(word);
    } else {
      challengeState.cells = randomChallengeCells(Number(length));
    }

    if (challengeState.cells.length) {
      challengeState.lastFirstKey = cellKey(challengeState.cells[0]);
    }
    challengeState.expected = applyKanaHelpers(challengeState.cells.map((cell) => cell.value));
    resetChallengeAnswer();
    clearChallengeHighlight();
    renderChallengeQuestion();
  }

  function appendChallengeCell(cell) {
    challengeState.answerGroups.push(cell);
    renderChallengeAnswer();
  }

  function removeLastChallengeAnswer() {
    if (challengeState.answerGroups.length) {
      challengeState.answerGroups.pop();
    } else {
      const chars = Array.from(challengeAnswerInput.value);
      chars.pop();
      challengeAnswerInput.value = chars.join("");
    }
    renderChallengeAnswer();
  }

  function clearChallengeAnswer() {
    challengeState.answerGroups = [];
    challengeAnswerInput.value = "";
    renderChallengeAnswer();
  }

  function checkChallengeAnswer() {
    const answer = currentChallengeAnswer();
    const correct = answer === challengeState.expected;
    challengeResult.hidden = false;
    challengeResult.classList.toggle("is-wrong", !correct);
    challengeResult.textContent = correct ? "せいかい！" : "もういちど！";
    if (correct) {
      challengeState.score += 1;
      challengeScore.textContent = `${challengeState.score}問せいかい！`;
      nextQuestionButton.hidden = false;
      highlightChallengeCells();
    }
  }

  function translateCipher() {
    const { parsed, errors } = parseCipherAddresses(cipherInput.value);
    const kanaList = parsed.map((cell) => cell.value);
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

  createXPicker.addEventListener("click", handleCreateAddressPick);
  createYPicker.addEventListener("click", handleCreateAddressPick);
  addAddressButton.addEventListener("click", appendPickedAddress);

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
  startChallengeButton.addEventListener("click", generateChallenge);
  nextQuestionButton.addEventListener("click", generateChallenge);
  checkAnswerButton.addEventListener("click", checkChallengeAnswer);
  hintButton.addEventListener("click", highlightChallengeCells);
  challengeUndoButton.addEventListener("click", removeLastChallengeAnswer);
  challengeClearButton.addEventListener("click", clearChallengeAnswer);
  challengeLevel.addEventListener("change", generateChallenge);
  challengeLength.addEventListener("change", generateChallenge);

  buildMap("createMap", { mode: "create", onCellClick: appendCell });
  buildMap("searchMap", { mode: "search" });
  buildMap("challengeMap", { mode: "challenge", onCellClick: appendChallengeCell });
  buildExpressionIndex();
  populateSelects();
  renderCreateAddressPickers();
  setCreateNotice(false);
  setGroups([]);
  updateFoundCell();
  renderChallengeAnswer();
  generateChallenge();
})();
