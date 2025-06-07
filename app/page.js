'use client';

import { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { collection, getDocs, doc, updateDoc, increment, arrayUnion, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [terminalText, setTerminalText] = useState('');
  const [terminalLines, setTerminalLines] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    // Terminal animation
    const lines = [
      "INITIALIZING BOOKBAY SYSTEM...",
      "LOADING KNOWLEDGE DATABASE...",
      "ESTABLISHING NEURAL CONNECTIONS...",
      "Welcome to BookBay - Where Knowledge Meets Innovation",
      "> Ready to explore the world of books"
    ];
    
    let currentLine = 0;
    let currentChar = 0;
    
    const typeWriter = () => {
      if (currentLine < lines.length) {
        if (currentChar < lines[currentLine].length) {
          setTerminalLines(prev => {
            const newLines = [...prev];
            if (!newLines[currentLine]) {
              newLines[currentLine] = '';
            }
            newLines[currentLine] = lines[currentLine].substring(0, currentChar + 1);
            return newLines;
          });
          currentChar++;
          setTimeout(typeWriter, 50);
        } else {
          currentLine++;
          currentChar = 0;
          setTimeout(typeWriter, 500);
        }
      }
    };
    
    typeWriter();

    // Fetch reviews with comments
    const fetchReviews = async () => {
      const reviewsCollection = collection(db, 'reviews');
      const reviewsSnapshot = await getDocs(reviewsCollection);
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

    fetchReviews();
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const handleUpvote = async (reviewId, currentUpvotes = 0, upvotedBy = []) => {
    if (!user) {
      alert('Please sign in to upvote reviews');
      return;
    }

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

      const reviewsCollection = collection(db, 'reviews');
      const reviewsSnapshot = await getDocs(reviewsCollection);
      const reviewsList = reviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReviews(reviewsList);
    } catch (error) {
      console.error('Error upvoting review:', error);
    }
  };

  const handleAddComment = async (reviewId) => {
    if (!user) {
      alert('Please sign in to comment');
      return;
    }

    if (!newComment.trim()) return;

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

      const reviewsCollection = collection(db, 'reviews');
      const reviewsSnapshot = await getDocs(reviewsCollection);
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
    } catch (error) {
      console.error('Error adding comment:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-green-500 font-mono">
        <div className="animate-pulse">INITIALIZING SYSTEM...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-green-500">
      <div className="bg-black/50 backdrop-blur-sm border-b border-green-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-green-500 font-mono">BookBay_</h1>
              <div className="text-sm text-green-400/70 font-mono">
                {terminalLines.map((line, index) => (
                  <div key={index} className="flex items-center">
                    <span className="text-green-500 mr-2">$</span>
                    {line}
                    {index === terminalLines.length - 1 && <span className="animate-blink ml-1">_</span>}
                  </div>
                ))}
              </div>
            </div>
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-green-400 font-mono">{user.displayName}</span>
                <a href="/dashboard" className="bg-green-500/10 text-green-500 border border-green-500/30 px-4 py-2 rounded-md hover:bg-green-500/20 font-mono transition-all">
                  [DASHBOARD]
                </a>
                <button
                  onClick={handleLogout}
                  className="bg-red-500/10 text-red-400 border border-red-500/30 px-4 py-2 rounded-md hover:bg-red-500/20 font-mono transition-all"
                >
                  [LOGOUT]
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="bg-green-500/10 text-green-500 border border-green-500/30 px-4 py-2 rounded-md hover:bg-green-500/20 font-mono transition-all"
              >
                [LOGIN]
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <h2 className="text-3xl font-bold ml-4 font-mono">Recent Book Reviews</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-black/50 backdrop-blur-sm border border-green-500/30 rounded-lg p-6 font-mono hover:border-green-500/50 transition-all">
              <h3 className="text-xl font-semibold mb-2 text-green-400">{review.bookTitle}</h3>
              <p className="text-green-300/80 mb-4">{review.summary}</p>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleUpvote(review.id, review.upvotes || 0, review.upvotedBy || [])}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-md ${
                      review.upvotedBy?.includes(user?.uid)
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-black/50 text-green-500/70 hover:bg-green-500/10 border border-green-500/20'
                    } transition-all`}
                  >
                    <span>[UPVOTE] {review.upvotes || 0}</span>
                  </button>
                </div>
                <div className="text-sm text-green-400/70">
                  <span>By {review.authorName}</span>
                  <span className="mx-2">|</span>
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
    </main>
  );
}
