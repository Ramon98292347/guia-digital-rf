/* eslint-disable @next/next/no-img-element */
import type { PublicGuideData } from "@/features/public-guide/server/service";

export function PublicPromotionsPage({ data }: { data: PublicGuideData }) {
  const collections = data.contentCollections.filter(
    (collection) => collection.kind.toLowerCase() === "promotion",
  );

  return (
    <main className="min-h-dvh bg-[#f5f2eb] px-4 py-8 text-[#173c35]">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center">
          {data.branding.logoPath ? (
            <img src={data.branding.logoPath} alt={data.tenant.name} className="mx-auto mb-5 h-20 w-auto object-contain" />
          ) : null}
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#bd7d2c]">Ofertas e novidades</p>
          <h1 className="mt-2 text-3xl font-bold">Promoções de {data.tenant.name}</h1>
          <p className="mx-auto mt-3 max-w-xl text-[#53645d]">Confira as condições especiais e anúncios publicados pelo estabelecimento.</p>
        </header>

        {collections.length ? (
          <div className="space-y-8">
            {collections.map((collection) => (
              <section key={collection.id} className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold">{collection.title}</h2>
                  {collection.description ? <p className="mt-1 whitespace-pre-line text-[#53645d]">{collection.description}</p> : null}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {collection.items.map((item) => {
                    const image = item.media.find((media) => media.mediaType === "image");
                    return (
                      <article key={item.id} className="overflow-hidden rounded-2xl bg-white shadow-[0_12px_28px_rgba(23,60,53,.1)]">
                        {image ? <img src={image.url} alt={image.altText ?? item.title} className="block h-auto w-full object-contain" /> : null}
                        {item.media.filter((media) => media.mediaType === "video").map((media) => (
                          <video key={media.id} src={media.url} controls playsInline className="block h-auto w-full" />
                        ))}
                        <div className="space-y-2 p-5">
                          <h3 className="text-lg font-bold">{item.title}</h3>
                          {item.subtitle ? <p className="font-medium">{item.subtitle}</p> : null}
                          {item.description ? <p className="whitespace-pre-line text-sm leading-6 text-[#53645d]">{item.description}</p> : null}
                          {item.instructions ? <p className="whitespace-pre-line text-sm leading-6 text-[#53645d]">{item.instructions}</p> : null}
                          {item.discountText ? <p className="font-bold text-[#bd7d2c]">{item.discountText}</p> : null}
                          {item.validityText ? <p className="text-xs text-[#53645d]">Validade: {item.validityText}</p> : null}
                          {item.couponCode ? <p className="text-xs text-[#53645d]">Cupom: {item.couponCode}</p> : null}
                          {(item.externalUrl || item.contactUrl) ? <div className="flex flex-wrap gap-3 pt-2">
                            {item.externalUrl ? <a href={item.externalUrl} target="_blank" rel="noreferrer" className="font-semibold text-[#267f78]">Saiba mais</a> : null}
                            {item.contactUrl ? <a href={item.contactUrl} target="_blank" rel="noreferrer" className="font-semibold text-[#267f78]">Entrar em contato</a> : null}
                          </div> : null}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-8 text-center text-[#53645d]">Nenhuma promoção publicada no momento.</div>
        )}
        <footer className="mt-10 text-center text-sm text-[#53645d]">{data.tenant.name}</footer>
      </div>
    </main>
  );
}
