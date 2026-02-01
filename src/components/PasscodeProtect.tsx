'use client';
import { useState, useEffect, type FormEvent, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Shield } from 'lucide-react';

interface PasscodeProtectProps {
  children: ReactNode;
  storageKey: string;
  passcode: string;
  title: string;
  description: string;
}

export default function PasscodeProtect({
  children,
  storageKey,
  passcode,
  title,
  description,
}: PasscodeProtectProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  
  // We need to wait for the component to mount before checking localStorage
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    const storedPasscode = localStorage.getItem(storageKey);
    if (storedPasscode === passcode) {
      setIsAuthenticated(true);
    }
  }, [storageKey, passcode]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue === passcode) {
      localStorage.setItem(storageKey, passcode);
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect passcode. Please try again.');
    }
  };
  
  if (!isMounted) {
      return null; // or a loading spinner
  }

  return (
    <AnimatePresence mode="wait">
      {isAuthenticated ? (
        <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            {children}
        </motion.div>
      ) : (
        <motion.div
          key="passcode-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center min-h-[60vh]"
        >
          <div className="w-full max-w-md mx-auto rounded-2xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-md p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#6B5DF9]/50 to-[#5CE7F4]/50 mb-4">
                <Shield className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            <p className="text-muted-foreground mt-2 mb-6">{description}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="password"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter passcode"
                className="bg-black/20 text-center"
              />
              <Button type="submit" className="w-full bg-gradient-to-r from-[#6B5DF9] to-[#5CE7F4] text-white">
                Unlock
              </Button>
            </form>
            {error && (
                <p className="text-red-400 text-sm mt-4">{error}</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
