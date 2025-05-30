import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to observe when an element enters or leaves the viewport
 * @param {Object} options - IntersectionObserver options
 * @param {number} options.threshold - A number between 0 and 1 indicating the percentage of the element that needs to be visible
 * @param {string} options.root - The element that is used as the viewport for checking visibility
 * @param {string} options.rootMargin - Margin around the root element
 * @returns {Array} [ref, isIntersecting, entry] - The ref to attach to the element, boolean if element is visible, and the full IntersectionObserverEntry
 */
const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIntersecting] = useState(false);
  const [entry, setEntry] = useState(null);
  const elementRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIntersecting(entry.isIntersecting);
      setEntry(entry);
    }, options);
    
    const currentElement = elementRef.current;
    
    if (currentElement) {
      observer.observe(currentElement);
    }
    
    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [elementRef, options]);
  
  return [elementRef, isIntersecting, entry];
};

export default useIntersectionObserver;