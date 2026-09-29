import Link from "next/link";
import { TestsGrid } from "@/components/product/TestsGrid";
import { Section, SectionHeader } from "@/components/ui/Section";
import { featuredProduct } from "@/config/products";
import styles from "./Tests.module.css";

export function Tests() {
  const featured = featuredProduct();
  return (
    <Section id="tests" theme="shell" labelledBy="tests-title">
      <SectionHeader
        id="tests-title"
        eyebrow="Tests"
        align="center"
        title="Built around the question you're actually asking."
        intro={`Five tests, one sample. ${featured.shortName} is our recommended starting point.`}
      />
      <TestsGrid location="home_tests" />
      <p className={styles.help}>
        <Link href="/tests">Compare all five tests</Link>, or <Link href="/find-my-test">answer a few quick questions</Link> and we&apos;ll recommend one.
      </p>
    </Section>
  );
}
