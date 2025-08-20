import React from 'react';

function App() {
  // Redirect to the quote generator HTML file
  React.useEffect(() => {
    window.location.href = '/quote-generator.html';
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-800 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Quote Generator...</p>
      </div>
    </div>
  );
}

export default App;