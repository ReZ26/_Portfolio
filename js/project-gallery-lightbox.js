(function () {
  'use strict';

  const galleries = Array.from(document.querySelectorAll('.project-gallery'));
  if (galleries.length) {
    const slides = galleries.flatMap((gallery) =>
      Array.from(gallery.querySelectorAll('img')).map((img) => ({
        src: img.getAttribute('src') || '',
        alt: img.getAttribute('alt') || 'Project screenshot'
      }))
    ).filter((slide) => slide.src);

    if (slides.length) {
      const overlay = document.createElement('div');
      overlay.className = 'gallery-lightbox';
      overlay.setAttribute('aria-hidden', 'true');
      overlay.innerHTML = [
        '<button class="gallery-lightbox-btn close" type="button" aria-label="Close image viewer">&times;</button>',
        '<button class="gallery-lightbox-btn prev" type="button" aria-label="Previous image">&#10094;</button>',
        '<img class="gallery-lightbox-image" src="data:," alt="" loading="lazy" />',
        '<button class="gallery-lightbox-btn next" type="button" aria-label="Next image">&#10095;</button>',
        '<p class="gallery-lightbox-caption"></p>'
      ].join('');
      document.body.appendChild(overlay);

      const imageEl = overlay.querySelector('.gallery-lightbox-image');
      const captionEl = overlay.querySelector('.gallery-lightbox-caption');
      const prevBtn = overlay.querySelector('.gallery-lightbox-btn.prev');
      const nextBtn = overlay.querySelector('.gallery-lightbox-btn.next');
      const closeBtn = overlay.querySelector('.gallery-lightbox-btn.close');

      let activeIndex = 0;

      function renderSlide(index) {
        activeIndex = (index + slides.length) % slides.length;
        const active = slides[activeIndex];
        imageEl.src = active.src;
        imageEl.alt = active.alt;
        captionEl.textContent = active.alt;
      }

      function openViewer(index) {
        renderSlide(index);
        overlay.classList.add('open');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }

      function closeViewer() {
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }

      document.addEventListener('click', (event) => {
        const clickedImage = event.target.closest('.project-gallery img');
        if (!clickedImage) return;

        const clickedSrc = clickedImage.getAttribute('src');
        const clickedAlt = clickedImage.getAttribute('alt') || 'Project screenshot';
        const index = slides.findIndex((slide) => slide.src === clickedSrc && slide.alt === clickedAlt);
        openViewer(index >= 0 ? index : 0);
      }, { passive: true });

      prevBtn.addEventListener('click', function () {
        renderSlide(activeIndex - 1);
      }, { passive: true });

      nextBtn.addEventListener('click', function () {
        renderSlide(activeIndex + 1);
      }, { passive: true });

      closeBtn.addEventListener('click', closeViewer, { passive: true });

      overlay.addEventListener('click', function (event) {
        if (event.target === overlay) closeViewer();
      }, { passive: true });

      document.addEventListener('keydown', function (event) {
        if (!overlay.classList.contains('open')) return;
        if (event.key === 'Escape') closeViewer();
        if (event.key === 'ArrowLeft') renderSlide(activeIndex - 1);
        if (event.key === 'ArrowRight') renderSlide(activeIndex + 1);
      }, { passive: false });
    }
  }

  initProjectVideos();

  function initProjectVideos() {
    const placeholders = Array.from(document.querySelectorAll('.project-video-placeholder'));
    if (!placeholders.length) return;

    const videoConfig = getVideoConfig(window.location.pathname || '');
    const hasVideo = Boolean(videoConfig && videoConfig.url);

    placeholders.forEach((placeholder) => {
      placeholder.classList.add('project-video-window');
      placeholder.innerHTML = hasVideo
        ? [
            '<div class="project-video-window-inner">',
            '<p class="project-video-label">Gameplay Video</p>',
            `<p class="project-video-coming-soon">${escapeHtml(videoConfig.description || 'Watch the gameplay preview in the embedded player window.')}</p>`,
            `<button class="btn outline project-video-trigger" type="button" data-video-url="${escapeHtml(videoConfig.url)}" data-video-title="${escapeHtml(videoConfig.title || 'Gameplay Video')}">${escapeHtml(videoConfig.buttonText || 'Watch Gameplay Video')}</button>`,
            '</div>'
          ].join('')
        : [
            '<div class="project-video-window-inner">',
            '<p class="project-video-label">Gameplay Video</p>',
            '<p class="project-video-coming-soon">Gameplay video will be added soon.</p>',
            '<button class="btn outline project-video-trigger" type="button" disabled aria-disabled="true">Watch Gameplay Video</button>',
            '</div>'
          ].join('');
    });

    if (!hasVideo) return;

    const overlay = document.createElement('div');
    overlay.className = 'video-lightbox';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = [
      '<div class="video-lightbox-panel" role="dialog" aria-modal="true" aria-label="Gameplay video player">',
      '<button class="video-lightbox-btn close" type="button" aria-label="Close video viewer">&times;</button>',
      '<div class="video-lightbox-frame">',
      '<iframe class="video-lightbox-iframe" title="Gameplay video" src="about:blank" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe>',
      '</div>',
      '<p class="video-lightbox-caption"></p>',
      '</div>'
    ].join('');
    document.body.appendChild(overlay);

    const iframe = overlay.querySelector('.video-lightbox-iframe');
    const caption = overlay.querySelector('.video-lightbox-caption');
    const closeBtn = overlay.querySelector('.video-lightbox-btn.close');

    function openVideo(url, title) {
      iframe.src = toEmbedUrl(url);
      caption.textContent = title || 'Gameplay Video';
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeVideo() {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      iframe.src = 'about:blank';
      document.body.style.overflow = '';
    }

    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('.project-video-trigger[data-video-url]');
      if (!trigger || trigger.disabled || trigger.getAttribute('aria-disabled') === 'true') return;
      event.preventDefault();
      openVideo(trigger.getAttribute('data-video-url') || '', trigger.getAttribute('data-video-title') || 'Gameplay Video');
    });

    closeBtn.addEventListener('click', closeVideo);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) closeVideo();
    });

    document.addEventListener('keydown', (event) => {
      if (!overlay.classList.contains('open')) return;
      if (event.key === 'Escape') closeVideo();
    });
  }

  function getVideoConfig(pathname) {
    const normalized = normalizePath(pathname);

    if (normalized.endsWith('/projects/rewind/')) {
      return {
        url: 'https://youtu.be/pVjgrQKkfMY',
        title: 'Rewind Component System Gameplay',
        buttonText: 'Watch Gameplay Video',
        description: 'Watch the Rewind Component System gameplay preview in the embedded player window.'
      };
    }

    if (normalized.endsWith('/projects/lost-cure/')) {
      return {
        url: 'https://youtu.be/pio_Z0jXJao',
        title: 'The Lost Cure Gameplay',
        buttonText: 'Watch Gameplay Video',
        description: 'Watch The Lost Cure gameplay preview in the embedded player window.'
      };
    }


    return null;
  }

  function normalizePath(pathname) {
    const normalized = String(pathname || '').replace(/\\/g, '/');
    if (normalized.endsWith('/')) return normalized;
    return normalized.replace(/\/[^/]*$/, '/');
  }

  function toEmbedUrl(url) {
    try {
      const parsed = new URL(url, window.location.href);

      if (parsed.hostname.includes('youtu.be')) {
        const videoId = parsed.pathname.split('/').filter(Boolean)[0];
        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : url;
      }

      if (parsed.hostname.includes('youtube.com')) {
        if (parsed.pathname === '/watch') {
          const videoId = parsed.searchParams.get('v');
          return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : url;
        }

        if (parsed.pathname.startsWith('/embed/')) {
          const embedId = parsed.pathname.split('/').filter(Boolean)[1];
          return embedId ? `${parsed.origin}/embed/${embedId}?autoplay=1&rel=0` : url;
        }
      }

      return url;
    } catch (error) {
      return url;
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();




