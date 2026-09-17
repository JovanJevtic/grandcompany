// =====================================================================
// Photo credits page — lists author, licence and source for every
// open-licence photograph on the portal
// =====================================================================

'use strict';

initPage(() => {
  const rows = (typeof PHOTO_CREDITS === 'undefined' ? [] : PHOTO_CREDITS).map((c) => `
    <div class="grid gap-4 border-b border-ink/10 py-5 sm:grid-cols-[160px_1fr] lg:grid-cols-[200px_1fr_220px]">
      <div class="aspect-[4/3] overflow-hidden bg-well">
        <img src="${esc(c.file)}" alt="" loading="lazy" class="h-full w-full object-cover" />
      </div>
      <div>
        <p class="text-[16px] font-semibold">${esc(c.caption)}</p>
        <p class="mt-1 text-[14px] text-muted">${esc(c.title)}</p>
        <p class="mt-1 text-[13px] text-muted">Datoteka ${esc(c.file)}</p>
      </div>
      <div class="text-[14px] lg:text-right">
        <p>${esc(c.author)}</p>
        <p class="mt-1 text-muted">Licenca ${esc(c.license)}</p>
        ${c.url ? `<a href="${esc(c.url)}" target="_blank" rel="noopener" class="link-line mt-1 inline-block text-steel">Izvor, ${esc(c.source)}</a>` : `<p class="mt-1 text-muted">Izvor ${esc(c.source)}</p>`}
      </div>
    </div>`).join('');

  $('credits-list').innerHTML = rows
    ? `<div class="border-t border-ink/20">${rows}</div>`
    : '<p class="border-t border-ink/20 py-8 text-[16px] text-muted">Trenutno nema fotografija pod otvorenom licencom.</p>';
});
