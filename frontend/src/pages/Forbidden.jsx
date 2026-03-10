// src/pages/Forbidden.jsx
export default function Forbidden() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-600">403</h1>
        <p className="mt-2 text-gray-600">
          Vous n'avez pas les droits nécessaires.
        </p>
      </div>
    </div>
  );
}
