'use client';

export default function BiometricPrompt({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-80 text-center space-y-4">
        <h3 className="font-semibold">Confirm with Biometrics</h3>
        <p className="text-sm text-gray-500">
          Use fingerprint or Face ID
        </p>

        <button
          onClick={onSuccess}
          className="w-full bg-green-600 text-white rounded py-2"
        >
          Authenticate
        </button>

        <button
          onClick={onCancel}
          className="w-full border rounded py-2"
        >
          Use PIN instead
        </button>
      </div>
    </div>
  );
}
