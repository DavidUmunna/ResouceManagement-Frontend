import React from 'react';

const NavbarSkeleton = () => {
  return (
    <div className="w-full bg-white border-b border-gray-200 animate-pulse">
      <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: brand and desktop nav links */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="h-8 w-8 rounded-md bg-gray-200" />
          <div className="h-4 w-28 rounded bg-gray-200" />

          <div className="hidden md:flex items-center gap-4 ml-4">
            <div className="h-3 w-16 rounded bg-gray-200" />
            <div className="h-3 w-16 rounded bg-gray-200" />
            <div className="h-3 w-20 rounded bg-gray-200" />
            <div className="h-3 w-14 rounded bg-gray-200" />
          </div>
        </div>

        {/* Right: search/action/avatar placeholders */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:block h-9 w-32 rounded-md bg-gray-200" />
          <div className="h-9 w-9 rounded-md bg-gray-200" />
          <div className="h-9 w-9 rounded-md bg-gray-200" />
          <div className="h-9 w-9 rounded-full bg-gray-200" />
        </div>
      </div>
    </div>
  );
};

export default NavbarSkeleton;
