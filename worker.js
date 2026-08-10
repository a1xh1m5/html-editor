export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Create a backend API endpoint for your frontend
    if (url.pathname === "/api/data") {
      // Access your secret safely on Cloudflare's server
      const apiKey = env.APP_KEY; 

      // Make the external request using your key
      const response = await fetch("https://api.example.com/data", {
        headers: { "Authorization": `Bearer ${apiKey}` }
      });

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // 2. Fallback to serving your static index.html and CSS/JS files
    return env.ASSETS.fetch(request);
  }
};
