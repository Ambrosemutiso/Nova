// app/Novaxpress/dashboard/admin/users/page.tsx
export default function UsersPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Manage Users</h2>
      <div className="bg-white p-4 rounded-lg shadow">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-orange-500 text-white">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-2">Jane Doe</td>
              <td className="p-2">jane@example.com</td>
              <td className="p-2">User</td>
              <td className="p-2">
                <button className="bg-orange-500 text-white px-3 py-1 rounded">
                  Block
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
