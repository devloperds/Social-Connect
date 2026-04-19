'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { PostCard } from '@/components/PostCard'
import { CommentList } from '@/components/CommentList'
import { PostSkeleton } from '@/components/PostSkeleton'
import { Navbar } from '@/components/Navbar'

export default function SinglePostPage() {
  const { postId } = useParams()
  const router = useRouter()
  
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [likedPosts, setLikedPosts] = useState<string[]>([])

  useEffect(() => {
    Promise.all([
      fetch(`/api/posts/${postId}`).then(res => res.ok ? res.json() : null),
      fetch(`/api/posts/${postId}/comments`).then(res => res.ok ? res.json() : []),
      fetch('/api/users/me').then(res => res.ok ? res.json() : null),
      fetch('/api/users/me/likes').then(res => res.ok ? res.json() : [])
    ]).then(([postData, commentsData, userData, likesData]) => {
      setPost(postData)
      setComments(Array.isArray(commentsData) ? commentsData : [])
      setCurrentUser(userData)
      setLikedPosts(Array.isArray(likesData) ? likesData : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [postId])

  const handleDeletePost = async (id: string) => {
    const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    if (res.ok) router.push('/feed')
  }

  if (loading) return (
    <>
      <Navbar user={currentUser} />
      <div className="max-w-2xl mx-auto py-10 px-4 min-h-screen">
        <PostSkeleton />
      </div>
    </>
  )

  if (!post) return (
    <>
      <Navbar user={currentUser} />
      <div className="text-center py-20 text-red-500 font-medium">Post not found</div>
    </>
  )

  return (
    <>
      <Navbar user={currentUser} />
      <div className="max-w-2xl mx-auto py-8 px-4 min-h-screen">
        <Link href="/feed" className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-6 font-semibold text-sm transition-colors group">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Feed
        </Link>
        
        <div className="animate-fade-in-up">
          <PostCard 
            post={post} 
            currentUser={currentUser} 
            hasLiked={likedPosts.includes(post.id)} 
            onDelete={handleDeletePost} 
          />
        </div>

        <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-xl font-extrabold text-gray-900">Comments</h3>
            <span className="gradient-primary text-white px-3 py-0.5 rounded-full text-xs font-bold shadow-sm">{post.comment_count}</span>
          </div>
          <CommentList 
            postId={postId as string} 
            comments={comments} 
            setComments={setComments} 
            currentUser={currentUser} 
            onCommentAdded={() => setPost((prev: any) => ({ ...prev, comment_count: prev.comment_count + 1 }))}
            onCommentDeleted={() => setPost((prev: any) => ({ ...prev, comment_count: Math.max(0, prev.comment_count - 1) }))}
          />
        </div>
      </div>
    </>
  )
}
