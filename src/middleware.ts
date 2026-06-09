import { defineMiddleware } from "astro:middleware";
import { createServerClient, parseCookieHeader } from "@supabase/ssr";

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.supabase = createServerClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(context.request.headers.get("cookie") ?? "");
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            context.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Usar getUser() es más seguro en el servidor ya que valida el JWT contra Supabase Auth
  const {
    data: { user },
  } = await context.locals.supabase.auth.getUser();
  context.locals.user = user;

  const {
    data: { session },
  } = await context.locals.supabase.auth.getSession();
  context.locals.session = session;

  const url = context.url.pathname;
  const isApiRoute = url.startsWith("/api/");
  const isPublic = url === "/" || url === "/login";

  if (!isApiRoute && !isPublic && !user) {
    return context.redirect("/");
  }

  if (url === "/login" && user) {
    return context.redirect("/");
  }

  return next();
});
