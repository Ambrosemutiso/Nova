'use client'

export default function ContactUs() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Contact Us</h1>
      <p className="text-gray-700 leading-relaxed">
        Have questions, suggestions, or need help? We’re here for you!
      </p>
      <ul className="list-disc ml-5 mt-4 space-y-2 text-gray-700">
        <li><strong>Email:</strong> support@novaxpress.co.ke</li>
        <li><strong>Phone:</strong> +254 712 345 678</li>
        <li><strong>Live Chat:</strong> Available Mon–Sat, 9am – 6pm</li>
        <li><strong>Location:</strong> NovaXpress HQ, Nairobi, Kenya</li>
      </ul>
    </div>
  )
}
