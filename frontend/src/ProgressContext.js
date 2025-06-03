import { createContext, useContext, useState } from 'react';

const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
  const totalSteps = 6;
  const [currentStep, setCurrentStep] = useState(1);

  const progressPercentage = ((currentStep / totalSteps) * 100).toFixed(2);

  return (
    <ProgressContext.Provider value={{ currentStep, setCurrentStep, progressPercentage, totalSteps }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => useContext(ProgressContext);