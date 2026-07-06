import { useEffect } from 'react';

export default function useScrollToTop(deps = []) {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
    document.scrollingElement && (document.scrollingElement.scrollTop = 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
