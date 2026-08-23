import Link from 'next/link';

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getClients } from '@/services/client.service';
import { getPets } from '@/services/pets.service';

import { PageHeader } from '../page-header';
import { EntityFormSheet } from '../entity-form-sheet';

export default async function PetsPage() {
  const [pets, clients] = await Promise.all([getPets(), getClients()]);
  const clientNames = new Map(clients.map((client) => [client.id, client.name]));

  return (
    <div className='space-y-6'>
      <PageHeader title='Питомцы' actionLabel='Добавить питомца' formType='pet' />

      {pets.length === 0 ? (
        <div className='rounded-2xl border border-dashed bg-card px-6 py-12 text-center'>
          <p className='font-medium'>Питомцев пока нет</p>
          <p className='mt-1 text-sm text-muted-foreground'>Добавьте первого питомца.</p>
        </div>
      ) : (
        <>
          <div className='hidden overflow-hidden rounded-2xl border bg-card lg:block'>
            <table className='w-full text-left text-sm'>
              <thead className='border-b bg-muted/50 text-muted-foreground'>
                <tr>
                  <th className='px-5 py-3 font-medium'>Питомец</th>
                  <th className='px-5 py-3 font-medium'>Клиент</th>
                  <th className='px-5 py-3 font-medium'>Вид</th>
                  <th className='px-5 py-3 font-medium'>Порода</th>
                  <th className='px-5 py-3 font-medium'>Интервал</th>
                  <th className='px-5 py-3 text-right font-medium'>Действия</th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                {pets.map((pet) => (
                  <tr key={pet.id} className='transition-colors hover:bg-muted/30'>
                    <td className='px-5 py-4 font-medium'>
                      <Link
                        href={`/crm/pets/${pet.id}`}
                        className='underline underline-offset-4'
                      >
                        {pet.name}
                      </Link>
                    </td>
                    <td className='px-5 py-4'>{clientNames.get(pet.clientId) ?? 'Не указан'}</td>
                    <td className='px-5 py-4'>{formatSpecies(pet.species)}</td>
                    <td className='px-5 py-4'>{pet.breed ?? '—'}</td>
                    <td className='px-5 py-4'>{formatInterval(pet.recommendedIntervalDays)}</td>
                    <td className='px-5 py-4'>
                      <div className='flex justify-end'>
                        <EntityFormSheet
                          type='pet'
                          actionLabel='Редактировать питомца'
                          pet={pet}
                          mobile
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className='grid gap-3 lg:hidden'>
            {pets.map((pet) => (
              <Card key={pet.id} className='transition-colors hover:bg-muted/30'>
                <CardHeader>
                  <CardTitle>
                    <Link
                      href={`/crm/pets/${pet.id}`}
                      className='underline underline-offset-4'
                    >
                      {pet.name}
                    </Link>
                  </CardTitle>
                  <CardDescription>{clientNames.get(pet.clientId) ?? 'Клиент не указан'}</CardDescription>
                  <CardAction>
                    <EntityFormSheet
                      type='pet'
                      actionLabel='Редактировать питомца'
                      pet={pet}
                      mobile
                    />
                  </CardAction>
                </CardHeader>
                <CardContent className='grid grid-cols-2 gap-x-4 gap-y-2'>
                  <PetDetail label='Вид' value={formatSpecies(pet.species)} />
                  <PetDetail label='Порода' value={pet.breed ?? '—'} />
                  <PetDetail
                    label='Интервал'
                    value={formatInterval(pet.recommendedIntervalDays)}
                  />
                  <PetDetail label='Пол' value={pet.sex === 'female' ? 'Самка' : 'Самец'} />
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PetDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className='text-xs text-muted-foreground'>{label}</p>
      <p className='mt-0.5'>{value}</p>
    </div>
  );
}

function formatSpecies(species: 'dog' | 'cat') {
  return species === 'dog' ? 'Собака' : 'Кошка';
}

function formatInterval(days: number | null) {
  return days ? `${days} дн.` : '—';
}
