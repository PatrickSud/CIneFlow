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
      publico: !!data.publico,
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
    publico: false,
    biblioteca: [],
    updatedAt: Date.now(),
  });
  return ref.id;
}

/** Define se a lista é pública (link de leitura). */
export async function setListPublic(listId: string, publico: boolean): Promise<void> {
  await updateDoc(doc(db, 'lists', listId), { publico, updatedAt: Date.now() });
}

/** Lê o documento completo de uma lista (metadados + biblioteca). */
export async function loadListDoc(
  listId: string
): Promise<{ meta: SharedList; biblioteca: Item[] } | null> {
  const snap = await getDoc(doc(db, 'lists', listId));
  if (!snap.exists()) return null;
  const d = snap.data() as any;
  return {
    meta: {
      id: snap.id,
      nome: d.nome || 'Lista',
      ownerUid: d.ownerUid || '',
      ownerEmail: d.ownerEmail || '',
      memberEmails: Array.isArray(d.memberEmails) ? d.memberEmails : [],
      publico: !!d.publico,
    },
    biblioteca: Array.isArray(d.biblioteca) ? d.biblioteca : [],
  };
}

/** Cria uma cópia pessoal (editável) de uma lista, com a biblioteca informada. */
export async function copyListToPersonal(
  ownerUid: string,
  ownerEmail: string,
  nome: string,
  biblioteca: Item[]
): Promise<string> {
  const ref = await addDoc(collection(db, 'lists'), {
    nome: nome.trim() || 'Cópia',
    ownerUid,
    ownerEmail: normEmail(ownerEmail),
    memberEmails: [normEmail(ownerEmail)],
    publico: false,
    biblioteca,
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
