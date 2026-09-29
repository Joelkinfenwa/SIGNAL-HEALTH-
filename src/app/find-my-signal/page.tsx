import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Quiz } from "@/components/quiz/Quiz";
import { Container } from "@/components/ui/Container";
import { quizQuestions } from "@/config/quiz";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Find my SIGNAL",
  description: "Tell us what you want to understand and we'll build your SIGNAL: the comprehensive test plus the add-ons that fit.",
};

/** Quiz page. The quiz itself is the client island; answers never leave the browser. */
export default function QuizPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className={styles.main}>
        <Container>
          <header className={styles.header}>
            <p className={styles.eyebrow}>Find my SIGNAL</p>
            <h1 className={styles.title}>What do you want to understand?</h1>
            <p className={styles.intro}>{quizQuestions.length} quick questions, under a minute. We&apos;ll build your SIGNAL: the test plus any add-ons worth adding.</p>
          </header>
          <Quiz />
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
