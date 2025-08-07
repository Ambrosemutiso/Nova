'use client';

import { toast } from 'react-toastify';
import { withdrawalRequests } from '@/lib/mockData';

export default function WithdrawalRequests() {
  const handleApprove = (id: string) => {
    toast.success(`Approved withdrawal ID ${id}`);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Pending Withdrawal Requests</h2>
      <ul className="space-y-4">
        {withdrawalRequests.map(request => (
          <li key={request.id} className="bg-white p-4 shadow rounded-md flex justify-between items-center">
            <div>
              <p><strong>User:</strong> {request.user}</p>
              <p><strong>Amount:</strong> KES {request.amount}</p>
            </div>
            <button
              onClick={() => handleApprove(request.id)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Approve
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
