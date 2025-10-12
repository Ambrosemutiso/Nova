import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart3, Users } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: number | string | undefined;
  color?: 'orange' | 'green' | 'red' | 'yellow' | 'blue';
}

const colorMap = {
  orange: 'from-orange-500 to-orange-600',
  green: 'from-green-500 to-green-600',
  red: 'from-red-500 to-red-600',
  yellow: 'from-yellow-400 to-yellow-500',
  blue: 'from-blue-500 to-blue-600',
};

export function MetricCard({ label, value, color = 'orange' }: MetricCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -4 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120 }}
      className={`relative p-5 bg-gradient-to-br ${colorMap[color]} text-white rounded-2xl shadow-lg overflow-hidden group`}
    >
      {/* Glow Animation */}
      <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-all duration-500 bg-[radial-gradient(circle_at_top_left,white,transparent_60%)]"></div>

      {/* Card Content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="mb-2">
          {color === 'green' && <TrendingUp className="w-6 h-6" />}
          {color === 'red' && <TrendingDown className="w-6 h-6" />}
          {color === 'blue' && <BarChart3 className="w-6 h-6" />}
          {color === 'orange' && <Users className="w-6 h-6" />}
        </div>
        <h3 className="text-sm font-medium uppercase tracking-wide opacity-90">{label}</h3>
        <p className="text-3xl font-bold mt-1 drop-shadow-sm">{value ?? '--'}</p>
      </div>

      {/* Bottom Glow Line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/30 rounded-b-xl group-hover:bg-white/60 transition-all"></div>
    </motion.div>
  );
}
