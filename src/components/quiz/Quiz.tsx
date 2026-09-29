"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { getBiomarker } from "@/config/biomarkers";
import { addonNewMarkers } from "@/config/addons";
import { productCategoryCount, productMarkerCount } from "@/config/products";
import { QUIZ_VERSION, quizQuestions, recommend, type QuizAnswers } from "@/config/quiz";
import { track } from "@/lib/analytics/track";
import { cx } from "@/lib/cx";
import { serializeConfiguration } from "@/lib/pricing";
import styles from "./Quiz.module.css";

/**
 * One question per screen. Multi-select questions confirm with a Continue
 * button; single-select advance on tap. Answers stay in component state and
 * are never sent anywhere.
 */
export function Quiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [done, setDone] = useState(false);
  const total = quizQuestions.length;
  const q = quizQuestions[step]!;
  const current = answers[q.id];
  const selected = new Set(Array.isArray(current) ? current : current ? [current] : []);

  function markStarted() {
    if (Object.keys(answers).length === 0) track({ name: "quiz_started", props: { quiz_version: QUIZ_VERSION } });
  }

  function finish(next: QuizAnswers) {
    const rec = recommend(next);
    track({ name: "quiz_completed", props: { quiz_version: QUIZ_VERSION } });
    track({ name: "product_recommended", props: { quiz_version: QUIZ_VERSION, product_id: rec.product.id, addon_ids: rec.addons.map((a) => a.id) } });
    setDone(true);
  }

  function advance(next: QuizAnswers) {
    setAnswers(next);
    if (step + 1 < total) setStep(step + 1);
    else finish(next);
  }

  function pick(optionId: string | null) {
    markStarted();
    if (q.multi && optionId) {
      const s = new Set(selected);
      if (s.has(optionId)) s.delete(optionId); else s.add(optionId);
      setAnswers({ ...answers, [q.id]: Array.from(s) });
      return;
    }
    advance({ ...answers, [q.id]: optionId ?? undefined });
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
        <div className={cx(styles.options, q.multi && styles.optionsMulti)}>
          {q.options.map((o) => {
            const on = selected.has(o.id);
            return (
              <button key={o.id} type="button" className={cx(styles.option, on && styles.selected)} aria-pressed={q.multi ? on : undefined} onClick={() => pick(o.id)}>
                <span className={styles.optionText}>
                  <span className={styles.optionLabel}>{o.label}</span>
                  {o.hint ? <span className={styles.optionHint}>{o.hint}</span> : null}
                </span>
                <Icon name={q.multi ? (on ? "check" : "plus") : "arrow"} size={18} className={styles.optionIcon} />
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className={styles.nav}>
        {step > 0 ? <button type="button" className={styles.back} onClick={() => setStep(step - 1)}>Back</button> : <span />}
        {q.multi ? (
          <Button href="#" ctaId={`quiz_continue_${q.id}`} location="quiz" className={styles.continue} onClick={(e) => { e.preventDefault(); advance({ ...answers, [q.id]: Array.from(selected) }); }}>
            {selected.size ? "Continue" : "Skip"} <Icon name="arrow" size={18} />
          </Button>
        ) : q.optional ? (
          <button type="button" className={styles.skip} onClick={() => pick(null)}>Skip</button>
        ) : null}
      </div>
      <p className={styles.privacy}>Your answers stay on your device. They&apos;re never stored or shared.</p>
    </div>
  );
}

function Result({ answers, onRestart }: { answers: QuizAnswers; onRestart: () => void }) {
  const { product, addons, reasons } = recommend(answers);
  const cfg = { productId: product.id, addonIds: addons.map((a) => a.id) };
  const href = `/signal${serializeConfiguration(cfg)}`;
  const collection =
    answers.collection === "mobile"
      ? "You asked for collection at home or work: choose it when you book, where it's available."
      : answers.collection === "centre"
        ? "You'll pick a collection centre when you book."
        : "Choose a centre or, where available, a home visit when you book.";
  return (
    <div className={styles.result} aria-live="polite">
      <p className={styles.resultKicker}>Your SIGNAL</p>
      <h2 className={styles.resultTitle}>{product.name}</h2>
      <p className={styles.resultTagline}>{product.tagline}</p>

      <div className={styles.resultCard}>
        <p className={styles.resultCounts}>
          <span className="num">{productCategoryCount(product)}</span> areas of health · <span className="num">{productMarkerCount(product)}</span> markers, every one explained
        </p>
        {addons.length > 0 ? (
          <ul className={styles.recs}>
            {addons.map((a) => (
              <li key={a.id} className={styles.rec}>
                <span className={styles.recPlus}>+</span>
                <span>
                  <strong>{a.name}</strong>
                  <span className={styles.recReason}>{reasons[a.id]}</span>
                  <span className={styles.recMarkers}>{addonNewMarkers(a).map((id) => getBiomarker(id).short ?? getBiomarker(id).name).join(" · ")}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.reason}>For what you want to understand, the SIGNAL Test on its own covers it. You can add depth any time.</p>
        )}
        <div className={styles.resultActions}>
          <Button href={href} full ctaId="quiz_build_my_signal" location="quiz_result">
            Build my SIGNAL <Icon name="arrow" size={18} />
          </Button>
        </div>
        <p className={styles.collection}><Icon name="home" size={16} /> {collection} You can change the add-ons before you pay.</p>
      </div>

      <p className={styles.resultFoot}>
        <button type="button" className={styles.back} onClick={onRestart}>Start again</button>
        <span aria-hidden="true"> · </span>
        <Link href="/signal">See everything in the SIGNAL Test</Link>
      </p>
    </div>
  );
}
