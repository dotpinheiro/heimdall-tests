const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, getDoc } = require('firebase/firestore');
const express = require('express');
require ('dotenv').config();


const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};
  

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const server = express();
server.use(express.json());
const PORT = process.env.PORT || 3001;

const ROLES_PERMISSIONS = {
  admin: ['USERS.LIST', 'EMPLOYEE.CREATE'],
  employee: ['EMPLOYEE.CREATE'],
  guest: []
};

async function getUserRoles(uid) {
  const ref = doc(db, 'roles', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return [];
  }
  return snap.data().roles || [];
}

async function checkPermissions(userRoles, requiredPermissions) {
  const userPermissions = new Set();
  userRoles.forEach(role => {
    const perms = ROLES_PERMISSIONS[role] || [];
    perms.forEach(p => userPermissions.add(p));
  });
  return requiredPermissions.every(p => userPermissions.has(p));
}

server.post('/login', async (req, res) => {
  try {
    console.log('Tentando autenticar...');
    const userCredential = await signInWithEmailAndPassword(auth, 'admin@admin.com', 'admin123');
    const user = userCredential?.user;

    console.log('Usuário autenticado:', user.uid);

    res.json({ user });
  } catch (error) {
    console.error('Erro:', error.message);
  }
});

server.post('/check-permissions', async (req, res) => {
  const { permissions } = req.body;
  const [_, userId] = req.headers['authorization']?.split(' ') || [];

  if (!userId || !permissions) {
    return res.status(400).json({ error: 'User ID e permissões são necessários' });
  }

  console.log(`Verificando permissões: ${permissions} para o usuário: ${userId}`);

  try {
    const userRoles = await getUserRoles(userId);
    const hasPerm = await checkPermissions(userRoles, permissions);
    console.log(`Permissões verificadas: ${hasPerm}`);
    res.json({ permissions: hasPerm });
  } catch (e) {
    console.log(e)
    res.status(500).json({ error: e.message });
  }
});

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
