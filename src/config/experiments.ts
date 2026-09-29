/**
 * CRO experiments. Assignment is server-side (middleware) into the `sig_exp`
 * cookie; every analytics event carries { experiment_id, variant }.
 * No third-party platform. Keep experiments few and finished.
 */
export interface ExperimentVariant {
  id: string;
  /** Relative weight; weights need not sum to 100. */
  weight: number;
}

export interface Experiment {
  id: string;
  /** What is being tested, for humans. */
  hypothesis: string;
  variants: ExperimentVariant[];
  active: boolean;
}

export const experiments: Experiment[] = [
  // Example shape; inactive until the homepage has two headlines worth testing.
  { id: "home_headline", hypothesis: "'Stop guessing. Start measuring.' beats 'Know what your body is telling you.' on Get my SIGNAL clicks.", variants: [{ id: "a", weight: 1 }, { id: "b", weight: 1 }], active: false },
];

export const activeExperiments = () => experiments.filter((e) => e.active);
