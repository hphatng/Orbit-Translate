import { redirect } from 'next/navigation';

export default async function DeckPracticePage({ params }: { params: Promise<{ deckId: string }> }) {
  const { deckId } = await params;
  redirect(`/study-hub/practice/${deckId}/flashcard`);
}
