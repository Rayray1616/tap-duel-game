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
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;

    if (back) {
      tg.BackButton.show();
      const handleBackButton = () => {
        navigate(-1);
      };
      tg.BackButton.onClick(handleBackButton);
      
      return () => {
        tg.BackButton.offClick(handleBackButton);
      };
    } else {
      tg.BackButton.hide();
    }
  }, [back, navigate]);

  return <>{children}</>;
}