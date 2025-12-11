import React, { useState } from 'react';
import { Post, Comment, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { postService } from '../services/postService';

interface PostItemProps {
    post: Post;
    onDelete: (id: number) => void;
}

const PostItem: React.FC<PostItemProps> = ({ post, onDelete }) => {
    const { user, isAuthenticated } = useAuth();
    const [likes, setLikes] = useState(post.likeCount);
    const [isLiked, setIsLiked] = useState(post.isLikedByCurrentUser);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentCount, setCommentCount] = useState(post.commentCount);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [newComment, setNewComment] = useState('');

    const timeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " mins ago";
        return "Just now";
    };

    const toggleLike = async () => {
        if (!user) return;
        // Optimistic Update
        const prevLikes = likes;
        const prevIsLiked = isLiked;
        
        setIsLiked(!isLiked);
        setLikes(isLiked ? likes - 1 : likes + 1);

        try {
            await postService.toggleLike(post.id);
        } catch (error) {
            // Revert on error
            setIsLiked(prevIsLiked);
            setLikes(prevLikes);
        }
    };

    const toggleComments = async () => {
        if (!showComments && comments.length === 0 && commentCount > 0) {
            setIsLoadingComments(true);
            try {
                const data = await postService.getComments(post.id);
                setComments(data);
            } finally {
                setIsLoadingComments(false);
            }
        }
        setShowComments(!showComments);
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!newComment.trim() || !user) return;

        try {
            const addedComment = await postService.createComment(post.id, user.id, newComment);
            setComments([...comments, addedComment]);
            setCommentCount(commentCount + 1);
            setNewComment('');
        } catch (error) {
            alert("Failed to add comment");
        }
    };

    const handleDeleteComment = async (commentId: number) => {
         if(!window.confirm("Delete this comment?")) return;
         try {
             await postService.deleteComment(commentId);
             setComments(comments.filter(c => c.id !== commentId));
             setCommentCount(commentCount - 1);
         } catch(error) {
             alert("Failed to delete comment");
         }
    };

    const canDeletePost = user && (user.id === post.userId || user.role === UserRole.ADMIN);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-all hover:shadow-md">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                    <img className="h-10 w-10 rounded-full" src={post.authorAvatar} alt={post.authorName} />
                    <div>
                        <p className="text-sm font-bold text-gray-900">{post.authorName}</p>
                        <p className="text-xs text-gray-500">{timeAgo(post.createdAt)}</p>
                    </div>
                </div>
                {canDeletePost && (
                    <button onClick={() => onDelete(post.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Delete Post">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="mt-3 mb-4 text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                {post.content}
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <div className="flex space-x-4">
                    <button 
                        onClick={toggleLike}
                        disabled={!isAuthenticated}
                        className={`flex items-center text-sm font-medium transition-colors ${isLiked ? 'text-secondary' : 'text-gray-500 hover:text-secondary'}`}
                    >
                        <svg className={`w-5 h-5 mr-1.5 ${isLiked ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {likes} {likes === 1 ? 'Like' : 'Likes'}
                    </button>
                    
                    <button 
                        onClick={toggleComments}
                        className="flex items-center text-sm font-medium text-gray-500 hover:text-primary transition-colors"
                    >
                         <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}
                    </button>
                </div>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="mt-4 pt-4 border-t border-gray-100 bg-gray-50 -mx-4 px-4 pb-2 rounded-b-lg">
                    {isLoadingComments ? (
                        <div className="text-center text-xs text-gray-500 py-2">Loading comments...</div>
                    ) : (
                        <div className="space-y-3 mb-4">
                            {comments.map(comment => (
                                <div key={comment.id} className="flex gap-2 text-sm group">
                                    <img className="h-6 w-6 rounded-full mt-1" src={comment.authorAvatar} alt="" />
                                    <div className="flex-grow">
                                        <div className="bg-white p-2 rounded-lg border border-gray-200 inline-block shadow-sm">
                                            <span className="font-bold text-gray-900 mr-2">{comment.authorName}</span>
                                            <span className="text-gray-700">{comment.content}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5 ml-1">
                                            <span className="text-xs text-gray-400">{timeAgo(comment.createdAt)}</span>
                                            {user && (user.id === comment.userId || user.role === UserRole.ADMIN) && (
                                                <button onClick={() => handleDeleteComment(comment.id)} className="text-xs text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">Delete</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {isAuthenticated && (
                        <form onSubmit={handleAddComment} className="flex gap-2">
                             <img className="h-8 w-8 rounded-full" src={user?.avatarUrl} alt="" />
                             <div className="flex-grow relative">
                                 <input
                                    type="text"
                                    placeholder="Write a comment..."
                                    className="w-full text-sm border-gray-300 rounded-full px-4 py-1.5 focus:ring-secondary focus:border-secondary focus:outline-none"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                 />
                                 <button type="submit" disabled={!newComment.trim()} className="absolute right-2 top-1.5 text-secondary hover:text-secondary-light disabled:opacity-30">
                                     <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                                 </button>
                             </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
};

export default PostItem;