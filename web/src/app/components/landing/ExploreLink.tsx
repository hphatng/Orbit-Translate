import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ReactNode } from 'react';

interface ExploreLinkProps {
  href: string;
  children?: ReactNode;
  variant?: 'ghost' | 'pill' | 'underline';
  className?: string;
  id?: string;
}

export default function ExploreLink({
  href,
  children = 'Khám phá thêm',
  variant = 'ghost',
  className = '',
  id,
}: ExploreLinkProps) {
  if (variant === 'pill') {
    return (
      <Link
        href={href}
        id={id}
        className={`group inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 hover:border-indigo-500/40 hover:text-white transition-all duration-200 ${className}`}
      >
        <span>{children}</span>
        <ArrowRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 transition-transform duration-200" />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      id={id}
      className={`group inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors duration-200 ${className}`}
    >
      <span>{children}</span>
      <ArrowRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-1 transition-transform duration-200" />
    </Link>
  );
}
