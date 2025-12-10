(function () {
  const SCALE = 8;
  let isUpdating = false;

  const owX = document.getElementById("overworldX");
  const owZ = document.getElementById("overworldZ");
  const nX = document.getElementById("netherX");
  const nZ = document.getElementById("netherZ");

  const commandInput = document.getElementById("commandInput");
  const commandApplyBtn = document.getElementById("commandApplyBtn");

  /* ---------- Вспомогательные функции ---------- */

  function parseNumber(value) {
    if (!value) return NaN;
    const n = Number(value);
    return Number.isFinite(n) ? n : NaN;
  }

  function format(num) {
    if (!Number.isFinite(num)) return "";
    const fixed = num.toFixed(2);
    return fixed.endsWith(".00") ? String(Math.round(num)) : fixed;
  }

  function setValue(input, value) {
    input.value = format(value);
  }

  /* ---------- Авторасчёт ---------- */

  function handleChange(source) {
    if (isUpdating) return;
    isUpdating = true;

    const ovX = parseNumber(owX.value);
    const ovZ = parseNumber(owZ.value);
    const netX = parseNumber(nX.value);
    const netZ = parseNumber(nZ.value);

    switch (source) {
      case "overworldX":
        setValue(nX, Number.isFinite(ovX) ? ovX / SCALE : "");
        break;

      case "overworldZ":
        setValue(nZ, Number.isFinite(ovZ) ? ovZ / SCALE : "");
        break;

      case "netherX":
        setValue(owX, Number.isFinite(netX) ? netX * SCALE : "");
        break;

      case "netherZ":
        setValue(owZ, Number.isFinite(netZ) ? netZ * SCALE : "");
        break;
    }

    isUpdating = false;
  }

  owX.addEventListener("input", () => handleChange("overworldX"));
  owZ.addEventListener("input", () => handleChange("overworldZ"));
  nX.addEventListener("input", () => handleChange("netherX"));
  nZ.addEventListener("input", () => handleChange("netherZ"));

  /* ---------- Разбор команды F3+C ---------- */

  function parseF3CCommand(cmd) {
    if (!cmd || typeof cmd !== "string") return null;
    const trimmed = cmd.trim();

    let world = null;
    if (trimmed.includes("minecraft:overworld")) {
      world = "overworld";
    } else if (trimmed.includes("minecraft:the_nether")) {
      world = "nether";
    } else {
      return null;
    }

    const nums = trimmed.match(/-?\d+(\.\d+)?/g);
    if (!nums || nums.length < 3) return null;

    const x = Number(nums[0]);
    const y = Number(nums[1]);
    const z = Number(nums[2]);

    if (!Number.isFinite(x) || !Number.isFinite(z)) return null;

    return { world, x, y, z };
  }

  /* ---------- Живая подсветка рамки ---------- */

  function updateCommandHighlight() {
    const cmd = commandInput.value;

    commandInput.classList.remove("world-overworld", "world-nether");

    if (cmd.includes("minecraft:overworld")) {
      commandInput.classList.add("world-overworld");
    } else if (cmd.includes("minecraft:the_nether")) {
      commandInput.classList.add("world-nether");
    }
  }

  commandInput.addEventListener("input", updateCommandHighlight);

  /* ---------- Применение команды ---------- */

  function applyCommand() {
    const parsed = parseF3CCommand(commandInput.value);

    if (!parsed) {
      commandInput.classList.add("shake");
      setTimeout(() => commandInput.classList.remove("shake"), 300);
      return;
    }

    if (parsed.world === "overworld") {
      setValue(owX, parsed.x);
      setValue(owZ, parsed.z);
      handleChange("overworldX");
      handleChange("overworldZ");
    } else {
      setValue(nX, parsed.x);
      setValue(nZ, parsed.z);
      handleChange("netherX");
      handleChange("netherZ");
    }
  }

  commandApplyBtn.addEventListener("click", applyCommand);

  // Ctrl+Enter = применить команду
  commandInput.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      applyCommand();
    }
  });

  /* НОТА В ШАПКЕ */

  const noteButton = document.getElementById("noteButton");
  if (noteButton) {
    const noteAudio = new Audio("sound.wav");
    noteAudio.volume = 0.9;

    noteButton.addEventListener("click", () => {
      // если уже играет — перематываем и опять с начала
      if (!noteAudio.paused) {
        noteAudio.currentTime = 0;
      }

      noteAudio
        .play()
        .then(() => {
          noteButton.classList.add("is-playing");
        })
        .catch(() => {
          // если браузер что-то запретил — просто молча игнорим
        });
    });

    noteAudio.addEventListener("ended", () => {
      noteButton.classList.remove("is-playing");
    });
  }
})();
