'use client';

export default function PayableAccountsWidget() {
  const completed = 14;
  const total = 16;
  const percentage = (completed / total) * 100;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Payable Accounts</h3>
      <p className="text-sm text-gray-600 mb-4">
        Keep your accounts up to date to avoid issues.
      </p>
      
      {/* Progress */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            {completed} OUT OF {total}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(percentage)}%
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
