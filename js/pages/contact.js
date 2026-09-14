// =====================================================================
// Contact page — inquiry form (demo: nothing is sent)
// =====================================================================

'use strict';

initPage(() => {
  const topic = new URLSearchParams(location.search).get('tema');
  if (topic && $('cf-topic').querySelector(`option[value="${CSS.escape(topic)}"]`)) {
    $('cf-topic').value = topic;
  }

  $('contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('cf-name').value.trim();
    const phone = $('cf-phone').value.trim();
    $('contact-form').outerHTML = `
      <div class="self-start border border-espresso/15 bg-paper p-8 lg:col-span-7 lg:col-start-6" role="status">
        <p class="text-[15px] text-sage">Upit je zabilježen</p>
        <p class="mt-2 font-serif text-[38px] italic leading-tight">Hvala, ${esc(name)}.</p>
        <p class="mt-3 max-w-[56ch] text-[16px] leading-relaxed text-umber">Komercijalista vas kontaktira na ${esc(phone)}. U demo verziji poruka se ne šalje nikome.</p>
        <a href="katalog.html" class="${BTN_GHOST} mt-6 px-6 py-3">Pogledajte katalog</a>
      </div>`;
  });
});
