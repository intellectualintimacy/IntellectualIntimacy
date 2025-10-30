import { useEffect, useState } from 'react';

// NOTE: You must ensure your Supabase client object is available here.
// Replace this import path with wherever you initialize your client.
import { supabase } from '../../lib/supabase';

export default function VerifyEmail({ supabase }) { 
  const [message, setMessage] = useState('Verifying subscription...');

  // Effect to handle the token exchange upon page load
  useEffect(() => {
    const handleConfirmation = async () => {
      // 1. Supabase client automatically reads tokens from the URL fragment 
      //    (e.g., #access_token=...) on page load.
      
      // 2. We explicitly check for the session to verify confirmation worked.
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        setMessage('Error confirming subscription. Please try signing up again.');
        console.error('Supabase Session Error:', error);
        return;
      }

      if (session) {
        setMessage('Success! Your subscription is confirmed. Redirecting you now...');
        // Redirect the user to a protected page (like their dashboard) after 3 seconds
        setTimeout(() => {
          window.location.href = '/dashboard'; 
        }, 3000);
      } else {
        // This usually means the link was successful but the session was already set or expired.
        setMessage('Confirmation successful, please log in.');
        setTimeout(() => {
          window.location.href = '/login'; 
        }, 3000);
      }
    };
    
    // Only run if the supabase client is ready
    if (supabase) {
        handleConfirmation();
    }
  }, [supabase]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-stone-900 text-white">
      <div className="p-8 bg-stone-800 rounded-lg shadow-xl text-center max-w-sm">
        <h2 className="text-2xl font-semibold mb-4 text-amber-400">Confirmation</h2>
        <p className="text-lg">{message}</p>
        <div className="mt-6">
          {message.includes('Success') ? (
            <svg className="mx-auto h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
             <svg className="mx-auto h-12 w-12 text-amber-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
