export default {
  async fetch(request, env) {
    // Handle CORS Preflight (OPTIONS request)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Only allow POST requests to /api/generate
    const url = new URL(request.url);
    if (request.method !== "POST" || url.pathname !== "/api/generate") {
      return new Response(JSON.stringify({ error: { message: "Not found" } }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    try {
      const body = await request.json();
      const model = body.model || "gemini-1.5-flash";
      const contents = body.contents || [];

      // Ensure API key is configured
      if (!env.GEMINI_API_KEY) {
        return new Response(JSON.stringify({ error: { message: "GEMINI_API_KEY is missing in Worker variables." } }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Direct request to Google Gemini API
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;

      const response = await fetch(geminiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ contents })
      });

      const data = await response.json();

      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: { message: err.message || "Internal Worker Error" } }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
};
