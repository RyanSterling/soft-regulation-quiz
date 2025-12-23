import { CTA_TYPES, CTA_CONTENT, getButtonText, getButtonUrl } from '../data/ctaContent';

export default function CTASection({ ctaType, ctaConfig, onCtaClick, isProcessing }) {
  const content = CTA_CONTENT[ctaType];
  const buttonText = getButtonText(ctaType, ctaConfig);
  const buttonUrl = getButtonUrl(ctaType, ctaConfig);

  const handleClick = () => {
    if (buttonUrl) {
      // If there's an external URL (live mode), update DB then redirect
      onCtaClick(buttonUrl);
    } else {
      // Otherwise, just update DB (waitlist mode)
      onCtaClick(null);
    }
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-lg p-8 space-y-6">
      {/* Headline */}
      <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
        {content.headline}
      </h2>

      {/* Description or Body */}
      {content.description && (
        <p className="text-lg text-slate-700 leading-relaxed">
          {content.description}
        </p>
      )}

      {content.body && (
        <div className="prose prose-lg max-w-none">
          {content.body.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-slate-700 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      )}

      {/* CTA Button */}
      <div className="pt-4">
        <button
          onClick={handleClick}
          disabled={isProcessing}
          className="w-full md:w-auto bg-slate-900 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : buttonText}
        </button>
      </div>
    </div>
  );
}
