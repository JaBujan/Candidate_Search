import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Candidate } from '../interfaces/Candidate.interface';

interface CandidateContextType {
  savedCandidatesList: Candidate[];
  addCandidateToContext: (candidate: Candidate) => void;
}

const CandidateContext = createContext<CandidateContextType | undefined>(undefined);

export const CandidateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [savedCandidatesList, setSavedCandidatesList] = useState<Candidate[]>([]);

  const addCandidateToContext = (candidate: Candidate) => {
    setSavedCandidatesList(prevCandidates => [...prevCandidates, candidate]);
  };

  return (
    <CandidateContext.Provider value={{ savedCandidatesList, addCandidateToContext }}>
      {children}
    </CandidateContext.Provider>
  );
};

export const useCandidate = (): CandidateContextType => {
  const context = useContext(CandidateContext);
  if (!context) {
    throw new Error('useCandidate must be used within a CandidateProvider');
  }
  return context;
};
