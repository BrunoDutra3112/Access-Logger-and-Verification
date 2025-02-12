export default {
    async fetch(request, env) {
      const url = new URL(request.url);
      
      if (url.pathname === "/registrar") {
        return await registrarAcesso(request, env);
      } else if (url.pathname === "/acessos") {
        return await listarAcessos(request, env);
      } else {
        return new Response("Rota não encontrada", { status: 404 });
      }
    }
  };
  
  async function registrarAcesso(request, env) {
    const { country } = request.cf || { country: "Desconhecido" };
    const userAgent = request.headers.get("User-Agent") || "Desconhecido";
    const fingerprint = btoa(userAgent);
  
    try {
      await env.DB.prepare(
        "INSERT INTO cloudteste (country, fingerprint) VALUES (?, ?)"
      ).bind(country, fingerprint).run();
      return new Response("Acesso registrado", { status: 200 });
    } catch (error) {
      return new Response(`Erro ao registrar: ${error.message}`, { status: 500 });
    }
  }
  
  async function listarAcessos(request, env) {
    try {
      const { results } = await env.DB.prepare("SELECT * FROM cloudteste").all();
      
      return new Response(JSON.stringify(results, null, 2), { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      });
    } catch (error) {
      console.error("Erro:", error);
      return new Response(`Erro: ${error.message}`, { status: 500 });
    }
  } 
  