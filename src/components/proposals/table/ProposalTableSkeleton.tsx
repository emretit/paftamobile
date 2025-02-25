
export const ProposalTableSkeleton = () => {
  return (
    <div className="w-full overflow-x-auto">
      <div className="animate-pulse space-y-4">
        <div className="h-16 bg-gray-100 rounded"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-50 rounded"></div>
        ))}
      </div>
    </div>
  );
};
