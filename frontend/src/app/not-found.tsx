import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-6xl font-bold text-foreground mb-4">404</h2>
        <h3 className="text-2xl font-semibold text-foreground mb-2">Page Not Found</h3>
        <p className="text-muted-foreground mb-6">
          The page you are looking for doesn't exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}