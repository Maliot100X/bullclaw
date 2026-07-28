'use client';

export default function Page() {
  const title = new URL('http://x' + window.location.pathname).pathname.split('/').pop() || 'Page';
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
      <h2 className="text-2xl font-bold text-white mb-4 capitalize">{title}</h2>
      <p className="text-gray-400">{title} interface coming soon...</p>
    </div>
  );
}
