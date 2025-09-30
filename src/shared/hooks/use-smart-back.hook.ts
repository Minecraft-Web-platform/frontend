import { useNavigate } from "react-router-dom";

/**
 *
 * @param {string} fallback
 * @returns function that redirect user to the prev page or to / or to fallback if provided
 */
export function useSmartBack(fallback: string = "/") {
  const navigate = useNavigate();

  return () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };
}
