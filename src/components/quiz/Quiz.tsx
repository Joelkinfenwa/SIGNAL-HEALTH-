"use client";

import Link from "next/link";
import { useState } from "react";
import { PanelLearn } from "@/components/product/PanelLearn";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { productCategoryCount, productMarkerCount } from "@/config/products";
import { QUIZ_VERSION, quizQuestions, recommend, type QuizAnswers } from "@/config/quiz";
import { track } from "@/lib/analytics/track";
import { cx } from "@/lib/cx";
import styles from "./Quiz.module.css";

/**
 * One question per screen, big targets, instant advance. Answers live in
 * component state only and are never sent anywhere.
 */
export function Quiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [done, setDone] = useState(false);
  const total = quizQuestions.length;
  const q = quizQuestions[step]!;

  function answer(optionId: string | null) {
    if (step === 0 && Object.keys(answers).length === 0) track({ name: "quiz_started", props: { quiz_version: QUIZ_VERSION } });
    const next = { ...answers, [q.id]: optionId ?? undefined };
    setAnswers(next);
    if (step + 1 < total) {
      setStep(step + 1);
    } else {
      const rec = recommend(next);
      track({ name: "quiz_completed", props: { quiz_version: QUIZ_VERSION } });
      track({ name: "product_recommended", props: { quiz_version: QUIZ_VERSION, product_id: rec.primary.id } });
      setDone(true);
    }
  }

  if (done) return <Result answers={answers} onRestart={() => { setAnswers({}); setStep(0); setDone(false); }} />;

  return (
    <div className={styles.quiz}>
      <div className={styles.progress} role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step + 1} aria-label="Quiz progress">
        <span className={styles.progressFill} style={{ width: `${((step + 1) / total) * 100}%` }} />
      </div>
      <p className={styles.stepLabel}><span className="num">{step + 1}</span> of <span className="num">{total}</span> · {q.label}</p>

      <fieldset className={styles.question} key={q.id}>
        <legend className={styles.legend}>{q.question}</legend>
        {q.help ? <p className={styles.help}>{q.help}</p> : null}
        <div className={styles.options}>
          {q.options.map((o) => (
            <button key={o.id} type="button" className={cx(styles.option, answers[q.id] === o.id && styles.selected)} onClick={() => answer(o.id)}>
              <span className={styles.optionText}>
                <span className={styles.optionLabel}>{o.label}</span>
                {o.hint ? <span className={styles.optionHint}>{o.hint}</span> : null}
              </span>
              <Icon name="arrow" size={18} className={styles.optionIcon} />
            </button>
          ))}
        </div>
      </fieldset>

      <div className={styles.nav}>
        {step > 0 ? (
          <button type="button" className={styles.back} onClick={() => setStep(step - 1)}>Back</button>
        ) : <span />}
        {q.optional ? (
          <button type="button" className={styles.skip} onClick={() => answer(null)}>Skip</button>
        ) : null}
      </div>
      <p className={styles.privacy}>Your answers stay on your device. They&apos;re never stored or shared.</p>
    </div>
  );
}

function Result({ answers, onRestart }: { answers: QuizAnswers; onRestart: () => void }) {
  const { primary, alternative, reason } = recommend(answers);
  const collection =
    answers.collection === "home"
      ? "You asked for collection at home or work: choose it when you book, where it's available. A collection centre is always an option too."
      : answers.collection === "centre"
        ? "You'll be able to pick a collection centre when you book. Home or workplace visits are also available in many areas if you change your mind."
        : "Choose home, workplace or a collection centre when you book.";
  return (
    <div className={styles.result} aria-live="polite">
      <p className={styles.resultKicker}>Our recommendation</p>
      <h2 className={styles.resultTitle}>{primary.name}</h2>
      <p className={styles.resultTagline}>{primary.tagline}</p>
      <p className={styles.reason}>{reason}</p>

      <div className={styles.resultCard}>
        <p className={styles.resultCounts}>
          <span className="num">{productCategoryCount(primary)}</span> areas of health · <span className="num">{productMarkerCount(primary)}</span> markers, every one explained
        </p>
        <PanelLearn markers={primary.markers} only={primary.highlights} limit={4} variant="chips" />
        <div className={styles.resultActions}>
          <Button href={`/tests/${primary.slug}`} full ctaId={`quiz_choose_${primary.slug}`} location="quiz_result">
            See {primary.shortName} in detail <Icon name="arrow" size={18} />
          </Button>
        </div>
        <p className={styles.collection}><Icon name="home" size={16} /> {collection}</p>
      </div>

      <div className={styles.alt}>
        <p className={styles.altLabel}>Also worth a look</p>
        <Link href={`/tests/${alternative.slug}`} className={styles.altLink}>
          <span>
            <strong>{alternative.name}</strong>
            <span className={styles.altQuestion}>{alternative.question}</span>
          </span>
          <Icon name="arrow" size={18} />
        </Link>
      </div>

      <p className={styles.resultFoot}>
        <button type="button" className={styles.back} onClick={onRestart}>Start again</button>
        <span aria-hidden="true"> · </span>
        <Link href="/tests">Compare all five tests</Link>
      </p>
    </div>
  );
}
