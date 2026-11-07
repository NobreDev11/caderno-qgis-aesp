// Diz ao app se a geração automática (API do Claude) está configurada. Não revela a chave.
const { responder } = require("./_auth");
module.exports = (req, res) => responder(res, 200, { ia: !!process.env.ANTHROPIC_API_KEY });
