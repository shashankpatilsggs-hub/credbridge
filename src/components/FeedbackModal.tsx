import React, { useState } from 'react';
import { X, MessageSquare, Star, Send, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useCredBridge } from '../context/CredBridgeContext';

export function FeedbackModal() {
  const { isFeedbackOpen, setIsFeedbackOpen, postFeedback } = useCredBridge();
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState<'usability' | 'feature' | 'stellar_tx' | 'bug' | 'general'>('usability');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isFeedbackOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments.trim()) return;

    setIsSubmitting(true);
    try {
      await postFeedback(rating, category, comments.trim());
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setComments('');
        setIsFeedbackOpen(false);
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md anim-fade font-inter">
      <div className="w-full max-w-md bg-neutral-950 border border-white/20 rounded-2xl p-6 shadow-2xl relative text-white">
        
        {/* Close Button */}
        <button
          onClick={() => setIsFeedbackOpen(false)}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">User Feedback & Rating</h2>
            <p className="text-xs text-white/60">Help improve CredBridge Protocol</p>
          </div>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-base font-medium text-white">Feedback Received!</h3>
            <p className="text-xs text-white/60">Thank you for shaping the future of Web3 reputation.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Star Rating */}
            <div>
              <label className="block text-white/60 mb-2 font-medium">Overall Experience Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating ? 'text-amber-400 fill-amber-400' : 'text-white/20'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-white/60 mb-1.5 font-medium">Feedback Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-white/10 border border-white/20 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-white"
              >
                <option value="usability" className="bg-black text-white">User Interface & Usability</option>
                <option value="stellar_tx" className="bg-black text-white">Stellar Transaction / Freighter</option>
                <option value="feature" className="bg-black text-white">Feature Request</option>
                <option value="bug" className="bg-black text-white">Bug Report</option>
                <option value="general" className="bg-black text-white">General Feedback</option>
              </select>
            </div>

            {/* Comments */}
            <div>
              <label className="block text-white/60 mb-1.5 font-medium">Your Feedback</label>
              <textarea
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Share your thoughts on CredBridge reputation proofs, onboarding, or UI experience..."
                className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white resize-none"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !comments.trim()}
              className="w-full py-3 bg-white text-black font-medium text-xs hover:bg-white/90 transition-colors btn-cut flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting Feedback...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Off-Chain Feedback</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
