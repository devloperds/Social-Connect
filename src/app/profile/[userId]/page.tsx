'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Avatar } from '@/components/Avatar'
import { PostCard } from '@/components/PostCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { toast } from "sonner"
import { ProfileSkeleton } from "@/components/PostSkeleton"
import { Navbar } from '@/components/Navbar'

export default function ProfilePage() {
  const { userId } = useParams()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [likedPosts, setLikedPosts] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const [followers, setFollowers] = useState(0)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isTogglingFollow, setIsTogglingFollow] = useState(false)

  // Edit form state
  const [bio, setBio] = useState('')
  const [website, setWebsite] = useState('')
  const [location, setLocation] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/users/${userId}`).then(res => res.ok ? res.json() : null),
      fetch(`/api/users/${userId}/posts`).then(res => res.ok ? res.json() : []),
      fetch(`/api/users/me`).then(res => res.ok ? res.json() : null),
      fetch(`/api/users/me/likes`).then(res => res.ok ? res.json() : [])
    ]).then(([profileData, postsData, meData, likesData]) => {
      setUser(profileData)
      setPosts(Array.isArray(postsData) ? postsData : [])
      setCurrentUser(meData)
      setLikedPosts(Array.isArray(likesData) ? likesData : [])
      
      if (profileData) {
        setBio(profileData.bio || '')
        setWebsite(profileData.website || '')
        setLocation(profileData.location || '')
        setFollowers(profileData.followers_count || 0)
        setIsFollowing(profileData.is_following || false)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [userId])

  const handleToggleFollow = async () => {
    if (!currentUser || isTogglingFollow) return
    setIsTogglingFollow(true)
    setIsFollowing(!isFollowing)
    setFollowers(isFollowing ? Math.max(0, followers - 1) : followers + 1)

    const method = isFollowing ? 'DELETE' : 'POST'
    const res = await fetch(`/api/users/${userId}/follow`, { method })
    if (res.ok) {
      // Success, optimistic UI remains valid
    } else {
      setIsFollowing(isFollowing)
      setFollowers(followers)
    }
    setIsTogglingFollow(false)
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    const res = await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bio, website, location })
    })
    if (res.ok) {
      const updatedUser = await res.json()
      setUser({ ...user, ...updatedUser })
      setSheetOpen(false)
      toast.success("Profile updated")
    } else {
      toast.error("Failed to update profile")
    }
    setIsUpdating(false)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/users/me/avatar', {
      method: 'POST',
      body: formData
    })

    if (res.ok) {
      const data = await res.json()
      setUser({ ...user, avatar_url: data.avatar_url })
      toast.success("Avatar uploaded")
    } else {
      const err = await res.json()
      toast.error(err.error || 'Upload failed')
    }
    setUploadingAvatar(false)
  }

  if (loading) return <><Navbar user={currentUser} /><ProfileSkeleton /></>
  if (!user) return <><Navbar user={currentUser} /><div className="text-center py-20 text-red-500 text-lg">User not found</div></>

  const isOwner = currentUser?.id === user.id

  const handleDeletePost = async (id: string) => {
    const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setPosts(prev => prev.filter(p => p.id !== id))
      toast.success('Post deleted')
    } else {
      toast.error('Failed to delete post.')
    }
  }

  return (
    <>
    <Navbar user={currentUser} />
    <div className="max-w-4xl mx-auto py-10 px-4 min-h-screen">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border p-8 flex flex-col md:flex-row gap-8 items-start relative">
        <div className="flex-shrink-0 relative group">
          <Avatar url={user.avatar_url} size="lg" className="w-32 h-32 text-4xl" />
          {isOwner && (
            <div 
              className="absolute inset-0 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer font-medium text-sm"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadingAvatar ? 'Uploading...' : 'Change'}
            </div>
          )}
          <input type="file" accept="image/jpeg,image/png" className="hidden" ref={fileInputRef} onChange={handleAvatarUpload} />
        </div>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{user.first_name || user.username} {user.last_name}</h1>
              <p className="text-gray-500 text-lg">@{user.username}</p>
            </div>
            
            {isOwner ? (
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger>
                  <Button variant="outline" className="rounded-full px-6 border-gray-300">Edit Profile</Button>
                </SheetTrigger>
                <SheetContent className="overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Edit Profile</SheetTitle>
                  </SheetHeader>
                  <form onSubmit={handleUpdateProfile} className="space-y-6 mt-8">
                    <div className="space-y-2">
                      <Label>Bio</Label>
                      <textarea 
                        value={bio} onChange={e => setBio(e.target.value)} 
                        maxLength={160} rows={4}
                        className="w-full p-3 border rounded-lg resize-none focus:ring-2 outline-none" 
                        placeholder="Tell us about yourself"
                      />
                      <p className="text-xs text-gray-400 text-right">{bio.length}/160</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. San Francisco" />
                    </div>
                    <div className="space-y-2">
                      <Label>Website</Label>
                      <Input value={website} onChange={e => setWebsite(e.target.value)} type="url" placeholder="https://example.com" />
                    </div>
                    <Button type="submit" disabled={isUpdating} className="w-full h-12 bg-blue-600 hover:bg-blue-700">
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </form>
                </SheetContent>
              </Sheet>
            ) : currentUser ? (
              <Button 
                 onClick={handleToggleFollow}
                 variant={isFollowing ? 'outline' : 'default'}
                 className={`rounded-full px-6 transition-all ${isFollowing ? 'border-gray-300 text-gray-700' : 'bg-gray-900 text-white'}`}
                 disabled={isTogglingFollow}
              >
                 {isFollowing ? 'Following' : 'Follow'}
              </Button>
            ) : null}
          </div>

          <div className="flex items-center gap-6 mb-4 mt-2">
            <div><span className="font-bold text-gray-900">{user.posts_count || 0}</span> <span className="text-gray-500">Posts</span></div>
            <div><span className="font-bold text-gray-900">{followers}</span> <span className="text-gray-500">Followers</span></div>
            <div><span className="font-bold text-gray-900">{user.following_count || 0}</span> <span className="text-gray-500">Following</span></div>
          </div>

          {user.bio && <p className="text-gray-800 text-md leading-relaxed whitespace-pre-wrap max-w-xl">{user.bio}</p>}
          
          <div className="flex flex-wrap gap-4 mt-6 text-sm text-gray-600 font-medium">
            {user.location && (
              <div className="flex items-center gap-1">
                📍 <span>{user.location}</span>
              </div>
            )}
            {user.website && (
              <div className="flex items-center gap-1 text-blue-600 hover:underline">
                🔗 <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`} target="_blank" rel="noopener noreferrer">{user.website.replace(/^https?:\/\//, '')}</a>
              </div>
            )}
            <div className="flex items-center gap-1">
              🗓️ <span>Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="mt-10">
        <div className="flex items-center gap-4 mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Posts</h2>
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">{user.posts_count || 0}</span>
        </div>
        
        {posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">No posts yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start auto-rows-max">
            {posts.map(post => (
              <PostCard key={post.id} post={post} currentUser={currentUser} onDelete={handleDeletePost} hasLiked={likedPosts.includes(post.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  )
}
