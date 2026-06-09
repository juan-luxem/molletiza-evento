import { createSignal, onMount, onCleanup, Show } from 'solid-js';

type Item = { id: string; name: string; status: string; assigned_to: string | null };

interface Props {
  items: Item[];
  userId: string;
  userAssigned: Item | null;
}

const SIZE = 320;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = SIZE / 2 - 6;
const COLORS = ['#D97706', '#92400E', '#C2410C', '#B45309', '#78350F', '#EA580C'];

function drawWheel(ctx: CanvasRenderingContext2D, rot: number, items: Item[]) {
  ctx.clearRect(0, 0, SIZE, SIZE);

  if (items.length === 0) {
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, Math.PI * 2);
    ctx.fillStyle = '#f4f4f5';
    ctx.fill();
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '13px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Todos los ingredientes', CX, CY - 9);
    ctx.fillText('ya fueron asignados', CX, CY + 9);
    return;
  }

  const count = items.length;
  const arc = (Math.PI * 2) / count;

  for (let i = 0; i < count; i++) {
    const start = rot + i * arc;
    const end = start + arc;

    // Segmento
    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.arc(CX, CY, R, start, end);
    ctx.closePath();
    ctx.fillStyle = COLORS[i % 2];
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Texto del ingrediente
    const textR = R * 0.60;
    const midAngle = start + arc / 2;
    const charCount = Math.max(3, Math.floor((arc * textR) / 6.5));
    const label = items[i].name.slice(0, charCount);
    const fontSize = Math.max(8, Math.min(11, (arc * R * 0.5) / 4.5));

    ctx.save();
    ctx.translate(
      CX + Math.cos(midAngle) * textR,
      CY + Math.sin(midAngle) * textR
    );
    ctx.rotate(midAngle + Math.PI / 2);
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, 0);
    ctx.restore();
  }

  // Borde exterior
  ctx.beginPath();
  ctx.arc(CX, CY, R, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Hub central
  ctx.beginPath();
  ctx.arc(CX, CY, 17, 0, Math.PI * 2);
  ctx.fillStyle = '#FEF3C7';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(CX, CY, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#D97706';
  ctx.fill();
}

export default function Roulette(props: Props) {
  const availableItems = () => props.items.filter((i) => i.status === 'available');

  const [spinning, setSpinning] = createSignal(false);
  const [result, setResult] = createSignal<Item | null>(props.userAssigned);
  const [rotation, setRotation] = createSignal(0);

  let canvasRef!: HTMLCanvasElement;
  let animId: number;

  onMount(() => {
    canvasRef.width = SIZE;
    canvasRef.height = SIZE;
    const ctx = canvasRef.getContext('2d')!;
    drawWheel(ctx, 0, availableItems());
  });

  onCleanup(() => {
    if (animId) cancelAnimationFrame(animId);
  });

  function easeOut(t: number) {
    return 1 - Math.pow(1 - t, 4);
  }

  async function handleSpin() {
    if (spinning() || result()) return;
    const items = availableItems();
    if (items.length === 0) return;

    setSpinning(true);

    try {
      const res = await fetch('/api/spin', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error ?? 'Error al girar la ruleta');
        setSpinning(false);
        return;
      }

      const winner: Item = data.item;
      const winnerIdx = items.findIndex((i) => i.id === winner.id);
      const ctx = canvasRef.getContext('2d')!;

      if (winnerIdx === -1) {
        // Race condition: mostrar resultado sin animación
        setResult(winner);
        setSpinning(false);
        return;
      }

      const count = items.length;
      const arc = (Math.PI * 2) / count;
      const winnerMid = winnerIdx * arc + arc / 2;
      // Queremos que winnerMid + rot = -π/2 → el segmento queda arriba
      const target = -Math.PI / 2 - winnerMid;
      const normalized = ((target % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const finalAngle = normalized + Math.PI * 2 * 8; // 8 vueltas completas

      const startAngle = rotation();
      const duration = 4500;
      const t0 = performance.now();

      function animate(now: number) {
        const elapsed = now - t0;
        const progress = Math.min(elapsed / duration, 1);
        const rot = startAngle + (finalAngle - startAngle) * easeOut(progress);
        setRotation(rot);
        drawWheel(ctx, rot, items);

        if (progress < 1) {
          animId = requestAnimationFrame(animate);
        } else {
          setSpinning(false);
          setResult(winner);
          setTimeout(() => window.location.reload(), 1800);
        }
      }

      animId = requestAnimationFrame(animate);
    } catch {
      setSpinning(false);
    }
  }

  return (
    <div class="flex flex-col items-center gap-6">
      {/* Ruleta */}
      <div class="relative">
        {/* Indicador (triángulo apuntando hacia abajo, en la parte superior) */}
        <div
          class="absolute left-1/2 -translate-x-1/2 z-10"
          style="top: -11px"
        >
          <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
            <path d="M11 14L0.607693 0.5L21.3923 0.5L11 14Z" fill="#D97706" />
          </svg>
        </div>

        <canvas
          ref={canvasRef!}
          style={{ width: `${SIZE}px`, height: `${SIZE}px` }}
          class="block rounded-full"
        />
      </div>

      {/* Estado: resultado o botón */}
      <Show
        when={result()}
        fallback={
          <button
            onClick={handleSpin}
            disabled={spinning() || availableItems().length === 0}
            class="px-8 py-2.5 bg-amber-600 text-white text-sm font-medium rounded-full hover:bg-amber-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {spinning()
              ? 'Girando...'
              : availableItems().length === 0
              ? 'Sin disponibles'
              : 'Girar Ruleta'}
          </button>
        }
      >
        <div class="text-center">
          <p class="text-xs text-amber-500 tracking-widest uppercase mb-1">Tu ingrediente</p>
          <p class="text-xl font-semibold text-stone-900">{result()!.name}</p>
        </div>
      </Show>
    </div>
  );
}
