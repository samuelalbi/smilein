// components/SkeletonLoading.tsx
import React from 'react';

interface SkeletonProps {
    className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
    return (
        <div className={`relative overflow-hidden bg-gray-200 dark:bg-gray-700 rounded ${className}`}>
            {/* Wave animation overlay */}
            <div className="absolute inset-0">
                <div className="animate-wave-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
        </div>
    );
};

export const CardSkeleton: React.FC = () => {
    return (
        <div className="rounded-sm border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-7 w-16 mb-2" />
                    <Skeleton className="h-9 w-20" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>
        </div>
    );
};

export const ChartSkeleton: React.FC = () => {
    return (
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-5">
            <div className="mb-3 justify-between gap-4 sm:flex">
                <div>
                    <Skeleton className="h-7 w-40 mb-3" />
                    <Skeleton className="h-5 w-24" />
                </div>
            </div>

            <div>
                <div className="flex h-[320px] items-end">
                    <Skeleton className="h-full w-full" />
                </div>
            </div>
        </div>
    );
};

export const TableSkeleton: React.FC = () => {
    return (
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-5">
            <Skeleton className="h-7 w-40 mb-6" />

            <div className="flex flex-col gap-5.5">
                {[...Array(5)].map((_, index) => (
                    <div key={index} className="flex flex-wrap items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex flex-1 flex-col gap-1">
                            <Skeleton className="h-4 w-full max-w-sm" />
                            <Skeleton className="h-3 w-full max-w-xs" />
                        </div>
                        <Skeleton className="h-7 w-16" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default {
    CardSkeleton,
    ChartSkeleton,
    TableSkeleton
};