export default function LoadingSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-dark p-5 animate-pulse">
          <div className="h-5 bg-[#2a2a2a] rounded-lg w-3/4 mb-3" />
          <div className="h-3 bg-[#1e1e1e] rounded-lg w-full mb-2" />
          <div className="h-3 bg-[#1e1e1e] rounded-lg w-2/3 mb-4" />
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-[#1e1e1e] rounded-full" />
            <div className="h-6 w-16 bg-[#1e1e1e] rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
