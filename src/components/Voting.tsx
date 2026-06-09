import { createSignal, For, Show } from 'solid-js';

type DateOption = { id: string; label: string; votes: number };

interface Props {
  dates: DateOption[];
  userVote: string | null;
}

export default function Voting(props: Props) {
  const [dates, setDates] = createSignal<DateOption[]>(props.dates);
  const [userVote, setUserVote] = createSignal<string | null>(props.userVote);
  const [voting, setVoting] = createSignal(false);
  const [error, setError] = createSignal('');

  const totalVotes = () => dates().reduce((sum, d) => sum + d.votes, 0);

  async function vote(dateId: string) {
    if (voting() || dateId === userVote()) return;
    setVoting(true);
    setError('');

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateId }),
      });
      const data = await res.json();

      if (res.ok) {
        setUserVote(dateId);
        setDates(data.dates);
      } else {
        setError(data.error ?? 'Error al votar');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setVoting(false);
    }
  }

  return (
    <div class="space-y-3">
      <For each={dates()}>
        {(date) => {
          const total = totalVotes();
          const pct = total > 0 ? Math.round((date.votes / total) * 100) : 0;
          const isSelected = () => userVote() === date.id;
          const hasVoted = () => userVote() !== null;

          return (
            <button
              onClick={() => vote(date.id)}
              disabled={voting() || isSelected()}
              class={`w-full text-left border rounded-lg p-4 transition-all ${
                isSelected()
                  ? 'border-zinc-900 bg-zinc-900 text-white cursor-default'
                  : hasVoted()
                  ? 'border-zinc-100 bg-zinc-50 hover:border-zinc-300 text-zinc-600'
                  : 'border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 text-zinc-900'
              } disabled:cursor-not-allowed`}
            >
              <div class="flex items-center justify-between mb-3">
                <span class={`font-medium ${isSelected() ? 'text-white' : ''}`}>
                  {date.label}
                </span>
                <span
                  class={`text-sm tabular-nums ${isSelected() ? 'text-zinc-300' : 'text-zinc-400'}`}
                >
                  {date.votes} {date.votes === 1 ? 'voto' : 'votos'}
                </span>
              </div>

              {/* Barra de progreso */}
              <div
                class={`h-1 rounded-full overflow-hidden ${isSelected() ? 'bg-white/20' : 'bg-zinc-100'}`}
              >
                <div
                  class={`h-full rounded-full transition-all duration-500 ${isSelected() ? 'bg-white' : 'bg-zinc-400'}`}
                  style={`width: ${pct}%`}
                />
              </div>

              <p class={`text-xs mt-1.5 ${isSelected() ? 'text-zinc-400' : 'text-zinc-400'}`}>
                {pct}%{isSelected() ? ' — tu voto' : ''}
              </p>
            </button>
          );
        }}
      </For>

      <Show when={error()}>
        <p class="text-xs text-red-500 text-center pt-1">{error()}</p>
      </Show>

      <Show when={!userVote() && !voting()}>
        <p class="text-xs text-zinc-400 text-center pt-1">
          Haz clic en una fecha para votar
        </p>
      </Show>

      <Show when={userVote() && !voting()}>
        <p class="text-xs text-zinc-400 text-center pt-1">
          Haz clic en otra fecha para cambiar tu voto
        </p>
      </Show>
    </div>
  );
}
