﻿// ===== Performance Optimization =====
const requestAnimFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
let typeEffectTimeout = null;

// Reduce motion preference detection
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== Typing Effect =====
const typedTextEl = document.querySelector('.typed-text');
const phrases = ['combat systems.', 'multiplayer architectures.', 'responsive player mechanics.', 'scalable gameplay frameworks.'];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
  if (!typedTextEl) return;

  if (prefersReducedMotion) {
    typedTextEl.textContent = phrases[phraseIndex];
    return;
  }

  const currentPhrase = phrases[phraseIndex];

  if (isDeleting) {
    typedTextEl.textContent = currentPhrase.substring(0, charIndex - 1);
    charIndex--;
  } else {
    typedTextEl.textContent = currentPhrase.substring(0, charIndex + 1);
    charIndex++;
  }

  let typeSpeed = isDeleting ? 45 : 85;

  if (!isDeleting && charIndex === currentPhrase.length) {
    typeSpeed = 1500;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    typeSpeed = 340;
  }

  typeEffectTimeout = setTimeout(typeEffect, typeSpeed);
}

// ===== Data Load and Render =====
const BLOCKED_SKILLS = new Set([
  'gameplay programming',
  'optimization',
  'multiplayer networking'
]);

// Debounce helper for efficient rendering
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// Throttle helper for scroll events
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

async function loadCV() {
  try {
    const res = await fetch('data/cv.json', { 
      cache: 'force-cache',
      priority: 'high'
    });
    const cv = await res.json();

    const sanitizedSkills = (cv.skills || []).filter(
      (skill) => !BLOCKED_SKILLS.has(String(skill || '').trim().toLowerCase())
    );

    // Render in optimized chunks
    requestAnimFrame(() => renderSkills(sanitizedSkills));
    requestAnimFrame(() => renderExperience(cv.experience || []));

    const allProjects = cv.projects || [];
    const unrealProjects = allProjects.filter((p) => (p.engine || '').toLowerCase().includes('unreal'));
    const unityProjects = allProjects.filter((p) => (p.engine || '').toLowerCase().includes('unity'));

    requestAnimFrame(() => renderProjects('unreal-projects-grid', unrealProjects, 'Unreal'));
    requestAnimFrame(() => renderProjects('unity-projects-grid', unityProjects, 'Unity'));

    requestAnimFrame(() => initInteractiveCards());
  } catch (e) {
    console.error('Failed to load cv.json', e);
  }
}

function renderSkills(skills) {
  const container = document.getElementById('skills-list');
  if (!container) return;

  const codingLanguages = skills.filter((skill) => isCodingLanguage(skill));
  const softwareSkills = skills.filter((skill) => !isCodingLanguage(skill));

  const renderSkillCard = (skill) => {
    const iconPath = getSkillIconPath(skill);

    if (iconPath) {
      return `
        <div class="skill-item interactive-card">
          <img class="skill-icon" src="${iconPath}" alt="" loading="lazy" />
          <span>${escapeHtml(skill)}</span>
        </div>
      `;
    }

    return `
      <div class="skill-item no-icon interactive-card">
        <span>${escapeHtml(skill)}</span>
      </div>
    `;
  };

  const softwareSection = softwareSkills.length
    ? `<p class="skills-subtitle">Software</p>${softwareSkills.map(renderSkillCard).join('')}`
    : '';

  const codingSection = codingLanguages.length
    ? `<p class="skills-subtitle">Coding Languages</p>${codingLanguages.map(renderSkillCard).join('')}`
    : '';

  container.innerHTML = `${softwareSection}${codingSection}`;
}

function renderExperience(experience) {
  const container = document.getElementById('experience-list');
  if (!container) return;

  if (!experience.length) {
    container.innerHTML = '<p class="empty-state">Experience logs will be added soon.</p>';
    return;
  }

  container.innerHTML = experience
    .map(
      (item, index) => `
        <article class="experience-card interactive-card">
          <p class="experience-index">Mission ${String(index + 1).padStart(2, '0')}</p>
          <h4>${escapeHtml(item.title || 'Role')}</h4>
          <p class="experience-company">${escapeHtml(item.company || '')}${item.location ? ` - ${escapeHtml(item.location)}` : ''}</p>
          <p class="experience-dates">${escapeHtml(item.dates || '')}</p>
          <ul class="experience-points">
            ${(item.details || []).slice(0, 3).map((detail) => `<li>${escapeHtml(detail)}</li>`).join('')}
          </ul>
        </article>
      `
    )
    .join('');
}

function isCodingLanguage(skill) {
  const value = String(skill || '').toLowerCase();

  if (value.includes('unreal') || value.includes('unity')) return false;

  return value.includes('c++') || value.includes('c#') || value.includes('sql');
}

function getSkillIconPath(skill) {
  const value = String(skill || '').toLowerCase();

  if (value.includes('unity')) return 'assets/icons/unity.png';
  if (value.includes('unreal')) return 'assets/icons/unreal.png';
  if (value.includes('blender')) return 'assets/icons/blender.png';
  if (value.includes('figma') || value.includes('ui/ux') || value.includes('affinity')) return 'assets/icons/figma.png';
  if (value.includes('git')) return 'assets/icons/git.png';
  if (value.includes('sql')) return 'assets/icons/sql.png';
  if (value === 'c++' || value.includes(' c++')) return 'assets/icons/c%2B%2B.png';
  if (value === 'c#' || value.includes(' c#')) return 'assets/icons/c%23.png';
  return null;
}

function renderProjects(containerId, projects, fallbackEngine) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!projects.length) {
    container.innerHTML = '<p class="empty-state">Projects will be added soon.</p>';
    return;
  }

  container.innerHTML = projects
    .map((p, index) => {
      const engine = (p.engine || fallbackEngine || '').trim();
      const engineIcon = engine.toLowerCase().includes('unity')
        ? 'assets/icons/unity.png'
        : 'assets/icons/unreal.png';

      const imageSrc = p.image || 'assets/images/placeholder.png';
      const hasDemo = typeof p.demo === 'string' && p.demo.trim() !== '';
      const hasSource = typeof p.source === 'string' && p.source.trim() !== '';
      const hasDownload = typeof p.download === 'string' && p.download.trim() !== '';
      const cardHref = hasDemo ? escapeHtml(p.demo) : '';
      
      // Check if this is Slimey Jump or Surprise Sprint
      const isPlayableGame = p.title && (
        p.title.toLowerCase().includes('slimey jump') || 
        p.title.toLowerCase().includes('surprise sprint')
      );
      
      // Check if project is shipped
      const isShipped = p.shipped === true;

      return `
        <article class="project-card interactive-card ${hasDemo ? 'is-clickable' : ''}" data-engine="${escapeHtml(engine)}" ${hasDemo ? `data-href="${cardHref}" tabindex="0" role="link" aria-label="Open project ${escapeHtml(p.title || 'Untitled')}"` : ''}>
          <img class="project-thumb" src="${escapeHtml(imageSrc)}" alt="${escapeHtml(p.title || 'Project preview')}" loading="lazy" />
          ${isShipped ? '<div class="shipped-badge">Shipped</div>' : ''}
          <div class="project-meta">
            <span class="engine-badge"><img src="${engineIcon}" alt="" /> ${escapeHtml(engine || 'Game Dev')}</span>
            ${p.tech ? `<span class="tech-badge">${escapeHtml(p.tech)}</span>` : ''}
          </div>
          <h4>${escapeHtml(p.title || 'Untitled')}</h4>
          <p>${escapeHtml(p.description || '')}</p>
          <div class="project-links">
            ${hasDemo ? `<a href="${cardHref}" target="_blank" rel="noopener">Open</a>` : ''}
            ${hasSource ? `<a href="${escapeHtml(p.source)}" target="_blank" rel="noopener">Code</a>` : ''}
            ${isPlayableGame && hasDownload ? `<a href="${escapeHtml(p.download)}" target="_blank" rel="noopener">Play Game</a>` : ''}
            ${!isPlayableGame && hasDownload ? `<a href="${escapeHtml(p.download)}" target="_blank" rel="noopener">Download</a>` : ''}
          </div>
        </article>
      `;
    })
    .join('');

  attachProjectCardLinks(container);
}

function attachProjectCardLinks(container) {
  const cards = container.querySelectorAll('.project-card.is-clickable');

  cards.forEach((card) => {
    const href = card.getAttribute('data-href');
    if (!href) return;

    card.addEventListener('click', (event) => {
      if (event.target.closest('a')) return;
      window.location.href = href;
    });

    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        window.location.href = href;
      }
    });
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ===== Immersive Interaction =====
function initLoadingSequence() {
  const overlay = document.getElementById('loading-sequence');
  const fill = document.getElementById('loading-bar-fill');
  if (!overlay || !fill) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealDelay = reducedMotion ? 220 : 1150;

  // Kick off the bar fill on the next frame so CSS transitions can animate it.
  requestAnimationFrame(() => {
    fill.style.width = '100%';
  });

  const complete = () => {
    overlay.classList.add('is-complete');
    setTimeout(() => {
      if (overlay && overlay.parentNode) overlay.remove();
    }, 520);
  };

  setTimeout(complete, revealDelay);

  // Hard safety net in case transitions/events are interrupted.
  setTimeout(() => {
    if (overlay && overlay.parentNode) overlay.remove();
  }, 2500);
}

function initScrollAnimations() {
  const sections = document.querySelectorAll('.zone-section');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in', 'visible');
        }
      });
    },
    { threshold: 0.14 }
  );

  sections.forEach((section) => {
    section.classList.add('fade-in');
    observer.observe(section);
  });
}

function initZoneHUD() {
  const zoneLabel = document.getElementById('hud-zone-label');
  const progressFill = document.getElementById('hud-progress-fill');
  const progressPercent = document.getElementById('hud-progress-percent');
  const sections = Array.from(document.querySelectorAll('.zone-section'));
  if (!zoneLabel || !progressFill || !sections.length) return;

  const updateProgress = throttle(() => {
    const scrollTop = window.scrollY || window.pageYOffset || 0;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const maxScroll = Math.max(1, docHeight);
    const progress = Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100));
    progressFill.style.width = `${progress}%`;
    if (progressPercent) progressPercent.textContent = `${Math.round(progress)}%`;

    let currentZone = sections[0].getAttribute('data-zone-name') || 'Mission Zone';
    
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.5) {
        currentZone = section.getAttribute('data-zone-name') || 'Mission Zone';
      }
    });
    
    zoneLabel.textContent = currentZone;
  }, 100);

  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);

  updateProgress();
}

function initInteractiveCards() {
  if (prefersReducedMotion) return;

  const cards = document.querySelectorAll('.interactive-card');
  cards.forEach((card) => {
    card.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(0, 247, 255, 0.6), transparent);
        pointer-events: none;
        transform: scale(0);
        animation: rippleEffect 0.6s ease-out;
        z-index: 10;
      `;
      this.appendChild(ripple);
      
      setTimeout(() => ripple.remove(), 600);
    });
  });
}

function initParallax() {
  if (prefersReducedMotion) return;

  const heroVisual = document.querySelector('.hero-visual');
  const engineIcons = document.querySelectorAll('.engine-corner');
  const progressHud = document.querySelector('.progress-hud');
  
  if (!heroVisual && !engineIcons.length) return;

  const handleScroll = throttle(() => {
    const scrollY = window.scrollY;
    const scrollVelocity = Math.min(scrollY * 0.02, 10);
    
    if (heroVisual) {
      const offset = Math.min(scrollY * 0.08, 30);
      heroVisual.style.transform = `translateY(${offset}px)`;
    }

    engineIcons.forEach((icon, index) => {
      const offset = scrollY * (0.04 + index * 0.01);
      icon.style.transform = `translateY(${offset}px)`;
    });

    if (progressHud) {
      const offset = scrollY * 0.02;
      progressHud.style.transform = `translateY(${offset}px)`;
    }
  }, 50);

  window.addEventListener('scroll', handleScroll, { passive: true });
}

function initMissionCounters() {
  const counterEls = document.querySelectorAll('[data-counter]');
  if (!counterEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const target = Number(el.getAttribute('data-counter') || 0);
        const duration = 900;
        const start = performance.now();

        const step = (now) => {
          const progress = Math.min(1, (now - start) / duration);
          const value = Math.round(target * progress);
          el.textContent = `${value}`;
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            el.textContent = `${target}`;
          }
        };

        requestAnimationFrame(step);
        observer.unobserve(el);
      });
    },
    { threshold: 0.65 }
  );

  counterEls.forEach((el) => observer.observe(el));
}

// ===== Missing Functions =====
function setFooterYear() {
  const yearEl = document.querySelector('.footer-year');
  if (yearEl) {
    yearEl.textContent = `© ${new Date().getFullYear()} All Rights Reserved.`;
  }
}

function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  const projectTopbar = document.querySelector('.project-topbar');
  
  if (!header && !projectTopbar) return;

  window.addEventListener(
    'scroll',
    () => {
      if (window.scrollY > 50) {
        if (header) header.classList.add('scrolled');
        if (projectTopbar) projectTopbar.classList.add('scrolled');
      } else {
        if (header) header.classList.remove('scrolled');
        if (projectTopbar) projectTopbar.classList.remove('scrolled');
      }
    },
    { passive: true }
  );
}

function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const nav = document.getElementById('nav');
  if (!menuBtn || !nav) return;

  menuBtn.addEventListener('click', () => {
    nav.classList.toggle('mobile-open');
    menuBtn.classList.toggle('active');
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('mobile-open');
      menuBtn.classList.remove('active');
    });
  });
}

function initScrollSpy() {
  const navLinks = document.querySelectorAll('.nav a[href^="#"]');
  if (!navLinks.length) return;

  window.addEventListener(
    'scroll',
    () => {
      let currentSection = '';
      const scrollPos = window.scrollY + 100;

      document.querySelectorAll('.zone-section').forEach((section) => {
        if (section.offsetTop <= scrollPos) {
          currentSection = section.getAttribute('id') || '';
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
          link.classList.add('active');
        }
      });
    },
    { passive: true }
  );
}

// ===== Hero Image Switcher =====
function initHeroImageSwitcher() {
  const introArt = document.querySelector('.intro-art');
  if (!introArt) return;

  // Array of project screenshot paths
  const projectImages = [
    'assets/Screenshots/Realm Rivals/Screenshot 2026-04-05 165615.png',
    'assets/Screenshots/Legend of Indra vs Vritrasur/Indra1.png',
    'assets/Screenshots/Isles Of Echoes On Cybertrom/Screenshot 2026-04-05 191107.png',
    'assets/Screenshots/RealityRun/Engine Screenshot 2026.03.13 - 20.22.52.34.png',
    'assets/Screenshots/Rewind System/Screenshot 2026-04-06 102954.png',
    'assets/Screenshots/Prototype For RPG Game/Screenshot 2026-04-06 104430.png',
    'assets/Screenshots/The Lost Cure/Lost_Cure1.jpg',
    'assets/Screenshots/Word Dash/Screenshot 2026-04-05 215451.png',
    'assets/Screenshots/Paint Runner/Screenshot_20260405_161250_It\'s Me Pico.jpg.jpeg',
    'assets/Screenshots/Isles Of Echoes On Cybertrom/Screenshot 2026-04-05 191118.png',
    'assets/Screenshots/Isles Of Echoes On Cybertrom/Screenshot 2026-04-05 191129.png',
    'assets/Screenshots/Isles Of Echoes On Cybertrom/Screenshot 2026-04-05 191235.png',
    'assets/Screenshots/Bubble Trap/Screenshot 2025-01-25 033347.png',
    'assets/Screenshots/Bubble Trap/Screenshot 2025-01-25 033449.png',
    'assets/Screenshots/Bubble Trap/Screenshot 2025-01-25 033509.png',
    'assets/Screenshots/Bubble Trap/Screenshot 2025-01-25 033524.png',
    'assets/Screenshots/Legend of Indra vs Vritrasur/Indra2.png',
    'assets/Screenshots/Legend of Indra vs Vritrasur/Indra3.png',
    'assets/Screenshots/Legend of Indra vs Vritrasur/Indra4.png',
    'assets/Screenshots/Legend of Indra vs Vritrasur/Indra5.png',
    'assets/Screenshots/Paint Runner/Screenshot_20260405_161309_It\'s Me Pico.jpg.jpeg',
    'assets/Screenshots/Paint Runner/Screenshot_20260405_161345_It\'s Me Pico.jpg.jpeg',
    'assets/Screenshots/Paint Runner/Screenshot_20260405_161436_It\'s Me Pico.jpg.jpeg',
    'assets/Screenshots/Slimey Jump/Screenshot 2026-04-06 211023.png',
    'assets/Screenshots/Slimey Jump/Screenshot 2026-04-06 211038.png',
    'assets/Screenshots/Slimey Jump/Screenshot 2026-04-06 211051.png',
    'assets/Screenshots/Slimey Jump/Screenshot 2026-04-06 211118.png',
    'assets/Screenshots/Surprise Sprint/Screenshot 2025-01-22 204535.png',
    'assets/Screenshots/Surprise Sprint/Screenshot 2025-01-22 204651.png',
    'assets/Screenshots/Surprise Sprint/Screenshot 2025-01-22 204818.png',
    'assets/Screenshots/Surprise Sprint/Screenshot 2025-01-22 204825.png',
  ];

  let currentImageIndex = -1;
  let switchInterval;

  function getRandomImage() {
    const randomIndex = Math.floor(Math.random() * projectImages.length);
    // Avoid showing the same image consecutively
    while (randomIndex === currentImageIndex && projectImages.length > 1) {
      return getRandomImage();
    }
    currentImageIndex = randomIndex;
    return projectImages[randomIndex];
  }

  function switchImage() {
    // Switch to random project image with fade effect
    introArt.style.opacity = '0.7';
    introArt.style.transition = 'all 0.6s ease-in-out';
    const randomImage = getRandomImage();
    introArt.src = randomImage;
    setTimeout(() => {
      introArt.style.opacity = '1';
    }, 100);
  }

  // Start with a random project image after 2 second delay
  setTimeout(() => {
    switchImage();
    switchInterval = setInterval(switchImage, 4000);
  }, 2000);

  // Clear interval when user leaves the page
  window.addEventListener('beforeunload', () => {
    clearInterval(switchInterval);
  });

  // Pause on mouse hover, resume on mouse leave
  const heroSection = document.querySelector('.hero-visual');
  if (heroSection) {
    heroSection.addEventListener('mouseenter', () => {
      clearInterval(switchInterval);
    });

    heroSection.addEventListener('mouseleave', () => {
      switchInterval = setInterval(switchImage, 4000);
    });
  }
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
  initLoadingSequence();
  typeEffect();
  loadCV();
  initScrollAnimations();
  setFooterYear();
  initHeaderScroll();
  initMobileMenu();
  initScrollSpy();
  initZoneHUD();
  initParallax();
  initMissionCounters();
  initHeroImageSwitcher();
});

// Clear any stale overlay when page is restored from cache/history.
window.addEventListener('pageshow', () => {
  const overlay = document.getElementById('loading-sequence');
  if (overlay) overlay.remove();
});

