const Spinner = ({ text = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-3"></div>
    <p className="text-gray-400 text-sm">{text}</p>
  </div>
);

export default Spinner;