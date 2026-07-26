// Listas compartilhadas (família/amigos) no Firestore.
// Cada lista é um documento em `lists/{id}` com os membros identificados por email.
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Item, SharedList } from '../types';

const normEmail = (e: string) => e.trim().toLowerCase();

/** Listas em que o email é membro. */
export async function fetchSharedLists(email: string): Promise<SharedList[]> {
  const q = query(collection(db, 'lists'), where('memberEmails', 'array-contains', normEmail(email)));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as any;
    return {
      id: d.id,
      nome: data.nome || 'Lista',
      ownerUid: data.ownerUid || '',
      ownerEmail: data.ownerEmail || '',
      memberEmails: Array.isArray(data.memberEmails) ? data.memberEmails : [],
    };
  });
}

/** Cria uma lista com o dono e os membros informados. Devolve o id. */
export async function createSharedList(
  ownerUid: string,
  ownerEmail: string,
  nome: string,
  members: string[]
): Promise<string> {
  const memberEmails = Array.from(
    new Set([normEmail(ownerEmail), ...members.map(normEmail).filter(Boolean)])
  );
  const ref = await addDoc(collection(db, 'lists'), {
    nome: nome.trim() || 'Nova lista',
    ownerUid,
    ownerEmail: normEmail(ownerEmail),
    memberEmails,
    biblioteca: [],
    updatedAt: Date.now(),
  });
  return ref.id;
}

export async function loadListItems(listId: string): Promise<Item[]> {
  const snap = await getDoc(doc(db, 'lists', listId));
  if (!snap.exists()) return [];
  const data = snap.data() as any;
  return Array.isArray(data.biblioteca) ? data.biblioteca : [];
}

export async function saveListItems(listId: string, items: Item[]): Promise<void> {
  await setDoc(doc(db, 'lists', listId), { biblioteca: items, updatedAt: Date.now() }, { merge: true });
}

/** Atualiza a lista de membros (emails). */
export async function setListMembers(listId: string, memberEmails: string[]): Promise<void> {
  const clean = Array.from(new Set(memberEmails.map(normEmail).filter(Boolean)));
  await updateDoc(doc(db, 'lists', listId), { memberEmails: clean, updatedAt: Date.now() });
}

/** Apaga a lista (apenas o dono deveria fazer isto). */
export async function deleteSharedList(listId: string): Promise<void> {
  await deleteDoc(doc(db, 'lists', listId));
}
