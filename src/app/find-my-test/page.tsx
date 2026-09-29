import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Quiz } from "@/components/quiz/Quiz";
import { Container } from "@/components/ui/Container";
import { quizQuestions } from "@/config/quiz";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Find my test",
  description: "Answer a few quick questions and we'll recommend the SIGNAL blood test that fits what you want to understand.",
};

/** Quiz page. The quiz itself is the client island; answers never leave the browser. */
export default function QuizPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className={styles.main}>
        <Container>
          <header className={styles.header}>
            <p className={styles.eyebrow}>Find my test</p>
            <h1 className={styles.title}>Which test is right for you?</h1>
            <p className={styles.intro}>{quizQuestions.length} quick questions, about a minute. We&apos;ll suggest one of five tests.</p>
          </header>
          <Quiz />
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
