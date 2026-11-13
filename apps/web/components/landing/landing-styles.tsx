/**
 * Entrance and scroll animations for the landing page.
 * Scroll reveals use CSS scroll-driven animations. Browsers without support
 * show the content as is. Nothing animates under prefers-reduced-motion.
 */
export function LandingStyles() {
  return (
    <style>{`
      @keyframes lp-rise {
        from { opacity: 0; transform: translateY(16px); }
        to { opacity: 1; transform: none; }
      }
      @media (prefers-reduced-motion: no-preference) {
        .lp-enter { animation: lp-rise 0.7s ease-out both; }
        .lp-enter-2 { animation-delay: 0.12s; }
        .lp-enter-3 { animation-delay: 0.24s; }
        @supports (animation-timeline: view()) {
          .lp-reveal {
            animation: lp-rise linear both;
            animation-timeline: view();
            animation-range: entry 0% entry 45%;
          }
        }
      }
    `}</style>
  );
}
