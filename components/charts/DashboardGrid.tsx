import React from 'react';
import { motion as _motion } from 'framer-motion';
const motion = _motion as any;

interface DashboardGridProps {
  id: string;
  children: React.ReactNode;
  columns?: 'grid-cols-1 md:grid-cols-2' | 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' | 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  id,
  children,
  columns = 'grid-cols-1 md:grid-cols-2'
}) => {
  return (
    <motion.div
      id={`dashboard-bento-grid-${id}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`grid ${columns} gap-3 w-full`}
    >
      {React.Children.map(children, (child, index) => {
        if (!child) return null;
        return (
          <motion.div
            key={`${id}-item-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="w-full flex"
          >
            <div className="w-full flex flex-col h-full">
              {child}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default DashboardGrid;
