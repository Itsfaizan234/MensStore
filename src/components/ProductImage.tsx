import React, { useState } from 'react';
import { Watch, Shirt, Briefcase, Sparkles, ShieldCheck } from 'lucide-react';
import { ProductCategory } from '../types/store';

interface ProductImageProps {
  src: string;
  alt: string;
  category?: ProductCategory;
  className?: string;
  imageFocus?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  category = 'Watches',
  className = '',
  imageFocus = 'object-center',
}) => {
  const [hasError, setHasError] = useState(false);

  const renderFallbackIcon = () => {
    switch (category) {
      case 'Watches':
        return <Watch className="w-8 h-8 text-[#9A6F38]" />;
      case "Men's Clothing":
        return <Shirt className="w-8 h-8 text-[#9A6F38]" />;
      case 'Wallets':
        return <Briefcase className="w-8 h-8 text-[#9A6F38]" />;
      case 'Perfumes':
        return <Sparkles className="w-8 h-8 text-[#9A6F38]" />;
      default:
        return <ShieldCheck className="w-8 h-8 text-[#9A6F38]" />;
    }
  };

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#EBE6DC] text-[#52504C] p-6 text-center select-none ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="mb-3 opacity-80">{renderFallbackIcon()}</div>
        <span className="text-xs font-medium tracking-wide text-[#18181B] max-w-[18ch] line-clamp-2">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`object-cover ${imageFocus} ${className}`}
      loading="lazy"
    />
  );
};
