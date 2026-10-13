'use client';

import React, { useState } from 'react';
import { TenantDto, CategoryDto } from '@amazingdeal/shared-types';
import { StoreHeader } from './StoreHeader';
import { CartDrawer } from './CartDrawer';
import { CheckoutModal } from './CheckoutModal';
import { StoreFooter } from './StoreFooter';

interface StorefrontClientShellProps {
  tenant: TenantDto;
  categories: CategoryDto[];
  children: React.ReactNode;
}

export function StorefrontClientShell({
  tenant,
  categories,
  children,
}: StorefrontClientShellProps) {
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);

  return (
    <>
      <StoreHeader tenant={tenant} categories={categories} />
      <main className="flex-1">{children}</main>
      <CartDrawer tenant={tenant} onOpenCheckout={() => setCheckoutOpen(true)} />
      <CheckoutModal
        tenant={tenant}
        isOpen={isCheckoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
      <StoreFooter tenant={tenant} />
    </>
  );
}
