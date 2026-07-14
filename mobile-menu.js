(() => {
  'use strict';
  const app = document.getElementById('app') || document.querySelector('.app');
  if (!app) return;

  const style = document.createElement('style');
  style.textContent = `
    .mobile-nav-toggle,.mobile-nav-backdrop{display:none}
    @media(max-width:820px){
      .mobile-nav-toggle{display:grid;position:fixed;z-index:320;left:12px;top:max(12px,env(safe-area-inset-top));width:44px;height:44px;border:1px solid var(--line);border-radius:12px;background:color-mix(in srgb,var(--panel) 94%,transparent);color:var(--ink);place-items:center;box-shadow:0 8px 24px rgba(0,0,0,.22);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);cursor:pointer}
      .mobile-nav-toggle svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}
      .mobile-nav-toggle.is-open{left:174px;background:var(--panel)}
      .mobile-nav-backdrop{display:block;position:fixed;z-index:295;inset:0;background:rgba(8,10,16,.34);opacity:0;pointer-events:none;transition:.2s}
      .app.mobile-open~.mobile-nav-backdrop,.mobile-nav-backdrop.is-open{opacity:1;pointer-events:auto}
      .app.mobile-open .sidebar{display:block!important;z-index:310!important;transform:none!important;width:min(82vw,290px)!important;box-shadow:0 18px 60px rgba(0,0,0,.38)!important}
      body.axes-only .app.mobile-open .sidebar{display:block!important}
      body.axes-only .mobile-nav-toggle{display:grid!important}
      body.axes-only .floating-ui{right:10px;top:max(10px,env(safe-area-inset-top))}
      .sidebar .side-scroll{padding-top:18px!important}
    }
  `;
  document.head.appendChild(style);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'mobile-nav-toggle';
  button.setAttribute('aria-label','Otevřít menu');
  button.setAttribute('aria-expanded','false');
  button.innerHTML = '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';

  const backdrop = document.createElement('div');
  backdrop.className = 'mobile-nav-backdrop';
  document.body.append(button,backdrop);

  const close = () => {
    app.classList.remove('mobile-open');
    button.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    button.setAttribute('aria-expanded','false');
    button.setAttribute('aria-label','Otevřít menu');
    button.innerHTML = '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  };

  const open = () => {
    document.body.classList.remove('axes-only');
    app.classList.remove('sidebar-collapsed');
    app.classList.add('mobile-open');
    button.classList.add('is-open');
    backdrop.classList.add('is-open');
    button.setAttribute('aria-expanded','true');
    button.setAttribute('aria-label','Zavřít menu');
    button.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  };

  button.addEventListener('click',() => app.classList.contains('mobile-open') ? close() : open());
  backdrop.addEventListener('click',close);
  document.addEventListener('keydown',event => { if (event.key === 'Escape') close(); });
  document.querySelector('.sidebar')?.addEventListener('click',event => {
    if (event.target.closest('.filter') && window.matchMedia('(max-width:820px)').matches) setTimeout(close,80);
  });
})();