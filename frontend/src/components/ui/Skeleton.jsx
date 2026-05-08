import { cn } from '../../lib/utils';

function BaseSkeleton({ width = '100%', height = '1rem', rounded = 'rounded-xl', className = '' }) {
  return (
    <div
      className={cn('animate-pulse bg-slate-200', rounded, className)}
      style={{ width, height }}
    />
  );
}

export default BaseSkeleton;

export function TaskCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <BaseSkeleton width="10px" height="10px" rounded="rounded-full" className="mt-2" />
        <div className="flex-1 space-y-3">
          <BaseSkeleton height="1rem" />
          <BaseSkeleton width="75%" height="0.85rem" />
          <div className="flex gap-2">
            <BaseSkeleton width="72px" height="22px" />
            <BaseSkeleton width="56px" height="22px" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DocumentItemSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <BaseSkeleton width="40px" height="40px" rounded="rounded-2xl" />
      <div className="flex-1 space-y-2">
        <BaseSkeleton width="45%" height="1rem" />
        <BaseSkeleton width="70%" height="0.85rem" />
      </div>
      <BaseSkeleton width="72px" height="24px" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <BaseSkeleton key={index} height="112px" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <BaseSkeleton key={index} height="280px" />
        ))}
      </div>
    </div>
  );
}
