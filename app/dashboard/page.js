'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, increment, arrayUnion, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    bookTitle: '',
    summary: '',
    gradeLevel: '',
    reasons: ''
  });
  const [newComment, setNewComment] = useState('');
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [terminalText, setTerminalText] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        fetchUserReviews(user.uid);
      }
    });

    // Terminal animation
    const text = "Welcome to your BookBay Dashboard - Your Knowledge Hub";
    let i = 0;
    const typeWriter = () => {
      if (i < text.length) {
        setTerminalText(text.substring(0, i + 1));
        i++;
        setTimeout(typeWriter, 50);
      }
    };
    typeWriter();

    return () => unsubscribe();
  }, []);

  const fetchUserReviews = async (userId) => {
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('userId', '==', userId)
    );
    const reviewsSnapshot = await getDocs(reviewsQuery);
    const reviewsList = await Promise.all(
      reviewsSnapshot.docs.map(async (doc) => {
        const review = { id: doc.id, ...doc.data() };
        const commentsQuery = query(
          collection(db, 'comments'),
          where('reviewId', '==', doc.id)
        );
        const commentsSnapshot = await getDocs(commentsQuery);
        review.comments = commentsSnapshot.docs.map(commentDoc => ({
          id: commentDoc.id,
          ...commentDoc.data()
        }));
        return review;
      })
    );
    setReviews(reviewsList);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      const reviewData = {
        ...newReview,
        userId: user.uid,
        authorName: user.displayName,
        createdAt: serverTimestamp(),
        upvotes: 0,
        upvotedBy: []
      };

      await addDoc(collection(db, 'reviews'), reviewData);
      setNewReview({
        bookTitle: '',
        summary: '',
        gradeLevel: '',
        reasons: ''
      });
      fetchUserReviews(user.uid);
    } catch (error) {
      console.error('Error adding review:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpvote = async (reviewId, currentUpvotes = 0, upvotedBy = []) => {
    if (!user) return;

    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      
      if (upvotedBy.includes(user.uid)) {
        await updateDoc(reviewRef, {
          upvotes: increment(-1),
          upvotedBy: upvotedBy.filter(id => id !== user.uid)
        });
      } else {
        await updateDoc(reviewRef, {
          upvotes: increment(1),
          upvotedBy: arrayUnion(user.uid)
        });
      }

      fetchUserReviews(user.uid);
    } catch (error) {
      console.error('Error upvoting review:', error);
    }
  };

  const handleAddComment = async (reviewId) => {
    if (!user || !newComment.trim()) return;

    try {
      const commentData = {
        reviewId,
        userId: user.uid,
        authorName: user.displayName,
        content: newComment,
        createdAt: serverTimestamp(),
        isHacker: Math.random() > 0.7,
        isNerd: Math.random() > 0.8,
        isEntrepreneur: Math.random() > 0.9
      };

      await addDoc(collection(db, 'comments'), commentData);
      setNewComment('');
      setActiveCommentId(null);
      fetchUserReviews(user.uid);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!user) return;
    
    try {
      // Delete all comments associated with the review
      const commentsQuery = query(
        collection(db, 'comments'),
        where('reviewId', '==', reviewId)
      );
      const commentsSnapshot = await getDocs(commentsQuery);
      const deleteCommentPromises = commentsSnapshot.docs.map(commentDoc => 
        deleteDoc(doc(db, 'comments', commentDoc.id))
      );
      await Promise.all(deleteCommentPromises);

      // Delete the review
      await deleteDoc(doc(db, 'reviews', reviewId));

      // Refresh the reviews list
      fetchUserReviews(user.uid);
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-green-500 font-mono">
        <div className="animate-pulse">ACCESS DENIED - PLEASE LOGIN</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-green-500">
      <div className="bg-black/50 backdrop-blur-sm border-b border-green-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-green-500 font-mono">BookBay_Dashboard_</h1>
              <div className="text-sm text-green-400/70 font-mono">{terminalText}<span className="animate-blink">_</span></div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="bg-green-500/10 text-green-500 border border-green-500/30 px-4 py-2 rounded-md hover:bg-green-500/20 font-mono transition-all"
              >
                [HOME]
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500/10 text-red-400 border border-red-500/30 px-4 py-2 rounded-md hover:bg-red-500/20 font-mono transition-all"
              >
                [LOGOUT]
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* New Review Form */}
          <div className="lg:col-span-1">
            <div className="bg-black/50 backdrop-blur-sm border border-green-500/30 rounded-lg p-6 font-mono">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <h2 className="text-xl font-bold ml-4">New Book Review</h2>
              </div>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-green-400 mb-1">Book Title</label>
                  <input
                    type="text"
                    name="bookTitle"
                    value={newReview.bookTitle}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 text-green-500 border border-green-500/30 rounded p-2 font-mono focus:border-green-500/50 focus:ring-0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-400 mb-1">Summary</label>
                  <textarea
                    name="summary"
                    value={newReview.summary}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 text-green-500 border border-green-500/30 rounded p-2 font-mono focus:border-green-500/50 focus:ring-0"
                    rows="3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-400 mb-1">Grade Level</label>
                  <input
                    type="text"
                    name="gradeLevel"
                    value={newReview.gradeLevel}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 text-green-500 border border-green-500/30 rounded p-2 font-mono focus:border-green-500/50 focus:ring-0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-400 mb-1">Why You Liked It</label>
                  <textarea
                    name="reasons"
                    value={newReview.reasons}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 text-green-500 border border-green-500/30 rounded p-2 font-mono focus:border-green-500/50 focus:ring-0"
                    rows="3"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-500/10 text-green-500 border border-green-500/30 px-4 py-2 rounded-md hover:bg-green-500/20 font-mono transition-all"
                >
                  [SUBMIT REVIEW]
                </button>
              </form>
            </div>
          </div>

          {/* User Reviews */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <h2 className="text-xl font-bold ml-4">Your Reviews</h2>
            </div>
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-black/50 backdrop-blur-sm border border-green-500/30 rounded-lg p-6 font-mono hover:border-green-500/50 transition-all">
                  <h3 className="text-xl font-semibold mb-2 text-green-400">{review.bookTitle}</h3>
                  <p className="text-green-300/80 mb-4">{review.summary}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUpvote(review.id, review.upvotes || 0, review.upvotedBy || [])}
                        className={`flex items-center space-x-1 px-2 py-1 rounded-md ${
                          review.upvotedBy?.includes(user.uid)
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-black/50 text-green-500/70 hover:bg-green-500/10 border border-green-500/20'
                        } transition-all`}
                      >
                        <span>[UPVOTE] {review.upvotes || 0}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-1 rounded-md hover:bg-red-500/20 transition-all"
                      >
                        [DELETE]
                      </button>
                    </div>
                    <div className="text-sm text-green-400/70">
                      <span>{review.gradeLevel}</span>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div className="mt-4 border-t border-green-500/30 pt-4">
                    <h4 className="text-sm font-bold mb-2 text-green-400">Comments</h4>
                    <div className="space-y-2 mb-4">
                      {review.comments?.map((comment) => (
                        <div 
                          key={comment.id} 
                          className={`text-sm p-2 rounded ${
                            comment.isHacker 
                              ? 'bg-red-900/20 border border-red-500/30' 
                              : comment.isNerd
                              ? 'bg-blue-900/20 border border-blue-500/30'
                              : comment.isEntrepreneur
                              ? 'bg-purple-900/20 border border-purple-500/30'
                              : 'bg-black/50 border border-green-500/20'
                          }`}
                        >
                          <span className={`${
                            comment.isHacker 
                              ? 'text-red-400' 
                              : comment.isNerd
                              ? 'text-blue-400'
                              : comment.isEntrepreneur
                              ? 'text-purple-400'
                              : 'text-green-400'
                          }`}>{comment.authorName}</span>
                          <span className="mx-2 text-green-500/50">|</span>
                          <span className="text-green-300/80">{comment.content}</span>
                        </div>
                      ))}
                    </div>
                    
                    {activeCommentId === review.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Enter your comment..."
                          className="w-full bg-black/50 text-green-500 border border-green-500/30 rounded p-2 font-mono focus:border-green-500/50 focus:ring-0"
                          rows="2"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAddComment(review.id)}
                            className="bg-green-500/10 text-green-500 border border-green-500/30 px-3 py-1 rounded hover:bg-green-500/20 transition-all"
                          >
                            [POST]
                          </button>
                          <button
                            onClick={() => {
                              setActiveCommentId(null);
                              setNewComment('');
                            }}
                            className="bg-black/50 text-green-500/70 border border-green-500/20 px-3 py-1 rounded hover:bg-green-500/10 transition-all"
                          >
                            [CANCEL]
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveCommentId(review.id)}
                        className="text-green-500/70 hover:text-green-400 text-sm transition-colors"
                      >
                        [ADD COMMENT]
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 