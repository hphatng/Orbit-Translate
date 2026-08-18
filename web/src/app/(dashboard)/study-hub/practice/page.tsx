import { redirect } from 'next/navigation';

export default async function PracticeRootPage({ searchParams }: { searchParams: Promise<{ deckId?: string }> }) {
  const resolvedParams = await searchParams;
  if (resolvedParams?.deckId) {
    redirect(`/study-hub/practice/${resolvedParams.deckId}/flashcard`);
  }
  redirect('/study-hub/practice/deck_ext_today/flashcard');
}
