import React, { createContext, useContext, useState } from 'react';
import { api } from './AuthContext';
import toast from 'react-hot-toast';

const CareerContext = createContext(null);

export function CareerProvider({ children }) {
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [assessmentHistory, setAssessmentHistory] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeCareer = async (profileData) => {
    setIsAnalyzing(true);
    try {
      const { data } = await api.post('/career/analyze', profileData);
      setCurrentAssessment(data);
      toast.success('Career analysis complete! 🎯');
      return data;
    } catch (error) {
      const msg = error.response?.data?.error || 'Analysis failed. Please try again.';
      toast.error(msg);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadHistory = async () => {
    try {
      const { data } = await api.get('/career/history');
      setAssessmentHistory(data.assessments);
      return data.assessments;
    } catch (error) {
      console.error('Failed to load history:', error);
      return [];
    }
  };

  const getAssessment = async (id) => {
    try {
      const { data } = await api.get(`/career/assessment/${id}`);
      return data.assessment;
    } catch (error) {
      toast.error('Failed to load assessment');
      throw error;
    }
  };

  const saveCareer = async (assessmentId, careerTitle) => {
    try {
      await api.post('/career/save', { assessmentId, careerTitle });
      toast.success(`${careerTitle} saved! ⭐`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save career');
    }
  };

  return (
    <CareerContext.Provider value={{
      currentAssessment, setCurrentAssessment,
      assessmentHistory, setAssessmentHistory,
      isAnalyzing,
      analyzeCareer, loadHistory, getAssessment, saveCareer
    }}>
      {children}
    </CareerContext.Provider>
  );
}

export const useCareer = () => {
  const context = useContext(CareerContext);
  if (!context) throw new Error('useCareer must be used within CareerProvider');
  return context;
};
