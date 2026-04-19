import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain alphanumeric characters and underscores"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
})

export const loginSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
})

export const profileSchema = z.object({
  bio: z.string().max(160).optional(),
  website: z.string().url().optional().or(z.literal('')),
  location: z.string().optional(),
})

export const postSchema = z.object({
  content: z.string().max(280).optional(),
  imageUrl: z.string().url().optional(),
}).refine(data => data.content || data.imageUrl, {
  message: "Post must contain either text content or an image",
  path: ["content"]
})

export const commentSchema = z.object({
  content: z.string().min(1).max(500),
})
