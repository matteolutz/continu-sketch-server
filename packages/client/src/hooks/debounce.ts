import { useEffect, useState } from "react";

export const useDebounce = <T>(initivalValue: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(initivalValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(initivalValue);
    }, delay);

    return () => clearTimeout(timer);
  }, [initivalValue, delay]);

  return debouncedValue;
};
