document.addEventListener('DOMContentLoaded', function() {
  // Elements
  
  const body = document.body;
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebarClose = document.getElementById('sidebarClose');
  const backdrop = document.querySelector('.backdrop');

  function isMobile() {
    return window.matchMedia('(max-width: 991.98px)').matches;
  }
  // Persist sidebar state
  const SIDEBAR_KEY = 'sidebar-collapsed';
  if (localStorage.getItem(SIDEBAR_KEY) === 'true') body.classList.add('sidebar-collapsed');

  function openSidebarMobile() {
    body.classList.add('sidebar-open');
    if (backdrop) backdrop.style.display = 'block';
  }
  function closeSidebarMobile() {
    body.classList.remove('sidebar-open');
    if (backdrop) backdrop.style.display = 'none';
  }

  // toggle (call from button handler)
  function toggleSidebar() {
    if (isMobile()) {
      if (body.classList.contains('sidebar-open')) closeSidebarMobile();
      else openSidebarMobile();
    } else {
      body.classList.toggle('sidebar-collapsed');
      localStorage.setItem('sidebar-collapsed', body.classList.contains('sidebar-collapsed'));
    }
  }

  // Toggle handlers
  sidebarToggle.addEventListener('click', function() {
    if (window.innerWidth <= 991) {
      openSidebarMobile();
      return;
    }
    body.classList.toggle('sidebar-collapsed');
    localStorage.setItem(SIDEBAR_KEY, body.classList.contains('sidebar-collapsed'));
  });
  sidebarClose?.addEventListener('click', closeSidebarMobile);
  backdrop.addEventListener('click', closeSidebarMobile);
  window.addEventListener('resize', function() {
    if (window.innerWidth > 991) closeSidebarMobile();
  });

  // Active menu tracking based on URL
  function activateMenuFromPath() {
    const links = document.querySelectorAll('.menu-link');
    const path = window.location.pathname;
    links.forEach(a => {
      const route = a.dataset.route || a.getAttribute('href');
      if (!route) return;
      // exact or startsWith for nested routes
      if (path === route || path.startsWith(route + '/')) {
        a.classList.add('active');
        // open parent collapse if any
        const collapse = a.closest('.collapse');
        if (collapse) new bootstrap.Collapse(collapse, {toggle:true});
      } else {
        a.classList.remove('active');
      }
    });
  }
  activateMenuFromPath();

  // restore desktop state on load/resize
  window.addEventListener('load', function() {
    if (!isMobile() && localStorage.getItem('sidebar-collapsed') === 'true') {
      body.classList.add('sidebar-collapsed');
    }
  });

  window.addEventListener('resize', function() {
    // when moving to desktop, ensure overlay is closed
    if (!isMobile()) {
      closeSidebarMobile();
      // restore collapsed state
      if (localStorage.getItem('sidebar-collapsed') === 'true') body.classList.add('sidebar-collapsed');
    } else {
      // on mobile, remove collapsed so overlay shows full labels
      body.classList.remove('sidebar-collapsed');
    }
  });
  // expose toggle to global so your button can call it
  window.AppSidebar = { toggle: toggleSidebar, open: openSidebarMobile, close: closeSidebarMobile };
});