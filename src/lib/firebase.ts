// Configuração e inicialização do Firebase (Auth + Firestore).
// As chaves web do Firebase são públicas por design — a segurança vem das
// regras do Firestore (cada usuário só acessa os próprios dados).
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDlw-aDQaIRNVI27Ta8USks1SJgPaZJn1g',
  authDomain: 'cineflow-edbec.firebaseapp.com',
  projectId: 'cineflow-edbec',
  storageBucket: 'cineflow-edbec.firebasestorage.app',
  messagingSenderId: '514986588883',
  appId: '1:514986588883:web:f1174de9a323a837d7b226',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firestore com cache offline (funciona sem internet; sincroniza ao voltar).
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentSingleTabManager(undefined) }),
});
