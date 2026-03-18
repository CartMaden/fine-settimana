/* ============================================================
   classifica.js — Classifica Torneo a Punti (Swiss)

   Tre stati:
   1. TORNEO NON INIZIATO  → nessun dato nel JSON
   2. IN CORSO / PROVVISORIA → JSON ha campo "bracket"
   3. CONCLUSO / FINALE    → JSON ha campo "classifica" (post-export)

   Polling ogni 15 secondi durante il torneo.
   ============================================================ */

(function () {

    const POLL_INTERVAL  = 15000;
    const START_DATE     = new Date("2026-05-15T00:00:00");   // data inizio torneo
    const ENDPOINT       = "../admin_area/get_bracket.php";

    let lastJSON = null;
    let countdownTimer = null;

    /* ── UTILS ── */
    function esc(str) {
        const d = document.createElement("div");
        d.textContent = str;
        return d.innerHTML;
    }

    function showToast(msg) {
        const t = document.getElementById("toast");
        if (!t) return;
        t.textContent = msg;
        t.className = "toast show";
        clearTimeout(t._timer);
        t._timer = setTimeout(() => { t.className = "toast"; }, 3000);
    }

    /* ── FETCH ── */
    async function fetchData() {
        const res  = await fetch(ENDPOINT + "?t=" + Date.now());
        const json = await res.json();
        return json;
    }

    /* ── CALCOLA CLASSIFICA DAL BRACKET ── */
    function buildLeaderboardFromBracket(bracket) {
        const teams = new Map();

        bracket.forEach(round => {
            round.forEach(match => {
                [match.t1, match.t2].forEach(t => {
                    if (t && !teams.has(t.caposquadra)) {
                        teams.set(t.caposquadra, {
                            caposquadra: t.caposquadra,
                            corso:       t.corso       || "",
                            mmr_totale:  t.mmr_totale  || 0,
                            punti:       0,
                            vinte:       0,
                            perse:       0,
                        });
                    }
                });

                if (match.winner && match.t2 !== null) {
                    const w = teams.get(match.winner.caposquadra);
                    const loserName = match.t1.caposquadra === match.winner.caposquadra
                        ? match.t2.caposquadra
                        : match.t1.caposquadra;
                    const l = teams.get(loserName);
                    if (w) { w.punti++; w.vinte++; }
                    if (l) { l.perse++; }
                }
            });
        });

        return Array.from(teams.values()).sort((a, b) => {
            if (b.punti !== a.punti) return b.punti - a.punti;
            return b.mmr_totale - a.mmr_totale;
        });
    }

    /* ── RENDER PODIO ── */
    function renderPodio(top3) {
        const medals = ["🥇", "🥈", "🥉"];
        const classes = ["podio-card--1", "podio-card--2", "podio-card--3"];
        // Ordine visivo: 2° | 1° | 3°
        const order = [1, 0, 2];

        const cards = order.map(i => {
            const t = top3[i];
            if (!t) return `<div class="podio-card ${classes[i]}" data-medal="${medals[i]}"></div>`;
            return `
            <div class="podio-card ${classes[i]}" data-medal="${medals[i]}">
                <span class="podio-medal">${medals[i]}</span>
                <div class="podio-pos">${i + 1}° Posto</div>
                <div class="podio-name">${esc(t.caposquadra)}</div>
                <div class="podio-corso">${esc(t.corso)}</div>
                <div class="podio-pts">${t.punti}<span>pt</span></div>
            </div>`;
        });

        return `<div class="podio">${cards.join("")}</div>`;
    }

    /* ── RENDER TABELLA ── */
    function renderTable(leaderboard) {
        const medals = ["🥇", "🥈", "🥉"];
        const rowCls = ["row-gold", "row-silver", "row-bronze"];

        const rows = leaderboard.map((t, i) => {
            const pos    = i < 3 ? medals[i] : `${i + 1}°`;
            const cls    = i < 3 ? rowCls[i] : "";
            const record = `${t.vinte}V&nbsp;/&nbsp;${t.perse}P`;
            return `
            <tr class="${cls}">
                <td class="col-pos">${pos}</td>
                <td class="col-team">${esc(t.caposquadra)}</td>
                <td class="col-corso hide-mobile">${esc(t.corso)}</td>
                <td class="col-pts">${t.punti}</td>
                <td class="col-record hide-mobile">${record}</td>
                <td class="hide-mobile" style="font-family:'Rajdhani',sans-serif;font-size:13px;color:#7a8aaa;text-align:right">
                    ${t.mmr_totale.toLocaleString("it-IT")}
                </td>
            </tr>`;
        }).join("");

        return `
        <div class="cla-table-wrap">
            <table class="cla-table">
                <thead>
                    <tr>
                        <th class="col-pos">Pos</th>
                        <th>Squadra</th>
                        <th class="hide-mobile">Corso</th>
                        <th class="col-pts" style="text-align:center">Punti</th>
                        <th class="col-record hide-mobile" style="text-align:center">Record</th>
                        <th class="hide-mobile" style="text-align:right">MMR</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>`;
    }

    /* ── STATO 1: TORNEO NON INIZIATO ── */
    function renderNotStarted() {
        // Avvia/aggiorna il countdown
        if (countdownTimer) clearInterval(countdownTimer);

        function getCountdown() {
            const now  = new Date();
            const diff = START_DATE - now;
            if (diff <= 0) return { giorni: 0, ore: 0, minuti: 0, secondi: 0 };
            const giorni  = Math.floor(diff / (1000 * 60 * 60 * 24));
            const ore     = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minuti  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secondi = Math.floor((diff % (1000 * 60)) / 1000);
            return { giorni, ore, minuti, secondi };
        }

        function pad(n) { return String(n).padStart(2, "0"); }

        const el = document.getElementById("claContent");
        el.innerHTML = `
        <div class="waiting-card">
            <span class="waiting-trophy">🏆</span>
            <h2>Il torneo non è ancora iniziato</h2>
            <p>La classifica sarà disponibile a partire dall'inizio del torneo.<br>
               Segna la data sul calendario e torna a trovarci!</p>
            <div class="waiting-date">📅 15 Maggio 2026</div>
            <div class="countdown" id="countdown">
                <div class="countdown-unit">
                    <div class="countdown-value" id="cd-giorni">--</div>
                    <div class="countdown-label">Giorni</div>
                </div>
                <div class="countdown-unit">
                    <div class="countdown-value" id="cd-ore">--</div>
                    <div class="countdown-label">Ore</div>
                </div>
                <div class="countdown-unit">
                    <div class="countdown-value" id="cd-minuti">--</div>
                    <div class="countdown-label">Minuti</div>
                </div>
                <div class="countdown-unit">
                    <div class="countdown-value" id="cd-secondi">--</div>
                    <div class="countdown-label">Secondi</div>
                </div>
            </div>
        </div>`;

        function tick() {
            const { giorni, ore, minuti, secondi } = getCountdown();
            const g = document.getElementById("cd-giorni");
            const o = document.getElementById("cd-ore");
            const m = document.getElementById("cd-minuti");
            const s = document.getElementById("cd-secondi");
            if (g) g.textContent = pad(giorni);
            if (o) o.textContent = pad(ore);
            if (m) m.textContent = pad(minuti);
            if (s) s.textContent = pad(secondi);
        }

        tick();
        countdownTimer = setInterval(tick, 1000);
    }

    /* ── STATO 2: TORNEO IN CORSO (CLASSIFICA PROVVISORIA) ── */
    function renderProvisional(bracket, savedAt) {
        if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }

        const leaderboard = buildLeaderboardFromBracket(bracket);

        // Conta turni completati
        const turniCompletati = bracket.filter(r =>
            r.every(m => m.winner !== null)
        ).length;

        const el = document.getElementById("claContent");
        let html = "";

        if (savedAt) {
            html += `<div class="last-update">Aggiornato: ${new Date(savedAt).toLocaleString("it-IT")}</div>`;
        }

        html += `
        <div class="status-banner status-banner--provisional">
            <span class="status-banner-icon">⚠️</span>
            <div class="status-banner-body">
                <h3>Classifica Provvisoria</h3>
                <p>Il torneo è ancora in corso. La classifica si aggiorna automaticamente al termine di ogni partita e diventerà <strong>ufficiale e definitiva</strong> solo alla conclusione di tutti i turni.</p>
            </div>
        </div>`;

        if (turniCompletati > 0) {
            html += `<div class="turni-badge">⚔️ ${turniCompletati} turno${turniCompletati !== 1 ? "i" : ""} completato${turniCompletati !== 1 ? "i" : ""} su ${bracket.length}</div>`;
        }

        if (leaderboard.length >= 3) {
            html += renderPodio(leaderboard.slice(0, 3));
        }

        html += renderTable(leaderboard);
        el.innerHTML = html;
    }

    /* ── STATO 3: TORNEO CONCLUSO (CLASSIFICA FINALE) ── */
    function renderFinal(classifica, turniGiocati) {
        if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }

        // La classifica salvata dall'export ha già punti, caposquadra, corso, mmr_totale
        // Aggiungiamo vinte/perse se assenti (retrocompatibilità)
        const leaderboard = classifica.map(t => ({
            ...t,
            vinte: t.vinte ?? t.punti ?? 0,
            perse: t.perse ?? 0,
        }));

        const el = document.getElementById("claContent");
        let html = `
        <div class="status-banner status-banner--final">
            <span class="status-banner-icon">🏆</span>
            <div class="status-banner-body">
                <h3>Classifica Finale Ufficiale</h3>
                <p>Il torneo si è concluso dopo <strong>${turniGiocati} turni</strong>. Questa è la classifica definitiva delle E-Olimpiadi Lazio Digital 2026.</p>
            </div>
        </div>`;

        if (leaderboard.length >= 3) {
            html += renderPodio(leaderboard.slice(0, 3));
        }

        html += renderTable(leaderboard);
        el.innerHTML = html;
    }

    /* ── RENDER ROUTER ── */
    function render(data) {
        // STATO 3: torneo concluso — il JSON ha "classifica" ma non "bracket"
        if (data.success && data.classifica && !data.bracket) {
            renderFinal(data.classifica, data.turniGiocati || 0);
            return;
        }

        // STATO 2: torneo in corso — il JSON ha "bracket"
        if (data.success && data.bracket && data.bracket.length > 0) {
            renderProvisional(data.bracket, data.saved_at);
            return;
        }

        // STATO 1: nessun dato → torneo non iniziato
        renderNotStarted();
    }

    /* ── POLLING ── */
    async function refresh(silent = false) {
        try {
            const data = await fetchData();
            const prev = JSON.stringify(lastJSON);
            const curr = JSON.stringify(data);

            if (prev && prev !== curr && !silent) {
                showToast("🔄 Classifica aggiornata");
            }

            lastJSON = data;
            render(data);
        } catch (err) {
            // Se non abbiamo ancora caricato nulla, mostra il not-started
            if (!lastJSON) {
                renderNotStarted();
            }
        }
    }

    /* ── INIT ── */
    document.addEventListener("DOMContentLoaded", () => {
        refresh(true);
        setInterval(() => refresh(false), POLL_INTERVAL);
    });

})();
