import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center">
        <Scissors className="h-16 w-16 text-pink-600 animate-bounce" />
        <h1 className="mt-6 text-3xl font-extrabold text-gray-900 sm:text-4xl">
          ページが見つかりません
        </h1>
        <p className="mt-2 text-base text-gray-500 text-center">
          お探しのページは存在しないか、移動された可能性があります。
        </p>
        <div className="mt-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
          >
            ダッシュボードに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
