import { lazy, ComponentType } from 'react';

/**
 * A wrapper around React.lazy that reloads the page if a chunk fails to load.
 * This handles the "Failed to fetch dynamically imported module" error that occurs
 * when a new version is deployed while a user has the app open.
 */
export const lazyWithRetry = <T extends ComponentType<any>>(
    factory: () => Promise<{ default: T }>
) => {
    return lazy(async () => {
        try {
            return await factory();
        } catch (error: any) {
            const isChunkLoadError =
                error.message?.includes('Failed to fetch dynamically imported module') ||
                error.message?.includes('Importing a module script failed') ||
                error.name === 'ChunkLoadError';

            if (isChunkLoadError) {
                // Check if we've already tried to refresh for this specific error
                const storageKey = `retry-lazy-refreshed-${window.location.pathname}`;
                const hasRefreshed = sessionStorage.getItem(storageKey);

                if (!hasRefreshed) {
                    sessionStorage.setItem(storageKey, 'true');
                    window.location.reload();
                    // Return a never-resolving promise to prevent React from throwing before reload
                    return new Promise(() => { });
                }
            }

            // If not a chunk error or we already retried, rethrow
            throw error;
        }
    });
};
