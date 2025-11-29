'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { submitReview } from '@/lib/api';

interface ReviewFormData {
  userName: string;
  rating: number;
  title: string;
  comment: string;
}

interface ReviewFormProps {
  productId: string;
}

export default function ReviewForm({ productId }: ReviewFormProps) {
  const t = useTranslations('reviews');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<ReviewFormData>({
    defaultValues: {
      rating: 0,
    },
  });

  const rating = watch('rating');

  const onSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true);
    try {
      await submitReview({
        productId,
        ...data,
      });
      setSubmitSuccess(true);
      reset();
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4">{t('writeReview')}</h3>

      {submitSuccess && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg">
          Review submitted successfully!
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('rating')} *
          </label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setValue('rating', star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                aria-label={`Rate ${star} stars`}
              >
                <svg
                  className={`w-8 h-8 ${
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
          {errors.rating && (
            <p className="text-red-500 text-sm mt-1">Rating is required</p>
          )}
        </div>

        <div>
          <label htmlFor="userName" className="block text-sm font-medium mb-2">
            {t('yourName')} *
          </label>
          <input
            id="userName"
            type="text"
            {...register('userName', { required: true })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {errors.userName && (
            <p className="text-red-500 text-sm mt-1">Name is required</p>
          )}
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            {t('reviewTitle')} *
          </label>
          <input
            id="title"
            type="text"
            {...register('title', { required: true })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">Title is required</p>
          )}
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium mb-2">
            {t('yourReview')} *
          </label>
          <textarea
            id="comment"
            rows={4}
            {...register('comment', { required: true, minLength: 10 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {errors.comment && (
            <p className="text-red-500 text-sm mt-1">
              Review must be at least 10 characters
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Submitting...' : t('submitReview')}
        </button>
      </form>
    </div>
  );
}
