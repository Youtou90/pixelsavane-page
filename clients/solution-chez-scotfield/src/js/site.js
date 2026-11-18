/* Solution Chez Scotfield — petits comportements du site */
(function(){
  var WA = document.body.dataset.wa || '237695317195';   // fourni par donnees/boutique.json

  // Filtres du catalogue
  var boutons = document.querySelectorAll('[data-filtre]');
  var rayons = document.querySelectorAll('[data-rayon]');
  function filtrer(cle){
    boutons.forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.filtre === cle)); });
    rayons.forEach(function(r){ r.hidden = !(cle === 'tout' || r.dataset.rayon === cle); });
  }
  boutons.forEach(function(b){ b.addEventListener('click', function(){ filtrer(b.dataset.filtre); }); });
  if (rayons.length && location.hash){
    var h = location.hash.slice(1);
    if (document.querySelector('[data-rayon="'+h+'"]')) filtrer(h);
  }

  // Bouton « Copier » le numéro
  document.querySelectorAll('[data-copier]').forEach(function(b){
    b.addEventListener('click', function(){
      var t = b.dataset.copier;
      var ok = function(){ b.textContent = 'Copié'; setTimeout(function(){ b.textContent = 'Copier'; }, 1800); };
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(ok, function(){ b.textContent = t; });
      else b.textContent = t;
    });
  });

  // Formulaire → message WhatsApp
  var f = document.getElementById('form-wa');
  if (f){
    f.addEventListener('submit', function(e){
      e.preventDefault();
      var v = function(id){ return (document.getElementById(id).value || '').trim(); };
      var retour = document.getElementById('form-retour');
      if (!v('besoin')){ retour.textContent = 'Dites-nous ce que vous cherchez avant d’envoyer.'; document.getElementById('besoin').focus(); return; }
      var msg = 'Bonjour Solution Chez Scotfield,\n' +
        (v('nom') ? 'Je suis ' + v('nom') + (v('quartier') ? ' (' + v('quartier') + ')' : '') + '.\n' : '') +
        'Rayon : ' + v('rayon') + '\n' + v('besoin');
      var url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
      retour.innerHTML = 'Message prêt. Si WhatsApp ne s’ouvre pas, <a href="' + url + '" target="_blank" rel="noopener">touchez ici</a>.';
      window.open(url, '_blank', 'noopener');
    });
  }
})();

// Filtre des portables par usage
(function(){
  var chips = document.querySelectorAll('[data-usage]');
  chips.forEach(function(c){
    c.addEventListener('click', function(){
      var u = c.dataset.usage;
      var cartes = c.closest('.rayon').querySelectorAll('.machine[data-usages]');
      chips.forEach(function(x){ x.setAttribute('aria-pressed', String(x === c)); });
      cartes.forEach(function(m){ m.hidden = !(u === 'tout' || m.dataset.usages.split(' ').indexOf(u) > -1); });
    });
  });
})();

// Journée ThinkPad : calcul à l'heure de Bertoua (UTC+1, pas d'heure d'été)
(function(){
  var now = new Date(Date.now() + 3600 * 1000);   // heure de Bertoua lue en UTC
  var j = now.getUTCDay();                         // 0 = dimanche, 2 = mardi
  var estMardi = j === 2;
  var dans = (2 - j + 7) % 7;
  var prochain = new Date(now.getTime() + dans * 864e5);
  var mois = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  var dateLong = 'mardi ' + prochain.getUTCDate() + ' ' + mois[prochain.getUTCMonth()];
  var dateCourt = 'Mardi ' + prochain.getUTCDate() + ' ' + mois[prochain.getUTCMonth()] + ' →';
  document.querySelectorAll('[data-mardi-long]').forEach(function(el){
    el.textContent = estMardi ? 'C’est aujourd’hui ! Journée ThinkPad jusqu’à la fermeture.'
      : 'Prochaine Journée ThinkPad : ' + dateLong + (dans === 1 ? ' (demain)' : ' (dans ' + dans + ' jours)');
    if (estMardi) el.classList.add('aujourdhui');
  });
  document.querySelectorAll('[data-mardi-court]').forEach(function(el){
    el.textContent = estMardi ? 'C’est aujourd’hui ! →' : dateCourt;
  });
  if (estMardi) document.querySelectorAll('.bande-mardi').forEach(function(b){ b.classList.add('aujourdhui'); });
  var idx = (j + 6) % 7;                           // lundi = 0
  var c = document.querySelector('.jour[data-jour="' + idx + '"]');
  if (c) c.classList.add('aujourdhui');
})();

/* ---------- Interactions ---------- */
(function(){
  var reduit = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // En-tête compact + bouton WhatsApp flottant
  var entete = document.querySelector('.entete'), wa = document.querySelector('.wa-flottant');
  var surDefile = function(){
    var y = window.scrollY;
    if (entete) entete.classList.toggle('defile', y > 12);
    if (wa) wa.classList.toggle('visible', y > 420);
  };
  window.addEventListener('scroll', surDefile, {passive:true}); surDefile();

  // Apparition en cascade des cartes
  var SEL = '.machine, .cat, .fiche, .gamme, .heros .tuile, .rangee > div, .tp-vedette';
  window.cascade = function(liste){
    if (reduit) return;
    var i = 0;
    liste.forEach(function(el){
      el.classList.remove('cascade-attente','cascade-go'); void el.offsetWidth;
      el.style.setProperty('--d', (Math.min(i++, 8) * 70) + 'ms');
      el.classList.add('cascade-go');
    });
  };
  if (!reduit && 'IntersectionObserver' in window){
    var lot = [], minuterie = null;
    var io = new IntersectionObserver(function(entrees){
      entrees.forEach(function(e){ if (e.isIntersecting){ io.unobserve(e.target); lot.push(e.target); } });
      clearTimeout(minuterie);
      minuterie = setTimeout(function(){ window.cascade(lot); lot = []; }, 16);
    }, {rootMargin:'0px 0px -6% 0px'});
    document.querySelectorAll(SEL).forEach(function(el){
      var r = el.getBoundingClientRect();
      if (r.top > window.innerHeight) el.classList.add('cascade-attente');   // seulement sous la ligne de flottaison
      io.observe(el);
    });
  }

  // Les filtres relancent la cascade sur les cartes affichées
  document.addEventListener('click', function(e){
    var b = e.target.closest('[data-usage],[data-filtre]');
    if (!b) return;
    setTimeout(function(){
      var zone = b.hasAttribute('data-usage') ? b.closest('.rayon') : document;
      var vis = Array.prototype.filter.call(zone.querySelectorAll('.machine, .gamme, .fiche'), function(el){ return el.offsetParent !== null && el.getBoundingClientRect().top < window.innerHeight; });
      window.cascade(vis);
    }, 0);
  });

  // ---------- Visionneuse photo ----------
  var v = document.getElementById('visionneuse'); if (!v) return;
  var vImg = v.querySelector('img'), vTitre = v.querySelector('.v-titre'), vPrix = v.querySelector('.v-prix'),
      vWa = v.querySelector('.v-wa'), vCompte = v.querySelector('.v-compte'), retourFocus = null, groupe = [], pos = 0;

  function visibles(){ return Array.prototype.filter.call(document.querySelectorAll('img[data-zoom]'), function(i){ return i.offsetParent !== null; }); }
  function remplir(img){
    var carte = img.closest('.machine, .fiche');
    vImg.src = img.dataset.zoom; vImg.alt = img.alt;
    vTitre.textContent = img.dataset.titre;
    var p = carte && carte.querySelector('.prix-m'); vPrix.textContent = p ? p.textContent : '';
    var w = carte && carte.querySelector('a.btn[href*="wa.me"]');
    vWa.hidden = !w; if (w) vWa.href = w.href;
    vCompte.textContent = (pos + 1) + ' / ' + groupe.length + ' · glissez ou utilisez les flèches';
  }
  function ouvrir(img){
    groupe = visibles(); pos = groupe.indexOf(img); retourFocus = img;
    remplir(img); v.hidden = false; document.body.classList.add('verrou');
    requestAnimationFrame(function(){
      v.classList.add('ouverte');
      if (reduit || !vImg.animate) return;
      var a = img.getBoundingClientRect();
      var go = function(){
        var b = vImg.getBoundingClientRect(); if (!b.width) return;
        vImg.animate([{transform:'translate(' + (a.left - b.left) + 'px,' + (a.top - b.top) + 'px) scale(' + (a.width / b.width) + ',' + (a.height / b.height) + ')'},{transform:'none'}],
          {duration:340, easing:'cubic-bezier(.22,1,.36,1)'});
      };
      vImg.complete ? go() : vImg.addEventListener('load', go, {once:true});
    });
    v.querySelector('.v-fermer').focus({preventScroll:true});
  }
  function fermer(){
    v.classList.remove('ouverte'); document.body.classList.remove('verrou');
    setTimeout(function(){ v.hidden = true; vImg.removeAttribute('src'); }, reduit ? 0 : 200);
    if (retourFocus) retourFocus.focus({preventScroll:true});
  }
  function aller(d){
    if (groupe.length < 2) return;
    pos = (pos + d + groupe.length) % groupe.length; remplir(groupe[pos]);
    if (!reduit && vImg.animate) vImg.animate([{opacity:0, transform:'translateX(' + (d * 40) + 'px)'},{opacity:1, transform:'none'}], {duration:260, easing:'cubic-bezier(.22,1,.36,1)'});
  }
  document.addEventListener('click', function(e){
    var img = e.target.closest('img[data-zoom]');
    if (img){ e.preventDefault(); ouvrir(img); return; }
  });
  document.querySelectorAll('img[data-zoom]').forEach(function(i){
    i.tabIndex = 0; i.setAttribute('role','button');
    i.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); ouvrir(i); } });
  });
  v.querySelector('.v-fermer').addEventListener('click', fermer);
  v.querySelector('.v-prec').addEventListener('click', function(){ aller(-1); });
  v.querySelector('.v-suiv').addEventListener('click', function(){ aller(1); });
  v.addEventListener('click', function(e){ if (e.target === v) fermer(); });
  document.addEventListener('keydown', function(e){
    if (v.hidden) return;
    if (e.key === 'Escape') fermer(); else if (e.key === 'ArrowRight') aller(1); else if (e.key === 'ArrowLeft') aller(-1);
  });
  var x0 = null;
  v.addEventListener('pointerdown', function(e){ x0 = e.clientX; });
  v.addEventListener('pointerup', function(e){ if (x0 === null) return; var dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 50) aller(dx < 0 ? 1 : -1); });
})();
