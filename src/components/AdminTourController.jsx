import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTour } from '@reactour/tour';
import { STEP_ROUTES } from '../tours/adminSteps';

export default function AdminTourController() {
  const { currentStep, isOpen } = useTour();
  const navigate = useNavigate();
  const location = useLocation();
  const prevStep = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    if (currentStep === prevStep.current) return;
    prevStep.current = currentStep;

    const target = STEP_ROUTES[currentStep];
    if (target && location.pathname !== target) {
      navigate(target);
    }
  }, [currentStep, isOpen, location.pathname, navigate]);

  return null;
}
