/**
 * @fileoverview Firestore Write Adapter.
 * This file contains all write operations for Firestore, such as addDoc,
 * setDoc, updateDoc, and deleteDoc, ensuring a clear separation of concerns.
 *
 * [D24] FIREBASE_ACL boundary: feature slices MUST import Firestore SDK
 *       utilities from this adapter (or firestore.read.adapter) rather than
 *       directly from 'firebase/firestore'.
 */

import {
	arrayRemove,
	arrayUnion,
	collection,
	doc,
	addDoc,
	setDoc,
	updateDoc,
	deleteDoc,
	runTransaction,
	serverTimestamp,
	type FieldValue,
	type Transaction,
	type WithFieldValue,
	type DocumentData,
	type FirestoreDataConverter,
} from 'firebase/firestore';

import { db } from './firestore.client';

export {
	serverTimestamp,
	arrayUnion,
	arrayRemove,
	runTransaction,
	addDoc,
	setDoc,
	updateDoc,
};
export type { FieldValue, Transaction };

export const addDocument = <T>(
	path: string,
	data: WithFieldValue<T>,
	converter?: FirestoreDataConverter<T>
) => {
	if (converter) {
		const collRef = collection(db, path).withConverter(converter);
		return addDoc(collRef, data);
	}

	return addDoc(collection(db, path), data as WithFieldValue<DocumentData>);
};

export const setDocument = <T>(
	path: string,
	data: WithFieldValue<T>,
	converter?: FirestoreDataConverter<T>
) => {
	if (converter) {
		const docRef = doc(db, path).withConverter(converter);
		return setDoc(docRef, data);
	}

	return setDoc(doc(db, path), data as WithFieldValue<DocumentData>);
};

export const updateDocument = (path: string, data: DocumentData) => {
	const docRef = doc(db, path);
	return updateDoc(docRef, data);
};

export const deleteDocument = (path: string) => {
	const docRef = doc(db, path);
	return deleteDoc(docRef);
};
