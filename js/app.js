const config = window.INVITATION_CONFIG || {};
const invitation = config.invitation || {};
const characters = config.characters || [];

const $ = (selector) => document.querySelector(selector);
const loader = $("#loader");
const enterButton = $("#enter-button");
const audio = $("#audio");
const musicToggle = $("#music-toggle");
const characterImage = $("#character-image");
const countdown = $("#countdown");
const countdownStatus = $("#countdown-status");
let characterIndex = 0;
let countdownInterval = null;
let hasEntered = false;

function setText(selector, value) {
  const element = $(selector);
  if (element && value !== undefined && value !== null) element.textContent = value;
}

function populateInvitation() {
  document.title = `Invitación de ${invitation.name || "cumpleaños"}`;
  setText("#loader-title", invitation.name);
  setText("#guest-name", invitation.name);
  setText("#age-label", invitation.age ? `CUMPLE ${invitation.age} AÑOS` : "");
  setText("#invitation-message", invitation.message);
  setText("#event-date", invitation.dateLabel);
  setText("#event-time", invitation.timeLabel);
  setText("#event-venue", invitation.venue);
  setText("#event-address", invitation.address);
  setText("#dress-code", invitation.dressCode);

  const mapButton = $("#map-button");
  if (mapButton && invitation.mapUrl) mapButton.href = invitation.mapUrl;

  const whatsappButton = $("#whatsapp-button");
  if (whatsappButton && invitation.whatsappNumber) {
    whatsappButton.href = `https://wa.me/${invitation.whatsappNumber}?text=${encodeURIComponent(invitation.whatsappMessage || "")}`;
  }

  const instagramLink = $("#instagram-link");
  if (instagramLink && invitation.instagramUrl) instagramLink.href = invitation.instagramUrl;
}

function showCharacter(index) {
  if (!characterImage || !characters.length) return;

  const character = characters[index];
  characterImage.classList.remove("is-visible");

  window.setTimeout(() => {
    characterImage.src = character.src;
    characterImage.style.width = character.width;
    characterImage.style.bottom = character.bottom;
    characterImage.style.transform = `translate3d(${character.translateX}, 18px, 0) scale(1.03)`;

    requestAnimationFrame(() => {
      characterImage.style.transform = `translate3d(${character.translateX}, 0, 0) scale(1)`;
      characterImage.classList.add("is-visible");
    });
  }, 420);
}

function startCharacters() {
  if (!characters.length) return;

  showCharacter(characterIndex);
  if (characters.length > 1) {
    window.setInterval(() => {
      characterIndex = (characterIndex + 1) % characters.length;
      showCharacter(characterIndex);
    }, 6000);
  }
}

async function startAudio() {
  if (!audio) return;

  try {
    await audio.play();
  } catch (error) {
    // Algunos navegadores pueden bloquear el audio hasta una interacción explícita.
  }
  updateMusicButton();
}

function updateMusicButton() {
  if (!audio || !musicToggle) return;

  const playing = !audio.paused;
  musicToggle.classList.toggle("is-playing", playing);
  musicToggle.setAttribute("aria-label", playing ? "Pausar música" : "Reproducir música");
  musicToggle.innerHTML = `<span aria-hidden="true">${playing ? "♪" : "♫"}</span>`;
}

function enterInvitation() {
  if (hasEntered) return;

  hasEntered = true;
  document.body.classList.remove("is-locked");
  loader?.classList.add("is-leaving");
  if (musicToggle) musicToggle.hidden = false;
  startAudio();
  window.setTimeout(() => loader?.remove(), 500);
}

function toggleAudio() {
  if (!audio) return;
  if (audio.paused) startAudio();
  else audio.pause();
  updateMusicButton();
}

function setupRevealAnimations() {
  const elements = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -5% 0px" });

  elements.forEach((element) => observer.observe(element));
}

const pad = (value) => String(value).padStart(2, "0");

function setCountdownValues(days, hours, minutes, seconds) {
  setText("#countdown-days", pad(days));
  setText("#countdown-hours", pad(hours));
  setText("#countdown-minutes", pad(minutes));
  setText("#countdown-seconds", pad(seconds));
}

function finishCountdown(message, status = "") {
  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = null;

  if (countdown) countdown.innerHTML = `<p class="countdown__finished-message">${message}</p>`;
  if (countdownStatus) countdownStatus.textContent = status;
}

function updateCountdown() {
  if (!countdown || !countdownStatus) return;

  const start = new Date(invitation.eventDateTime).getTime();
  const end = new Date(invitation.eventEndDateTime).getTime();
  const now = Date.now();

  if (Number.isNaN(start) || Number.isNaN(end)) {
    countdownStatus.textContent = "Revisá la fecha configurada en js/config.js.";
    return;
  }

  if (now >= end) return finishCountdown("¡Gracias por compartir este día! ⭐");
  if (now >= start) return finishCountdown("¡Hoy es el gran día! 🍄", "La aventura ya empezó.");

  const totalSeconds = Math.max(0, Math.floor((start - now) / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  setCountdownValues(days, hours, minutes, seconds);
  countdownStatus.textContent = days === 1 ? "Falta solo 1 día." : `Faltan ${days} días para festejar juntos.`;
}

function startCountdown() {
  updateCountdown();
  if (!countdownInterval) countdownInterval = window.setInterval(updateCountdown, 1000);
}

function setupVisibilityAudio() {
  document.addEventListener("visibilitychange", () => {
    if (!hasEntered || !document.hidden || !audio) return;
    audio.pause();
    updateMusicButton();
  });
}

function init() {
  document.body.classList.add("is-locked");
  populateInvitation();
  startCharacters();
  startCountdown();
  setupRevealAnimations();
  setupVisibilityAudio();

  enterButton?.addEventListener("click", enterInvitation);
  musicToggle?.addEventListener("click", toggleAudio);
  audio?.addEventListener("play", updateMusicButton);
  audio?.addEventListener("pause", updateMusicButton);
}

document.addEventListener("DOMContentLoaded", init);
