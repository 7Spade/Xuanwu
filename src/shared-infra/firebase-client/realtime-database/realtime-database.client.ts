/**
 * Module: realtime-database.client.ts
 * Purpose: Initialize and export frontend Realtime Database singleton
 * Responsibilities: provide one Database instance for RTDB adapters
 * Constraints: deterministic logic, respect module boundaries
 */

import { getDatabase, type Database } from 'firebase/database';

import { app } from '../app.client';

export const rtdb: Database = getDatabase(app);
