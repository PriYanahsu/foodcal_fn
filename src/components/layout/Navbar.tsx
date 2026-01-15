import React from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href={ROUTES.HOME} className="flex items-center px-2 py-2 text-xl font-bold text-blue-600">
              FoodCal
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href={ROUTES.SCAN}
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
            >
              Scan
            </Link>
            <Link
              href={ROUTES.HISTORY}
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
            >
              History
            </Link>
            <Link
              href={ROUTES.PROFILE}
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
            >
              Profile
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
