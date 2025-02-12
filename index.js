// Exporte o código pra ser usado no servidor, tipo uma função "fetch" pra lidar com requisições
export default {
    // Essa função "fetch" vai lidar com as requisições que chegam
    async fetch(request, env) {
      // Pega o caminho (ou URL) da requisição
      const url = new URL(request.url);
      
      // Checa se o caminho da URL é "/registrar"
      if (url.pathname === "/registrar") {
        // Se for, chama a função que registra o acesso
        return await registrarAcesso(request, env);
      } 
      // Checa se o caminho é "/acessos"
      else if (url.pathname === "/acessos") {
        // Se for, chama a função pra listar os acessos
        return await listarAcessos(request, env);
      } 
      else {
        // Se não for nenhum dos dois, retorna um erro 404, dizendo que não encontrou a rota
        return new Response("Rota não encontrada", { status: 404 });
      }
    }
  };
  
  // Função pra registrar o acesso
  async function registrarAcesso(request, env) {
    // Aqui a gente tenta pegar o país da requisição, se não achar, coloca "Desconhecido"
    const { country } = request.cf || { country: "Desconhecido" };
    // Pega o "User-Agent", que é basicamente qual navegador a pessoa tá usando, se não achar, coloca "Desconhecido"
    const userAgent = request.headers.get("User-Agent") || "Desconhecido";
    // Cria um "fingerprint" (impressão digital do navegador) com base no User-Agent codificado em base64
    const fingerprint = btoa(userAgent);
  
    try {
      // Agora, vai inserir esses dados (país e fingerprint) na base de dados
      await env.DB.prepare(
        "INSERT INTO cloudteste (country, fingerprint) VALUES (?, ?)"
      ).bind(country, fingerprint).run();
      // Retorna uma resposta dizendo que o acesso foi registrado
      return new Response("Acesso registrado", { status: 200 });
    } catch (error) {
      // Se deu erro, retorna uma mensagem com o erro
      return new Response(`Erro ao registrar: ${error.message}`, { status: 500 });
    }
  }
  
  // Função pra listar todos os acessos que foram registrados
  async function listarAcessos(request, env) {
    try {
      // Pega todos os registros da tabela "cloudteste"
      const { results } = await env.DB.prepare("SELECT * FROM cloudteste").all();
      
      // Retorna os resultados em formato JSON
      return new Response(JSON.stringify(results, null, 2), { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      });
    } catch (error) {
      // Se der erro, loga o erro no console e retorna uma resposta com o erro
      console.error("Erro:", error);
      return new Response(`Erro: ${error.message}`, { status: 500 });
    }
  }
  