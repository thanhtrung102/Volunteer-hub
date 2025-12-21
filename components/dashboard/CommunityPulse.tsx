import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Event, Post } from '../../types';
import { postService } from '../../services/postService';

interface CommunityPulseProps {
  isLoading: boolean;
  highlights: {
    newEvents: Event[];
    trendingEvents: Event[];
    activeEvents: Event[];
  };
}

const CommunityPulse: React.FC<CommunityPulseProps> = ({ isLoading, highlights }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  // Load recent posts across all events
  useEffect(() => {
    loadRecentPosts();
  }, []);

  const loadRecentPosts = async () => {
    try {
      // Get recent posts from all events and sort by creation date
      const allPosts = await postService.getAllRecentPosts(5);
      setPosts(allPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Column 1: Newly Announced */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex justify-between items-center">
          <h3 className="font-bold text-blue-900">🆕 Newly Announced</h3>
          <Link to="/events" className="text-xs text-blue-700 hover:underline">
            View All
          </Link>
        </div>
        <ul className="divide-y divide-gray-100">
          {highlights.newEvents.length === 0 ? (
            <li className="p-4 text-sm text-gray-500">No new events</li>
          ) : (
            highlights.newEvents.map((e) => (
              <li key={e.id} className="p-4 hover:bg-gray-50 transition-colors">
                <Link to={`/events/${e.id}`} className="block">
                  <p className="text-sm font-semibold text-gray-900 line-clamp-1">{e.title}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">
                      {new Date(e.startDate).toLocaleDateString()}
                    </span>
                    <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                      New
                    </span>
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Column 2: Active Discussions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-purple-50 px-4 py-3 border-b border-purple-100 flex justify-between items-center">
          <h3 className="font-bold text-purple-900">💬 Active Discussions</h3>
          <span className="text-xs text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full animate-pulse">
            Live
          </span>
        </div>
        <ul className="divide-y divide-gray-100">
          {postsLoading ? (
            <li className="p-4 text-sm text-gray-500">Loading discussions...</li>
          ) : posts.length === 0 ? (
            <li className="p-4 text-sm text-gray-500">No active discussions</li>
          ) : (
            posts.map((post) => (
              <li key={post.id} className="p-4 hover:bg-gray-50 transition-colors">
                <Link to={`/events/${post.eventId}`} className="block">
                  <div className="flex items-start gap-2">
                    {post.authorAvatar && (
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        className="w-8 h-8 rounded-full flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 line-clamp-2">{post.content}</p>
                      <div className="flex items-center mt-1.5 text-xs text-gray-500 gap-3">
                        <span className="font-medium text-gray-700">{post.authorName}</span>
                        <span className="flex items-center">
                          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          {post.commentCount || 0}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {post.likeCount || 0}
                        </span>
                        <span className="text-purple-600 font-medium ml-auto">
                          {getTimeAgo(post.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Column 3: Trending */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-orange-50 px-4 py-3 border-b border-orange-100 flex justify-between items-center">
          <h3 className="font-bold text-orange-900">🔥 Trending</h3>
        </div>
        <ul className="divide-y divide-gray-100">
          {highlights.trendingEvents.length === 0 ? (
            <li className="p-4 text-sm text-gray-500">No trending events</li>
          ) : (
            highlights.trendingEvents.map((e, index) => (
              <li key={e.id} className="p-4 hover:bg-gray-50 transition-colors">
                <Link to={`/events/${e.id}`} className="block">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">{e.title}</p>
                    <span className="text-xs font-bold text-orange-500">#{index + 1}</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-orange-400 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, (e.participantCount || 0) * 2)}%` }}
                    ></div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500 text-right">
                    {e.participantCount} Participants
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default CommunityPulse;
