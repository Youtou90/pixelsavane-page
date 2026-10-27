/* PixelSavane™ : interactions du site (JavaScript sans framework). */
(function () {
  "use strict";

  var C = window.PS_CONFIG || {};
  var WA = C.whatsapp || "237695151026";
  var reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Liens WhatsApp avec message pré-rempli : <a data-wa="Bonjour…"> */
  document.querySelectorAll("[data-wa]").forEach(function (a) {
    a.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(a.getAttribute("data-wa"));
  });

  /* Liens réglés dans config.js : <a data-lien="facebook"> */
  document.querySelectorAll("[data-lien]").forEach(function (a) {
    var cle = a.getAttribute("data-lien");
    var url = C[cle];
    if (!url) return;
    a.href = url + (a.getAttribute("data-ancre") || "");
    if (/^(facebook|tiktok|youtube|linkedin|samuel)/.test(cle)) {
      a.target = "_blank";
      a.rel = "noopener";
      var lbl = a.getAttribute("aria-label");
      if (lbl) a.setAttribute("aria-label", lbl.replace(" (lien à venir)", ""));
    }
    a.querySelectorAll("[data-a-venir]").forEach(function (s) { s.remove(); });
  });
  /* Nom de Samuel Abena en lien, s'il a donné le sien */
  var lienSamuel = C.samuelYoutube || C.samuelFacebook;
  if (lienSamuel) {
    document.querySelectorAll("[data-samuel]").forEach(function (s) {
      var a = document.createElement("a");
      a.href = lienSamuel; a.target = "_blank"; a.rel = "noopener";
      a.textContent = s.textContent;
      s.replaceWith(a);
    });
  }
  if (C.facebook && C.tiktok && C.youtube) {
    document.querySelectorAll("[data-reseaux-note]").forEach(function (p) { p.hidden = true; });
  }

  /* Menu mobile */
  var btnMenu = document.querySelector("[data-menu]");
  var menu = document.getElementById("ps-menu");
  if (btnMenu && menu) {
    var icone = btnMenu.querySelector("path");
    var libelle = btnMenu.querySelector("span");
    var basculer = function (ouvrir) {
      menu.hidden = !ouvrir;
      btnMenu.setAttribute("aria-expanded", ouvrir ? "true" : "false");
      libelle.textContent = ouvrir ? "Fermer" : "Menu";
      icone.setAttribute("d", ouvrir ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16");
    };
    btnMenu.addEventListener("click", function () { basculer(menu.hidden); });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) basculer(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !menu.hidden) { basculer(false); btnMenu.focus(); }
    });
  }

  /* Apparitions au défilement : repli pour les navigateurs sans animation-timeline */
  if (!reduit && "IntersectionObserver" in window &&
      !(window.CSS && CSS.supports && CSS.supports("animation-timeline: view()"))) {
    document.documentElement.classList.add("no-vt");
    var io = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".ps-rv, .ps-grow").forEach(function (el) { io.observe(el); });
  }

  /* Conversation Telegram animée (agent Wata Fufu)
     Script volontairement raccourci, sans données personnelles : ne rien y ajouter. */
  var S = [
    { de: "agent", h: "20:00", l: [["Récapitulatif du 2026-10-23", 1], ["Aucune dépense enregistrée aujourd’hui.", 0], ["Mois en cours : 0 F dépensés sur un budget de 535 000 F.", 0], ["• Nutrition : reste 80 000 F", 0], ["• Transport : reste 60 000 F", 0], ["• Épargne : reste 150 000 F", 0]] },
    { de: "moi", h: "21:08", t: "Mes dépenses d’aujourd’hui\nTransport : 9550\nNutrition 2900\nFiche pour chargeur laptop 500\nBlouses pour enfants - divers\nRaclette - divers" },
    { de: "agent", h: "21:08", l: [["D’accord ! J’ai besoin de quelques précisions :", 0], ["1. Fiche chargeur laptop 500 F → Divers ✓", 0], ["2. Blouses pour enfants → quel montant ?", 0], ["3. Raclette → quel montant ?", 0]] },
    { de: "moi", h: "21:12", t: "Blouses 10000\nRaclette 2000\nTout ça c’est pour aujourd’hui 23" },
    { de: "agent", h: "21:13", l: [["Prêt à enregistrer · 23 octobre 2026", 1], ["- Transport : 9 550 F", 0], ["- Nutrition : 2 900 F", 0], ["- Divers : 500 F (fiche chargeur)", 0], ["- Divers : 10 000 F (blouses enfants)", 0], ["- Divers : 2 000 F (raclette)", 0], ["Total du jour : 24 950 F", 1], ["Dis-moi « ok » pour que j’enregistre tout ça !", 0]] },
    { de: "moi", h: "21:14", t: "OK" },
    { de: "agent", h: "21:14", l: [["Parfait ! J’ai bien enregistré toutes tes dépenses dans ton tableau ✓", 0], ["Total enregistré : 24 950 F", 1], ["Tout est à jour !", 0]] }
  ];
  var fr = function (s) {
    return s.replace(/ ([:;!?»])/g, " $1").replace(/« /g, "« ")
      .replace(/(\d) (\d{3})/g, "$1 $2").replace(/(\d) F\b/g, "$1 F");
  };

  function bulle(m) {
    var d = document.createElement("div");
    var h = document.createElement("span");
    h.className = "ps-b__h";
    if (m.de === "agent") {
      d.className = "ps-b ps-b--bot ps-pop";
      m.l.forEach(function (ln) {
        var e = document.createElement(ln[1] ? "b" : "div");
        e.textContent = fr(ln[0]);
        d.appendChild(e);
      });
      h.textContent = m.h;
    } else {
      d.className = "ps-b ps-b--moi ps-pop";
      d.textContent = fr(m.t);
      h.textContent = m.h + " ✓✓";
    }
    d.appendChild(h);
    return d;
  }

  document.querySelectorAll("[data-chat]").forEach(function (box) {
    var log = box.querySelector("[data-chat-log]");
    var date = log.firstElementChild;
    var saisie = box.querySelector("[data-chat-saisie]");
    var envoi = box.querySelector("[data-chat-envoi]");
    var statut = box.querySelector("[data-chat-statut]");
    var statutTxt = statut.lastElementChild;
    var rejouer = box.querySelector("[data-chat-rejouer]");
    var i = 0, t = null, tt = null, actif = false, points = null;

    var vider = function () {
      while (log.lastChild && log.lastChild !== date) log.removeChild(log.lastChild);
    };
    var brouillon = function (txt) {
      saisie.textContent = txt || "Message";
      saisie.classList.toggle("is-on", !!txt);
      envoi.classList.toggle("is-on", !!txt);
      if (txt) {
        var c = document.createElement("span");
        c.className = "ps-caret";
        saisie.appendChild(c);
      }
    };
    var ecrit = function (oui) {
      statut.classList.toggle("is-typing", oui);
      statutTxt.textContent = oui ? "en train d’écrire…" : "bot · en ligne";
      if (oui && !points) {
        points = document.createElement("div");
        points.className = "ps-b ps-b--bot ps-b--dots ps-pop";
        points.setAttribute("aria-label", "BusinessWaterFufu est en train d’écrire");
        points.innerHTML = '<span class="ps-dot"></span><span class="ps-dot" style="--d:.15s"></span><span class="ps-dot" style="--d:.3s"></span>';
        log.appendChild(points);
      } else if (!oui && points) {
        points.remove();
        points = null;
      }
    };
    var stop = function () { clearTimeout(t); clearTimeout(tt); };

    if (box.hasAttribute("data-statique") || reduit) {
      S.forEach(function (m) { log.appendChild(bulle(m)); });
      if (rejouer) rejouer.hidden = true;
      return;
    }

    var step = function () {
      if (i >= S.length) { t = setTimeout(start, 8000); return; }
      var m = S[i];
      if (m.de === "moi") {
        var txt = fr(m.t), k = 0;
        var tick = function () {
          k += 1;
          brouillon(txt.slice(0, k));
          if (k < txt.length) {
            var c = txt[k - 1];
            tt = setTimeout(tick, c === "\n" ? 260 : (c === " " ? 55 : 26 + Math.random() * 38));
          } else {
            t = setTimeout(function () {
              i += 1;
              brouillon("");
              envoi.classList.add("is-on", "is-sent");
              log.appendChild(bulle(m));
              t = setTimeout(function () { envoi.classList.remove("is-on", "is-sent"); step(); }, 420);
            }, 420);
          }
        };
        tt = setTimeout(tick, 350);
      } else {
        ecrit(true);
        t = setTimeout(function () {
          i += 1;
          ecrit(false);
          log.appendChild(bulle(m));
          t = setTimeout(step, 1200 + m.l.length * 260);
        }, Math.min(2300, 900 + m.l.length * 190));
      }
    };
    var start = function () {
      stop(); i = 0; vider(); ecrit(false); brouillon("");
      t = setTimeout(step, 600);
    };
    var demarre = false;
    rejouer.addEventListener("click", start);

    /* Démarre quand la fenêtre arrive à l'écran, se met en pause en dehors */
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entrees) {
        entrees.forEach(function (en) {
          if (en.isIntersecting && !actif) {
            actif = true;
            if (!demarre) { demarre = true; start(); }
            else { brouillon(""); ecrit(false); step(); }
          } else if (!en.isIntersecting && actif) {
            actif = false; stop(); brouillon(""); ecrit(false);
          }
        });
      }, { threshold: 0.25 }).observe(box);
    } else {
      start();
    }
  });

  /* Filtres de la page Réalisations */
  var filtres = document.querySelector("[data-filtres]");
  if (filtres) {
    var onglets = filtres.querySelectorAll("[data-filtre]");
    var familles = document.querySelectorAll("[data-famille]");
    var filtrer = function (cle) {
      onglets.forEach(function (b) {
        b.setAttribute("aria-selected", b.getAttribute("data-filtre") === cle ? "true" : "false");
      });
      familles.forEach(function (f) {
        var n = 0;
        f.querySelectorAll("[data-cat]").forEach(function (c) {
          var garde = cle === "tout" || c.getAttribute("data-cat") === cle;
          c.hidden = !garde;
          if (garde) {
            /* relance l'animation d'apparition, en cascade */
            c.classList.remove("ps-pop");
            void c.offsetWidth;
            c.style.setProperty("--d", (n * (c.classList.contains("ps-demo") ? 0.05 : 0.06)).toFixed(2) + "s");
            c.classList.add("ps-pop");
            n++;
          }
        });
        f.hidden = n === 0;
      });
    };
    onglets.forEach(function (b) {
      b.addEventListener("click", function () { filtrer(b.getAttribute("data-filtre")); });
    });
    /* Flèches gauche / droite entre les onglets */
    filtres.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var liste = Array.prototype.slice.call(onglets);
      var i = liste.indexOf(document.activeElement);
      if (i < 0) return;
      var j = (i + (e.key === "ArrowRight" ? 1 : -1) + liste.length) % liste.length;
      liste[j].focus();
      e.preventDefault();
    });
    document.querySelectorAll(".ps-demo").forEach(function (c, i) {
      c.style.setProperty("--d", (i * 0.05).toFixed(2) + "s");
    });
  }

  /* Formulaire Contact : compose le message WhatsApp, rien n'est envoyé à un serveur */
  var form = document.querySelector("[data-wa-form]");
  if (form) {
    var nom = form.querySelector("#nom");
    var activite = form.querySelector("#activite");
    var cases = form.querySelectorAll("input[type=checkbox]");
    var texte = form.querySelector("[data-apercu]");
    var envoyer = form.querySelector("[data-wa-envoyer]");
    var composer = function () {
      var choix = [];
      /* minuscule sur la première lettre seulement, pour garder « agent IA » */
      cases.forEach(function (c) { if (c.checked) choix.push(c.value.charAt(0).toLowerCase() + c.value.slice(1)); });
      var msg = [
        "Bonjour PixelSavane,",
        "Je m’appelle " + (nom.value.trim() || "[votre nom]") + ".",
        "Mon activité : " + (activite.value.trim() || "[votre activité]") + ".",
        "J’ai besoin de : " + (choix.length ? choix.join(", ") : "[à préciser]") + "."
      ].join("\n");
      texte.textContent = msg;
      envoyer.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg);
    };
    form.addEventListener("input", composer);
    form.addEventListener("change", composer);
    form.addEventListener("submit", function (e) { e.preventDefault(); envoyer.click(); });
    composer();
  }

  /* Page de vente : le mot qui tourne dans le titre */
  var rot = document.querySelector("[data-mots]");
  if (rot && !reduit) {
    var mots = rot.getAttribute("data-mots").split("|"), mi = 0;
    setInterval(function () {
      rot.classList.add("is-out");
      setTimeout(function () {
        mi = (mi + 1) % mots.length;
        rot.textContent = mots[mi];
        rot.classList.remove("is-out");
      }, 300);
    }, 2400);
  }

  /* Page de vente : onglets des tarifs (sans JS, toutes les formules restent visibles) */
  var tabs = document.querySelectorAll("[data-tab]");
  if (tabs.length) {
    var ouvrir = function (cle) {
      tabs.forEach(function (t) {
        var on = t.getAttribute("data-tab") === cle;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
    };
    tabs.forEach(function (t, n) {
      t.addEventListener("click", function () { ouvrir(t.getAttribute("data-tab")); });
      t.addEventListener("keydown", function (e) {
        var sens = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!sens) return;
        var autre = tabs[(n + sens + tabs.length) % tabs.length];
        autre.focus();
        ouvrir(autre.getAttribute("data-tab"));
        e.preventDefault();
      });
    });
    document.querySelectorAll("[data-onglet]").forEach(function (a) {
      a.addEventListener("click", function () { ouvrir(a.getAttribute("data-onglet")); });
    });
    ouvrir(tabs[0].getAttribute("data-tab"));
  }

  /* Page de vente : « Composez votre projet », le prix et le message se calculent seuls */
  var compo = document.querySelector("[data-composeur]");
  if (compo) {
    var milliers = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); };
    var tTotal = compo.querySelector("[data-total]");
    var tDes = compo.querySelector("[data-total-des]");
    var tMois = compo.querySelector("[data-total-mois]");
    var tEnvoi = compo.querySelector("[data-total-envoyer]");
    var affiche = 0;
    var animer = function (vers) {
      if (reduit) { tTotal.textContent = milliers(vers); affiche = vers; return; }
      var depart = affiche, t0 = null;
      var pas = function (t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / 450, 1);
        tTotal.textContent = milliers(Math.round(depart + (vers - depart) * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(pas); else affiche = vers;
      };
      requestAnimationFrame(pas);
    };
    var calculer = function () {
      var somme = 0, mois = 0, des = false, choix = [];
      compo.querySelectorAll("input:checked").forEach(function (i) {
        if (!i.value) return;
        somme += parseInt(i.getAttribute("data-prix"), 10);
        if (i.hasAttribute("data-mois")) mois += parseInt(i.getAttribute("data-mois"), 10);
        if (i.hasAttribute("data-des")) des = true;
        choix.push(i.value);
      });
      animer(somme);
      tDes.textContent = des ? "dès " : "";
      tMois.textContent = mois ? "+ " + milliers(mois) + " FCFA / mois" : "";
      var msg = choix.length
        ? "Bonjour PixelSavane, voici mon projet : " + choix.join(", ") + ". Estimation : " +
          (des ? "dès " : "") + milliers(somme) + " FCFA" + (mois ? " + " + milliers(mois) + " FCFA/mois" : "") +
          ". Mon activité :"
        : "Bonjour PixelSavane, j’ai un projet :";
      tEnvoi.setAttribute("aria-disabled", choix.length ? "false" : "true");
      tEnvoi.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg);
    };
    compo.addEventListener("change", calculer);
    calculer();
  }

  /* Visionneuse des démonstrations */
  var zoom = document.querySelector("[data-zoom]");
  if (zoom) {
    var demos = Array.prototype.slice.call(document.querySelectorAll(".ps-demo"));
    var zImg = zoom.querySelector("[data-zoom-img]");
    var zTitre = zoom.querySelector("[data-zoom-titre]");
    var zInfo = zoom.querySelector("[data-zoom-info]");
    var zFermer = zoom.querySelector("[data-zoom-fermer]");
    var zi = 0, ouvreur = null;

    var montrer = function (i) {
      zi = (i + demos.length) % demos.length;
      var b = demos[zi];
      var img = b.querySelector("img");
      zImg.src = img.currentSrc || img.getAttribute("src");
      zImg.alt = img.alt;
      zTitre.textContent = b.querySelector(".ps-h3").textContent;
      zInfo.textContent = b.querySelector(".ps-demo__txt .ps-sm").textContent + " · " + (zi + 1) + " / " + demos.length;
      zoom.setAttribute("aria-label", zTitre.textContent);
    };
    var fermer = function () {
      zoom.hidden = true;
      document.documentElement.style.overflow = "";
      if (ouvreur) ouvreur.focus();
    };
    demos.forEach(function (b, i) {
      b.addEventListener("click", function () {
        ouvreur = b;
        montrer(i);
        zoom.hidden = false;
        document.documentElement.style.overflow = "hidden";
        zFermer.focus();
      });
    });
    zFermer.addEventListener("click", fermer);
    zoom.querySelector("[data-zoom-prec]").addEventListener("click", function () { montrer(zi - 1); });
    zoom.querySelector("[data-zoom-suiv]").addEventListener("click", function () { montrer(zi + 1); });
    /* Clic sur le fond (hors image et boutons) */
    zoom.addEventListener("click", function (e) { if (e.target === zoom) fermer(); });
    document.addEventListener("keydown", function (e) {
      if (zoom.hidden) return;
      if (e.key === "Escape") fermer();
      else if (e.key === "ArrowLeft") montrer(zi - 1);
      else if (e.key === "ArrowRight") montrer(zi + 1);
      else if (e.key === "Tab") {
        /* Focus piégé dans la visionneuse */
        var f = zoom.querySelectorAll("button");
        var premier = f[0], dernier = f[f.length - 1];
        if (e.shiftKey && document.activeElement === premier) { dernier.focus(); e.preventDefault(); }
        else if (!e.shiftKey && document.activeElement === dernier) { premier.focus(); e.preventDefault(); }
      }
    });
  }
})();
