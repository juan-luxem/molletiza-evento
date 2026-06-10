import { createSignal, For, Show } from 'solid-js';

type Mollete = {
  emoji: string;
  tag: string;
  name: string;
  images: string[];
  ingredients: readonly string[];
  description: string;
};

const MOLLETES: Mollete[] = [
  {
    emoji: '🫓',
    tag: 'El original',
    name: 'El Clásico',
    images: ['/pico-gallo.png'],
    ingredients: ['Frijoles refritos', 'Queso fundido', 'Pico de gallo'],
    description:
      'La combinación de toda la vida. Frijoles cremosos bien sazonados, una capa generosa de queso manchego derretido y el golpe fresco del pico de gallo casero. Imposible no pedir dos.',
  },
  {
    emoji: '🌶️',
    tag: 'Con sabor',
    name: 'El de Chorizo',
    images: ['/chorizo.png'],
    ingredients: ['Frijoles refritos', 'Queso fundido', 'Chorizo crujiente'],
    description:
      'El chorizo bien doradito le da un crujido y un sabor ahumado que se combina perfecto con el queso fundido. Garantizado que mancha la camisa y que no deja ni las migajas.',
  },
  {
    emoji: '🍖',
    tag: 'El favorito',
    name: 'El de Longaniza',
    images: ['/longaniza.png'],
    ingredients: ['Frijoles refritos', 'Queso fundido', 'Longaniza frita'],
    description:
      'La longaniza bien doradita trae ese sabor especiado que nadie puede resistir. Con el queso derretido encima y los frijoles de base, es una combinación que deja sin palabras.',
  },
  {
    emoji: '🥩',
    tag: 'El suave',
    name: 'El de Jamón',
    images: ['/jamon.png'],
    ingredients: ['Frijoles refritos', 'Queso fundido', 'Jamón gratinado'],
    description:
      'Para los que prefieren algo más suave pero igual de sabroso. El jamón se gratina con el queso y los frijoles para crear un clásico reconfortante que nunca, nunca falla.',
  },
  {
    emoji: '🍕',
    tag: 'La fusión',
    name: 'El Pizza-Mollete',
    images: ['/pizza-mollete.png'],
    ingredients: ['Queso fundido', 'Pepperoni tostado'],
    description:
      'El experimento que se convirtió en tradición. Sin frijoles — la superficie entera cubierta de queso derretido y pepperoni crujiente del horno. Polémica garantizada, adicción también.',
  },
];

const MATEMATICAS = [
  {
    emoji: '🍞',
    item: 'Bolillos',
    total: '50–54 piezas',
    porPersona: '2 bolillos (4 mitades)',
    nota: '27 personas × 2 = 54 bolillos. Pedimos un poco más por si alguien repite.',
  },
  {
    emoji: '🫘',
    item: 'Frijoles refritos',
    total: '3 kg',
    porPersona: '~115 g por persona',
    nota: '≈ 29 g por mitad de bolillo. Cremosos, bien sazonados, la base de todo.',
  },
  {
    emoji: '🧀',
    item: 'Queso para fundir',
    total: '3 kg',
    porPersona: '~115 g por persona',
    nota: 'Manchego, Gouda o mezcla. ~29 g por mitad para que quede bien cubierto.',
  },
  {
    emoji: '🥩',
    item: 'Proteínas (4 tipos)',
    total: '2.5 kg total',
    porPersona: 'Variedad para elegir',
    nota: '750 g chorizo · 750 g longaniza · 500 g jamón · 500 g pepperoni.',
  },
  {
    emoji: '🍅',
    item: 'Salsas y pico',
    total: '2 L + 2 tuppers',
    porPersona: '~75 ml salsa',
    nota: '2 L de salsa (roja o verde) + 2 tuppers generosos de pico de gallo fresco.',
  },
] as const;

export default function MenuPreview() {
  const [selected, setSelected] = createSignal<Mollete | null>(null);
  const [imgIdx, setImgIdx] = createSignal(0);
  const [imgError, setImgError] = createSignal(false);

  let dialogRef!: HTMLDialogElement;

  function open(m: Mollete) {
    setSelected(m);
    setImgIdx(0);
    setImgError(false);
    dialogRef.showModal();
  }

  function close() {
    dialogRef.close();
  }

  function prev() {
    const m = selected();
    if (!m) return;
    setImgError(false);
    setImgIdx((i) => (i - 1 + m.images.length) % m.images.length);
  }

  function next() {
    const m = selected();
    if (!m) return;
    setImgError(false);
    setImgIdx((i) => (i + 1) % m.images.length);
  }

  return (
    <div class="space-y-12">

      {/* ── Dialog nativo ── */}
      <dialog
        ref={dialogRef!}
        onClose={() => setSelected(null)}
        onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        class="m-auto rounded-3xl p-0 w-full max-w-lg border-0 shadow-2xl
               backdrop:bg-stone-900/60 backdrop:backdrop-blur-sm
               open:flex open:flex-col"
      >
        <Show when={selected()}>
          {(m) => (
            <>
              {/* Imagen */}
              <div class="relative bg-amber-100 aspect-video overflow-hidden shrink-0">
                <Show
                  when={!imgError()}
                  fallback={
                    <div class="w-full h-full flex items-center justify-center">
                      <span class="text-7xl opacity-40">{m().emoji}</span>
                    </div>
                  }
                >
                  <img
                    src={m().images[imgIdx()]}
                    alt={m().name}
                    class="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                  />
                </Show>

                {/* Gradiente inferior */}
                <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                {/* Botón cerrar */}
                <button
                  onClick={close}
                  class="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/65 text-white flex items-center justify-center transition-colors"
                  aria-label="Cerrar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>

                {/* Flechas */}
                <Show when={m().images.length > 1}>
                  <button
                    onClick={prev}
                    class="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/65 text-white flex items-center justify-center transition-colors"
                    aria-label="Anterior"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M15 18l-6-6 6-6"/>
                    </svg>
                  </button>
                  <button
                    onClick={next}
                    class="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/65 text-white flex items-center justify-center transition-colors"
                    aria-label="Siguiente"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </button>
                </Show>

                {/* Dots */}
                <Show when={m().images.length > 1}>
                  <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    <For each={m().images}>
                      {(_, i) => (
                        <button
                          onClick={() => { setImgError(false); setImgIdx(i()); }}
                          aria-label={`Foto ${i() + 1}`}
                          class={`h-1.5 rounded-full transition-all duration-200 ${
                            i() === imgIdx() ? 'w-4 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/75'
                          }`}
                        />
                      )}
                    </For>
                  </div>
                </Show>
              </div>

              {/* Contenido */}
              <div class="p-5 overflow-y-auto">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center gap-2.5">
                    <span class="text-2xl">{m().emoji}</span>
                    <h3 class="text-lg font-semibold text-stone-900">{m().name}</h3>
                  </div>
                  <span class="text-xs text-amber-600 font-medium bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-full shrink-0 ml-2">
                    {m().tag}
                  </span>
                </div>

                <div class="flex flex-wrap gap-1.5 mb-3">
                  <For each={m().ingredients}>
                    {(ing) => (
                      <span class="text-xs text-stone-500 bg-stone-50 border border-stone-100 px-2 py-0.5 rounded-full">
                        {ing}
                      </span>
                    )}
                  </For>
                </div>

                <p class="text-sm text-stone-500 leading-relaxed italic">{m().description}</p>
              </div>
            </>
          )}
        </Show>
      </dialog>

      {/* ── Tipos de mollete ── */}
      <section>
        <div class="mb-6">
          <h2 class="text-base font-semibold text-stone-900">El menú del día</h2>
          <p class="text-sm text-stone-500 mt-0.5">
            5 tipos de mollete — toca una card para ver fotos
          </p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <For each={MOLLETES}>
            {(m) => (
              <button
                type="button"
                onClick={() => open(m)}
                class="group border border-amber-100 rounded-2xl p-5 bg-white hover:border-amber-300 hover:shadow-md transition-all duration-200 flex flex-col text-left cursor-pointer active:scale-[.98]"
              >
                <div class="flex items-start justify-between mb-3">
                  <span class="text-2xl">{m.emoji}</span>
                  <span class="text-xs text-amber-600 font-medium bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-full">
                    {m.tag}
                  </span>
                </div>

                <h3 class="font-semibold text-stone-900 mb-2">{m.name}</h3>

                <div class="flex flex-wrap gap-1.5 mb-3">
                  <For each={m.ingredients}>
                    {(ing) => (
                      <span class="text-xs text-stone-500 bg-stone-50 border border-stone-100 px-2 py-0.5 rounded-full">
                        {ing}
                      </span>
                    )}
                  </For>
                </div>

                <p class="text-xs text-stone-400 leading-relaxed mt-auto italic line-clamp-2">
                  {m.description}
                </p>

                <p class="text-xs text-amber-500 mt-3 font-medium group-hover:text-amber-600 transition-colors">
                  Ver fotos →
                </p>
              </button>
            )}
          </For>
        </div>
      </section>

      {/* ── Las matemáticas ── */}
      <section>
        <div class="mb-6">
          <h2 class="text-base font-semibold text-stone-900">
            Las matemáticas de la Molletiza
          </h2>
          <p class="text-sm text-stone-500 mt-0.5">Por qué pedimos lo que pedimos</p>
        </div>

        <div class="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
          <p class="text-sm text-amber-900 leading-relaxed">
            Calculamos <strong class="font-semibold">2 bolillos por persona</strong> (4 mitaditas c/u), lo que nos da
            ~54 bolillos. Para cada mitad, ~29 g de frijoles y ~29 g de queso fundido es
            la medida perfecta para que queden bien cargadas sin desperdiciar. Las proteínas
            las dividimos en{' '}
            <strong class="font-semibold">4 opciones</strong> para que haya variedad: el que quiera
            chorizo agarra de chorizo, el que quiera longaniza agarra de longaniza. Y con{' '}
            <strong class="font-semibold">2 L de salsa</strong> y dos tuppers de pico de gallo
            fresco, nadie se queda sin su toque final.
          </p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <For each={MATEMATICAS}>
            {(c) => (
              <div class="border border-amber-100 rounded-xl p-4 bg-white">
                <div class="flex items-center gap-2 mb-3">
                  <span class="text-xl">{c.emoji}</span>
                  <span class="text-sm font-medium text-stone-700">{c.item}</span>
                </div>
                <p class="text-2xl font-semibold text-stone-900 tracking-tight">
                  {c.total}
                </p>
                <p class="text-xs font-medium text-amber-600 mt-1">{c.porPersona}</p>
                <p class="text-xs text-stone-400 mt-2 leading-relaxed">{c.nota}</p>
              </div>
            )}
          </For>
        </div>
      </section>

    </div>
  );
}
