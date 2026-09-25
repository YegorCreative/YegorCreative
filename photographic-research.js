(function () {
  "use strict";

  const root = document.querySelector(".exposure-sim");
  if (!root) {
    return;
  }

  const AP = ["1.4", "2", "2.8", "4", "5.6", "8", "11", "16", "22", "32"];
  const SH = ["1 sec", "1/2", "1/4", "1/8", "1/15", "1/30", "1/60", "1/125", "1/250", "1/500", "1/1000"];
  const IS = ["100", "200", "400", "800", "1600", "3200", "6400"];
  const BASE = -5 - 7 + 2; // f/8, 1/125, ISO 400 = correct (EV 0)
  const $ = (id) => root.querySelector("#" + id);
  let target = 0;
  let last = { a: 5, s: 7, i: 2 };
  const total = (a, s, i) => -a - s + i;
  const off = () => total(+$("a").value, +$("s").value, +$("i").value) - BASE;

  const nc = $("noise");
  const nx = nc.getContext("2d");

  function drawNoise(level) {
    const img = nx.createImageData(320, 180);
    for (let k = 0; k < img.data.length; k += 4) {
      const v = Math.random() * 255;
      img.data[k] = img.data[k + 1] = img.data[k + 2] = v;
      img.data[k + 3] = 255;
    }
    nx.putImageData(img, 0, 0);
    nc.style.opacity = level;
  }

  function drawMover(sIdx) {
    const streak = [230, 180, 130, 90, 55, 30, 15, 6, 2, 0, 0][sIdx];
    let g = "";
    const n = streak ? 14 : 1;
    for (let k = 0; k < n; k++) {
      const x = 175 - streak * (k / (n - 1 || 1));
      g += `<circle cx="${x}" cy="105" r="16" fill="#E24B4A" fill-opacity="${streak ? (0.12 + 0.5 * (1 - k / n)) / (streak > 60 ? 1.6 : 1) : 1}"/>`;
    }
    $("mover").innerHTML = g;
  }

  function render() {
    const a = +$("a").value;
    const s = +$("s").value;
    const i = +$("i").value;
    const o = off();
    $("av").textContent = "f/" + AP[a];
    $("sv").textContent = SH[s];
    $("iv").textContent = IS[i];
    const blur = [9, 7.5, 6, 4.5, 3.2, 2, 1.1, 0.5, 0.1, 0][a];
    $("bg").style.filter = `blur(${blur}px)`;
    drawMover(s);
    drawNoise([0, 0.03, 0.07, 0.12, 0.19, 0.28, 0.4][i]);
    const b = Math.min(4.5, Math.max(0.06, Math.pow(2, o * 0.75)));
    $("expo").style.filter = `brightness(${b})` + (o > 1 ? ` contrast(${Math.max(0.5, 1 - 0.1 * (o - 1))})` : "");
    const pos = (v) => ((Math.max(-3.4, Math.min(3.4, v)) + 3.5) / 7 * 100) + "%";
    $("nd").style.left = pos(o);
    $("tl").style.left = pos(target);
    $("tt").style.left = pos(target);
    const m = $("meter");
    m.querySelectorAll(".tick").forEach((t) => t.remove());
    for (let v = -3; v <= 3; v++) {
      const t = document.createElement("div");
      t.className = "tick";
      t.style.left = pos(v);
      t.textContent = (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v);
      m.appendChild(t);
    }
    const ev = (o > 0 ? "+" : o < 0 ? "−" : "") + Math.abs(o);
    const st = $("st");
    if (o === 0) {
      st.textContent = "EV 0 · Properly exposed";
      st.className = "status good";
    } else if (o < 0) {
      st.textContent = `EV ${ev} · Underexposed (too dark) by ${-o} stop${o === -1 ? "" : "s"}`;
      st.className = "status under";
    } else {
      st.textContent = `EV ${ev} · Overexposed (too bright) by ${o} stop${o === 1 ? "" : "s"}`;
      st.className = "status over";
    }
    const d = target - o;
    $("st2").innerHTML = d === 0
      ? `<b class="good">✓ You hit your target (EV ${target > 0 ? "+" : ""}${target}).</b>`
      : `To reach your target you need <b>${Math.abs(d)} stop${Math.abs(d) === 1 ? "" : "s"} ${d > 0 ? "MORE" : "LESS"} light</b>. ${d > 0 ? "Open the aperture (smaller f-number), use a slower shutter, or raise ISO." : "Close the aperture (bigger f-number), use a faster shutter, or lower ISO."}`;
    $("fa").textContent = a <= 2
      ? `f/${AP[a]}: big opening, SHALLOW depth of field (blurry background)`
      : a >= 7
        ? `f/${AP[a]}: tiny opening, DEEP depth of field (sharp background)`
        : `f/${AP[a]}: medium depth of field`;
    $("fs").textContent = s <= 4
      ? `${SH[s]}: slow, motion BLURS`
      : s >= 8
        ? `${SH[s]}: fast, motion FREEZES`
        : `${SH[s]}: slight blur on fast motion`;
    $("fi").textContent = i <= 1
      ? `ISO ${IS[i]}: less sensitive, LESS noise (clean)`
      : i >= 5
        ? `ISO ${IS[i]}: more sensitive, MORE noise (grainy)`
        : `ISO ${IS[i]}: some noise`;
    $("eqiso").textContent = IS[i];
    const tot = total(a, s, i);
    let rows = "<tr><th>Aperture</th><th>Shutter speed</th><th>ISO</th></tr>";
    for (let x = 0; x < 10; x++) {
      const y = i - x - tot;
      if (y < 0 || y > 10) continue;
      rows += `<tr class="${x === a ? "cur" : ""}"><td>f/${AP[x]}</td><td>${SH[y]}</td><td>${IS[i]}</td></tr>`;
    }
    $("eq").innerHTML = rows;
    last = { a, s, i };
  }

  function onMove(which) {
    const w = $("warn");
    w.textContent = "";
    if ($("lock").checked) {
      const c = $("comp").value;
      if (c === which) {
        w.textContent = "Pick a different setting to compensate with.";
        render();
        return;
      }
      const tot = total(last.a, last.s, last.i);
      const a = +$("a").value;
      const s = +$("s").value;
      const i = +$("i").value;
      let need;
      if (c === "s") need = i - a - tot;
      else if (c === "a") need = i - s - tot;
      else need = tot + a + s;
      const el = $(c);
      const mx = +el.max;
      const cl = Math.max(0, Math.min(mx, need));
      el.value = cl;
      if (cl !== need) w.textContent = "Ran out of range on the compensating setting, so the exposure changed.";
    }
    render();
  }

  ["a", "s", "i"].forEach((k) => $(k).addEventListener("input", () => onMove(k)));
  $("tg").querySelectorAll("button").forEach((b) => {
    b.onclick = () => {
      $("tg").querySelectorAll("button").forEach((x) => x.classList.remove("on"));
      b.classList.add("on");
      target = +b.dataset.t;
      render();
    };
  });
  render();
})();
