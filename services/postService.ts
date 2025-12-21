/**
 * Post and Comment Management Service
 *
 * Manages social features for event discussion channels.
 * Implements the business requirement: "Approved events automatically generate
 * dedicated discussion channels enabling member interaction comparable to Facebook walls"
 *
 * Features:
 * - Post creation, deletion, and listing
 * - Comment management with cascade deletion
 * - Like/unlike functionality
 * - Real-time interaction tracking
 *
 * Note: Uses in-memory storage for demo purposes. Posts and comments are
 * initialized from mock data and maintained in memory for fast access.
 * In production, this would be migrated to the database layer similar
 * to other entities.
 *
 * @module services/postService
 */

import { Post, Comment } from '../types';
import { userService } from './userService';
import { MOCK_POSTS, MOCK_COMMENTS } from '../mockData';

/**
 * PostService - Singleton service for post and comment operations
 *
 * Provides social interaction features for event discussion channels.
 */
class PostService {
  private static instance: PostService;
  private posts = MOCK_POSTS;
  private comments = MOCK_COMMENTS;

  private constructor() {}

  public static getInstance(): PostService {
    if (!PostService.instance) PostService.instance = new PostService();
    return PostService.instance;
  }

  private async delay(ms: number = 400): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async getPosts(eventId: number): Promise<Post[]> {
      await this.delay();
      return this.posts
        .filter(p => p.eventId === eventId)
        .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async getAllRecentPosts(limit: number = 5): Promise<Post[]> {
      await this.delay();
      return this.posts
        .slice()
        .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
  }

  public async createPost(eventId: number, userId: number, content: string): Promise<Post> {
      await this.delay();
      const user = await userService.getUserById(userId);
      const newPost: Post = {
          id: Date.now(),
          eventId,
          userId,
          content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          authorName: user?.fullName || 'Unknown',
          authorAvatar: user?.avatarUrl,
          commentCount: 0,
          likeCount: 0,
          isLikedByCurrentUser: false
      };
      this.posts.unshift(newPost);
      return newPost;
  }

  public async deletePost(postId: number): Promise<void> {
      await this.delay();
      const index = this.posts.findIndex(p => p.id === postId);
      if (index !== -1) this.posts.splice(index, 1);
      
      // Cascade delete comments
      const commentsKeep = this.comments.filter(c => c.postId !== postId);
      this.comments.length = 0;
      this.comments.push(...commentsKeep);
  }

  public async toggleLike(postId: number): Promise<Post> {
      await this.delay(200);
      const postIndex = this.posts.findIndex(p => p.id === postId);
      if(postIndex === -1) throw new Error("Post not found");
      
      const post = {...this.posts[postIndex]};
      
      if (post.isLikedByCurrentUser) {
          post.likeCount = Math.max(0, post.likeCount - 1);
          post.isLikedByCurrentUser = false;
      } else {
          post.likeCount++;
          post.isLikedByCurrentUser = true;
      }
      
      this.posts[postIndex] = post;
      return post;
  }

  public async getComments(postId: number): Promise<Comment[]> {
      await this.delay(200);
      return this.comments
        .filter(c => c.postId === postId)
        .sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public async createComment(postId: number, userId: number, content: string): Promise<Comment> {
      await this.delay();
      const user = await userService.getUserById(userId);
      const newComment: Comment = {
          id: Date.now(),
          postId,
          userId,
          content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          authorName: user?.fullName || 'Unknown',
          authorAvatar: user?.avatarUrl
      };
      this.comments.push(newComment);
      
      const post = this.posts.find(p => p.id === postId);
      if(post) post.commentCount++;

      return newComment;
  }

  public async deleteComment(commentId: number): Promise<void> {
       await this.delay();
       const commentIndex = this.comments.findIndex(c => c.id === commentId);
       if(commentIndex !== -1) {
           const comment = this.comments[commentIndex];
           const post = this.posts.find(p => p.id === comment.postId);
           if(post) post.commentCount = Math.max(0, post.commentCount - 1);
           this.comments.splice(commentIndex, 1);
       }
  }
}

export const postService = PostService.getInstance();