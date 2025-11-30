import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Review, ReviewFilters } from '@/types/admin';

interface ReviewListProps {
  initialFilters?: ReviewFilters;
}

const ReviewList: React.FC<ReviewListProps> = ({ initialFilters = {} }) => {
  const { t } = useTranslation('admin');
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ReviewFilters>(initialFilters);
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);

  // Mock data - in real app, this would come from API
  const mockReviews: Review[] = [
    {
      id: '1',
      productId: '1',
      customerId: 'cust_1',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      rating: 5,
      title: 'Excellent headphones!',
      content: 'These headphones are amazing! The sound quality is incredible and the noise cancellation works perfectly.',
      status: 'pending',
      verifiedPurchase: true,
      helpfulCount: 12,
      adminResponse: null,
      adminResponseDate: null,
      createdAt: '2024-01-20T10:30:00Z',
      updatedAt: '2024-01-20T10:30:00Z',
    },
    {
      id: '2',
      productId: '2',
      customerId: null,
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      rating: 3,
      title: 'Okay t-shirt',
      content: 'The t-shirt is decent quality but the sizing runs small. I ordered a medium but it fits more like a small.',
      status: 'approved',
      verifiedPurchase: false,
      helpfulCount: 5,
      adminResponse: null,
      adminResponseDate: null,
      createdAt: '2024-01-19T14:20:00Z',
      updatedAt: '2024-01-19T14:20:00Z',
    },
    {
      id: '3',
      productId: '1',
      customerId: 'cust_3',
      customerName: 'Bob Johnson',
      customerEmail: 'bob@example.com',
      rating: 1,
      title: 'Terrible experience',
      content: 'The headphones stopped working after just one week. Very disappointed with the quality.',
      status: 'pending',
      verifiedPurchase: true,
      helpfulCount: 2,
      adminResponse: null,
      adminResponseDate: null,
      createdAt: '2024-01-18T09:15:00Z',
      updatedAt: '2024-01-18T09:15:00Z',
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      let filtered = [...mockReviews];
      
      if (filters.status) {
        filtered = filtered.filter(r => r.status === filters.status);
      }
      
      if (filters.rating) {
        filtered = filtered.filter(r => r.rating === filters.rating);
      }
      
      if (filters.search) {
        filtered = filtered.filter(r => 
          r.customerName.toLowerCase().includes(filters.search!.toLowerCase()) ||
          r.content.toLowerCase().includes(filters.search!.toLowerCase()) ||
          (r.title && r.title.toLowerCase().includes(filters.search!.toLowerCase()))
        );
      }
      
      if (filters.verifiedPurchase !== undefined) {
        filtered = filtered.filter(r => r.verifiedPurchase === filters.verifiedPurchase);
      }
      
      if (filters.sortBy) {
        filtered.sort((a, b) => {
          let aValue: any = a[filters.sortBy! as keyof Review];
          let bValue: any = b[filters.sortBy! as keyof Review];
          
          if (filters.sortBy === 'created_at' || filters.sortBy === 'rating' || filters.sortBy === 'helpful_count') {
            aValue = aValue;
            bValue = bValue;
          }
          
          if (filters.sortOrder === 'desc') {
            return aValue > bValue ? -1 : 1;
          }
          return aValue > bValue ? 1 : -1;
        });
      }
      
      setReviews(filtered);
      setLoading(false);
    }, 500);
  }, [filters]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReviews(reviews.map(r => r.id));
    } else {
      setSelectedReviews([]);
    }
  };

  const handleSelectReview = (reviewId: string, checked: boolean) => {
    if (checked) {
      setSelectedReviews([...selectedReviews, reviewId]);
    } else {
      setSelectedReviews(selectedReviews.filter(id => id !== reviewId));
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject' | 'hide' | 'delete') => {
    console.log(`Bulk ${action}:`, selectedReviews);
    alert(`Bulk action "${action}" would be performed on ${selectedReviews.length} reviews`);
    // API call to perform bulk action
    setSelectedReviews([]);
  };

  const handleReviewAction = async (reviewId: string, action: 'approve' | 'reject' | 'hide' | 'show' | 'delete') => {
    console.log(`Review ${action}:`, reviewId);
    alert(`Review action "${action}" would be performed on review #${reviewId}`);
    // API call to perform action
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'hidden': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('reviews.title')}</h1>
        <p className="text-gray-600">Moderate customer reviews and respond to feedback</p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search reviews..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">{t('reviews.filter.all')}</option>
              <option value="pending">{t('reviews.filter.pending')}</option>
              <option value="approved">{t('reviews.filter.approved')}</option>
              <option value="rejected">{t('reviews.filter.rejected')}</option>
              <option value="hidden">{t('reviews.filter.hidden')}</option>
            </select>
          </div>
          <div>
            <select
              value={filters.rating || ''}
              onChange={(e) => setFilters({ ...filters, rating: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          <div>
            <select
              value={filters.verifiedPurchase !== undefined ? filters.verifiedPurchase.toString() : ''}
              onChange={(e) => setFilters({ 
                ...filters, 
                verifiedPurchase: e.target.value === '' ? undefined : e.target.value === 'true' 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Reviews</option>
              <option value="true">Verified Purchase</option>
              <option value="false">Not Verified</option>
            </select>
          </div>
          <div>
            <select
              value={`${filters.sortBy || 'created_at'}-${filters.sortOrder || 'desc'}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                setFilters({ ...filters, sortBy: sortBy as any, sortOrder: sortOrder as any });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="rating-desc">Highest Rating</option>
              <option value="rating-asc">Lowest Rating</option>
              <option value="helpful_count-desc">Most Helpful</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedReviews.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedReviews.length} reviews selected
            </span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('approve')}>
                {t('reviews.actions.approve')}
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('reject')}>
                {t('reviews.actions.reject')}
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('hide')}>
                {t('reviews.actions.hide')}
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('delete')}>
                {t('reviews.actions.delete')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <input
                  type="checkbox"
                  checked={selectedReviews.includes(review.id)}
                  onChange={(e) => handleSelectReview(review.id, e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {review.title || 'No Title'}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-gray-500">
                          by {review.customerName}
                        </span>
                        {review.verifiedPurchase && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {t('reviews.details.verified')}
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{review.content}</p>
                  {review.adminResponse && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {t('reviews.response.title')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(review.adminResponseDate!).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{review.adminResponse}</p>
                    </div>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{review.helpfulCount} {t('reviews.details.helpful', { count: review.helpfulCount })}</span>
                    <span>•</span>
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${getStatusColor(review.status)}
                    `}>
                      {t(`reviews.filter.${review.status}`)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-2 ml-4">
                {review.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleReviewAction(review.id, 'approve')}
                    >
                      {t('reviews.actions.approve')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReviewAction(review.id, 'reject')}
                    >
                      {t('reviews.actions.reject')}
                    </Button>
                  </>
                )}
                {review.status === 'approved' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReviewAction(review.id, 'hide')}
                  >
                    {t('reviews.actions.hide')}
                  </Button>
                )}
                {review.status === 'hidden' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReviewAction(review.id, 'show')}
                  >
                    {t('reviews.actions.show')}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/admin/reviews/${review.id}/respond`)}
                >
                  {t('reviews.actions.respond')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReviewAction(review.id, 'delete')}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  {t('reviews.actions.delete')}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;