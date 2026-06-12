import { env } from '$env/dynamic/private';
import { createClient } from '@supabase/supabase-js';

let client = null;

export function getSupabaseClient() {
	if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
		throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured');
	}

	if (!client) {
		client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
			auth: {
				persistSession: false,
				autoRefreshToken: false
			}
		});
	}

	return client;
}

export function getSupabaseStorageBucket() {
	return env.SUPABASE_STORAGE_BUCKET || 'flower-bouquets';
}

/**
 * @param {unknown} error
 * @param {string} action
 * @returns {never}
 */
export function throwSupabaseError(error, action) {
	/** @type {any} */
	const supabaseError = error;
	const message =
		typeof supabaseError?.message === 'string'
			? supabaseError.message
			: 'Unexpected Supabase error';
	const detail = typeof supabaseError?.details === 'string' ? ` ${supabaseError.details}` : '';
	const hint = typeof supabaseError?.hint === 'string' ? ` Hint: ${supabaseError.hint}` : '';
	const wrapped = new Error(`Supabase ${action} failed: ${message}.${detail}${hint}`);

	wrapped.name = 'SupabaseError';
	// Preserve the PostgREST/storage code for server logs and future classifiers.
	// @ts-expect-error - attach provider-specific metadata to a standard Error.
	wrapped.code = supabaseError?.code;

	throw wrapped;
}
