// ===== Typing Effect =====
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

  let typeSpeed = isDeleting ? 48 : 92;

  if (!isDeleting && charIndex === currentPhrase.length) {
    typeSpeed = 1600;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    typeSpeed = 360;
  }

  setTimeout(typeEffect, typeSpeed);
}

// ===== Load CV Data =====
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

    const allProjects = cv.projects || [];
    const unrealProjects = allProjects.filter((p) => (p.engine || '').toLowerCase().includes('unreal'));
    const unityProjects = allProjects.filter((p) => (p.engine || '').toLowerCase().includes('unity'));

    renderProjects('unreal-projects-grid', unrealProjects, 'Unreal');
    renderProjects('unity-projects-grid', unityProjects, 'Unity');
  } catch (e) {
    console.error('Failed to load cv.json', e);
  }
}

// ===== Render Skills =====
function renderSkills(skills) {
  const container = document.getElementById('skills-list');
  if (!container) return;

  const codingLanguages = skills.filter((skill) => isCodingLanguage(skill));
  const softwareSkills = skills.filter((skill) => !isCodingLanguage(skill));

  const renderSkillCard = (skill) => {
    const iconPath = getSkillIconPath(skill);

    if (iconPath) {
      return `
        <div class="skill-item">
          <img class="skill-icon" src="${iconPath}" alt="" loading="lazy" />
          <span>${escapeHtml(skill)}</span>
        </div>
      `;
    }

    return `
      <div class="skill-item no-icon">
        <span>${escapeHtml(skill)}</span>
      </div>
    `;
  };

  const codingSection = codingLanguages.length
    ? `<p class="skills-subtitle">Coding Languages</p>${codingLanguages.map(renderSkillCard).join('')}`
    : '';

  const softwareSection = softwareSkills.length
    ? `<p class="skills-subtitle">Software</p>${softwareSkills.map(renderSkillCard).join('')}`
    : '';

  container.innerHTML = `${softwareSection}${codingSection}`;
}

function isCodingLanguage(skill) {
  const value = String(skill || '').toLowerCase();

  // Engine/tool entries that mention C++/C# should still stay in Software.
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

// ===== Render Projects =====
function renderProjects(containerId, projects, fallbackEngine) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!projects.length) {
    container.innerHTML = '<p class="empty-state">Projects will be added soon.</p>';
    return;
  }

  container.innerHTML = projects
    .map((p) => {
      const engine = (p.engine || fallbackEngine || '').trim();
      const engineIcon = engine.toLowerCase().includes('unity')
        ? 'assets/icons/unity.png'
        : engine.toLowerCase().includes('unreal')
          ? 'assets/icons/unreal.png'
          : 'assets/icons/unreal.png';

      const imageSrc = p.image || 'assets/images/placeholder.png';
      const hasDemo = typeof p.demo === 'string' && p.demo.trim() !== '';
      const hasSource = typeof p.source === 'string' && p.source.trim() !== '';
      const cardHref = hasDemo ? escapeHtml(p.demo) : '';

      return `
        <article class="project-card ${hasDemo ? 'is-clickable' : ''}" data-engine="${escapeHtml(engine)}" ${hasDemo ? `data-href="${cardHref}" tabindex="0" role="link" aria-label="Open project ${escapeHtml(p.title || 'Untitled')}"` : ''}>
          <img class="project-thumb" src="${escapeHtml(imageSrc)}" alt="${escapeHtml(p.title || 'Project preview')}" loading="lazy" />
          <div class="project-meta">
            <span class="engine-badge"><img src="${engineIcon}" alt="" /> ${escapeHtml(engine || 'Game Dev')}</span>
            <div class="project-links">
              ${hasDemo ? `<a href="${cardHref}" target="_blank" rel="noopener">Demo</a>` : ''}
              ${hasSource ? `<a href="${escapeHtml(p.source)}" target="_blank" rel="noopener">Code</a>` : ''}
            </div>
          </div>
          <h4>${escapeHtml(p.title || 'Untitled')}</h4>
          <p>${escapeHtml(p.description || '')}</p>
          <div class="tags">
            ${engine ? `<span class="tag">${escapeHtml(engine)}</span>` : ''}
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

// ===== Scroll Animations =====
function initScrollAnimations() {
  const sections = document.querySelectorAll('.section');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('fade-in', 'visible');
      });
    },
    { threshold: 0.14 }
  );

  sections.forEach((section) => {
    section.classList.add('fade-in');
    observer.observe(section);
  });
}

// ===== Footer Year =====
function setFooterYear() {
  const yearEl = document.querySelector('.footer-year');
  if (yearEl) yearEl.textContent = `© ${new Date().getFullYear()}`;
}

// ===== Mobile Menu Toggle =====
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const nav = document.getElementById('nav');
  if (!menuBtn || !nav) return;

  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('active');
    nav.classList.toggle('active');
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuBtn.classList.remove('active');
      nav.classList.remove('active');
    });
  });
}

// ===== Active Nav Link on Scroll =====
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav a[href^="#"]');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      });
    },
    { threshold: 0.35, rootMargin: '-80px 0px -40% 0px' }
  );

  sections.forEach((section) => observer.observe(section));
}

// ===== Header Scroll Effect =====
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 36) {
      header.style.boxShadow = '0 10px 30px rgba(2, 8, 20, 0.45)';
    } else {
      header.style.boxShadow = 'none';
    }
  });
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
  typeEffect();
  loadCV();
  initScrollAnimations();
  setFooterYear();
  initHeaderScroll();
  initMobileMenu();
  initScrollSpy();
});
