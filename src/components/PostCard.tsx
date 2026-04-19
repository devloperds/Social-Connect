import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Avatar } from './Avatar'

interface PostCardProps {
  post: {
    id: string
    content: string
    image_url?: string
    like_count: number
    comment_count: number
    created_at: string
    author: {
      id: string
      username: string
      first_name?: string
      last_name?: string
      avatar_url?: string
    }
  }
  currentUser?: { id: string }
  onDelete?: (id: string) => void
  hasLiked?: boolean
}

export function PostCard({ post, currentUser, onDelete, hasLiked = false }: PostCardProps) {
  const displayName = post.author.first_name ? `${post.author.first_name} ${post.author.last_name || ''}` : post.author.username
  const isOwner = currentUser?.id === post.author.id

  const [liked, setLiked] = useState(hasLiked)
  const [likesCount, setLikesCount] = useState(post.like_count)
  const [isLiking, setIsLiking] = useState(false)

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this post?") && onDelete) {
      onDelete(post.id)
    }
  }

  const handleLike = async () => {
    if (isLiking || !currentUser) return
    setIsLiking(true)
    
    // Optimistic UI updates
    setLiked(!liked)
    setLikesCount(liked ? Math.max(0, likesCount - 1) : likesCount + 1)

    const method = liked ? 'DELETE' : 'POST'
    const res = await fetch(`/api/posts/${post.id}/like`, { method })
    if (!res.ok) {
      // Revert optimistic actions gracefully
      setLiked(liked)
      setLikesCount(likesCount)
    }
    setIsLiking(false)
  }

  return (
    <div className="bg-white border rounded-xl overflow-hidden shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.author.id}`}>
            <Avatar url={post.author.avatar_url} size="sm" />
          </Link>
          <div>
            <Link href={`/profile/${post.author.id}`} className="font-semibold text-gray-900 hover:underline">
              {displayName}
            </Link>
            <p className="text-xs text-gray-500">@{post.author.username} • {new Date(post.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        {isOwner && (
          <button onClick={handleDelete} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
        )}
      </div>

      <div className="mb-4">
        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{post.content}</p>
        {post.image_url && (
          <div className="mt-3 w-full rounded-lg overflow-hidden border">
            <img
              src={post.image_url}
              alt="Post content"
              className="w-full object-cover max-h-[500px]"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-6 text-gray-500 text-sm border-t pt-3">
        <button 
          onClick={handleLike} 
          disabled={!currentUser || isLiking}
          className={`flex items-center gap-1 transition-colors ${liked ? 'text-red-500 font-medium' : 'hover:text-blue-600'}`}
        >
          <span>{liked ? '❤️' : '🤍'}</span> {likesCount}
        </button>
        <Link href={`/posts/${post.id}`} className="flex items-center gap-1 hover:text-blue-600 transition-colors">
          <span>💬</span> {post.comment_count}
        </Link>
      </div>
    </div>
  )
}
