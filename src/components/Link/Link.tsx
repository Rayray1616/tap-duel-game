import { type FC, type MouseEventHandler, useCallback } from 'react';
import { Link as RouterLink, type LinkProps } from 'react-router-dom';

import { classNames } from '@/css/classnames.ts';

import './Link.css';

export const Link: FC<LinkProps> = ({
  className,
  onClick: propsOnClick,
  to,
  ...rest
}) => {
  const onClick = useCallback<MouseEventHandler<HTMLAnchorElement>>((e) => {
    propsOnClick?.(e);

    // Compute if target path is external. In this case we would like to open
    // link using TMA method.
    let path: string;
    if (typeof to === 'string') {
      path = to;
    } else {
      const { search = '', pathname = '', hash = '' } = to;
      path = `${pathname}?${search}#${hash}`;
    }

    const targetUrl = new URL(path, window.location.toString());
    const currentUrl = new URL(window.location.toString());
    const isExternal = targetUrl.protocol !== currentUrl.protocol
      || targetUrl.host !== currentUrl.host;

    if (isExternal) {
      e.preventDefault();
      // Use direct Telegram WebApp API
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.openLink) {
        tg.openLink(targetUrl.toString());
      } else {
        // Fallback to regular link opening
        window.open(targetUrl.toString(), '_blank');
      }
    }
  }, [to, propsOnClick]);

  return (
    <RouterLink
      {...rest}
      to={to}
      onClick={onClick}
      className={classNames(className, 'link')}
    />
  );
};
