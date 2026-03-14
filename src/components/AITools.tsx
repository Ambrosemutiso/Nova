'use client';

import { motion } from 'framer-motion';

export default function NovaXmaxAISuite() {

  const features = [
    {
      title: 'AI Ad Creator',
      text: 'Generate high-quality product images, promotional banners, and short video ads automatically. Our AI transforms simple product photos into professional marketing creatives optimized for marketplaces and social media.',
    },
    {
      title: 'Smart Product Suggestions',
      text: 'The AI continuously analyzes market trends, customer behavior, and seasonal demand to recommend products that are likely to sell well in your region and beyond.',
    },
    {
      title: 'Sales Prediction',
      text: 'Our predictive AI forecasts potential product performance using demand signals, pricing data, and market competition to help sellers make smarter stocking decisions.',
    },
    {
      title: 'Market Insights',
      text: 'Gain real-time insights into trending categories, popular search terms, and buyer demand across the NovaXmax marketplace.',
    },
    {
      title: 'Auto Product Descriptions',
      text: 'Generate professional SEO-optimized product descriptions instantly, designed to increase visibility and conversion rates.',
    },
    {
      title: 'Growth Optimization',
      text: 'Our AI continuously analyzes your store performance and suggests pricing strategies, promotions, and inventory improvements.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">

      <div className="max-w-6xl mx-auto px-4 pt-28 pb-10">

        {/* HERO SECTION */}
        <section className="relative bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 text-white py-24 px-6 text-center rounded-2xl shadow-lg">

          <div className="max-w-4xl mx-auto">

            <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">
              NovaXmax <span className="text-white">AI Seller Tools</span>
            </h1>

            <p className="text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
              Grow your business faster with intelligent tools designed to help
              sellers create professional ads, discover trending products,
              predict demand, and make smarter business decisions.
            </p>

          </div>

        </section>


        {/* INTRO SECTION */}
        <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">

          <motion.img
            src="/AI-tools.jpg"
            alt="AI Tools"
            className="rounded-2xl shadow-md w-full object-cover"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          />

          <div>

            <h2 className="text-3xl font-bold text-orange-600 mb-4">
              Intelligent Tools for Modern Sellers
            </h2>

            <p className="text-gray-700 leading-relaxed mb-4">
              NovaXmax integrates powerful artificial intelligence technology
              directly into the seller platform, enabling businesses of all
              sizes to access tools previously available only to large
              e-commerce companies.
            </p>

            <p className="text-gray-700 leading-relaxed">
              With automated marketing content generation, predictive demand
              analysis, and intelligent product insights, our AI helps sellers
              make data-driven decisions that increase sales and reduce risk.
            </p>

          </div>

        </section>


        {/* FEATURES GRID */}
        <section className="bg-gray-50 py-16 px-6 rounded-2xl">

          <div className="max-w-6xl mx-auto text-center">

            <h2 className="text-3xl font-bold text-orange-600 mb-10">
              What Our AI Can Do
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">

              {features.map((feature, i) => (

                <motion.div
                  key={i}
                  className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >

                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.text}
                  </p>

                </motion.div>

              ))}

            </div>

          </div>

        </section>


        {/* BENEFITS SECTION */}
        <section className="max-w-5xl mx-auto px-6 py-16 text-center">

          <h2 className="text-3xl font-bold text-orange-600 mb-6">
            Built to Help Sellers Scale Faster
          </h2>

          <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">

            Our AI tools reduce the time spent on marketing, research,
            and product optimization. Sellers can focus on growing their
            businesses while NovaXmax handles the heavy data analysis
            and creative generation.

          </p>

        </section>


        {/* CTA */}
        <section className="bg-orange-500 text-white py-16 px-6 text-center rounded-2xl shadow-lg">

          <div className="max-w-4xl mx-auto">

            <h2 className="text-3xl font-bold mb-4">
              Start Using AI to Grow Your Store
            </h2>

            <p className="text-lg mb-8">
              Join thousands of sellers using NovaXmax AI tools to
              create better ads, discover profitable products,
              and grow faster in the digital marketplace.
            </p>

            <a
              href="/desc/sell-on-novaxmax"
              className="inline-block bg-white text-orange-600 font-semibold py-3 px-8 rounded-full shadow hover:bg-gray-100 transition"
            >
              Start Selling with AI
            </a>

          </div>

        </section>

      </div>

    </div>
  );
}