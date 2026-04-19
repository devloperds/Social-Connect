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
  if (!user) return <><Navbar user={currentUser} /><div className="text-center py-20 text-red-500 text-lg font-medium">User not found</div></>

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
    <div className="max-w-4xl mx-auto py-8 px-4 min-h-screen">
      {/* Profile Header */}
      <div className="glass-card rounded-3xl overflow-hidden animate-fade-in-up">
        {/* Cover gradient */}
        <div className="h-32 sm:h-40 gradient-primary animate-gradient relative">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/20 to-transparent"></div>
        </div>

        <div className="px-6 sm:px-8 pb-8 -mt-16 relative">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="flex-shrink-0 relative group">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden ring-4 ring-white shadow-xl">
                <Avatar url={user.avatar_url} size="lg" className="w-full h-full text-4xl" />
              </div>
              {isOwner && (
                <div 
                  className="absolute inset-0 bg-black/50 text-white rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-1">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    <span className="text-xs font-bold">{uploadingAvatar ? 'Uploading...' : 'Change'}</span>
                  </div>
                </div>
              )}
              <input type="file" accept="image/jpeg,image/png" className="hidden" ref={fileInputRef} onChange={handleAvatarUpload} />
            </div>

            {/* User Info */}
            <div className="flex-1 pt-2 sm:pt-6 w-full">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{user.first_name || user.username} {user.last_name}</h1>
                  <p className="text-gray-500 font-medium">@{user.username}</p>
                </div>
                
                {isOwner ? (
                  <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetTrigger>
                      <Button variant="outline" className="rounded-2xl px-6 border-gray-200/80 hover:bg-gray-50 font-bold text-sm h-10">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit Profile
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle className="text-xl font-extrabold">Edit Profile</SheetTitle>
                      </SheetHeader>
                      <form onSubmit={handleUpdateProfile} className="space-y-6 mt-8">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700">Bio</Label>
                          <textarea 
                            value={bio} onChange={e => setBio(e.target.value)} 
                            maxLength={160} rows={4}
                            className="w-full p-3 border border-gray-200/80 rounded-xl resize-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none bg-white/60 transition-all" 
                            placeholder="Tell us about yourself"
                          />
                          <p className="text-xs text-gray-400 text-right font-medium">{bio.length}/160</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700">Location</Label>
                          <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. San Francisco" className="h-11 rounded-xl bg-white/60 border-gray-200/80 focus:border-indigo-300" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700">Website</Label>
                          <Input value={website} onChange={e => setWebsite(e.target.value)} type="url" placeholder="https://example.com" className="h-11 rounded-xl bg-white/60 border-gray-200/80 focus:border-indigo-300" />
                        </div>
                        <Button type="submit" disabled={isUpdating} className="w-full h-12 gradient-primary hover:opacity-90 rounded-xl font-bold text-white border-0 shadow-lg shadow-indigo-200/50">
                          {isUpdating ? (
                            <span className="flex items-center gap-2">
                              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                              </svg>
                              Saving...
                            </span>
                          ) : 'Save Changes'}
                        </Button>
                      </form>
                    </SheetContent>
                  </Sheet>
                ) : currentUser ? (
                  <Button 
                     onClick={handleToggleFollow}
                     variant={isFollowing ? 'outline' : 'default'}
                     className={`rounded-2xl px-6 transition-all font-bold text-sm h-10 ${
                       isFollowing 
                         ? 'border-gray-200/80 text-gray-700 hover:text-red-500 hover:border-red-200 hover:bg-red-50' 
                         : 'gradient-primary text-white shadow-lg shadow-indigo-200/50 border-0 hover:opacity-90'
                     }`}
                     disabled={isTogglingFollow}
                  >
                     {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                ) : null}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 my-5">
                <div className="text-center">
                  <span className="block text-xl font-extrabold text-gray-900">{user.posts_count || 0}</span>
                  <span className="text-xs text-gray-500 font-medium">Posts</span>
                </div>
                <div className="w-px h-8 bg-gray-200/60"></div>
                <div className="text-center">
                  <span className="block text-xl font-extrabold text-gray-900">{followers}</span>
                  <span className="text-xs text-gray-500 font-medium">Followers</span>
                </div>
                <div className="w-px h-8 bg-gray-200/60"></div>
                <div className="text-center">
                  <span className="block text-xl font-extrabold text-gray-900">{user.following_count || 0}</span>
                  <span className="text-xs text-gray-500 font-medium">Following</span>
                </div>
              </div>

              {user.bio && <p className="text-gray-700 leading-relaxed whitespace-pre-wrap max-w-xl text-[15px]">{user.bio}</p>}
              
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500 font-medium">
                {user.location && (
                  <div className="flex items-center gap-1.5 bg-gray-50/80 px-3 py-1.5 rounded-xl">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{user.location}</span>
                  </div>
                )}
                {user.website && (
                  <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-indigo-50/80 text-indigo-600 px-3 py-1.5 rounded-xl hover:bg-indigo-100/80 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    <span>{user.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
                <div className="flex items-center gap-1.5 bg-gray-50/80 px-3 py-1.5 rounded-xl">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-extrabold text-gray-900">Posts</h2>
          <span className="gradient-primary text-white px-3 py-0.5 rounded-full text-xs font-bold shadow-sm">{user.posts_count || 0}</span>
        </div>
        
        {posts.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-3xl animate-fade-in-up">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-500">{isOwner ? 'Share your first thought with the world!' : 'This user hasn\'t posted anything yet.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start auto-rows-max stagger-children">
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
