import { createSignal, Show } from 'solid-js';
import { createBrowserClient } from '@supabase/ssr';

export default function LoginForm() {
  const [error, setError] = createSignal('');
  const [loading, setLoading] = createSignal(false);

  const supabase = createBrowserClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY
  );

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const emailVal    = (fd.get('email')    as string) ?? '';
    const passwordVal = (fd.get('password') as string) ?? '';

    setLoading(true);
    setError('');

    const { error: err } = await supabase.auth.signInWithPassword({
      email: emailVal,
      password: passwordVal,
    });

    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      window.location.href = '/';
    }
  };

  const inputClass =
    'w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm placeholder-stone-300 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-white';

  return (
    <form onSubmit={handleSubmit} class="space-y-4">
      <div>
        <label class="block text-xs font-medium text-stone-500 mb-1.5 tracking-wide uppercase">
          Correo electronico
        </label>
        <input
          name="email"
          type="email"
          required
          placeholder="nombre@molletes.com"
          class={inputClass}
        />
      </div>

      <div>
        <label class="block text-xs font-medium text-stone-500 mb-1.5 tracking-wide uppercase">
          Contrasena
        </label>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="••••••••"
          class={inputClass}
        />
      </div>

      <Show when={error()}>
        <p class="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
          {error()}
        </p>
      </Show>

      <button
        type="submit"
        disabled={loading()}
        class="w-full py-3 px-4 bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-amber-700 active:scale-[.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
      >
        {loading() ? 'Un momento...' : 'Entrar a la Molletiza'}
      </button>
    </form>
  );
}
