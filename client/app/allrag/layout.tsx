import { ReactNode } from 'react';
import RagLayout from '../rag/layout';

export default function AllRagLayout({ children }: { children: ReactNode }) {
  return <RagLayout>{children}</RagLayout>;
}
