import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getClientById } from '@/services/client.service';
import { getPetById } from '@/services/pets.service';

export default async function PetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pet = await getPetById(id);

  if (!pet) {
    notFound();
  }

  const owner = await getClientById(pet.clientId);

  return (
    <div className='space-y-8'>
      <div>
        <Link href='/crm/pets' className='text-sm text-muted-foreground hover:text-foreground'>
          ← Все питомцы
        </Link>
        <h1 className='mt-3 text-2xl font-semibold tracking-tight'>{pet.name}</h1>
        <p className='mt-1 text-muted-foreground'>
          {formatSpecies(pet.species)} · {pet.breed ?? 'Порода не указана'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Информация о питомце</CardTitle>
          <CardDescription>Основные данные и владелец</CardDescription>
        </CardHeader>
        <CardContent className='grid gap-x-8 gap-y-5 sm:grid-cols-2 xl:grid-cols-3'>
          <PetDetail label='Вид' value={formatSpecies(pet.species)} />
          <PetDetail label='Порода' value={pet.breed ?? 'Не указана'} />
          <PetDetail label='Пол' value={pet.sex === 'female' ? 'Самка' : 'Самец'} />
          <PetDetail
            label='Дата рождения'
            value={pet.birthDate ? formatDate(pet.birthDate) : 'Не указана'}
          />
          <PetDetail
            label='Интервал между визитами'
            value={pet.recommendedIntervalDays ? `${pet.recommendedIntervalDays} дн.` : 'Не указан'}
          />
          <div>
            <p className='text-xs text-muted-foreground'>Владелец</p>
            {owner ? (
              <Link
                href={`/crm/clients/${owner.id}`}
                className='mt-1 inline-block font-medium hover:underline'
              >
                {owner.name}
              </Link>
            ) : (
              <p className='mt-1'>Не найден</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className='grid gap-4 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>План груминга</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='whitespace-pre-wrap text-muted-foreground'>
              {pet.groomingPlan ?? 'План груминга пока не добавлен.'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Заметки</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='whitespace-pre-wrap text-muted-foreground'>
              {pet.notes ?? 'Заметок пока нет.'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PetDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className='text-xs text-muted-foreground'>{label}</p>
      <p className='mt-1'>{value}</p>
    </div>
  );
}

function formatSpecies(species: 'dog' | 'cat') {
  return species === 'dog' ? 'Собака' : 'Кошка';
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('ru-RU').format(new Date(date));
}
