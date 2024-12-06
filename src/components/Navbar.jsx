import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-[#6781ff] p-4 flex items-center justify-between">
      <div className="w-24"></div> {/* Spacer for alignment */}
      <h1 className="text-2xl font-semibold text-white text-center">MEDISCRIBE</h1>
      <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Login
      </button>
    </nav>
  );
};

export default Navbar; 