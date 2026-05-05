import Link from 'next/link'
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
  const [showHeartAnim, setShowHeartAnim] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [translatedText, setTranslatedText] = useState<string | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)

  const handleTranslate = async () => {
    if (translatedText) {
      setTranslatedText(null)
      return
    }

    setIsTranslating(true)
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: post.content, source: "en", target: "hi" }),
      })
      const data = await response.json()
      if (data.translated) {
        setTranslatedText(data.translated)
      }
    } catch (error) {
      console.error("Translation failed:", error)
    } finally {
      setIsTranslating(false)
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(post.id)
      setShowDeleteConfirm(false)
    }
  }

  const handleLike = async () => {
    if (isLiking || !currentUser) return
    setIsLiking(true)
    
    if (!liked) {
      setShowHeartAnim(true)
      setTimeout(() => setShowHeartAnim(false), 600)
    }

    setLiked(!liked)
    setLikesCount(liked ? Math.max(0, likesCount - 1) : likesCount + 1)

    const method = liked ? 'DELETE' : 'POST'
    const res = await fetch(`/api/posts/${post.id}/like`, { method })
    if (!res.ok) {
      setLiked(liked)
      setLikesCount(likesCount)
    }
    setIsLiking(false)
  }

  const handleDoubleClickLike = async () => {
    if (!currentUser || liked) return
    setShowHeartAnim(true)
    setTimeout(() => setShowHeartAnim(false), 600)
    setLiked(true)
    setLikesCount(likesCount + 1)
    
    const res = await fetch(`/api/posts/${post.id}/like`, { method: 'POST' })
    if (!res.ok) {
      setLiked(false)
      setLikesCount(likesCount)
    }
  }

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden p-5 mb-3 group/card" onDoubleClick={handleDoubleClickLike}>
      {/* Author Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.author.id}`} className="relative">
            <Avatar url={post.author.avatar_url} size="sm" className="w-10 h-10 ring-2 ring-white shadow-sm" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white"></div>
          </Link>
          <div>
            <Link href={`/profile/${post.author.id}`} className="font-bold text-gray-900 hover:text-teal-600 transition-colors text-sm">
              {displayName}
            </Link>
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <span>@{post.author.username}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span>{timeAgo(post.created_at)}</span>
            </p>
          </div>
        </div>
        
        {isOwner && (
          <div className="relative">
            <button 
              onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 transition-all opacity-0 group-hover/card:opacity-100"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
            {showDeleteConfirm && (
              <div className="absolute right-0 top-full mt-1 glass-card rounded-xl py-1 w-36 shadow-xl animate-scale-in z-10">
                <button 
                  onClick={handleDelete} 
                  className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 font-medium"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Delete post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-[15px]">
          {translatedText || post.content}
        </p>
        {post.content && (
          <button 
            onClick={handleTranslate}
            disabled={isTranslating}
            className="text-xs text-teal-600 hover:text-teal-700 font-medium mt-1 mb-2 transition-colors flex items-center gap-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 8 6 6" />
              <path d="m4 14 6-6 2-3" />
              <path d="M2 5h12" />
              <path d="M7 2h1" />
              <path d="m22 22-5-10-5 10" />
              <path d="M14 18h6" />
            </svg>
            {isTranslating ? 'Translating...' : (translatedText ? 'Show original' : 'Translate to Hindi')}
          </button>
        )}
        {post.image_url && (
          <div className="mt-3 w-full rounded-xl overflow-hidden relative cursor-pointer">
            <img
              src={post.image_url}
              alt="Post content"
              className="w-full object-cover max-h-[500px] hover:scale-[1.02] transition-transform duration-500"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            {/* Double-click heart overlay */}
            {showHeartAnim && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-6xl animate-heart-beat drop-shadow-lg">❤️</span>
              </div>
            )}
          </div>
        )}
        {/* Heart animation for text-only posts */}
        {showHeartAnim && !post.image_url && (
          <div className="flex justify-center py-2 pointer-events-none">
            <span className="text-4xl animate-heart-beat">❤️</span>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-1 pt-3 border-t border-gray-100/60">
        <button 
          onClick={handleLike} 
          disabled={!currentUser || isLiking}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
            liked 
              ? 'text-rose-500 bg-rose-50/80 hover:bg-rose-100/80' 
              : 'text-gray-500 hover:text-rose-500 hover:bg-rose-50/60'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${liked ? 'scale-110' : ''}`}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span>{likesCount}</span>
        </button>

        <Link 
          href={`/posts/${post.id}`} 
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:text-teal-600 hover:bg-teal-50/60 transition-all duration-200"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>{post.comment_count}</span>
        </Link>

        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:text-emerald-600 hover:bg-emerald-50/60 transition-all duration-200 ml-auto">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </button>
      </div>
    </div>
  )
}
