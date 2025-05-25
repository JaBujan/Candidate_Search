import { useCandidate } from '../contexts/CandidateContext';
import { Candidate } from '../interfaces/Candidate.interface';

const SavedCandidates = () => {
  const { savedCandidatesList } = useCandidate();

  return (
    <>
      <h1>Potential Candidates</h1>
      {(savedCandidatesList.length <= 0) ? <h2> There are no candidates to display</h2> :
      <table className='table'>
        <thead>
          <tr>
            <th>Avatar</th>
            <th>Name</th>
            <th>Username</th>
            <th>Location</th>
            <th>Email</th>
            <th>Company</th>
          </tr>
        </thead>
        <tbody>
          {savedCandidatesList.map((candidate: Candidate, index: number) => {
            return <tr key={candidate.id || index}>
            <td id='img-container'><img id='table-img' src={candidate.avatar}></img></td>
            <td>{candidate.name || 'N/A'}</td>
            <td>{candidate.username}</td>
            <td>{candidate.location || 'None provided'}</td>
            <td>{candidate.email || 'None provided'}</td>
            <td>{candidate.company || 'None specified'}</td>
          </tr>})}
        </tbody>
      </table>}
    </>
  );
};

export default SavedCandidates;
