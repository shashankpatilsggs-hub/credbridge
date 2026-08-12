/**
 * Off-Chain Metadata & User Feedback Persistence Service
 */

export interface FeedbackSubmission {
  id: string;
  rating: number;
  category: 'usability' | 'feature' | 'stellar_tx' | 'bug' | 'general';
  comments: string;
  userPublicKey?: string;
  timestamp: string;
}

export async function submitUserFeedback(feedback: Omit<FeedbackSubmission, 'id' | 'timestamp'>): Promise<FeedbackSubmission> {
  const submission: FeedbackSubmission = {
    ...feedback,
    id: `fb_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toISOString(),
  };

  // Simulate API delay for serverless backend post
  await new Promise(resolve => setTimeout(resolve, 600));

  try {
    const existing = JSON.parse(localStorage.getItem('credbridge_feedback') || '[]');
    existing.push(submission);
    localStorage.setItem('credbridge_feedback', JSON.stringify(existing));
  } catch (err) {
    console.error('Failed to save off-chain feedback:', err);
  }

  return submission;
}

export function getStoredFeedback(): FeedbackSubmission[] {
  try {
    return JSON.parse(localStorage.getItem('credbridge_feedback') || '[]');
  } catch {
    return [];
  }
}
