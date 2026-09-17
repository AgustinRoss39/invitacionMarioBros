const invitation = {
  name: "Samuel",
  age: 7,
  message:
    "¡Prepárate para una aventura increíble en el Reino Champiñón! ¿Listo para saltar, correr y celebrar mi cumple? ¡Te espero!",

  // Formato recomendado: AAAA-MM-DDTHH:mm:ss-03:00
  // Se dejó una fecha futura para que el modelo muestre la cuenta regresiva activa.
  eventDateTime: "2026-10-03T18:00:00-03:00",
  eventEndDateTime: "2026-10-03T21:00:00-03:00",
  dateLabel: "Sábado 3 de Octubre",
  timeLabel: "18:00 a 21:00 hs.",

  venue: "Salón de Fiestas Janos",
  address: "Gral. Pedro Díaz 1800, Hurlingham",
  mapUrl: "https://maps.app.goo.gl/LnZVf7kF9egGp7Lk8",

  extraMessage: "Si te copás, podés venir al cumple disfrazado 😁",

  whatsappNumber: "5491156223007",
  whatsappMessage:
    "¡Hola! Confirmo mi asistencia al cumpleaños de Samuel. 🍄⭐",

  instagramUrl: "https://www.instagram.com/rossdigitalstudio/",
  instagramHandle: "@rossdigitalstudio"
};

const characters = [
  { src: "img/2.png", width: "min(86vw, 395px)", bottom: "-3px", translateX: "-50%" },
  { src: "img/1.png", width: "min(88vw, 405px)", bottom: "-4px", translateX: "-50%" },
  { src: "img/3.png", width: "min(101vw, 470px)", bottom: "-4px", translateX: "-50%" },
  { src: "img/4.png", width: "min(100vw, 465px)", bottom: "-5px", translateX: "-50%" }
];

const $ = (selector) => document.querySelector(selector);

const loader = $("#loader");
const enterButton = $("#enter-button");
const audio = $("#audio");
const musicToggle = $("#music-toggle");
const characterImage = $("#character-image");
const countdown = $("#countdown");
const countdownStatus = $("#countdown-status");

let characterIndex = 0;
let characterInterval = null;
let countdownInterval = null;
let hasEntered = false;

function setText(selector, value) {
  const element = $(selector);
  if (element) element.textContent = value;
}

function populateInvitation() {
  document.title = `Invitación de ${invitation.name}`;

  setText("#loader-title", invitation.name);
  setText("#guest-name", invitation.name);
  setText("#age-label", `CUMPLE ${invitation.age} AÑOS`);
  setText("#invitation-message", invitation.message);
  setText("#event-date", invitation.dateLabel);
  setText("#event-time", invitation.timeLabel);
  setText("#event-venue", invitation.venue);
  setText("#event-address", invitation.address);
  setText("#extra-message", invitation.extraMessage);

  const portrait = $("#portrait");
  if (portrait) portrait.alt = `Foto de ${invitation.name}`;

  const mapButton = $("#map-button");
  if (mapButton) mapButton.href = invitation.mapUrl;

  const whatsappButton = $("#whatsapp-button");
  if (whatsappButton) {
    const whatsappText = encodeURIComponent(invitation.whatsappMessage);
    whatsappButton.href = `https://wa.me/${invitation.whatsappNumber}?text=${whatsappText}`;
  }

  const instagramLink = $("#instagram-link");
  if (instagramLink) {
    instagramLink.href = invitation.instagramUrl;
    instagramLink.textContent = invitation.instagramHandle;
  }
}

function applyCharacter(character, entering = false) {
  characterImage.style.width = character.width;
  characterImage.style.bottom = character.bottom;
  characterImage.style.left = "50%";
  characterImage.style.transform = entering
    ? `translate3d(${character.translateX}, 22px, 0) scale(1.035)`
    : `translate3d(${character.translateX}, 0, 0) scale(1)`;
}

function showCharacter(index) {
  const character = characters[index];
  characterImage.classList.remove("is-visible");

  window.setTimeout(() => {
    characterImage.src = character.src;
    applyCharacter(character, true);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        applyCharacter(character, false);
        characterImage.classList.add("is-visible");
      });
    });
  }, 420);
}

function startCharacters() {
  showCharacter(characterIndex);

  if (characters.length > 1) {
    characterInterval = window.setInterval(() => {
      characterIndex = (characterIndex + 1) % characters.length;
      showCharacter(characterIndex);
    }, 5600);
  }
}

async function startAudio() {
  try {
    await audio.play();
  } catch (error) {
    // Algunos navegadores pueden bloquear la reproducción automática.
  }

  updateMusicButton();
}

function updateMusicButton() {
  if (!musicToggle || !audio) return;

  const playing = !audio.paused;
  musicToggle.classList.toggle("is-playing", playing);
  musicToggle.setAttribute(
    "aria-label",
    playing ? "Pausar música" : "Reproducir música"
  );
  musicToggle.innerHTML = `<span class="music-toggle__icon" aria-hidden="true">${playing ? "♪" : "♫"}</span>`;
}

function enterInvitation() {
  if (hasEntered) return;

  hasEntered = true;
  document.body.classList.remove("is-locked");
  loader.classList.add("is-leaving");
  musicToggle.hidden = false;
  startAudio();

  window.setTimeout(() => {
    if (loader?.isConnected) loader.remove();
  }, 500);
}

function toggleAudio() {
  if (audio.paused) startAudio();
  else audio.pause();

  updateMusicButton();
}

function setupRevealAnimations() {
  const revealElements = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.13, rootMargin: "0px 0px -4% 0px" }
  );

  revealElements.forEach((element) => observer.observe(element));
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function setCountdownValues(days, hours, minutes, seconds) {
  setText("#countdown-days", pad(days));
  setText("#countdown-hours", pad(hours));
  setText("#countdown-minutes", pad(minutes));
  setText("#countdown-seconds", pad(seconds));
}

function showFinishedCountdown(message) {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }

  countdown.classList.add("is-finished");
  countdown.innerHTML = `<p class="countdown__finished-message">${message}</p>`;
}

function updateCountdown() {
  const start = new Date(invitation.eventDateTime).getTime();
  const end = new Date(invitation.eventEndDateTime).getTime();
  const now = Date.now();

  if (Number.isNaN(start) || Number.isNaN(end)) {
    countdownStatus.textContent = "Revisá la fecha configurada en card8fa7.js.";
    return;
  }

  if (now >= end) {
    showFinishedCountdown("¡Gracias por acompañarme! ⭐");
    countdownStatus.textContent = "";
    return;
  }

  if (now >= start) {
    showFinishedCountdown("¡Hoy es el gran día! 🍄");
    countdownStatus.textContent = "¡La aventura ya empezó!";
    return;
  }

  const distance = start - now;
  const totalSeconds = Math.max(0, Math.floor(distance / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  setCountdownValues(days, hours, minutes, seconds);

  if (days === 0) countdownStatus.textContent = "¡Ya falta menos de un día!";
  else if (days === 1) countdownStatus.textContent = "¡Falta solo 1 día!";
  else countdownStatus.textContent = `Faltan ${days} días para empezar la aventura.`;
}

function startCountdown() {
  updateCountdown();

  if (!countdownInterval && !countdown.classList.contains("is-finished")) {
    countdownInterval = window.setInterval(updateCountdown, 1000);
  }
}

function setupVisibilityAudio() {
  document.addEventListener("visibilitychange", () => {
    if (!hasEntered) return;

    if (document.hidden) {
      audio.pause();
      updateMusicButton();
    }
  });
}

function init() {
  document.body.classList.add("is-locked");

  populateInvitation();
  startCharacters();
  startCountdown();
  setupRevealAnimations();
  setupVisibilityAudio();

  enterButton.addEventListener("click", enterInvitation);
  musicToggle.addEventListener("click", toggleAudio);
  audio.addEventListener("play", updateMusicButton);
  audio.addEventListener("pause", updateMusicButton);
}

document.addEventListener("DOMContentLoaded", init);
