import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CustomerInfo } from '@/types/checkout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useTranslation } from 'next-i18next';

const customerInfoSchema = z.object({
  firstName: z.string().min(2, 'validation.minLength'),
  lastName: z.string().min(2, 'validation.minLength'),
  email: z.string().email('validation.email'),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
});

interface CustomerInfoFormProps {
  onSubmit: (data: CustomerInfo) => void;
  defaultValues?: Partial<CustomerInfo>;
  loading?: boolean;
}

export const CustomerInfoForm: React.FC<CustomerInfoFormProps> = ({
  onSubmit,
  defaultValues,
  loading = false,
}) => {
  const { t } = useTranslation('common');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerInfo>({
    resolver: zodResolver(customerInfoSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          {...register('firstName')}
          label={t('checkout.firstName')}
          error={errors.firstName?.message}
          required
        />
        <Input
          {...register('lastName')}
          label={t('checkout.lastName')}
          error={errors.lastName?.message}
          required
        />
      </div>

      <Input
        {...register('email')}
        type="email"
        label={t('checkout.email')}
        error={errors.email?.message}
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          {...register('phone')}
          type="tel"
          label={t('checkout.phone')}
          error={errors.phone?.message}
        />
        <Input
          {...register('whatsapp')}
          type="tel"
          label={t('checkout.whatsapp')}
          error={errors.whatsapp?.message}
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
        loading={loading}
      >
        Continue to Shipping
      </Button>
    </form>
  );
};