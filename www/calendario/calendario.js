/* ============================================================
   calendario.js — Torneo a Punti (Swiss)
   Mostra tutti i turni con risultati per partita.
   Polling ogni 15 secondi per aggiornamenti live.
   ============================================================ */

(function () {

    const POLL_INTERVAL = 15000;
    let   currentTab    = "tutti";
    let   lastData      = null;

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
        t.className   = "toast show";
        clearTimeout(t._timer);
        t._timer = setTimeout(() => { t.className = "toast"; }, 3000);
    }

    /* ── FETCH ── */
    async function fetchBracket() {
        const res  = await fetch("../admin_area/get_bracket.php?t=" + Date.now());
        const json = await res.json();
        return json;
    }

    /* ── STATS ── */
    function updateStats(bracket) {
        if (!bracket || bracket.length === 0) {
            document.getElementById("statTotali").textContent    = "—";
            document.getElementById("statGiocate").textContent   = "—";
            document.getElementById("statRimanenti").textContent = "—";
            document.getElementById("statFase").textContent      = "—";
            const liveDot = document.getElementById("liveDot");
            if (liveDot) liveDot.style.display = "none";
            return;
        }

        let totali = 0, giocate = 0;
        bracket.forEach(round => {
            round.forEach(m => {
                if (m.t2 !== null) { // Esclude BYE
                    totali++;
                    if (m.winner !== null) giocate++;
                }
            });
        });

        const rimanenti    = totali - giocate;
        const turnoAttuale = bracket.length;

        document.getElementById("statTotali").textContent    = totali;
        document.getElementById("statGiocate").textContent   = giocate;
        document.getElementById("statRimanenti").textContent = rimanenti;
        document.getElementById("statFase").textContent      = `Turno ${turnoAttuale}`;

        const liveDot = document.getElementById("liveDot");
        if (liveDot) liveDot.style.display = (giocate > 0 && rimanenti > 0) ? "flex" : "none";
    }

    /* ── RENDER TURNI ── */
    function renderRounds(bracket, tab) {
        let roundsToShow = bracket.map((round, rIdx) => ({ round, rIdx }));

        if (tab === "risultati") {
            roundsToShow = roundsToShow.filter(({ round }) =>
                round.some(m => m.winner !== null && m.t2 !== null)
            );
        } else if (tab === "prossime") {
            roundsToShow = roundsToShow.filter(({ round }) =>
                round.some(m => m.winner === null && m.t2 !== null)
            );
        }

        if (!roundsToShow.length) {
            const icon = tab === "risultati" ? "⏳" : "✅";
            const msg  = tab === "risultati"
                ? "Nessuna partita ancora disputata."
                : tab === "prossime"
                    ? "Tutte le partite sono state giocate!"
                    : "Nessun turno generato.";
            return `<div class="empty-state">
                <div class="empty-icon">${icon}</div>
                <h2>${msg}</h2>
            </div>`;
        }

        let html = "";

        roundsToShow.forEach(({ round, rIdx }) => {
            const realMatches = round.filter(m => m.t2 !== null);
            const played = realMatches.filter(m => m.winner !== null).length;
            const total  = realMatches.length;

            let badgeCls, badgeTxt;
            if (played === total && total > 0) { badgeCls = "round-badge--done";    badgeTxt = "Completato"; }
            else if (played > 0)               { badgeCls = "round-badge--partial"; badgeTxt = `${played}/${total} disputate`; }
            else                               { badgeCls = "round-badge--pending"; badgeTxt = "In attesa"; }

            html += `<div class="round-block">
                <div class="round-header">
                    <div class="round-title">Turno ${rIdx + 1}</div>
                    <span class="round-badge ${badgeCls}">${badgeTxt}</span>
                    <div class="round-divider"></div>
                </div>
                <div class="matches-grid">`;

            round.forEach((match, mIdx) => {
                const { t1, t2, winner } = match;
                const isBye = t2 === null;

                // Nei tab risultati/prossime non mostrare i BYE
                if (isBye && tab !== "tutti") return;

                if (isBye) {
                    html += `<div class="match-card match-card--bye">
                        <span class="match-label">Match ${mIdx + 1} — BYE</span>
                        <div class="side-indicator"></div>
                        <div class="team-slot">
                            <span class="team-name">${esc(t1.caposquadra)}</span>
                            <span class="team-mmr">${t1.mmr_totale.toLocaleString("it-IT")} MMR</span>
                        </div>
                        <div class="match-center"><span class="vs-label">BYE</span></div>
                        <div class="team-slot team-slot--right">
                            <span class="team-name tbd">— BYE —</span>
                        </div>
                        <div class="side-indicator"></div>
                    </div>`;
                    return;
                }

                if (tab === "risultati" && winner === null) return;
                if (tab === "prossime"  && winner !== null) return;

                const isDone = winner !== null;
                const t1Wins = isDone && winner.caposquadra === t1.caposquadra;
                const t2Wins = isDone && winner.caposquadra === t2.caposquadra;
                const cardCls = isDone ? "match-card--done" : "match-card--pending";
                const t1Cls   = t1Wins ? "team-slot--winner" : t2Wins ? "team-slot--loser" : "";
                const t2Cls   = t2Wins ? "team-slot--winner" : t1Wins ? "team-slot--loser" : "";

                html += `<div class="match-card ${cardCls}">
                    <span class="match-label">Match ${mIdx + 1}</span>
                    <div class="side-indicator">
                        <span class="win-chevron ${t1Wins ? "visible" : ""}">›</span>
                    </div>
                    <div class="team-slot ${t1Cls}">
                        <span class="team-name">${esc(t1.caposquadra)}</span>
                        <span class="team-mmr">${t1.mmr_totale.toLocaleString("it-IT")} MMR</span>
                    </div>
                    <div class="match-center">
                        ${isDone
                            ? `<span class="result-icon">✓</span><span class="vs-label">Fine</span>`
                            : `<span class="vs-label">VS</span>`
                        }
                    </div>
                    <div class="team-slot team-slot--right ${t2Cls}">
                        <span class="team-name">${esc(t2.caposquadra)}</span>
                        <span class="team-mmr">${t2.mmr_totale.toLocaleString("it-IT")} MMR</span>
                    </div>
                    <div class="side-indicator">
                        <span class="win-chevron ${t2Wins ? "visible" : ""}">‹</span>
                    </div>
                </div>`;
            });

            html += `</div></div>`;
        });

        return html;
    }

    /* ── RENDER PRINCIPALE ── */
    function render(data) {
        const content = document.getElementById("calContent");
        const tabBar  = document.getElementById("tabBar");
        if (!content) return;

        if (!data.success || !data.bracket || !data.bracket.length) {
            content.innerHTML = `<div class="empty-state">
                <div class="empty-icon">📅</div>
                <h2>Nessun torneo in corso</h2>
                <p>Il bracket non è ancora stato generato nella pagina Matchmaking.</p>
            </div>`;
            updateStats(null);
            if (tabBar) tabBar.style.display = "none";
            return;
        }

        const bracket = data.bracket;
        const savedAt = data.saved_at ? new Date(data.saved_at) : null;

        updateStats(bracket);
        if (tabBar) tabBar.style.display = "flex";

        let html = "";
        if (savedAt) {
            html += `<div class="last-update">Aggiornato: ${savedAt.toLocaleString("it-IT")}</div>`;
        }
        html += renderRounds(bracket, currentTab);
        content.innerHTML = html;
    }

    /* ── POLLING ── */
    async function refresh(silent = false) {
        try {
            const data = await fetchBracket();
            const prev = JSON.stringify(lastData);
            const curr = JSON.stringify(data);
            if (prev && prev !== curr && !silent) {
                showToast("🔄 Risultati aggiornati");
            }
            lastData = data;
            render(data);
        } catch (err) {
            if (!lastData) {
                const content = document.getElementById("calContent");
                if (content) content.innerHTML = `<div class="empty-state">
                    <div class="empty-icon">⚠️</div>
                    <h2>Errore di connessione</h2>
                    <p>Impossibile recuperare i dati del torneo.</p>
                </div>`;
            }
        }
    }

    /* ── TAB LOGIC ── */
    function initTabs() {
        document.addEventListener("click", (e) => {
            const btn = e.target.closest(".tab-btn");
            if (!btn) return;
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentTab = btn.dataset.tab;
            if (lastData) render(lastData);
        });
    }

    /* ── INIT ── */
    document.addEventListener("DOMContentLoaded", () => {
        initTabs();
        refresh(true);
        setInterval(() => refresh(false), POLL_INTERVAL);
    });

})();
