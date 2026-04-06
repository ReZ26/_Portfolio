﻿// ===== Typing Effect =====
const typedTextEl = document.querySelector('.typed-text');
const phrases = ['gameplay systems.', 'combat mechanics.', 'multiplayer experiences.', 'immersive worlds.'];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
  if (!typedTextEl) return;

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

  setTimeout(typeEffect, typeSpeed);
}

// ===== Data Load and Render =====
const BLOCKED_SKILLS = new Set([
  'gameplay programming',
  'optimization',
  'multiplayer networking'
]);

async function loadCV() {
  try {
    const res = await fetch('data/cv.json', { cache: 'no-store' });
    const cv = await res.json();

    const sanitizedSkills = (cv.skills || []).filter(
      (skill) => !BLOCKED_SKILLS.has(String(skill || '').trim().toLowerCase())
    );

    renderSkills(sanitizedSkills);
    renderExperience(cv.experience || []);

    const allProjects = cv.projects || [];
    const unrealProjects = allProjects.filter((p) => (p.engine || '').toLowerCase().includes('unreal'));
    const unityProjects = allProjects.filter((p) => (p.engine || '').toLowerCase().includes('unity'));

    renderProjects('unreal-projects-grid', unrealProjects, 'Unreal');
    renderProjects('unity-projects-grid', unityProjects, 'Unity');

    initInteractiveCards();
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
      const cardHref = hasDemo ? escapeHtml(p.demo) : '';

      return `
        <article class="project-card interactive-card ${hasDemo ? 'is-clickable' : ''}" data-engine="${escapeHtml(engine)}" ${hasDemo ? `data-href="${cardHref}" tabindex="0" role="link" aria-label="Open project ${escapeHtml(p.title || 'Untitled')}"` : ''}>
          <img class="project-thumb" src="${escapeHtml(imageSrc)}" alt="${escapeHtml(p.title || 'Project preview')}" loading="lazy" />
          <div class="project-meta">
            <span class="engine-badge"><img src="${engineIcon}" alt="" /> ${escapeHtml(engine || 'Game Dev')}</span>
            <span class="mission-badge">Mission ${String(index + 1).padStart(2, '0')}</span>
          </div>
          <h4>${escapeHtml(p.title || 'Untitled')}</h4>
          <p>${escapeHtml(p.description || '')}</p>
          <div class="project-links">
            ${hasDemo ? `<a href="${cardHref}" target="_blank" rel="noopener">Open</a>` : ''}
            ${hasSource ? `<a href="${escapeHtml(p.source)}" target="_blank" rel="noopener">Code</a>` : ''}
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

  const updateProgress = () => {
    const scrollTop = window.scrollY || window.pageYOffset || 0;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const maxScroll = Math.max(1, docHeight);
    const progress = Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100));
    progressFill.style.width = `${progress}%`;
    if (progressPercent) progressPercent.textContent = `${Math.round(progress)}%`;

    // Update zone label based on current scroll position
    let currentZone = sections[0].getAttribute('data-zone-name') || 'Mission Zone';
    
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.5) {
        currentZone = section.getAttribute('data-zone-name') || 'Mission Zone';
      }
    });
    
    zoneLabel.textContent = currentZone;
  };

  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);

  // Initial update
  updateProgress();
}

function initInteractiveCards() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cards = document.querySelectorAll('.interactive-card');
  cards.forEach((card) => {
    // Add click ripple effect only - no tilting
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
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const heroVisual = document.querySelector('.hero-visual');
  const engineIcons = document.querySelectorAll('.engine-corner');
  const progressHud = document.querySelector('.progress-hud');
  const skillItems = document.querySelectorAll('.skill-item');
  
  if (!heroVisual && !engineIcons.length) return;

  window.addEventListener(
    'scroll',
    () => {
      const scrollY = window.scrollY;
      const scrollVelocity = Math.min(scrollY * 0.02, 10);
      
      if (heroVisual) {
        const offset = Math.min(scrollY * 0.12, 40);
        const rotation = scrollY * 0.02;
        heroVisual.style.transform = `translateY(${offset}px) rotateZ(${rotation}deg)`;
      }

      // Parallax for engine icons with sine wave
      engineIcons.forEach((icon, index) => {
        const offset = scrollY * (0.05 + index * 0.02);
        const sway = Math.sin(scrollY * 0.01) * 5;
        icon.style.transform = `translateY(${offset + sway}px) rotate(${scrollY * 0.05}deg)`;
      });

      // Parallax for HUD with glow intensity
      if (progressHud) {
        const offset = scrollY * 0.03;
        const glowIntensity = 0.1 + (scrollVelocity / 10) * 0.5;
        progressHud.style.transform = `translateY(${offset}px)`;
        progressHud.style.filter = `drop-shadow(0 0 ${20 * glowIntensity}px rgba(0, 247, 255, ${glowIntensity}))`;
      }

      // Parallax for skill items with wave effect
      skillItems.forEach((item, index) => {
        const offset = scrollY * 0.01 * (index % 3 + 1);
        const wave = Math.sin((scrollY + index * 100) * 0.005) * 3;
        item.style.transform = `translateX(${offset + wave}px)`;
      });
    },
    { passive: true }
  );
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
});

// Clear any stale overlay when page is restored from cache/history.
window.addEventListener('pageshow', () => {
  const overlay = document.getElementById('loading-sequence');
  if (overlay) overlay.remove();
});
