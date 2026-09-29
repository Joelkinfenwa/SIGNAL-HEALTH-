import Image from "next/image";
import type { MediaAsset } from "@/config/media";
import { cx } from "@/lib/cx";
import styles from "./Photo.module.css";

interface PhotoProps {
  asset: MediaAsset;
  sizes: string;
  priority?: boolean;
  className?: string;
  position?: string;
}

/** Rounded, fill-mode photo. The parent (or className) sets the aspect ratio. */
export function Photo({ asset, sizes, priority, className, position = "center" }: PhotoProps) {
  return (
    <div className={cx(styles.photo, className)}>
      <Image src={asset.src} alt={asset.alt} fill sizes={sizes} priority={priority} style={{ objectFit: "cover", objectPosition: position }} />
    </div>
  );
}
