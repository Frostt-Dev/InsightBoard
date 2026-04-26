import Navbar from './Navbar';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
