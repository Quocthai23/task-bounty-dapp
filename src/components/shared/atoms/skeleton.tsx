import * as React from 'react';

import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('animate-pulse rounded bg-neutral-200', className)}
      {...props}
    />
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-col space-y-3 p-4 rounded-xl border border-neutral-100 bg-white">
      <Skeleton className="h-[125px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
      <div className="flex justify-between mt-4 pt-4 border-t border-neutral-100">
        <Skeleton className="h-6 w-[80px]" />
        <Skeleton className="h-6 w-[60px]" />
      </div>
    </div>
  );
}

export { Skeleton, SkeletonCard };

