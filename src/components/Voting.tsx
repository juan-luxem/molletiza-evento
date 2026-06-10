import { createSignal, For, Show } from 'solid-js';

type DateOption = { id: string; label: string; votes: number };

interface Props {
  dates: DateOption[];
  userVote: string | null;
  votingClosed: boolean;
}

export default function Voting(props: Props) {
  const [dates, setDates] = createSignal<DateOption[]>(props.dates);
  const [userVote, setUserVote] = createSignal<string | null>(props.userVote);
  const [voting, setVoting] = createSignal(false);
  const [error, setError] = createSignal('');
  const closed = props.votingClosed;

  const totalVotes = () => dates().reduce((sum, d) => sum + d.votes, 0);

  async function vote(dateId: string) {
    if (closed || voting() || dateId === userVote()) return;
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
      setError('Error de conexion');
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
              disabled={closed || voting() || isSelected()}
              class={`w-full text-left border rounded-2xl p-4 transition-all duration-200 ${
                isSelected()
                  ? 'border-amber-500 bg-amber-600 text-white shadow-md shadow-amber-200 cursor-default'
                  : closed
                  ? 'border-stone-100 bg-stone-50 text-stone-400 cursor-default'
                  : hasVoted()
                  ? 'border-amber-100 bg-white hover:border-amber-300 hover:bg-amber-50/60 text-stone-600'
                  : 'border-stone-200 hover:border-amber-400 hover:bg-amber-50/50 text-stone-900'
              } disabled:cursor-not-allowed`}
            >
              <div class="flex items-center justify-between mb-3">
                <span class={`font-medium ${isSelected() ? 'text-white' : 'text-stone-800'}`}>
                  {date.label}
                </span>
                <span
                  class={`text-sm tabular-nums font-medium ${isSelected() ? 'text-amber-100' : 'text-amber-500'}`}
                >
                  {date.votes} {date.votes === 1 ? 'voto' : 'votos'}
                </span>
              </div>

              <div
                class={`h-1.5 rounded-full overflow-hidden ${isSelected() ? 'bg-amber-500/40' : 'bg-amber-100'}`}
              >
                <div
                  class={`h-full rounded-full transition-all duration-500 ${isSelected() ? 'bg-amber-200' : 'bg-amber-400'}`}
                  style={`width: ${pct}%`}
                />
              </div>

              <p class={`text-xs mt-1.5 ${isSelected() ? 'text-amber-200' : 'text-stone-400'}`}>
                {pct}%{isSelected() ? ' — tu voto' : ''}
              </p>
            </button>
          );
        }}
      </For>

      <Show when={error()}>
        <p class="text-xs text-red-500 text-center pt-1">{error()}</p>
      </Show>

      <Show when={closed}>
        <p class="text-xs text-stone-400 text-center pt-1">
          Las votaciones cerraron el 10 de junio a las 6:00 pm
        </p>
      </Show>

      <Show when={!closed && !userVote() && !voting()}>
        <p class="text-xs text-stone-400 text-center pt-1">
          Haz clic en una fecha para votar
        </p>
      </Show>

      <Show when={!closed && userVote() && !voting()}>
        <p class="text-xs text-stone-400 text-center pt-1">
          Haz clic en otra fecha para cambiar tu voto
        </p>
      </Show>
    </div>
  );
}
