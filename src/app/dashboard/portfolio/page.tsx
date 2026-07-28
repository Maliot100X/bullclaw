'use client';

export default function Page() {
  const title = 'portfolio';
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white capitalize">${title}</h1>
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <p className="text-gray-400">Content for ${title} coming soon...</p>
      </div>
    </div>
  );
}
