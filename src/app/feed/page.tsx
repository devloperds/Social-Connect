'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { PostCard } from '@/components/PostCard'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import Image from 'next/image'
import { toast } from 'sonner'
import { PostSkeleton } from '@/components/PostSkeleton'
import { Navbar } from '@/components/Navbar'

export default function FeedPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [likedPosts, setLikedPosts] = useState<string[]>([])
  
  // Create Post state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const observer = useRef<IntersectionObserver | null>(null)
  const lastPostElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) setPage(p => p + 1)
    })
    if (node) observer.current.observe(node)
  }, [loading, hasMore])

  useEffect(() => {
    Promise.all([
      fetch('/api/users/me').then(res => res.ok ? res.json() : null),
      fetch('/api/users/me/likes').then(res => res.ok ? res.json() : [])
    ]).then(([user, likes]) => {
      setCurrentUser(user)
      setLikedPosts(Array.isArray(likes) ? likes : [])
    })
  }, [])

  useEffect(() => {
    setLoading(true)
    fetch(`/api/feed?page=${page}&limit=10`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) {
          setHasMore(false)
        } else {
          setPosts(prev => {
            const newPosts = data.filter((p: any) => !prev.find(x => x.id === p.id))
            return [...prev, ...newPosts]
          })
        }
        setLoading(false)
      })
      .catch(() => {
        setHasMore(false)
        setLoading(false)
        toast.error("Failed to load feed.")
      })
  }, [page])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      setPreview(URL.createObjectURL(selected))
    }
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData()
    if (content) formData.append('content', content)
    if (file) formData.append('file', file)

    const res = await fetch('/api/posts', { method: 'POST', body: formData })
      if (res.ok) {
        const newPost = await res.json()
        setPosts([newPost, ...posts])
        setDialogOpen(false)
        setContent('')
        setFile(null)
        setPreview(null)
        toast.success("Post created successfully!")
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to post')
      }
    setIsSubmitting(false)
  }

  const handleDeletePost = async (id: string) => {
    const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setPosts(prev => prev.filter(p => p.id !== id))
      toast.success("Post deleted")
    } else {
      toast.error('Failed to delete post.')
    }
  }

  if (loading && posts.length === 0) return (
    <>
      <Navbar user={currentUser} />
      <div className="max-w-2xl mx-auto py-10 px-4 min-h-screen">
         <PostSkeleton />
         <PostSkeleton />
         <PostSkeleton />
      </div>
    </>
  )

  return (
    <>
    <Navbar user={currentUser} />
    <div className="max-w-2xl mx-auto py-10 px-4 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Your Feed</h1>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 shadow-md">
              Create Post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Create a new post</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePost} className="space-y-4 mt-4">
              <div className="relative">
                <Textarea 
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  maxLength={280}
                  className="min-h-[120px] resize-none text-lg p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                />
                <span className={`absolute bottom-3 right-3 text-xs font-semibold ${content.length >= 280 ? 'text-red-500' : 'text-gray-400'}`}>
                  {content.length}/280
                </span>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-4">
                   <label className="cursor-pointer text-blue-600 font-medium hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg flex items-center justify-center transition-colors">
                     📷 Add Photo
                     <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleFileChange} />
                   </label>
                </div>
                
                <Button type="submit" disabled={isSubmitting || (!content && !file)} className="rounded-full px-6 bg-gray-900 hover:bg-black text-white">
                  {isSubmitting ? 'Posting...' : 'Post'}
                </Button>
              </div>

              {preview && (
                <div className="relative mt-4 w-full rounded-xl overflow-hidden border">
                  <img src={preview} alt="Preview" className="w-full object-cover max-h-48" />
                  <button type="button" onClick={() => { setFile(null); setPreview(null); }} className="absolute top-2 right-2 bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black">
                    ✕
                  </button>
                </div>
              )}
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {posts.map((post, index) => {
          const hasLiked = likedPosts.includes(post.id)
          if (posts.length === index + 1) {
            return <div ref={lastPostElementRef} key={post.id}><PostCard post={post} currentUser={currentUser} onDelete={handleDeletePost} hasLiked={hasLiked} /></div>
          }
          return <PostCard key={post.id} post={post} currentUser={currentUser} onDelete={handleDeletePost} hasLiked={hasLiked} />
        })}
      </div>
      
      {loading && <div className="text-center py-6 text-gray-500 animate-pulse font-medium">Loading amazing posts...</div>}
      {!hasMore && posts.length > 0 && <div className="text-center py-10 text-gray-400 border-t mt-4 border-dashed">You have reached the end of the line!</div>}
      {!loading && posts.length === 0 && <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-500">Your feed is completely empty. Start posting!</div>}
    </div>
    </>
  )
}
