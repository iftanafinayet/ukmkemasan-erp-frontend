import React from 'react';

export default function MobilePageSkeleton({ activeMenu }) {
  if (activeMenu === 'dashboard') {
    return (
      <div className="p-4 space-y-8 animate-pulse pt-6">
        {/* Hero Skeleton */}
        <div className="w-full h-48 bg-slate-100 rounded-3xl"></div>
        
        {/* Category/Stats section */}
        <div className="space-y-3">
          <div className="w-1/3 h-5 bg-slate-100 rounded-lg mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-slate-100 rounded-2xl"></div>
            <div className="h-24 bg-slate-100 rounded-2xl"></div>
          </div>
        </div>

        {/* Carousel Skeleton */}
        <div className="space-y-3">
          <div className="w-1/2 h-5 bg-slate-100 rounded-lg mb-4"></div>
          <div className="flex gap-4 overflow-hidden">
            <div className="w-3/4 h-32 bg-slate-100 rounded-2xl shrink-0"></div>
            <div className="w-1/4 h-32 bg-slate-100 rounded-2xl shrink-0"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (activeMenu === 'catalog') {
    return (
      <div className="p-4 space-y-6 animate-pulse pt-6">
        {/* Filter Pills */}
        <div className="flex gap-3 overflow-hidden border-b border-slate-100 pb-4">
           <div className="w-24 h-8 bg-slate-100 rounded-full shrink-0"></div>
           <div className="w-20 h-8 bg-slate-100 rounded-full shrink-0"></div>
           <div className="w-28 h-8 bg-slate-100 rounded-full shrink-0"></div>
        </div>
        
        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
           {[...Array(6)].map((_, i) => (
             <div key={i} className="space-y-3">
                <div className="w-full aspect-square bg-slate-100 rounded-2xl"></div>
                <div className="w-3/4 h-4 bg-slate-100 rounded"></div>
                <div className="w-1/2 h-4 bg-slate-100 rounded"></div>
                <div className="w-full h-8 bg-slate-100 rounded mt-2"></div>
             </div>
           ))}
        </div>
      </div>
    );
  }

  // Generic List (Orders, Cart)
  return (
    <div className="p-4 space-y-4 animate-pulse pt-6">
      {[...Array(5)].map((_, i) => (
         <div key={i} className="w-full h-32 bg-slate-100 rounded-2xl"></div>
      ))}
    </div>
  );
}
