export const ExperienceState = Object.freeze({
  INTRO: "intro",
  COUNTDOWN: "countdown",
  SCENE: "scene",
  COUPLET: "couplet",
  WISH: "wish",
  CELEBRATION: "celebration"
});

export function createStateMachine(initial, transitions) {
  let current = initial;
  const listeners = new Set();

  return {
    get state() {
      return current;
    },
    can(next) {
      return (transitions[current] || []).includes(next);
    },
    transition(next, payload = {}) {
      if (!this.can(next)) return false;
      const previous = current;
      current = next;
      listeners.forEach((listener) => listener({ previous, current, payload }));
      return true;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}
