import { Skeleton } from "@/components/ui/skeleton"

export function PostSkeleton() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden p-5 mb-3 space-y-4">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="h-10 w-10 rounded-full bg-gray-200/60" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[150px] rounded-lg bg-gray-200/60" />
          <Skeleton className="h-3 w-[100px] rounded-lg bg-gray-200/60" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-full rounded-lg bg-gray-200/60" />
        <Skeleton className="h-4 w-[85%] rounded-lg bg-gray-200/60" />
        <Skeleton className="h-4 w-[40%] rounded-lg bg-gray-200/60" />
      </div>
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100/60">
         <Skeleton className="h-8 w-20 rounded-xl bg-gray-200/60" />
         <Skeleton className="h-8 w-20 rounded-xl bg-gray-200/60" />
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 min-h-screen space-y-8">
      <div className="glass-card rounded-3xl overflow-hidden">
        <Skeleton className="h-40 w-full rounded-none bg-gray-200/60" />
        <div className="px-8 pb-8 -mt-16">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <Skeleton className="w-32 h-32 rounded-3xl bg-gray-200/60 ring-4 ring-white" />
            <div className="flex-1 space-y-4 w-full pt-6">
              <div className="flex justify-between w-full">
                <div className="space-y-2">
                   <Skeleton className="h-8 w-[200px] rounded-lg bg-gray-200/60" />
                   <Skeleton className="h-4 w-[120px] rounded-lg bg-gray-200/60" />
                </div>
                <Skeleton className="h-10 w-[120px] rounded-2xl bg-gray-200/60" />
              </div>
              <div className="flex gap-8 py-4">
                 <Skeleton className="h-12 w-16 rounded-lg bg-gray-200/60" />
                 <Skeleton className="h-12 w-16 rounded-lg bg-gray-200/60" />
                 <Skeleton className="h-12 w-16 rounded-lg bg-gray-200/60" />
              </div>
              <Skeleton className="h-14 w-full rounded-xl bg-gray-200/60" />
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-24 rounded-lg bg-gray-200/60" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <PostSkeleton />
           <PostSkeleton />
        </div>
      </div>
    </div>
  )
}
