export const dynamic = 'force-dynamic';

import SiteLayout from './(site)/layout';

export default function NotFound() {
    return (
        <SiteLayout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] mb-4">
                    404
                </h2>
                <p className="text-xl text-[var(--text-muted)] mb-8">Page Not Found</p>
                <p className="text-[var(--text-muted)] max-w-md">
                    Could not find requested resource. The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
            </div>
        </SiteLayout>
    );
}
