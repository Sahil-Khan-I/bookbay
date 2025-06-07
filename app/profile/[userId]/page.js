"use client"

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../context/AuthContext';

export default function UserProfile() {
  const { userId } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Check if profile is public or if it's the current user's profile
          if (userData.isPublic || (user && user.uid === userId)) {
            setProfile(userData);
          } else {
            setError("This profile is private.");
          }
        } else {
          setError("User not found.");
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Something went wrong. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
          <div className="text-green-500 font-mono text-sm animate-pulse">Loading user data from mainframe...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      {/* Animated Matrix-style background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500 rounded-full filter blur-3xl opacity-5 animate-pulse"></div>
        <div className="absolute top-40 -left-20 w-80 h-80 bg-blue-500 rounded-full filter blur-3xl opacity-5 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-40 left-60 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl opacity-5 animate-pulse animation-delay-4000"></div>
        
        {/* Code grid overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>

      {/* Navigation Bar */}
      <div className="relative z-10 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white flex items-center">
            <span className="text-green-500 mr-1">&lt;</span>
            Startanator
            <span className="text-green-500 ml-1">/&gt;</span>
          </Link>
          <div className="flex space-x-4">
            <Link 
              href="/discover" 
              className="relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gray-800 p-0.5 text-sm font-medium text-white border border-green-900 hover:border-green-500 transition-colors focus:outline-none"
            >
              <span className="relative px-5 py-2.5 rounded-md flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
                cd /discover
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative container mx-auto px-4 py-12">
        {error ? (
          <div className="max-w-md mx-auto text-center py-16 bg-gray-900 rounded-xl border border-gray-800 p-8">
            <div className="font-mono text-center mb-4 p-4 bg-red-900/30 border border-red-800 rounded">
              <div className="text-red-300 text-sm">ERROR CODE: 404</div>
              <div className="text-xl font-bold text-white mt-2">{error}</div>
            </div>
            <p className="text-gray-400 mb-6 font-mono">
              $ whoami<br/>
              unknown_user<br/>
              $ traceroute<br/>
              route not found
            </p>
            <Link 
              href="/"
              className="inline-flex items-center rounded bg-green-700 px-6 py-3 text-sm font-mono text-white hover:bg-green-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              cd /home
            </Link>
          </div>
        ) : profile ? (
          <div className="max-w-3xl mx-auto">
            <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-xl">
              <div className="h-32 bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
                {/* Tech pattern overlay */}
                <div className="absolute inset-0 opacity-10">
                  <svg width="100%" height="100%">
                    <pattern id="circuit-pattern" width="50" height="50" patternUnits="userSpaceOnUse">
                      <path d="M10 10h30v30h-30z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      <circle cx="10" cy="10" r="2" fill="currentColor" />
                      <circle cx="40" cy="10" r="2" fill="currentColor" />
                      <circle cx="10" cy="40" r="2" fill="currentColor" />
                      <circle cx="40" cy="40" r="2" fill="currentColor" />
                      <path d="M10 10h10v10h20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      <path d="M40 40h-10v-10h-20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#circuit-pattern)" />
                  </svg>
                </div>
                
                {/* Code terminal */}
                <div className="relative z-10 font-mono text-sm bg-black bg-opacity-70 px-4 py-2 rounded">
                  <span className="text-green-500">[user@startanator]$ </span> 
                  <span className="text-white">cat profile.json</span>
                  <div className="text-green-400 mt-1">
                    &#123; &quot;name&quot;: &quot;{profile.displayName || 'Anonymous'}&quot; &#125;
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-8 relative">
                <div className="absolute -top-16 left-6 rounded-full border-4 border-gray-900 overflow-hidden">
                  {profile.photoURL ? (
                    <Image
                      src={profile.photoURL}
                      alt={profile.displayName || 'User'}
                      width={96}
                      height={96}
                      className="h-24 w-24 object-cover"
                    />
                  ) : (
                    <div className="h-24 w-24 flex items-center justify-center bg-gray-800 text-green-500 text-2xl font-bold font-mono">
                      {profile.displayName ? profile.displayName[0] : '>'}_
                    </div>
                  )}
                </div>
                
                <div className="mt-12">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h1 className="text-2xl font-bold text-white flex items-center">
                        {profile.displayName || 'Anonymous Hacker'}
                        {profile.hackathonMode && (
                          <span className="ml-2 px-2 py-1 bg-green-900/50 text-green-400 text-xs rounded-md font-mono">
                            HACKER MODE
                          </span>
                        )}
                      </h1>
                      {user && user.uid !== userId && (
                        <div className="mt-2">
                          <Link 
                            href={`/messages/${userId}`}
                            className="text-sm text-green-400 hover:text-green-300 transition-colors font-mono flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            send_message.sh
                          </Link>
                        </div>
                      )}
                    </div>
                    
                    {user && user.uid !== userId && (
                      <button
                        onClick={async () => {
                          try {
                            // Update current user's connections
                            const currentUserRef = doc(db, "users", user.uid);
                            await updateDoc(currentUserRef, {
                              connections: arrayUnion(userId)
                            });
                            
                            // Update the other user's connections
                            const targetUserRef = doc(db, "users", userId);
                            await updateDoc(targetUserRef, {
                              connections: arrayUnion(user.uid)
                            });
                            
                            alert("Connected successfully! You're now in each other's network.");
                          } catch (error) {
                            console.error("Error connecting:", error);
                            alert("Failed to connect. Please try again.");
                          }
                        }}
                        className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-600 transition-colors flex items-center font-mono"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                        </svg>
                        /bin/connect
                      </button>
                    )}
                  </div>
                  
                  {profile.bio && (
                    <div className="mt-6">
                      <h3 className="text-sm font-semibold text-green-500 mb-1 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                        </svg>
                        README.md
                      </h3>
                      <div className="text-gray-300 bg-gray-800/50 p-3 rounded border-l-2 border-green-500 font-mono text-sm">
                        {profile.bio}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                      <h3 className="text-sm font-semibold text-green-500 mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        Tech_Interests[]
                      </h3>
                      {profile.interests && profile.interests.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {profile.interests.map((interest, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-gray-700 border border-green-700 text-green-400 rounded text-xs font-mono"
                            >
                              #{interest}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 font-mono text-xs">
                          {/* No data found */}
                        </p>
                      )}
                    </div>
                    
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                      <h3 className="text-sm font-semibold text-green-500 mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Skills.run()
                      </h3>
                      {profile.skills && profile.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map((skill, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-gray-700 border border-blue-700 text-blue-400 rounded text-xs font-mono"
                            >
                              function({skill})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 font-mono text-xs">
                          {/* No data found */}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Terminal-style output with tech-inspired quotes */}
                  <div className="mt-8 bg-black bg-opacity-70 border border-gray-800 rounded p-4 font-mono text-sm">
                    <div className="flex items-center text-gray-400 mb-2">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                      <div className="flex-1 text-center text-xs">user@startanator:~</div>
                    </div>
                    <div className="text-green-500">[user@startanator ~]$ </div>
                    <div className="text-white">
                      &quot;Talk is cheap. Show me the code.&quot; - Linus Torvalds
                    </div>
                    <div className="text-green-500 mt-2">[user@startanator ~]$ echo &apos;The best way to predict the future is to invent it&apos;</div>
                    <div className="text-white mt-1">
                      The best way to predict the future is to invent it
                    </div>
                    <div className="text-green-500 mt-2">[user@startanator ~]$ <span className="animate-pulse">_</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
      
      <style jsx>{`
        .bg-grid-pattern {
          background-size: 50px 50px;
          background-image: 
            linear-gradient(to right, rgba(0, 255, 0, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 255, 0, 0.05) 1px, transparent 1px);
        }
        
        @keyframes blob {
          0% { transform: scale(1); }
          33% { transform: scale(1.1); }
          66% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
} 