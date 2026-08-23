import { Archive02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getActiveGroomingServices } from '@/services/grooming-services.service';
import type { GroomingService } from '@/types/entities';

import { EntityFormSheet } from '../../entity-form-sheet';
import { PageHeader } from '../../page-header';
import { archiveGroomingServiceAction } from './actions';

export default async function GroomingServicesPage() {
  const services = await getActiveGroomingServices();

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Справочник услуг'
        actionLabel='Добавить услугу'
        formType='grooming-service'
      />

      {services.length === 0 ? (
        <div className='rounded-2xl border border-dashed bg-card px-6 py-12 text-center'>
          <p className='font-medium'>Услуг пока нет</p>
          <p className='mt-1 text-sm text-muted-foreground'>Добавьте первую услугу.</p>
        </div>
      ) : (
        <>
          <div className='hidden overflow-hidden rounded-2xl border bg-card lg:block'>
            <table className='w-full text-left text-sm'>
              <thead className='border-b bg-muted/50 text-muted-foreground'>
                <tr>
                  <th className='px-5 py-3 font-medium'>Услуга</th>
                  <th className='px-5 py-3 font-medium'>Описание</th>
                  <th className='px-5 py-3 font-medium'>Стоимость</th>
                  <th className='px-5 py-3 font-medium'>Длительность</th>
                  <th className='px-5 py-3 text-right font-medium'>Действия</th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                {services.map((service) => (
                  <tr key={service.id} className='transition-colors hover:bg-muted/30'>
                    <td className='px-5 py-4 font-medium'>{service.name}</td>
                    <td className='max-w-md truncate px-5 py-4 text-muted-foreground'>
                      {service.description ?? '—'}
                    </td>
                    <td className='px-5 py-4'>{formatPrice(service.defaultPrice)}</td>
                    <td className='px-5 py-4'>{formatDuration(service.defaultDurationMinutes)}</td>
                    <td className='px-5 py-4'>
                      <ServiceActions service={service} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className='grid gap-3 lg:hidden'>
            {services.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <div className='flex items-start justify-between gap-3'>
                    <div>
                      <CardTitle>{service.name}</CardTitle>
                      <CardDescription className='mt-1'>
                        {service.description ?? 'Без описания'}
                      </CardDescription>
                    </div>
                    <ServiceActions service={service} />
                  </div>
                </CardHeader>
                <CardContent className='grid grid-cols-2 gap-4'>
                  <ServiceDetail label='Стоимость' value={formatPrice(service.defaultPrice)} />
                  <ServiceDetail
                    label='Длительность'
                    value={formatDuration(service.defaultDurationMinutes)}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ServiceActions({ service }: { service: GroomingService }) {
  return (
    <div className='flex justify-end gap-1'>
      <EntityFormSheet
        type='grooming-service'
        actionLabel='Редактировать услугу'
        groomingService={service}
        mobile
      />
      <form action={archiveGroomingServiceAction.bind(null, service.id)}>
        <Button type='submit' variant='ghost' size='icon' aria-label='В архив' title='В архив'>
          <HugeiconsIcon icon={Archive02Icon} strokeWidth={2} />
        </Button>
      </form>
    </div>
  );
}

function ServiceDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className='text-xs text-muted-foreground'>{label}</p>
      <p className='mt-0.5'>{value}</p>
    </div>
  );
}

function formatPrice(price: number | null) {
  return price === null ? '—' : new Intl.NumberFormat('ru-RU').format(price);
}

function formatDuration(minutes: number | null) {
  return minutes === null ? '—' : `${minutes} мин.`;
}
