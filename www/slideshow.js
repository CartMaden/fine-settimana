let slideIndex = 0;
showSlides();

function showSlides() {
    let i;
    let slides = document.getElementsByClassName("mySlides");

    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }

    slideIndex++;
    if (slideIndex > slides.length) {
        slideIndex = 1;
    }

    slides[slideIndex - 1].style.display = "block";

    setTimeout(showSlides, 2000);
}

document.querySelectorAll(".media-container").forEach(container => {

    const video = container.querySelector("video");

    container.addEventListener("mouseenter", () => {
        video.play();
    });

    container.addEventListener("mouseleave", () => {
        video.pause();
        video.currentTime = 0;
    });

});



  const games = {
    valorant: {
      tag: 'Sparatutto Tattico · 5v5',
      title: 'Valorant',
      img: './photo/valorant.jpg',
      theme: 'valorant-box',
      desc: 'Valorant è uno sparatutto tattico 5v5 sviluppato da Riot Games. Due squadre si alternano nei ruoli di attaccanti e difensori su mappe ricche di angoli strategici. Ogni agente possiede abilità uniche che si integrano con il classico gameplay basato sulla precisione di mira. La comunicazione, il posizionamento e la gestione dell’economia sono fondamentali per la vittoria.',
      dates: '12/03/2026 &ndash; 18/03/2026',
      format: '5 giocatori + 3 riserve per team &middot; Eliminazione diretta'
    },
    lol: {
      tag: 'MOBA Competitivo · 5v5',
      title: 'League of Legends',
      img: './photo/lol.jpg',
      theme: 'lol-box',
      desc: 'League of Legends è il MOBA più giocato al mondo. Due squadre da 5 si sfidano su una mappa simmetrica con l’obiettivo di distruggere il Nexus avversario. La scelta dei campioni, la gestione delle risorse e la coordinazione tra le corsie determinano il risultato. Ogni partita richiede adattabilità e pensiero tattico in tempo reale.',
      dates: '20/03/2026 &ndash; 26/03/2026',
      format: '5 giocatori + 3 riserve per team &middot; Eliminazione diretta'
    },
    r6: {
      tag: 'FPS Tattico · 5v5',
      title: 'Rainbow Six Siege',
      img: './photo/r6.jpg',
      theme: 'r6-box',
      desc: 'Rainbow Six Siege è un FPS tattico ad alta intensità basato su attacco e difesa tra operatori specializzati. La distruzione ambientale e i gadget unici di ogni operatore aprono infinite possibilità strategiche. Ogni round dura pochi minuti, ma richiede comunicazione perfetta, lettura del gioco avversario e reazioni fulminee.',
      dates: '28/03/2026 &ndash; 04/04/2026',
      format: '5 giocatori + 3 riserve per team &middot; Eliminazione diretta'
    }
  };

  const overlay = document.getElementById('gameModal');
  const card    = document.getElementById('gameModalCard');

  function openGameModal(key) {
    const g = games[key];
    card.className = 'game-modal-card ' + g.theme;
    document.getElementById('gameModalImg').src = g.img;
    document.getElementById('gameModalTag').textContent = g.tag;
    document.getElementById('gameModalTitle').textContent = g.title;
    document.getElementById('gameModalDesc').textContent = g.desc;
    document.getElementById('gameModalDetails').innerHTML =
      '<div class="gmd-row"><span class="gmd-label">&#128197; Date Match</span><span class="gmd-val">' + g.dates + '</span></div>' +
      '<div class="gmd-row"><span class="gmd-label">&#128101; Formato</span><span class="gmd-val">' + g.format + '</span></div>';
    card.scrollTop = 0;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  document.querySelectorAll('.game-card[data-game]').forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => openGameModal(el.dataset.game));
  });

  function closeGameModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.getElementById('gameModalClose').addEventListener('click', closeGameModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeGameModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeGameModal(); });
