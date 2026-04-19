'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Avatar } from '@/components/Avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from "sonner"

interface CommentListProps {
  postId: string
  comments: any[]
  setComments: (callback: (prev: any[]) => any[]) => void
  currentUser: any
  onCommentAdded: () => void
  onCommentDeleted: () => void
}

export function CommentList({ postId, comments, setComments, currentUser, onCommentAdded, onCommentDeleted }: CommentListProps) {
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setIsSubmitting(true)
    
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newComment.trim() })
    })

    if (res.ok) {
      const data = await res.json()
      setComments(prev => [...prev, data])
      setNewComment('')
      onCommentAdded()
      toast.success('Comment posted')
    } else {
      const err = await res.json()
      toast.error(err.error || 'Failed to post comment')
    }
    setIsSubmitting(false)
  }

  const handleDeleteComment = async (commentId: string) => {
    const res = await fetch(`/api/posts/${postId}/comments/${commentId}`, { method: 'DELETE' })
    if (res.ok) {
      setComments(prev => prev.filter(c => c.id !== commentId))
      onCommentDeleted()
      toast.success('Comment deleted')
    } else {
      toast.error('Failed to delete comment')
    }
  }

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d`
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div>
      {currentUser ? (
        <form onSubmit={handleCreateComment} className="mb-8 glass-card p-5 rounded-2xl flex gap-4 items-start">
          <Avatar url={currentUser.avatar_url} size="sm" className="hidden sm:block w-10 h-10 ring-2 ring-white shadow-sm" />
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              maxLength={500}
              className="resize-none min-h-[80px] rounded-xl bg-white/60 border-gray-200/80 focus:bg-white focus:border-indigo-300 text-sm"
            />
            <div className="flex justify-between items-center">
              <span className={`text-xs font-medium ${newComment.length >= 450 ? 'text-amber-500' : 'text-gray-300'}`}>
                {newComment.length}/500
              </span>
              <Button 
                type="submit" 
                disabled={!newComment.trim() || isSubmitting} 
                className="rounded-2xl px-6 gradient-primary text-white font-bold text-sm border-0 shadow-lg shadow-indigo-200/50 hover:opacity-90 transition-all"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Replying...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    Reply
                  </span>
                )}
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-6 glass-card text-center rounded-2xl">
          <p className="text-gray-500 mb-2">Join the conversation</p>
          <Link href="/login" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
            Log in to comment →
          </Link>
        </div>
      )}

      <div className="space-y-3 stagger-children">
        {comments.map(comment => (
          <div key={comment.id} className="flex gap-3 group">
            <Link href={`/profile/${comment.author.id}`} className="flex-shrink-0 mt-1">
              <Avatar url={comment.author.avatar_url} size="sm" className="w-9 h-9 ring-2 ring-white shadow-sm" />
            </Link>
            <div className="glass-card p-4 rounded-2xl rounded-tl-lg flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Link href={`/profile/${comment.author.id}`} className="font-bold text-gray-900 hover:text-indigo-600 transition-colors text-sm">
                    {comment.author.first_name ? `${comment.author.first_name} ${comment.author.last_name || ''}` : comment.author.username}
                  </Link>
                  <span className="text-xs text-gray-400 font-medium">{timeAgo(comment.created_at)}</span>
                </div>
                {currentUser?.id === comment.author.id && (
                  <button 
                    onClick={() => handleDeleteComment(comment.id)} 
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                )}
              </div>
              <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{comment.content}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <div className="text-center py-12 glass-card rounded-2xl">
            <div className="text-3xl mb-3">💬</div>
            <p className="text-gray-500 font-medium text-sm">No comments yet. Be the first!</p>
          </div>
        )}
      </div>
    </div>
  )
}
