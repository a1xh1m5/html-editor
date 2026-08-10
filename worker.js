export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Secure backend endpoint: handles requests sent from index.html
    if (url.pathname === "/api/generate") {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }

      try {
        const body = await request.json();

        // 1. Fetch your secret key stored in Cloudflare Workers
        const apiKey = env.API_KEY;

        if (!apiKey) {
          return new Response(
            JSON.stringify({ error: "API key is not configured in Cloudflare." }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }

        // 2. Forward request to external API using the hidden key
        const apiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        const data = await apiResponse.json();
        return new Response(JSON.stringify(data), {
          headers: { "Content-Type": "application/json" },
        });

      } catch (err) {
        return new Response(
          JSON.stringify({ error: err.message }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Serve static files (index.html, CSS, etc.)
    return env.ASSETS.fetch(request);
  },
};
