import { useNavigate } from 'react-router-dom';
import { type PropsWithChildren, useEffect } from 'react';

export function Page({ children, back = true }: PropsWithChildren<{
  /**
   * True if it is allowed to go back from this page.
   */
  back?: boolean
}>) {
  const navigate = useNavigate();

  useEffect(() => {
    // Telegram WebApp BackButton functionality removed
    console.log('Telegram WebApp BackButton functionality has been removed');
  }, [back, navigate]);

  return <>{children}</>;
}