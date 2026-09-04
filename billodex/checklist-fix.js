(() => {
  const content = document.getElementById('content');
  if (!content) return;

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

  function saveSoon() {
    content.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertParagraph' }));
  }

  function newChecklistItem(afterItem) {
    const item = document.createElement('div');
    item.className = 'checkitem';
    item.innerHTML = '<input type="checkbox"><span class="checktext" contenteditable="true"><br></span>';
    afterItem.after(item);
    const text = item.querySelector('.checktext');
    placeCaret(text);
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

  content.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || e.shiftKey) return;

    const sel = window.getSelection();
    if (!sel?.rangeCount) return;
    const anchor = sel.anchorNode;
    const el = anchor?.nodeType === 1 ? anchor : anchor?.parentElement;
    const item = el?.closest?.('.checkitem');
    if (!item || !content.contains(item)) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    const text = item.querySelector('.checktext');
    if (!textOf(text)) exitChecklist(item);
    else newChecklistItem(item);
  }, true);
})();
