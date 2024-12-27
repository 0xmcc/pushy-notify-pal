'use client';

import { useState } from 'react';
import AvatarUpload from './profile/AvatarUpload';
import ProfileForm from './profile/ProfileForm';

const OnboardingFlow = () => {
  const [step, setStep] = useState(1);
  const [avatarUrl, setAvatarUrl] = useState('');

  const handleAvatarComplete = (url: string) => {
    setAvatarUrl(url);
    setStep(2);
  };

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      {step === 1 && (
        <AvatarUpload onComplete={handleAvatarComplete} />
      )}
      {step === 2 && (
        <ProfileForm avatarUrl={avatarUrl} />
      )}
    </div>
  );
};

export default OnboardingFlow;