import Image from 'next/image';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { Locale } from '@/lib/i18n/config';
import { siteLabels } from '@/lib/i18n/site';
import type { PortfolioCase } from '@/types/entities';

export function PortfolioCaseCard({ item, locale }: { item: PortfolioCase; locale: Locale }) {
  const labels = siteLabels[locale].portfolio;
  const content = {
    ru: { breed: item.breedRu, description: item.descriptionRu },
    sr: { breed: item.breedSr, description: item.descriptionSr },
  }[locale];

  return (
    <article>
      <Card className="h-full">
        <CardHeader>
          <h2>{item.petName}</h2>
          <p className="text-muted-foreground">{labels.species[item.species]} · {content.breed}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-photo-surface">
            <Image
              src={item.imageAfterUrl}
              alt={item.petName}
              fill
              sizes="(min-width: 1280px) 360px, (min-width: 1024px) 30vw, (min-width: 768px) 45vw, 90vw"
              className="object-cover"
            />
          </div>
          <p className="typography-card">{content.description}</p>
        </CardContent>
      </Card>
    </article>
  );
}
