// @ts-check
/**
 * Presentation mode: the tablet on the kitchen table.
 *
 * Owner 2026-09-07: "presentation mode on a tablet would be fucking fire" and
 * "so smart like Jarvis and easy to get done it can be presented on at the
 * home." Every piece already existed and was pointed at the contractor: the
 * preview overlay is captioned "how they'll see it", the options only appear
 * together on a document that has to be emailed first, and "Sign in person" is
 * a button he reaches past the client's shoulder to find.
 *
 * So this adds no document, no signing path and no record. It reuses the
 * proposal HTML, the option group and the in-person signature sheet, arranged
 * for a screen he hands across the table.
 *
 * What we verify:
 *  1. What counts as an offer is decided ONCE (_optionOffered), and the
 *     client's document reads the same function, so a draft price can never
 *     reach a client on one surface and not the other
 *  2. A group opens the chooser; a lone proposal goes straight to the document
 *  3. Nothing is badged until HE taps the star, and only one can carry it
 *  4. The document screen signs the option that is actually on screen
 *  5. One overlay, ever. Back does not stack a second one behind the first
 *  6. No horizontal bleed at 390px, and the signature sheet sits ON TOP
 */

const { test, expect, mockAllExternal, waitForAppBoot, assertNoErrors } = require('./helpers');

const PM_CLIENT = 88001;

test.describe('presentation mode', () => {
  let page;

  const seed = () => page.evaluate(cid => {
    clients = clients.filter(c => c.id !== cid).concat([{ id: cid, name: 'Vasquez', addr: '9 Present Ln', phone: '3165550009' }]);
    bids = bids.filter(b => ![88101, 88102, 88103].includes(b.id)).concat([
      { id: 88101, client_id: cid, client_name: 'Vasquez', type: 'Reroof, Option A', amount: 12400, status: 'Pending', draft: false, optionGroup: 88101, optionLabel: 'A', proposalSentDate: '2026-09-05', signingToken: 'pm-tok-a', isFreeForm: true, byoItems: [{ id: 1, section: 'Work', label: 'Tear-off and reroof', qty: 1, unit: 'square', rate: 12400, price: 12400, on: true }] },
      { id: 88102, client_id: cid, client_name: 'Vasquez', type: 'Reroof with new decking, Option B', amount: 15900, status: 'Pending', draft: false, optionGroup: 88101, optionLabel: 'B', proposalSentDate: '2026-09-05', isFreeForm: true },
      { id: 88103, client_id: cid, client_name: 'Vasquez', type: 'Reroof, standing seam, Option C', amount: 28750, status: 'Draft', draft: true, optionGroup: 88101, optionLabel: 'C', isFreeForm: true }
    ]);
    bids.forEach(b => { if ([88101, 88102, 88103].includes(b.id)) delete b.optionRecommended; });
  }, PM_CLIENT);

  // Put the editor on Option B with real work on it, the state the contractor
  // is in when he turns the screen around.
  const openB = () => page.evaluate(() => {
    _presentClose();
    document.getElementById('_gei-ip-ov')?.remove();
    _geiEditBidId = 88102; _geiClientId = 88001; _geiIsFreeForm = true; _geiIsTM = false;
    _byoItems = [_byoNormItem({ id: 1, section: 'Work', label: 'Tear-off and reroof', qty: 32, unit: 'square', rate: 420, notes: 'Strip to deck, ice and water at the eaves', on: true })];
    _geiScopeChips = []; _geiExclusions = [];
    _byoUpdateRail();
  });

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, bypassCSP: true });
    page = await ctx.newPage();
    await mockAllExternal(page);
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await waitForAppBoot(page);
    await page.evaluate(() => {
      window.supaLoadFromCloud = async () => {};
      window.saveGenericEstimate = () => {};   // the editor's own save is not what is under test here
    });
  });
  test.afterAll(async () => { await page.context().close(); });

  // ── 1. One rule for what a client may be shown ─────────────────────────────

  test('_optionOffered: the open one always counts, a bare draft never does', async () => {
    await seed();
    const r = await page.evaluate(() => ({
      fromB: _optionOffered(bids.find(b => b.id === 88102)).map(x => x.optionLabel),
      fromC: _optionOffered(bids.find(b => b.id === 88103)).map(x => x.optionLabel),
      nul: _optionOffered(null).length,
      undef: _optionOffered(undefined).length,
      noGroup: _optionOffered({ id: 999, optionGroup: null }).length
    }));
    expect(r.fromB, 'C is a half-written draft: it has no price a client may see').toEqual(['A', 'B']);
    expect(r.fromC, 'except when C is the one he opened, then it is his own document').toEqual(['A', 'B', 'C']);
    expect(r.nul).toBe(0);
    expect(r.undef).toBe(0);
    expect(r.noGroup).toBe(0);
  });

  test('the client document and the tablet read the SAME function', async () => {
    const wired = await page.evaluate(() => {
      const src = String(sendGenericProposal);
      return { usesShared: src.includes('_optionOffered('), noLocalCopy: !/_sibs\.filter\(x=>x\.id===\(_thisBid/.test(src) };
    });
    expect(wired.usesShared).toBe(true);
    expect(wired.noLocalCopy, 'a second copy of the rule is how the two drift apart').toBe(true);
  });

  test('_presentList: a lone proposal presents itself, no open bid presents nothing', async () => {
    const r = await page.evaluate(() => {
      const keep = _geiEditBidId;
      _geiEditBidId = null;
      const none = _presentList().length;
      bids = bids.filter(b => b.id !== 88500).concat([{ id: 88500, client_id: 88001, client_name: 'Vasquez', type: 'Small repair', amount: 900, status: 'Draft', draft: true }]);
      _geiEditBidId = 88500;
      const lone = _presentList().map(x => x.id);
      _geiEditBidId = 88102;
      const group = _presentList().map(x => x.optionLabel);
      _geiEditBidId = keep;
      return { none, lone, group };
    });
    expect(r.none).toBe(0);
    expect(r.lone).toEqual([88500]);
    expect(r.group).toEqual(['A', 'B']);
  });

  // ── 2. What opens ──────────────────────────────────────────────────────────

  test('a group opens the chooser with every offered option priced, and no draft price', async () => {
    await seed(); await openB();
    const r = await page.evaluate(() => {
      _geiPresent();
      const ov = document.getElementById('_gei-present-ov');
      const html = ov ? ov.innerHTML : '';
      return {
        open: !!ov,
        cards: ov ? ov.querySelectorAll('[onclick^="_presentOpen("]').length : 0,
        hasA: html.includes('Option A'), hasB: html.includes('Option B'),
        hasC: html.includes('Option C'),
        priceA: html.includes('$12,400'),
        priceC: html.includes('$28,750'),
        chooseCopy: html.includes('Choose your option')
      };
    });
    expect(r.open).toBe(true);
    expect(r.cards, 'one card per offered option').toBe(2);
    expect(r.hasA && r.hasB).toBe(true);
    expect(r.hasC, 'the draft option is not an offer and is not on the tablet').toBe(false);
    expect(r.priceA).toBe(true);
    expect(r.priceC).toBe(false);
    expect(r.chooseCopy).toBe(true);
  });

  test('the open option shows its LIVE total, not the number last saved on the record', async () => {
    await seed(); await openB();
    const html = await page.evaluate(() => { _geiPresent(); return document.getElementById('_gei-present-ov').innerHTML; });
    expect(html, '32 squares at $420').toContain('$13,440');
    expect(html, 'the stale stored amount must not be what the client reads').not.toContain('$15,900');
  });

  test('a lone proposal skips the chooser and goes straight to the document', async () => {
    const r = await page.evaluate(async () => {
      _presentClose();
      _geiEditBidId = 88500; _geiClientId = 88001; _geiIsFreeForm = true; _geiIsTM = false;
      _byoItems = [_byoNormItem({ id: 1, section: 'Work', label: 'Patch flashing', qty: 1, unit: 'ea', rate: 900, on: true })];
      _geiScopeChips = []; _geiExclusions = [];
      _byoUpdateRail();
      await _geiPresent();
      const ov = document.getElementById('_gei-present-ov');
      return {
        open: !!ov,
        chooser: ov ? ov.innerHTML.includes('Choose your option') : null,
        sign: ov ? !!ov.querySelector('#present-sign') : null,
        back: ov ? !!ov.querySelector('#present-back') : null
      };
    });
    expect(r.open).toBe(true);
    expect(r.chooser, 'there is nothing to choose between').toBe(false);
    expect(r.sign).toBe(true);
    expect(r.back, 'no options behind it, so no Back that goes nowhere').toBe(false);
  });

  // ── 3. The recommendation is HIS, never ours ───────────────────────────────

  test('nothing is badged until he taps the star', async () => {
    await seed(); await openB();
    const r = await page.evaluate(() => {
      _geiPresent();
      return {
        badge: document.getElementById('_gei-present-ov').innerHTML.includes('Our recommendation'),
        rec: _presentRecId(_presentList()),
        recEmpty: _presentRecId([]),
        recNull: _presentRecId(null)
      };
    });
    expect(r.badge, 'auto-badging the middle price puts words in his mouth').toBe(false);
    expect(r.rec).toBe(null);
    expect(r.recEmpty).toBe(null);
    expect(r.recNull).toBe(null);
  });

  test('one star at a time: marking B clears A, tapping B again clears it', async () => {
    await seed(); await openB();
    const r = await page.evaluate(() => {
      _geiPresent();
      _presentSetRec(88101);
      const first = { a: !!bids.find(b => b.id === 88101).optionRecommended, b: !!bids.find(b => b.id === 88102).optionRecommended, badge: document.getElementById('_gei-present-ov').innerHTML.includes('Our recommendation') };
      _presentSetRec(88102);
      const moved = { a: !!bids.find(b => b.id === 88101).optionRecommended, b: !!bids.find(b => b.id === 88102).optionRecommended };
      _presentSetRec(88102);
      const off = { a: !!bids.find(b => b.id === 88101).optionRecommended, b: !!bids.find(b => b.id === 88102).optionRecommended, badge: document.getElementById('_gei-present-ov').innerHTML.includes('Our recommendation') };
      return { first, moved, off };
    });
    expect(r.first).toEqual({ a: true, b: false, badge: true });
    expect(r.moved, 'two recommendations is no recommendation').toEqual({ a: false, b: true });
    expect(r.off).toEqual({ a: false, b: false, badge: false });
  });

  test('the star survives on the record, so it is still his call next time', async () => {
    await seed(); await openB();
    const kept = await page.evaluate(() => {
      _geiPresent(); _presentSetRec(88101); _presentClose();
      _geiPresent();
      return document.getElementById('_gei-present-ov').innerHTML.includes('Our recommendation');
    });
    expect(kept).toBe(true);
  });

  // ── 4. The document, and signing the one on screen ─────────────────────────

  test('the document screen shows the real proposal and offers to sign it', async () => {
    await seed(); await openB();
    const r = await page.evaluate(async () => {
      _geiPresent();
      await _presentOpen(88102);
      const ov = document.getElementById('_gei-present-ov');
      return {
        editing: _geiEditBidId,
        sign: !!ov.querySelector('#present-sign'),
        back: !!ov.querySelector('#present-back'),
        doc: ov.innerHTML.includes('Tear-off and reroof'),
        total: ov.innerHTML.includes('$13,440.00'),
        chooser: ov.innerHTML.includes('Choose your option')
      };
    });
    expect(r.editing).toBe(88102);
    expect(r.sign).toBe(true);
    expect(r.back, 'there are options behind it').toBe(true);
    expect(r.doc).toBe(true);
    expect(r.total).toBe(true);
    expect(r.chooser, 'the chooser is replaced, not layered under').toBe(false);
  });

  test('opening a sibling really moves the editor onto it, so the signature belongs to it', async () => {
    await seed(); await openB();
    const editing = await page.evaluate(async () => { _geiPresent(); await _presentOpen(88101); return _geiEditBidId; });
    expect(editing, 'the whole point: sign what is on screen').toBe(88101);
  });

  test('an option that no longer exists says so instead of showing the wrong one', async () => {
    await seed(); await openB();
    const r = await page.evaluate(async () => {
      _geiPresent();
      const before = _geiEditBidId;
      await _presentOpen(999999);
      return { before, after: _geiEditBidId, stillChooser: document.getElementById('_gei-present-ov').innerHTML.includes('Choose your option') };
    });
    expect(r.after).toBe(r.before);
    expect(r.stillChooser).toBe(true);
  });

  test('the signature sheet opens ON TOP, so backing out lands on the proposal', async () => {
    await seed(); await openB();
    const r = await page.evaluate(async () => {
      _geiPresent(); await _presentOpen(88102);
      _presentSign();
      const ip = document.getElementById('_gei-ip-ov');
      const pv = document.getElementById('_gei-present-ov');
      return {
        ip: !!ip, pv: !!pv,
        ipZ: ip ? parseInt(getComputedStyle(ip).zIndex, 10) : 0,
        pvZ: pv ? parseInt(getComputedStyle(pv).zIndex, 10) : 0
      };
    });
    expect(r.ip).toBe(true);
    expect(r.pv, 'the presentation stays behind it, not the contractor\'s editor').toBe(true);
    expect(r.ipZ).toBeGreaterThan(r.pvZ);
  });

  // ── 5. One overlay, ever ───────────────────────────────────────────────────

  test('chooser to document and back never stacks a second overlay', async () => {
    await seed(); await openB();
    const n = await page.evaluate(async () => {
      _presentClose();
      _geiPresent(); await _presentOpen(88102); _geiPresent(); await _presentOpen(88102); _geiPresent();
      return document.querySelectorAll('#_gei-present-ov').length;
    });
    expect(n).toBe(1);
  });

  test('close removes it, and closing twice is not an error', async () => {
    const n = await page.evaluate(() => { _presentClose(); _presentClose(); return document.querySelectorAll('#_gei-present-ov').length; });
    expect(n).toBe(0);
  });

  test('presenting with nothing open says so and opens nothing', async () => {
    const r = await page.evaluate(() => {
      const keep = _geiEditBidId;
      _geiEditBidId = null;
      _geiPresent();
      const open = !!document.getElementById('_gei-present-ov');
      _geiEditBidId = keep;
      return open;
    });
    expect(r).toBe(false);
  });

  // ── 6. It has to survive a real screen ─────────────────────────────────────

  test('no horizontal bleed at 390px, cards stay inside the viewport', async () => {
    await seed(); await openB();
    const r = await page.evaluate(() => {
      _presentClose(); _geiPresent();
      const w = window.innerWidth;
      const cards = [...document.querySelectorAll('#_gei-present-ov [onclick^="_presentOpen("]')].map(el => el.getBoundingClientRect());
      return {
        bleed: document.documentElement.scrollWidth - w,
        overflow: cards.filter(r2 => r2.right > w + 1 || r2.left < -1).length,
        cards: cards.length
      };
    });
    expect(r.cards).toBe(2);
    expect(r.bleed).toBeLessThanOrEqual(1);
    expect(r.overflow).toBe(0);
  });

  test('the document screen scrolls the proposal, never the page sideways', async () => {
    await seed(); await openB();
    const bleed = await page.evaluate(async () => {
      _presentClose(); _geiPresent(); await _presentOpen(88102);
      return document.documentElement.scrollWidth - window.innerWidth;
    });
    expect(bleed).toBeLessThanOrEqual(1);
  });

  test('Present sits in the action stack on both estimate types', async () => {
    const r = await page.evaluate(() => {
      const wrap = document.createElement('div'); wrap.id = 'pmx-actions-wrap'; document.body.appendChild(wrap);
      _geiRenderActionButtons('pmx', {});
      const html = wrap.innerHTML;
      const cols = wrap.querySelector('div[style*="grid-template-columns"]')?.style.gridTemplateColumns;
      wrap.remove();
      return { present: html.includes('_geiPresent()'), sign: html.includes('_geiSignInPerson()'), send: html.includes('Send proposal'), cols };
    });
    expect(r.present).toBe(true);
    expect(r.sign, 'the existing signing path is untouched').toBe(true);
    expect(r.send).toBe(true);
    expect(r.cols, 'Present is full-width above Sign, it does not squeeze the small row').toBe('repeat(2, 1fr)');
  });

  test('naming and money helpers hold on junk input', async () => {
    const r = await page.evaluate(() => ({
      nul: _presentName(null),
      blank: _presentName({ type: '   ' }),
      lbl: _presentName({ optionLabel: 'C', type: 'Whatever' }),
      m0: _presentMoney(0), mNul: _presentMoney(null), mStr: _presentMoney('abc'), mNum: _presentMoney(13440.49)
    }));
    expect(r.nul).toBe('Proposal');
    expect(r.blank).toBe('Proposal');
    expect(r.lbl).toBe('Option C');
    expect(r.m0).toBe('$0');
    expect(r.mNul).toBe('$0');
    expect(r.mStr).toBe('$0');
    expect(r.mNum).toBe('$13,440');
  });

  test('no console errors', async () => {
    await page.evaluate(() => { _presentClose(); document.getElementById('_gei-ip-ov')?.remove(); });
    assertNoErrors(page);
  });
});
