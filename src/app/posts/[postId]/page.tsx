'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { PostCard } from '@/components/PostCard'
import { CommentList } from '@/components/CommentList'
import { PostSkeleton } from '@/components/PostSkeleton'

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
    <div className="max-w-2xl mx-auto py-10 px-4 min-h-screen">
      <PostSkeleton />
    </div>
  )
  if (!post) return <div className="text-center py-20 text-red-500 font-medium">Post not found</div>

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 min-h-screen">
      <Link href="/feed" className="text-blue-600 hover:underline mb-6 inline-block">← Back to Feed</Link>
      
      <PostCard 
        post={post} 
        currentUser={currentUser} 
        hasLiked={likedPosts.includes(post.id)} 
        onDelete={handleDeletePost} 
      />

      <h3 className="text-xl font-bold mb-6 mt-10 text-gray-900 border-b pb-4">Comments ({post.comment_count})</h3>
      <CommentList 
        postId={postId as string} 
        comments={comments} 
        setComments={setComments} 
        currentUser={currentUser} 
        onCommentAdded={() => setPost((prev: any) => ({ ...prev, comment_count: prev.comment_count + 1 }))}
        onCommentDeleted={() => setPost((prev: any) => ({ ...prev, comment_count: Math.max(0, prev.comment_count - 1) }))}
      />
    </div>
  )
}
