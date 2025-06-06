const express = require('express');
const { Client } = require('@dotpinheiro/heimdall-js');

const app = express();
app.use(express.json());

const client = new Client('localhost', 50051);

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const auth = await client.authenticate(email, password);
    if (!auth || !auth.token) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    console.log(`Usuário autenticado: ${email}`);

    res.json({ token: auth.token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/check-permissions', async (req, res) => {
  const { permissions } = req.body;
  const [_, token] = req.headers['authorization']?.split(' ') || [];

  if (!token || !permissions) {
    return res.status(400).json({ error: 'Token e permissões são necessários' });
  }

  console.log(`Verificando permissões: ${permissions} para o token: ${token}`);

  try {
    const hasPerm = await client.checkPermissions(token, permissions);
    console.log(`Permissões verificadas: ${hasPerm}`);
    res.json({ permissions: hasPerm });
  } catch (e) {
    console.log(e)
    res.status(500).json({ error: e.message });
  }
});

app.listen(3001, () => {
  console.log('Servidor rodando na porta 3001');
});