(() => {
  const content = document.getElementById('content');
  if (!content) return;

  let lastHandledAt = 0;

  function textOf(el) {
    return (el?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function placeCaret(el) {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    el.focus();
  }

  function saveSoon(inputType = 'insertParagraph') {
    content.dispatchEvent(new InputEvent('input', { bubbles: true, inputType }));
  }

  function currentChecklistItem() {
    const sel = window.getSelection();
    if (!sel?.rangeCount) return null;
    const anchor = sel.anchorNode;
    const el = anchor?.nodeType === 1 ? anchor : anchor?.parentElement;
    const item = el?.closest?.('.checkitem');
    return item && content.contains(item) ? item : null;
  }

  function newChecklistItem(afterItem) {
    const item = document.createElement('div');
    item.className = 'checkitem';
    item.innerHTML = '<input type="checkbox"><span class="checktext" contenteditable="true"><br></span>';
    afterItem.after(item);
    placeCaret(item.querySelector('.checktext'));
    saveSoon();
  }

  function exitChecklist(item) {
    const p = document.createElement('p');
    p.innerHTML = '<br>';
    item.after(p);
    item.remove();
    placeCaret(p);
    saveSoon();
  }

  function handleChecklistReturn(e) {
    const item = currentChecklistItem();
    if (!item) return false;

    const now = performance.now();
    if (now - lastHandledAt < 40) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return true;
    }
    lastHandledAt = now;

    e.preventDefault();
    e.stopImmediatePropagation();

    const text = item.querySelector('.checktext');
    if (!textOf(text)) exitChecklist(item);
    else newChecklistItem(item);
    return true;
  }

  content.addEventListener('beforeinput', (e) => {
    if (e.inputType !== 'insertParagraph' && e.inputType !== 'insertLineBreak') return;
    handleChecklistReturn(e);
  }, true);

  content.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || e.shiftKey) return;
    handleChecklistReturn(e);
  }, true);
})();
