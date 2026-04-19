'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { PostCard } from '@/components/PostCard'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
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
    <div className="max-w-2xl mx-auto py-8 px-4 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Your Feed</h1>
          <p className="text-gray-500 text-sm mt-1">See what your community is sharing</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button className="gradient-primary text-white rounded-2xl px-6 shadow-lg shadow-indigo-200/50 hover:shadow-indigo-300/60 hover:opacity-90 transition-all font-bold text-sm h-11 border-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-extrabold">Create a new post</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePost} className="space-y-4 mt-4">
              <div className="relative">
                <Textarea 
                  placeholder="What's on your mind? ✨"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  maxLength={280}
                  className="min-h-[120px] resize-none text-base p-4 bg-white/60 border-gray-200/80 focus:bg-white focus:border-indigo-300 text-gray-900 placeholder:text-gray-400 rounded-xl"
                />
                <span className={`absolute bottom-3 right-3 text-xs font-bold ${content.length >= 260 ? content.length >= 280 ? 'text-red-500' : 'text-amber-500' : 'text-gray-300'}`}>
                  {content.length}/280
                </span>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-3">
                   <label className="cursor-pointer text-indigo-600 font-semibold hover:text-indigo-700 bg-indigo-50/80 px-4 py-2.5 rounded-xl flex items-center justify-center transition-all hover:bg-indigo-100/80 text-sm">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                       <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                       <circle cx="8.5" cy="8.5" r="1.5" />
                       <polyline points="21 15 16 10 5 21" />
                     </svg>
                     Add Photo
                     <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleFileChange} />
                   </label>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting || (!content && !file)} 
                  className="rounded-2xl px-6 gradient-primary text-white font-bold text-sm shadow-lg shadow-indigo-200/50 border-0 hover:opacity-90 transition-all"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Posting...
                    </span>
                  ) : 'Post'}
                </Button>
              </div>

              {preview && (
                <div className="relative mt-4 w-full rounded-xl overflow-hidden border border-gray-200/60">
                  <img src={preview} alt="Preview" className="w-full object-cover max-h-48" />
                  <button 
                    type="button" 
                    onClick={() => { setFile(null); setPreview(null); }} 
                    className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Posts */}
      <div className="space-y-4 stagger-children">
        {posts.map((post, index) => {
          const hasLiked = likedPosts.includes(post.id)
          if (posts.length === index + 1) {
            return <div ref={lastPostElementRef} key={post.id}><PostCard post={post} currentUser={currentUser} onDelete={handleDeletePost} hasLiked={hasLiked} /></div>
          }
          return <PostCard key={post.id} post={post} currentUser={currentUser} onDelete={handleDeletePost} hasLiked={hasLiked} />
        })}
      </div>
      
      {loading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-3 text-gray-500 font-medium bg-white/60 px-6 py-3 rounded-2xl border border-white/60">
            <svg className="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            Loading posts...
          </div>
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-center py-12 mt-4">
          <div className="inline-flex flex-col items-center gap-2 text-gray-400">
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <span className="text-sm font-medium">You've seen everything ✨</span>
          </div>
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center py-20 glass-card rounded-3xl animate-fade-in-up">
          <div className="text-5xl mb-4">🌟</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Your feed is empty</h3>
          <p className="text-gray-500">Start by creating your first post!</p>
        </div>
      )}
    </div>
    </>
  )
}
