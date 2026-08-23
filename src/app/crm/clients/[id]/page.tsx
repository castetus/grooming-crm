import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getClientById } from '@/services/client.service';
import { getPetsByClientId } from '@/services/pets.service';

export default async function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [client, pets] = await Promise.all([getClientById(id), getPetsByClientId(id)]);

  if (!client) {
    notFound();
  }

  return (
    <div className='space-y-8'>
      <div>
        <Link href='/crm/clients' className='text-sm text-muted-foreground hover:text-foreground'>
          ← Все клиенты
        </Link>
        <h1 className='mt-3 text-2xl font-semibold tracking-tight'>{client.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Информация о клиенте</CardTitle>
          <CardDescription>Контактные данные и предпочтения</CardDescription>
        </CardHeader>
        <CardContent className='grid gap-x-8 gap-y-5 sm:grid-cols-2 xl:grid-cols-3'>
          <ClientDetail label='Телефон' value={client.phone ?? 'Не указан'} />
          <ClientDetail label='Telegram' value={formatTelegram(client.telegramUsername)} />
          <ClientDetail label='Язык' value={formatLanguage(client.preferredLanguage)} />
          <ClientDetail label='Адрес' value={client.address ?? 'Не указан'} />
          <ClientDetail
            label='Дата добавления'
            value={formatDate(client.createdAt)}
          />
          <ClientDetail
            label='Заметки'
            value={client.notes ?? 'Нет заметок'}
            className='sm:col-span-2 xl:col-span-3'
          />
        </CardContent>
      </Card>

      <section className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-semibold'>Питомцы</h2>
          <span className='text-sm text-muted-foreground'>{pets.length}</span>
        </div>

        {pets.length === 0 ? (
          <div className='rounded-2xl border border-dashed bg-card px-6 py-10 text-center'>
            <p className='font-medium'>У клиента пока нет питомцев</p>
          </div>
        ) : (
          <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
            {pets.map((pet) => (
              <Link key={pet.id} href={`/crm/pets/${pet.id}`}>
                <Card className='h-full transition-colors hover:bg-muted/30'>
                  <CardHeader>
                    <CardTitle>{pet.name}</CardTitle>
                    <CardDescription>
                      {formatSpecies(pet.species)} · {pet.breed ?? 'Порода не указана'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='grid grid-cols-2 gap-4'>
                    <ClientDetail label='Пол' value={pet.sex === 'female' ? 'Самка' : 'Самец'} />
                    <ClientDetail
                      label='Дата рождения'
                      value={pet.birthDate ? formatDate(pet.birthDate) : 'Не указана'}
                    />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
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
      <p className='mt-1 whitespace-pre-wrap'>{value}</p>
    </div>
  );
}

function formatTelegram(username: string | null) {
  if (!username) {
    return 'Не указан';
  }

  return username.startsWith('@') ? username : `@${username}`;
}

function formatLanguage(language: 'ru' | 'sr') {
  return language === 'ru' ? 'Русский' : 'Сербский';
}

function formatSpecies(species: 'dog' | 'cat') {
  return species === 'dog' ? 'Собака' : 'Кошка';
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('ru-RU').format(new Date(date));
}
