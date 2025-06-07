"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function Profile() {
  const { user, userProfile, loading, logout, updateUserProfile } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState([]);
  const [skills, setSkills] = useState([]);
  const [newInterest, setNewInterest] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  // Set initial profile data
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || user?.displayName || '');
      setBio(userProfile.bio || '');
      setInterests(userProfile.interests || []);
      setSkills(userProfile.skills || []);
    }
  }, [userProfile, user]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchUserReviews = async () => {
      try {
        const reviewsQuery = query(
          collection(db, 'reviews'),
          where('userId', '==', user.uid)
        );
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviewsList = reviewsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setReviews(reviewsList);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchUserReviews();
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };
  
  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };
  
  const handleRemoveInterest = (interest) => {
    setInterests(interests.filter(i => i !== interest));
  };
  
  const handleRemoveSkill = (skill) => {
    setSkills(skills.filter(s => s !== skill));
  };
  
  const handleSaveProfile = async () => {
    try {
    setError('');
    setSuccess('');
      
      await updateUserProfile({
        displayName,
        bio,
        interests,
        skills
      });
      
      setSuccess('Profile updated successfully! Your signal has been boosted.');
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. System glitch detected.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
          <div className="text-green-500 font-mono text-sm animate-pulse">Initializing user data from mainframe...</div>
        </div>
      </div>
    );
  }

  if (!user) return null; // Will be redirected in useEffect

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
          <div className="flex items-center space-x-4">
            <Link
              href="/discover"
              className="relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gray-800 p-0.5 text-sm font-medium text-white border border-green-900 hover:border-green-500 transition-colors focus:outline-none"
            >
              <span className="relative px-5 py-2.5 rounded-md flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
                Discover
              </span>
            </Link>
          <button
            onClick={handleLogout}
              className="relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-red-900 p-0.5 text-sm font-medium text-white border border-red-900 hover:border-red-700 transition-colors focus:outline-none"
          >
              <span className="relative px-5 py-2.5 rounded-md flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
              Logout
            </span>
          </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative container mx-auto px-4 py-12">
        {/* Terminal-style heading */}
        <div className="text-center mb-8 font-mono">
          <div className="inline-block bg-black bg-opacity-70 px-6 py-3 rounded-lg border border-green-900">
            <span className="text-green-500">[user@startanator ~]$ </span>
            <span className="text-white">cat profile.config</span>
          </div>
        </div>
        
        {error && (
          <div className="max-w-3xl mx-auto mb-8 p-4 bg-red-900/30 border border-red-800 rounded-lg text-center text-red-200 font-mono">
            <div className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              ERROR: {error}
            </div>
          </div>
        )}
        
        {success && (
          <div className="max-w-3xl mx-auto mb-8 p-4 bg-green-900/30 border border-green-500 rounded-lg text-center text-green-300 font-mono">
            <div className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {success}
            </div>
          </div>
        )}
        
        {/* Profile Card */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-xl">
            <div className="h-32 bg-gradient-to-r from-gray-800 to-gray-900 relative overflow-hidden">
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
              
              <div className="absolute top-4 right-4">
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1 bg-green-800 text-green-200 rounded text-xs font-mono hover:bg-green-700 transition-colors"
                  >
                    sudo edit
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 bg-gray-800 text-gray-200 rounded text-xs font-mono hover:bg-gray-700 transition-colors"
                  >
                    cancel
                  </button>
                )}
              </div>
            </div>
            
            <div className="px-6 py-8 relative">
              <div className="absolute -top-16 left-6 rounded-full border-4 border-gray-900 overflow-hidden">
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    width={96}
                    height={96}
                    className="h-24 w-24 object-cover"
                  />
                ) : (
                  <div className="h-24 w-24 flex items-center justify-center bg-gray-800 text-green-500 text-2xl font-bold font-mono">
                    {user.displayName ? user.displayName[0] : '>'}_
                  </div>
                )}
              </div>
              
              <div className="mt-12">
                {!isEditing ? (
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {displayName || 'Anonymous Hacker'}
                    </h2>
                    
                    {bio && (
                      <div className="mt-6">
                        <h3 className="text-sm font-semibold text-green-500 mb-1 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                          </svg>
                          README.md
                        </h3>
                        <div className="text-gray-300 bg-gray-800/50 p-3 rounded border-l-2 border-green-500 font-mono text-sm">
                          {bio}
                        </div>
                      </div>
                    )}
                    
                    {/* Interests Tags */}
                    {interests && interests.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-sm font-semibold text-green-500 mb-2 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                          Tech_Interests[]
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {interests.map(interest => (
                            <span key={interest} className="px-2 py-1 bg-gray-800 border border-green-700 text-green-400 rounded text-xs font-mono">
                              #{interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Skills Tags */}
                    {skills && skills.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-sm font-semibold text-green-500 mb-2 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Skills.run()
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {skills.map(skill => (
                            <span key={skill} className="px-2 py-1 bg-gray-800 border border-blue-700 text-blue-400 rounded text-xs font-mono">
                              function({skill})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Connections */}
                    {userProfile?.connections && userProfile.connections.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-sm font-semibold text-green-500 mb-2 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                          </svg>
                          Network.connections
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {userProfile.connections.map(connectionId => (
                            <div key={connectionId} className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm flex items-center">
                              <span className="mr-2 font-mono text-xs">{connectionId.substring(0, 6)}...</span>
                              <Link href={`/profile/${connectionId}`} className="text-green-400 hover:text-green-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                                </svg>
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-800 p-6 rounded-lg border border-green-800">
                    <h3 className="text-xl font-mono mb-6 text-green-400">./edit_profile.sh</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-green-400 mb-2 font-mono text-sm">displayName</label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
                          placeholder="Your name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-green-400 mb-2 font-mono text-sm">bio</label>
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
                          placeholder="Tell us about yourself"
                          rows="4"
                        ></textarea>
                      </div>
                      
                      <div>
                        <label className="block text-green-400 mb-2 font-mono text-sm">interests</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {interests.map(interest => (
                            <div key={interest} className="group bg-gray-700 px-3 py-1 rounded-full flex items-center">
                              <span className="text-green-300 text-xs mr-2 font-mono">#{interest}</span>
                              <button 
                                onClick={() => handleRemoveInterest(interest)}
                                className="text-gray-400 hover:text-red-400 focus:outline-none"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex">
                          <input
                            type="text"
                            value={newInterest}
                            onChange={(e) => setNewInterest(e.target.value)}
                            className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-l text-white focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
                            placeholder="Add interest"
                            onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                          />
                          <button
                            onClick={handleAddInterest}
                            className="px-4 py-2 bg-green-700 text-white rounded-r hover:bg-green-600 transition-colors font-mono text-sm"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-green-400 mb-2 font-mono text-sm">skills</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {skills.map(skill => (
                            <div key={skill} className="group bg-gray-700 px-3 py-1 rounded-full flex items-center">
                              <span className="text-blue-300 text-xs mr-2 font-mono">function({skill})</span>
                              <button 
                                onClick={() => handleRemoveSkill(skill)}
                                className="text-gray-400 hover:text-red-400 focus:outline-none"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex">
                          <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-l text-white focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
                            placeholder="Add skill"
                            onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                          />
                          <button
                            onClick={handleAddSkill}
                            className="px-4 py-2 bg-blue-700 text-white rounded-r hover:bg-blue-600 transition-colors font-mono text-sm"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex justify-end pt-4">
                        <button
                          onClick={handleSaveProfile}
                          className="px-6 py-2 bg-green-700 text-white rounded-md hover:bg-green-600 transition-colors font-mono flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          make install
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                      </div>
                  </div>
                </div>

          {/* Terminal-style footer */}
          <div className="mt-8 bg-black bg-opacity-70 border border-gray-800 rounded p-4 font-mono text-sm">
            <div className="flex items-center text-gray-400 mb-2">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
              <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
              <div className="flex-1 text-center text-xs">user@startanator:~</div>
                  </div>
            <div className="text-green-500">[user@startanator ~]$ echo &quot;Code is like humor. When you have to explain it, it&apos;s bad.&quot;</div>
            <div className="text-white mt-1">
              Code is like humor. When you have to explain it, it&apos;s bad.
            </div>
            <div className="text-green-500 mt-2">[user@startanator ~]$ <span className="animate-pulse">_</span></div>
          </div>
        </div>
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