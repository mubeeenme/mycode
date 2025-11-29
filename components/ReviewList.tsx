'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Review } from '@/types';
import { formatDate } from '@/lib/utils';
import StarRating from './StarRating';

interface ReviewListProps {
  reviews: Review[];
  totalReviews: number;
  currentPage: number;
  totalPages: number;
  locale: string;
}

export default function ReviewList({ reviews, totalReviews, currentPage, totalPages, locale }: ReviewListProps) {
  const t = useTranslations('reviews');
  const [page, setPage] = useState(currentPage);

  const loadMore = () => {
    setPage(page + 1);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">
        {t('title')} ({totalReviews})
      </h3>

      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>{t('noReviews')}</p>
          <p className="mt-2">{t('beFirst')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b pb-6 last:border-b-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold">{review.userName}</span>
                    {review.verified && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {t('verified')}
                      </span>
                    )}
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                </div>
                <span className="text-sm text-gray-500">
                  {formatDate(review.createdAt, locale)}
                </span>
              </div>
              <h4 className="font-semibold mb-2">{review.title}</h4>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))}

          {currentPage < totalPages && (
            <button
              onClick={loadMore}
              className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              {t('loadMore')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
