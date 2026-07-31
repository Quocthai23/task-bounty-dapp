import React from 'react';

export const AuthLeftPanel: React.FC = () => {
  return (
    <div className="relative hidden w-[45%] flex-col items-start justify-start overflow-hidden px-10 pt-12 md:flex bg-neutral-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_60%,rgba(1,88,255,0.35),transparent_60%),radial-gradient(circle_at_80%_20%,rgba(5,178,255,0.18),transparent_50%)]" />
      <div className="relative z-10 mt-auto mb-12">
        <h2 className="text-4xl leading-tight font-bold whitespace-pre-line text-white">
          Join the TaskBounty Network
        </h2>
        <p className="mt-4 leading-relaxed whitespace-pre-line text-neutral-300">
          Connect with top talent, discover amazing projects, and manage your bounties securely.
        </p>
      </div>
    </div>
  );
};
