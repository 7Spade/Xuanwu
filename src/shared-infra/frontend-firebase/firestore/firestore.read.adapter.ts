/**
 * @fileoverview Firestore Read Adapter.
 * This file contains all read-only operations for Firestore, such as getDoc,
 * getDocs, and creating real-time listeners with onSnapshot.
 *
 * [D24] FIREBASE_ACL boundary: feature slices MUST import Firestore SDK
 *       utilities from this adapter (or firestore.write.adapter) rather than
 *       directly from 'firebase/firestore'.
 */

import {
	collection,
	collectionGroup,
	doc,
	getDoc,
	getDocs,
	onSnapshot,
	query,
	where,
	orderBy,
	limit,
	Timestamp,
	type CollectionReference,
	type DocumentChange,
	type DocumentData,
	type DocumentSnapshot,
	type FieldPath,
	type OrderByDirection,
	type Query,
	type QueryConstraint,
	type QueryDocumentSnapshot,
	type QuerySnapshot,
	type Unsubscribe,
	type WhereFilterOp,
	type FirestoreDataConverter,
} from 'firebase/firestore';

import { db } from './firestore.client';

export {
	collection,
	collectionGroup,
	doc,
	getDoc,
	getDocs,
	onSnapshot,
	query,
	where,
	orderBy,
	limit,
	Timestamp,
};
export type {
	CollectionReference,
	DocumentChange,
	DocumentData,
	DocumentSnapshot,
	FieldPath,
	OrderByDirection,
	Query,
	QueryConstraint,
	QueryDocumentSnapshot,
	QuerySnapshot,
	Unsubscribe,
	WhereFilterOp,
};

export const getDocument = async <T>(
	path: string,
	converter?: FirestoreDataConverter<T>
): Promise<T | null> => {
	if (converter) {
		const docRef = doc(db, path).withConverter(converter);
		const docSnap = await getDoc(docRef);
		return docSnap.exists() ? docSnap.data() : null;
	}

	const docRef = doc(db, path);
	const docSnap = await getDoc(docRef);
	return docSnap.exists() ? (docSnap.data() as T) : null;
};

export const getDocuments = async <T>(query: Query<T>): Promise<T[]> => {
	const querySnapshot = await getDocs(query);
	return querySnapshot.docs.map((doc) => doc.data());
};

export const createSubscription = <T>(
	query: Query<T, DocumentData>,
	onUpdate: (data: T[]) => void
): Unsubscribe => {
	return onSnapshot(query, (querySnapshot) => {
		const data = querySnapshot.docs.map((doc) => doc.data());
		onUpdate(data);
	});
};

export const subscribeToDocument = <T extends object>(
	path: string,
	onUpdate: (data: (T & { id: string }) | null) => void
): Unsubscribe => {
	const docRef = doc(db, path);
	return onSnapshot(docRef, (snap) => {
		onUpdate(snap.exists() ? ({ id: snap.id, ...snap.data() } as T & { id: string }) : null);
	});
};
