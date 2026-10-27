(() => {
  'use strict';
  if (window.__franklinFundingLoaded) return;
  window.__franklinFundingLoaded = true;

  const norm = v => String(v || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const isFunding = q => /\b(free|paid|pay|paying|payment|price|cost|fee|charge|charged|donate|donates|donated|donating|donation|donations|crypto|wallet|erc20|ethereum|sol|solana|btc|bitcoin|ltc|litecoin|tip|tips|tipping|fund|funding|support developer|support project|support you)\b/.test(norm(q));
  const wantsWallet = q => /\b(donate|donates|donated|donating|donation|donations|crypto|wallet|erc20|ethereum|sol|solana|btc|bitcoin|ltc|litecoin|tip|tips|tipping|support developer|support project|support you)\b/.test(norm(q));

  function answer(q) {
    const base = "Nope — the GTA V iOS Project is completely free. You will NEVER be asked to pay for an update, to play the game, or to unlock project features. Donations are totally voluntary.";
    if (!wantsWallet(q)) return { text: base + " If you want to support the developer, you can do that voluntarily via crypto, but payment is never required.", topic: 'funding', suggestions: ['Show crypto donation addresses', 'Where can I join Discord?'] };
    return { text: base + "\n\nIf you want to support the developer voluntarily:\n\nERC20: 0x2df6a507b418637D465fA3402Aa05D2cdF1BDb91\nSOL: J6CtXd23tQakYhRxqu6Q31HY5RmwGwkKNPdvNarD8iqm\nBTC: bc1qk3a8jq6zr3yy6e3yg035c4lmel08l3g53nskut\nLTC: ltc1qcw0qwdqepwyqwzf8x5exdhzgpxtzmjva49ke8a\n\nThank you!", topic: 'funding', suggestions: ['Is donating required?', 'Where can I join Discord?'] };
  }

  window.FranklinFunding = { matches: isFunding, answer };
})();