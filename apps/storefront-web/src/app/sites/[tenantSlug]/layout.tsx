import React from 'react';
import { getTenant, getCategories } from '@/lib/api';
import { StorefrontClientShell } from '@/components/StorefrontClientShell';
import { notFound } from 'next/navigation';

export async function generateMetadata({
  params,
}: {
  params: { tenantSlug: string };
}) {
  try {
    const tenant = await getTenant(params.tenantSlug);
    return {
      title: `${tenant.branding.storeName} | Official Online Store`,
      description:
        tenant.branding.bannerSubheadline ||
        `Shop exclusive collections from ${tenant.branding.storeName}`,
    };
  } catch {
    return {
      title: 'Store Not Found',
    };
  }
}

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { tenantSlug: string };
}) {
  let tenant;
  let categories = [];

  try {
    [tenant, categories] = await Promise.all([
      getTenant(params.tenantSlug),
      getCategories(params.tenantSlug),
    ]);
  } catch (err) {
    console.error(`Failed to load tenant for slug: ${params.tenantSlug}`, err);
    notFound();
  }

  const primaryColor = tenant.branding.primaryColor || '#0284c7';
  const accentColor = tenant.branding.accentColor || '#0369a1';

  return (
    <>
      <style>{`
        :root {
          --brand-primary: ${primaryColor};
          --brand-accent: ${accentColor};
        }
      `}</style>
      <StorefrontClientShell tenant={tenant} categories={categories}>
        {children}
      </StorefrontClientShell>
    </>
  );
}
