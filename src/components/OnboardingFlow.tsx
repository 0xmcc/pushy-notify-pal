'use client';

import { useState } from 'react';
import AvatarUpload from './profile/AvatarUpload';
import ProfileForm from './profile/ProfileForm';
import AvatarPreview from './profile/AvatarPreview';

const OnboardingFlow = () => {
  const [step, setStep] = useState(1);
  const [avatarUrl, setAvatarUrl] = useState('');

  const handleAvatarComplete = (url: string) => {
    setAvatarUrl(url);
    setStep(2);
  };

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      {step === 1 ? (
        <AvatarUpload onComplete={handleAvatarComplete} />
      ) : (
        <div className="space-y-6">
          <div className="flex justify-center">
            <AvatarPreview 
              previewUrl={null} 
              avatarUrl={avatarUrl}
              size="lg"
            />
          </div>
          <ProfileForm avatarUrl={avatarUrl} />
        </div>
      )}
    </div>
  );
};

export default OnboardingFlow;