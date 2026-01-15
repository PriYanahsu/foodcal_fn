import React from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          Welcome to FoodCal
        </h1>
        <p className="text-xl text-gray-600">
          Track your nutrition by scanning your food
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-4">📷</div>
            <h3 className="text-xl font-semibold mb-2">Scan Food</h3>
            <p className="text-gray-600 mb-4">
              Upload an image of your food to get instant nutrition information
            </p>
            <Link href={ROUTES.SCAN}>
              <Button variant="primary" className="w-full">
                Start Scanning
              </Button>
            </Link>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">View History</h3>
            <p className="text-gray-600 mb-4">
              Check your past food scans and nutrition tracking
            </p>
            <Link href={ROUTES.HISTORY}>
              <Button variant="secondary" className="w-full">
                View History
              </Button>
            </Link>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-4xl mb-4">👤</div>
            <h3 className="text-xl font-semibold mb-2">Your Profile</h3>
            <p className="text-gray-600 mb-4">
              Manage your profile and nutrition goals
            </p>
            <Link href={ROUTES.PROFILE}>
              <Button variant="outline" className="w-full">
                Go to Profile
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
