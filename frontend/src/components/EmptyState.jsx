const EmptyState = ({ title, subtitle, icon = '📋' }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-gray-600 font-semibold text-lg mb-1">{title}</h3>
    <p className="text-gray-400 text-sm max-w-xs">{subtitle}</p>
  </div>
);

export default EmptyState;