// Contact Button Event Tracking
function trackContactClick(buttonType, location) {
  // ส่ง event เข้า GTM
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "contact_button_click",
    button_type: buttonType,
    location: location
  });
}

// Utility: Safe event binding
function bindClickById(id, handler) {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('click', handler);
  }
  return !!el;
}

// Mobile Navigation Toggle
function initMobileNav() {
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const body = document.body;

  function setExpanded(isExpanded) {
    if (!navToggle || !navMenu) return;
    navToggle.classList.toggle('active', isExpanded);
    navMenu.classList.toggle('active', isExpanded);
    navToggle.setAttribute('aria-expanded', String(isExpanded));
    body.style.overflow = isExpanded ? 'hidden' : '';
  }

  function toggleMenu() {
    if (!navToggle || !navMenu) return;
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    setExpanded(!expanded);
  }

  if (navToggle && navMenu) {
    // Click toggle
    navToggle.addEventListener('click', toggleMenu);

    // Keyboard: Enter/Space opens, Escape closes
    navToggle.addEventListener('keydown', (e) => {
      const key = e.key;
      if (key === 'Enter' || key === ' ') {
        e.preventDefault();
        toggleMenu();
      } else if (key === 'Escape') {
        setExpanded(false);
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      if (!expanded) return;
      const target = e.target;
      if (!navMenu.contains(target) && !navToggle.contains(target)) {
        setExpanded(false);
      }
    });

    // Close when clicking a nav link
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => setExpanded(false));
    });
  }
}

// Smooth scrolling for navigation links
function initSmoothScroll() {
  const navLinks = document.querySelectorAll('a[href^="#"]');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetSection = document.querySelector(targetId);
      if (!targetSection) return;
      e.preventDefault();

      const offsetTop = Math.max(0, targetSection.offsetTop - 80); // Account for fixed navbar
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    });
  });
}

// Intersection Observer for animations
function initScrollAnimations() {
  const elements = document.querySelectorAll('.step-card, .problem-item, .solution-item, .info-item, .terms-item');
  if (!elements.length) return;
  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => {
      el.classList.add('visible');
    });
    return;
  }

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  elements.forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
  });
}

// Initialize contact button bindings safely
function initContactButtons() {
  bindClickById('lineBtn', () => trackContactClick('line', 'hero'));
  bindClickById('messengerBtn', () => trackContactClick('messenger', 'hero'));
  bindClickById('phoneBtn', () => trackContactClick('phone', 'hero'));

  bindClickById('articleLineBtn', () => trackContactClick('line', 'article'));
  bindClickById('articleMessengerBtn', () => trackContactClick('messenger', 'article'));
  bindClickById('articlePhoneBtn', () => trackContactClick('phone', 'article'));
}

function initActiveSection() {
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  if (!navLinks.length) return;

  const linkMap = Array.from(navLinks).map(link => {
    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return null;
    const section = document.querySelector(targetId);
    if (!section) return null;
    return { link, section };
  }).filter(Boolean);

  if (!linkMap.length) return;

  function updateActiveLink() {
    const scrollPosition = window.scrollY + 120;
    let current = linkMap[0];

    linkMap.forEach(item => {
      if (item.section.offsetTop <= scrollPosition) {
        current = item;
      }
    });

    linkMap.forEach(item => {
      if (item === current) {
        item.link.setAttribute('aria-current', 'page');
      } else {
        item.link.removeAttribute('aria-current');
      }
    });
  }

  updateActiveLink();
  window.addEventListener('scroll', updateActiveLink, { passive: true });
}

// Report Section Tabs
function initReportTabs() {
  const tabs = document.querySelectorAll('.report-tab');
  const contents = document.querySelectorAll('.report-tab-content');
  
  if (!tabs.length || !contents.length) return;
  
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const targetTab = this.getAttribute('data-tab');
      
      // Remove active class from all tabs and contents
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding content
      this.classList.add('active');
      const targetContent = document.querySelector(`[data-content="${targetTab}"]`);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });
}

// Image Modal (Lightbox)
function initImageModal() {
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  const captionText = document.getElementById('imageCaption');
  const closeBtn = document.querySelector('.image-modal-close');
  const reportImages = document.querySelectorAll('.report-img');
  
  if (!modal || !modalImg || !captionText) return;
  
  // Only add click event to images, not videos
  reportImages.forEach(img => {
    img.addEventListener('click', function() {
      modal.classList.add('active');
      modalImg.src = this.src;
      captionText.textContent = this.alt;
      document.body.style.overflow = 'hidden';
    });
  });
  
  // Close modal
  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  
  // Close on background click
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // Close on ESC key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initMobileNav();
  initSmoothScroll();
  initScrollAnimations();
  initContactButtons();
  initActiveSection();
  initReportTabs();
  initImageModal();
});

// Force Facebook widget to re-render
window.addEventListener('load', function() {
  if (typeof FB !== 'undefined') {
    FB.XFBML.parse();
  }
});

// Navbar scroll effect
window.addEventListener('scroll', function() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  if (window.scrollY > 100) {
    navbar.style.background = 'rgba(255, 255, 255, 0.98)';
    navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
  } else {
    navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    navbar.style.boxShadow = 'none';
  }
}, { passive: true });
