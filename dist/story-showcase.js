(() => {
  'use strict';
  if (window.__gtavStoryShowcase) return;
  window.__gtavStoryShowcase = true;
  if (document.body?.dataset.page !== 'home') return;

  const DISCORD = 'https://discord.gg/HgcbPjcyJ';
  const PARTS = {
    vice: [
      'assets/story-covers/vice.b64.1.txt',
      'assets/story-covers/vice.b64.2.txt',
      'assets/story-covers/vice.b64.3.txt'
    ],
    liberty: [
      'assets/story-covers/liberty.b64.1.txt',
      'assets/story-covers/liberty.b64.2.txt',
      'assets/story-covers/liberty.b64.3.txt'
    ]
  };

  const loadCover = async files => {
    const parts = await Promise.all(files.map(async file => {
      const response = await fetch(file, { cache: 'force-cache' });
      if (!response.ok) throw new Error(`Cover asset failed: ${file}`);
      return (await response.text()).trim();
    }));
    return `data:image/webp;base64,${parts.join('')}`;
  };

  const ensureStyle = () => {
    if (document.getElementById('story-showcase-style')) return;
    const style = document.createElement('style');
    style.id = 'story-showcase-style';
    style.textContent = `
      .story-showcase{
        --story-max:1420px;
        position:relative;
        z-index:2;
        overflow:hidden;
        isolation:isolate;
        color:#fff;
        background:
          radial-gradient(80% 70% at 50% -10%,rgba(255,255,255,.075),transparent 62%),
          linear-gradient(180deg,#080808 0%,#030303 48%,#080808 100%);
        padding:clamp(76px,9vw,142px) 0 clamp(92px,11vw,168px);
      }
      .story-showcase::before{
        content:"";
        position:absolute;
        inset:0 0 auto;
        height:1px;
        background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent);
        pointer-events:none;
      }
      .story-showcase-inner{width:min(var(--story-max),calc(100% - 64px));margin:0 auto}
      .story-showcase-head{
        display:flex;
        align-items:flex-end;
        justify-content:space-between;
        gap:32px;
        margin-bottom:clamp(34px,4vw,58px);
      }
      .story-showcase-kicker{
        display:block;
        margin:0 0 11px;
        font:700 11px/1 "DM Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        letter-spacing:.24em;
        text-transform:uppercase;
        color:rgba(255,255,255,.46);
      }
      .story-showcase-title{
        margin:0;
        font-family:"DM Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        font-size:clamp(36px,5.7vw,82px);
        font-weight:800;
        line-height:.94;
        letter-spacing:-.055em;
      }
      .story-showcase-note{
        max-width:330px;
        margin:0 0 5px;
        font:500 14px/1.55 "DM Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        color:rgba(255,255,255,.48);
      }
      .story-showcase-track{
        display:grid;
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:clamp(18px,2.1vw,34px);
      }
      .story-card{
        position:relative;
        min-width:0;
        overflow:hidden;
        border-radius:clamp(22px,2.4vw,36px);
        background:#131313;
        box-shadow:0 28px 80px rgba(0,0,0,.42);
        transform:translateZ(0);
      }
      .story-card-media{
        position:relative;
        width:100%;
        aspect-ratio:4/5;
        overflow:hidden;
        background:#151515;
      }
      .story-card img{
        display:block;
        width:100%;
        height:100%;
        object-fit:cover;
        transform:scale(1.003);
        transition:transform .9s cubic-bezier(.16,1,.3,1),filter .45s ease;
      }
      .story-card::after{
        content:"";
        position:absolute;
        inset:0;
        pointer-events:none;
        border:1px solid rgba(255,255,255,.11);
        border-radius:inherit;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.09);
      }
      .story-card-shade{
        position:absolute;
        inset:0;
        pointer-events:none;
        background:
          linear-gradient(180deg,transparent 54%,rgba(0,0,0,.12) 67%,rgba(0,0,0,.84) 100%),
          linear-gradient(90deg,rgba(0,0,0,.12),transparent 24%,transparent 76%,rgba(0,0,0,.12));
      }
      .story-card-ui{
        position:absolute;
        left:clamp(18px,2.2vw,32px);
        right:clamp(18px,2.2vw,32px);
        bottom:clamp(18px,2.2vw,30px);
        z-index:2;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:18px;
      }
      .story-card-label{
        min-width:0;
        font:800 clamp(15px,1.4vw,20px)/1.05 "DM Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        letter-spacing:-.025em;
        text-shadow:0 3px 18px rgba(0,0,0,.55);
      }
      .story-get{
        position:relative;
        isolation:isolate;
        flex:0 0 auto;
        min-width:92px;
        height:48px;
        padding:0 24px;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        border:1px solid rgba(255,255,255,.27);
        border-radius:999px;
        overflow:hidden;
        color:#fff!important;
        text-decoration:none!important;
        font:700 14px/1 "DM Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        letter-spacing:-.01em;
        background:linear-gradient(135deg,rgba(255,255,255,.20),rgba(255,255,255,.08));
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.28),
          inset 0 -1px 0 rgba(0,0,0,.12),
          0 12px 28px rgba(0,0,0,.30);
        backdrop-filter:blur(22px) saturate(1.45);
        -webkit-backdrop-filter:blur(22px) saturate(1.45);
        transition:transform .26s cubic-bezier(.16,1,.3,1),border-color .26s ease,background .26s ease,box-shadow .26s ease;
      }
      .story-get::before{
        content:"";
        position:absolute;
        inset:-1px;
        z-index:-1;
        background:linear-gradient(105deg,transparent 22%,rgba(255,255,255,.20) 46%,transparent 70%);
        transform:translateX(-125%);
        transition:transform .62s cubic-bezier(.16,1,.3,1);
      }
      .story-get:hover,.story-get:focus-visible{
        transform:translateY(-2px);
        border-color:rgba(255,255,255,.42);
        background:linear-gradient(135deg,rgba(255,255,255,.27),rgba(255,255,255,.11));
        box-shadow:inset 0 1px 0 rgba(255,255,255,.34),0 16px 36px rgba(0,0,0,.38);
      }
      .story-get:hover::before,.story-get:focus-visible::before{transform:translateX(125%)}
      .story-get:active{transform:scale(.97)}
      .story-card:hover img{transform:scale(1.035)}
      .story-dots{display:none}
      @keyframes storyShimmer{to{background-position:-220% 0}}
      @media(max-width:760px){
        .story-showcase{padding:72px 0 94px}
        .story-showcase-inner{width:100%}
        .story-showcase-head{
          width:calc(100% - 38px);
          margin:0 auto 28px;
          align-items:flex-start;
          flex-direction:column;
          gap:12px;
        }
        .story-showcase-title{font-size:clamp(38px,12vw,58px)}
        .story-showcase-note{font-size:13px;max-width:290px}
        .story-showcase-track{
          display:flex;
          gap:14px;
          overflow-x:auto;
          overscroll-behavior-x:contain;
          scroll-snap-type:x mandatory;
          scroll-padding-inline:19px;
          padding:2px 19px 24px;
          scrollbar-width:none;
          -webkit-overflow-scrolling:touch;
        }
        .story-showcase-track::-webkit-scrollbar{display:none}
        .story-card{
          flex:0 0 min(82vw,390px);
          scroll-snap-align:center;
          border-radius:24px;
          transform:scale(.955);
          opacity:.67;
          transition:transform .45s cubic-bezier(.16,1,.3,1),opacity .35s ease;
        }
        .story-card.is-active{transform:scale(1);opacity:1}
        .story-card-ui{left:16px;right:16px;bottom:16px}
        .story-card-label{font-size:15px}
        .story-get{min-width:80px;height:44px;padding:0 20px;font-size:13px}
        .story-dots{
          display:flex;
          justify-content:center;
          gap:7px;
          margin-top:4px;
        }
        .story-dot{
          width:6px;
          height:6px;
          padding:0;
          border:0;
          border-radius:999px;
          background:rgba(255,255,255,.27);
          transition:width .3s cubic-bezier(.16,1,.3,1),background .3s ease;
        }
        .story-dot.is-active{width:22px;background:rgba(255,255,255,.88)}
      }
      @media(prefers-reduced-motion:reduce){
        .story-card,.story-card img,.story-get,.story-get::before,.story-dot{transition:none!important}
      }
    `;
    document.head.append(style);
  };

  const markup = covers => `
    <div class="story-showcase-inner">
      <div class="story-showcase-head">
        <div>
          <span class="story-showcase-kicker">THE STORIES</span>
          <h2 class="story-showcase-title">Explore the classics.</h2>
        </div>
        <p class="story-showcase-note">Two iconic stories. One place to connect with the community.</p>
      </div>
      <div class="story-showcase-track" role="region" aria-roledescription="carousel" aria-label="Grand Theft Auto Stories">
        <article class="story-card is-active" data-story-index="0">
          <div class="story-card-media">
            <img src="${covers.vice}" alt="Grand Theft Auto Vice City Stories cover" width="420" height="536" decoding="async">
          </div>
          <div class="story-card-shade"></div>
          <div class="story-card-ui">
            <span class="story-card-label">VICE CITY STORIES</span>
            <a class="story-get discord-link" href="${DISCORD}" target="_blank" rel="noopener noreferrer" aria-label="Get Vice City Stories through Discord">Get</a>
          </div>
        </article>
        <article class="story-card" data-story-index="1">
          <div class="story-card-media">
            <img src="${covers.liberty}" alt="Grand Theft Auto Liberty City Stories cover" width="420" height="450" decoding="async">
          </div>
          <div class="story-card-shade"></div>
          <div class="story-card-ui">
            <span class="story-card-label">LIBERTY CITY STORIES</span>
            <a class="story-get discord-link" href="${DISCORD}" target="_blank" rel="noopener noreferrer" aria-label="Get Liberty City Stories through Discord">Get</a>
          </div>
        </article>
      </div>
      <div class="story-dots" aria-hidden="true"><span class="story-dot is-active"></span><span class="story-dot"></span></div>
    </div>`;

  const enhanceMobile = section => {
    const track = section.querySelector('.story-showcase-track');
    const cards = [...section.querySelectorAll('.story-card')];
    const dots = [...section.querySelectorAll('.story-dot')];
    if (!track || cards.length < 2) return;
    let frame = 0;
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const center = track.scrollLeft + track.clientWidth / 2;
        let active = 0;
        let distance = Infinity;
        cards.forEach((card, index) => {
          const cardCenter = card.offsetLeft + card.offsetWidth / 2;
          const nextDistance = Math.abs(cardCenter - center);
          if (nextDistance < distance) {
            distance = nextDistance;
            active = index;
          }
        });
        cards.forEach((card, index) => card.classList.toggle('is-active', index === active));
        dots.forEach((dot, index) => dot.classList.toggle('is-active', index === active));
      });
    };
    track.addEventListener('scroll', sync, { passive: true });
    addEventListener('resize', sync, { passive: true });
    sync();
  };

  const insertAfterIntro = section => {
    const intro = document.querySelector('.home-intro-v5,.home-intro-v4,.home-intro-v3,.home-intro-v2,.home-intro');
    if (!intro) return false;
    intro.insertAdjacentElement('afterend', section);
    return true;
  };

  const waitForPlacement = section => {
    if (insertAfterIntro(section)) return;
    const root = document.querySelector('main') || document.body;
    const observer = new MutationObserver(() => {
      if (!insertAfterIntro(section)) return;
      observer.disconnect();
    });
    observer.observe(root, { childList: true, subtree: false });
    setTimeout(() => {
      if (section.isConnected) return observer.disconnect();
      observer.disconnect();
      const hero = document.querySelector('.home-hero');
      if (hero) hero.before(section);
    }, 3000);
  };

  const init = async () => {
    ensureStyle();
    try {
      const [vice, liberty] = await Promise.all([
        loadCover(PARTS.vice),
        loadCover(PARTS.liberty)
      ]);
      if (document.querySelector('.story-showcase')) return;
      const section = document.createElement('section');
      section.className = 'story-showcase';
      section.setAttribute('aria-labelledby', 'story-showcase-title');
      section.innerHTML = markup({ vice, liberty });
      section.querySelector('.story-showcase-title')?.setAttribute('id', 'story-showcase-title');
      waitForPlacement(section);
      enhanceMobile(section);
    } catch (error) {
      console.warn('[story-showcase] Artwork could not be loaded.', error);
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
