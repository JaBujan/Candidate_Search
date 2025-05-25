import { useState, useEffect } from 'react';
import { searchGithub, searchGithubUser } from '../api/API';
import { IoAddCircle, IoRemoveCircle } from 'react-icons/io5';
import { useCandidate } from '../contexts/CandidateContext'; // Added import
import { Candidate as CandidateInterface } from '../interfaces/Candidate.interface'; // Added import

const CandidateSearch = () => {
  const [candidates, setCandidates] = useState<{ id: number; avatar_url: string; login: string; html_url: string }[]>([]);
  // The 'candidate' state holds the direct response from searchGithubUser API
  const [candidate, setCandidate] = useState<any | null>(null); // Using any for flexibility with API response, ensure properties used exist
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedCandidates, setSavedCandidates] = useState<any[]>(() => { // Assuming localStorage stores array of raw API candidate objects
    const item = localStorage.getItem('savedCandidates');
    return item ? JSON.parse(item) : [];
  });
  const { addCandidateToContext } = useCandidate(); // Get context function

  // Fetch a single random candidate's detailed profile
  const fetchDetailedCandidateProfile = async () => {
    if (candidates.length === 0) {
      // If no basic candidates, fetch a new list of them first.
      // This will trigger the useEffect below once `candidates` state is updated.
      fetchCandidateLogins();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // candidates[0].login comes from the list fetched by searchGithub()
      const detailedData = await searchGithubUser(candidates[0].login);
      setCandidate(detailedData); // Store the raw API response
    } catch (err) {
      setError('No more candidates are available or failed to fetch details.');
      console.error(err);
      setCandidate(null); 
    } finally {
      setLoading(false);
    }
  };

  // Fetch a list of basic candidate info (logins, avatars, etc.)
  const fetchCandidateLogins = async () => {
    setLoading(true); 
    setError(null);
    try {
      const newCandidateLogins = await searchGithub(); 
      setCandidates(newCandidateLogins);
      if (newCandidateLogins.length === 0) {
        setCandidate(null); 
        setError('No new candidates found from search.');
      }
      // useEffect depending on `candidates` will call fetchDetailedCandidateProfile
    } catch (err) {
      setError('Failed to search for new candidate logins.');
      console.error(err);
      setCandidates([]); 
      setCandidate(null); 
    } finally {
      // setLoading is false either from here or from fetchDetailedCandidateProfile if called by useEffect
      if (candidates.length === 0) setLoading(false); 
    }
  };
  
  // When the list of basic candidate logins changes, fetch details for the first one.
  useEffect(() => {
    if (candidates.length > 0) {
      fetchDetailedCandidateProfile();
    } else {
      // If candidates list becomes empty (e.g. after exhausting it), 
      // and not already loading, try to fetch a new list.
      // This also helps if initial fetch yields no candidates.
      if (!loading) {
        // fetchCandidateLogins(); // Avoid potential loop if initial fetch is empty
      }
    }
  }, [candidates]);

  // Initial fetch of candidate logins when component mounts
  useEffect(() => {
    fetchCandidateLogins();
  }, []);

  // Save candidate to localStorage and context, then fetch the next one
  const handleSaveCandidate = () => {
    if (candidate) {
      // 1. Existing localStorage logic (uses the raw API object `candidate`)
      const updatedLocalStorageList = [...savedCandidates, candidate];
      setSavedCandidates(updatedLocalStorageList);
      localStorage.setItem('savedCandidates', JSON.stringify(updatedLocalStorageList));

      // 2. New Context logic: Map raw API `candidate` to `CandidateInterface`
      const candidateForContext: CandidateInterface = {
        id: candidate.id, // Assuming candidate object from API has .id
        name: candidate.name || '',
        username: candidate.login, // API uses .login
        location: candidate.location || '',
        avatar: candidate.avatar_url, // API uses .avatar_url
        email: candidate.email || '',
        html_url: candidate.html_url,
        company: candidate.company || '',
      };
      addCandidateToContext(candidateForContext);

      // 3. Fetch new list of candidate logins (which will then trigger fetching details)
      fetchCandidateLogins();
    }
  };

  // Skip candidate without saving, fetch the next one
  const handleSkipCandidate = () => {
    fetchCandidateLogins();
  };

  return (
    <div className="candidate-card-container"> {/* Added container class */}
      <h1>Candidate Search</h1>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {candidate && (
        <div className="candidate-card"> {/* Added card class */}
          <img src={candidate.avatar_url} alt={candidate.name || candidate.login} className="avatar" /> {/* Added avatar class */}
          <h2>{candidate.name || 'No Name Provided'}</h2>
          <p className="username">({candidate.login})</p> {/* Added username class */}
          <p className="info-item"><strong>Location:</strong> {candidate.location || 'Not Available'}</p>
          <p className="info-item"><strong>Email:</strong> {candidate.email || 'Not Available'}</p>
          <p className="info-item"><strong>Company:</strong> {candidate.company || 'Not Available'}</p>
          {candidate.bio && <p className="info-item bio"><strong>Bio:</strong> {candidate.bio}</p>} {/* Added bio class and conditional rendering */}
          <p className="info-item"><a href={candidate.html_url} target="_blank" rel="noopener noreferrer">View GitHub Profile</a></p>
        </div>
      )}

      <div className="candidate-actions"> {/* Added actions class */}
        <IoRemoveCircle className="reject-icon" onClick={handleSkipCandidate} /> {/* Added icon class */}
        <IoAddCircle className="accept-icon" onClick={handleSaveCandidate} />  {/* Added icon class */}
      </div>
    </div>
  );
};

export default CandidateSearch;
