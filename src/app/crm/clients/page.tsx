import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getClients } from '@/services/client.service';

import { PageHeader } from '../page-header';

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div className='space-y-6'>
      <PageHeader title='Клиенты' actionLabel='Добавить клиента' formType='client' />

      {clients.length === 0 ? (
        <div className='rounded-2xl border border-dashed bg-card px-6 py-12 text-center'>
          <p className='font-medium'>Клиентов пока нет</p>
          <p className='mt-1 text-sm text-muted-foreground'>Добавьте первого клиента.</p>
        </div>
      ) : (
        <>
          <div className='hidden overflow-hidden rounded-2xl border bg-card lg:block'>
            <table className='w-full text-left text-sm'>
              <thead className='border-b bg-muted/50 text-muted-foreground'>
                <tr>
                  <th className='px-5 py-3 font-medium'>Клиент</th>
                  <th className='px-5 py-3 font-medium'>Телефон</th>
                  <th className='px-5 py-3 font-medium'>Telegram</th>
                  <th className='px-5 py-3 font-medium'>Язык</th>
                  <th className='px-5 py-3 font-medium'>Адрес</th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                {clients.map((client) => (
                  <tr key={client.id} className='transition-colors hover:bg-muted/30'>
                    <td className='px-5 py-4 font-medium'>
                      <Link href={`/crm/clients/${client.id}`} className='hover:underline'>
                        {client.name}
                      </Link>
                    </td>
                    <td className='px-5 py-4'>{client.phone ?? '—'}</td>
                    <td className='px-5 py-4'>{formatTelegram(client.telegramUsername)}</td>
                    <td className='px-5 py-4'>{formatLanguage(client.preferredLanguage)}</td>
                    <td className='max-w-xs truncate px-5 py-4'>{client.address ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className='grid gap-3 lg:hidden'>
            {clients.map((client) => (
              <Link key={client.id} href={`/crm/clients/${client.id}`}>
                <Card className='transition-colors hover:bg-muted/30'>
                  <CardHeader>
                    <CardTitle>{client.name}</CardTitle>
                    <CardDescription>{client.phone ?? 'Телефон не указан'}</CardDescription>
                  </CardHeader>
                  <CardContent className='grid grid-cols-2 gap-x-4 gap-y-2'>
                    <ClientDetail
                      label='Telegram'
                      value={formatTelegram(client.telegramUsername)}
                    />
                    <ClientDetail
                      label='Язык'
                      value={formatLanguage(client.preferredLanguage)}
                    />
                    <ClientDetail label='Адрес' value={client.address ?? '—'} className='col-span-2' />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ClientDetail({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className='text-xs text-muted-foreground'>{label}</p>
      <p className='mt-0.5'>{value}</p>
    </div>
  );
}

function formatTelegram(username: string | null) {
  if (!username) {
    return '—';
  }

  return username.startsWith('@') ? username : `@${username}`;
}

function formatLanguage(language: 'ru' | 'sr') {
  return language === 'ru' ? 'Русский' : 'Сербский';
}
