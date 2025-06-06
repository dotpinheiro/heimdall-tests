require('dotenv').config();
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const AWS = require('aws-sdk');
const express = require('express');
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3001;


// === Config Cognito ===
const poolData = {
  UserPoolId: process.env.USER_POOL_ID,
  ClientId: process.env.CLIENT_ID
};

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

const ROLES_PERMISSIONS = {
  admin: ['USERS.LIST', 'EMPLOYEE.CREATE'],
  employee: ['EMPLOYEE.CREATE'],
  guest: []
};

// === DynamoDB Config ===
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const docClient = new AWS.DynamoDB.DocumentClient();

async function getUserRoles(userId) {
  const params = {
    TableName: 'UserRoles',
    Key: { userId }
  };

  const data = await docClient.get(params).promise();
  return data.Item ? data.Item.roles : [];
}

function checkPermissions(userRoles, requiredPermissions) {
  const userPermissions = new Set();
  userRoles.forEach(role => {
    const perms = ROLES_PERMISSIONS[role] || [];
    perms.forEach(p => userPermissions.add(p));
  });
  return requiredPermissions.every(p => userPermissions.has(p));
}

const authenticateUser = (username, password) => {
  return new Promise((resolve, reject) => {
    const authDetails = new AmazonCognitoIdentity.AuthenticationDetails({
      Username: username,
      Password: password
    });

    const userData = {
      Username: username,
      Pool: userPool
    };

    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (result) => {
        const accessToken = result.getAccessToken().getJwtToken();
        const idToken = result.getIdToken().getJwtToken();
        const userId = result.getIdToken().decodePayload().sub;
        resolve({ accessToken, idToken, userId });
      },
      onFailure: (err) => {
        reject(err);
      }
    });
  });
};

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const { userId, accessToken } = await authenticateUser(username, password);
    res.json({ userId, accessToken });
  } catch (err) {
    console.error('Erro:', err.message);
    res.status(401).json({ error: 'Credenciais inválidas' });
  }
});

app.post('/check-permissions', async (req, res) => {
  const { permissions } = req.body;
  const [_, userId] = req.headers['authorization']?.split(' ') || [];

  console.log(`Verificando permissões: ${permissions} para o usuário: ${userId}`);

  if (!userId || !permissions) {
    return res.status(400).json({ error: 'User ID e permissões são necessários' });
  }

  try {
    const roles = await getUserRoles(userId);
    const hasPerm = checkPermissions(roles, permissions);
    res.json({ permissions: hasPerm });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}
);