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
    if (!confirm('Are you sure you want to delete this comment?')) return
    
    const res = await fetch(`/api/posts/${postId}/comments/${commentId}`, { method: 'DELETE' })
    if (res.ok) {
      setComments(prev => prev.filter(c => c.id !== commentId))
      onCommentDeleted()
      toast.success('Comment deleted')
    } else {
      toast.error('Failed to delete comment')
    }
  }

  return (
    <div className="mt-10">
      {currentUser ? (
        <form onSubmit={handleCreateComment} className="mb-10 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-start">
          <Avatar url={currentUser.avatar_url} size="sm" className="hidden sm:block" />
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              maxLength={500}
              className="resize-none min-h-[80px]"
            />
            <div className="flex justify-end items-center">
              <Button type="submit" disabled={!newComment.trim() || isSubmitting} className="rounded-full px-6 bg-blue-600 hover:bg-blue-700 text-white">
                {isSubmitting ? 'Posting...' : 'Reply'}
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-10 p-6 bg-gray-50 text-center rounded-xl border border-dashed">
          <Link href="/login" className="text-blue-600 font-medium hover:underline">Log in to comment</Link>
        </div>
      )}

      <div className="space-y-6">
        {comments.map(comment => (
          <div key={comment.id} className="flex gap-4 group">
            <Link href={`/profile/${comment.author.id}`} className="flex-shrink-0">
              <Avatar url={comment.author.avatar_url} size="sm" />
            </Link>
            <div className="bg-white p-4 rounded-xl border shadow-sm flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Link href={`/profile/${comment.author.id}`} className="font-semibold text-gray-900 hover:underline">
                    {comment.author.first_name ? `${comment.author.first_name} ${comment.author.last_name || ''}` : comment.author.username}
                  </Link>
                  <span className="text-xs text-gray-500">• {new Date(comment.created_at).toLocaleDateString()}</span>
                </div>
                {currentUser?.id === comment.author.id && (
                  <button 
                    onClick={() => handleDeleteComment(comment.id)} 
                    className="text-red-500 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && <p className="text-gray-500 text-center py-10 border border-dashed rounded-xl">No comments yet. Be the first to start the conversation!</p>}
      </div>
    </div>
  )
}
