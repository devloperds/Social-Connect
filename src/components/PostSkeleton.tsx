import { Skeleton } from "@/components/ui/skeleton"

export function PostSkeleton() {
  return (
    <div className="bg-white border rounded-xl overflow-hidden shadow-sm p-4 mb-4 space-y-4">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-3 w-[100px]" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[85%]" />
        <Skeleton className="h-4 w-[40%]" />
      </div>
      <div className="flex items-center gap-6 mt-4 pt-3 border-t">
         <Skeleton className="h-4 w-12" />
         <Skeleton className="h-4 w-12" />
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 min-h-screen space-y-10">
      <div className="bg-white rounded-2xl shadow-sm border p-8 flex flex-col md:flex-row gap-8 items-start">
        <Skeleton className="w-32 h-32 rounded-full" />
        <div className="flex-1 space-y-4 w-full">
          <div className="flex justify-between w-full">
            <div className="space-y-2">
               <Skeleton className="h-8 w-[200px]" />
               <Skeleton className="h-4 w-[120px]" />
            </div>
            <Skeleton className="h-10 w-[120px] rounded-full" />
          </div>
          <div className="flex gap-6 py-4">
             <Skeleton className="h-4 w-16" />
             <Skeleton className="h-4 w-16" />
             <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-14 w-full" />
        </div>
      </div>
      <div className="space-y-6">
        <Skeleton className="h-6 w-24 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <PostSkeleton />
           <PostSkeleton />
        </div>
      </div>
    </div>
  )
}
