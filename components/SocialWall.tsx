import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { postService } from '../services/postService';
import { Post } from '../types';
import PostItem from './PostItem';

interface SocialWallProps {
  eventId: number;
}

const SocialWall: React.FC<SocialWallProps> = ({ eventId }) => {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [eventId]);

  const loadPosts = async () => {
    try {
      const data = await postService.getPosts(eventId);
      setPosts(data);
    } catch (error) {
      console.error("Failed to load posts", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !user) return;

    setIsPosting(true);
    try {
      const createdPost = await postService.createPost(eventId, user.id, newPostContent);
      setPosts([createdPost, ...posts]);
      setNewPostContent('');
    } catch (error) {
      alert("Failed to create post.");
    } finally {
      setIsPosting(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
      if(!window.confirm("Delete this post?")) return;
      try {
          await postService.deletePost(postId);
          setPosts(posts.filter(p => p.id !== postId));
      } catch (error) {
          alert("Failed to delete post");
      }
  };

  if (isLoading) return <div className="py-8 text-center text-gray-500">Loading discussions...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary">Discussion Channel</h2>
          <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">Live</span>
      </div>

      {/* Create Post Input */}
      {isAuthenticated ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <form onSubmit={handleCreatePost}>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <img className="h-10 w-10 rounded-full" src={user?.avatarUrl} alt={user?.fullName} />
              </div>
              <div className="flex-grow">
                <textarea
                  className="w-full border-gray-200 rounded-md focus:ring-secondary focus:border-secondary resize-none text-sm p-2 bg-gray-50 focus:bg-white transition-colors"
                  rows={2}
                  placeholder="Share something with the community..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isPosting || !newPostContent.trim()}
                    className="bg-primary hover:bg-primary-light text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {isPosting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg text-center text-sm text-gray-500 border border-gray-200">
           Please <a href="/login" className="text-secondary font-bold hover:underline">log in</a> to join the discussion.
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <p className="text-center text-gray-500 py-4 italic">No posts yet. Be the first to start the conversation!</p>
        ) : (
          posts.map(post => (
            <PostItem key={post.id} post={post} onDelete={handleDeletePost} />
          ))
        )}
      </div>
    </div>
  );
};

export default SocialWall;