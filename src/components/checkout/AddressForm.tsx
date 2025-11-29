import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Address } from '@/types/checkout';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useTranslation } from 'next-i18next';

const addressSchema = z.object({
  street: z.string().min(5, 'validation.minLength'),
  street2: z.string().optional(),
  city: z.string().min(2, 'validation.minLength'),
  state: z.string().min(2, 'validation.minLength'),
  postalCode: z.string().min(3, 'validation.minLength'),
  country: z.string().min(2, 'validation.minLength'),
});

const countryOptions = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'MX', label: 'Mexico' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'ES', label: 'Spain' },
  { value: 'IT', label: 'Italy' },
  { value: 'JP', label: 'Japan' },
  { value: 'CN', label: 'China' },
  { value: 'AU', label: 'Australia' },
];

interface AddressFormProps {
  onSubmit: (data: Address) => void;
  defaultValues?: Partial<Address>;
  loading?: boolean;
  title?: string;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  onSubmit,
  defaultValues,
  loading = false,
  title,
}) => {
  const { t } = useTranslation('common');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Address>({
    resolver: zodResolver(addressSchema),
    defaultValues,
  });

  const selectedCountry = watch('country');

  return (
    <div>
      {title && (
        <h2 className="text-lg font-medium text-gray-900 mb-6">{title}</h2>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          {...register('street')}
          label={t('checkout.street')}
          error={errors.street?.message}
          required
        />

        <Input
          {...register('street2')}
          label={t('checkout.street2')}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            {...register('city')}
            label={t('checkout.city')}
            error={errors.city?.message}
            required
          />
          <Input
            {...register('state')}
            label={t('checkout.state')}
            error={errors.state?.message}
            required
          />
          <Input
            {...register('postalCode')}
            label={t('checkout.postalCode')}
            error={errors.postalCode?.message}
            required
          />
        </div>

        <Select
          {...register('country')}
          label={t('checkout.country')}
          options={countryOptions}
          value={selectedCountry}
          onChange={(e) => setValue('country', e.target.value)}
          error={errors.country?.message}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
          loading={loading}
        >
          Continue
        </Button>
      </form>
    </div>
  );
};