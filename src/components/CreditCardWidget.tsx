'use client';

import { CreditCard } from '@/types/financial';

const mockCard: CreditCard = {
  number: '4328 4388 4161 8183',
  holder: 'Lev Manzhai',
  expiry: '12/31',
  type: 'mastercard'
};

export default function CreditCardWidget() {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-black text-white border-gray-800 rounded-2xl p-4 relative shadow-2xl border h-46 w-full max-w-sm mx-auto sm:h-45 sm:max-w-sm md:h-45 md:max-w-md lg:h-48 lg:max-w-md">
      {/* Chip */}
      <div className="absolute top-4 left-4 w-8 h-6 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-sm shadow-inner">
        <div className="w-full h-full bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-sm flex items-center justify-center">
          <div className="w-5 h-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-sm shadow-inner"></div>
        </div>
      </div>

      {/* VISA Logo */}
      <div className="absolute top-4 right-4">
        <div className="w-12 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg">
          <div className="font-bold text-sm text-black">VISA</div>
        </div>
      </div>

      {/* Card Number */}
      <div className="mb-6 mt-12">
        <p className="text-lg font-mono tracking-wider font-bold whitespace-nowrap">
          {mockCard.number}
        </p>
      </div>

      {/* Cardholder Info */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-xs mb-1 uppercase tracking-wider text-gray-400">Cardholder Name</p>
          <p className="text-lg font-bold">{mockCard.holder}</p>
        </div>

        {/* Expiry */}
        <div className="text-right">
          <p className="text-xs mb-1 uppercase tracking-wider text-gray-400">Expires</p>
          <p className="text-lg font-bold">{mockCard.expiry}</p>
        </div>
      </div>

      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white opacity-5 rounded-2xl"></div>
    </div>
  );
}
