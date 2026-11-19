import { useEffect, useState } from 'react';
import { fetchJson } from '../../api';
import { normalizeNewsCollection, orderNews } from '../../utils/newsEditorial';

export default function useNewsCollection() {
  const [state, setState] = useState({ status: 'loading', articles: [] });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetchJson('/news', controller.signal)
      .then(articles => {
        if (!controller.signal.aborted) setState({ status: 'success', articles: orderNews(normalizeNewsCollection(articles)) });
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: 'error', articles: [] });
      });
    return () => controller.abort();
  }, [attempt]);

  return {
    ...state,
    retry() {
      setState({ status: 'loading', articles: [] });
      setAttempt(current => current + 1);
    }
  };
}
