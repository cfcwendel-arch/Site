import Link from "next/link";
import { Search, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListingCard } from "@/components/site/listing-card";
import { getCategories, getFeaturedListings } from "@/lib/listings";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const [categories, featured] = await Promise.all([getCategories(), getFeaturedListings(8)]);

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-green-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
              Compre e venda máquinas e veículos do agro com segurança
            </h1>
            <p className="mt-4 text-lg text-neutral-600">
              Tratores, colheitadeiras, implementos, caminhões e muito mais. O marketplace feito
              para o produtor rural e o revendedor.
            </p>

            <form action="/anuncios" className="mt-8 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <Input name="q" placeholder="Buscar por trator, colheitadeira, caminhão..." className="pl-9" />
              </div>
              <Button type="submit" size="lg">Buscar</Button>
            </form>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/cadastro" className={buttonVariants({ variant: "outline" })}>
                Quero anunciar minhas máquinas
              </Link>
              <Link href="/planos" className={buttonVariants({ variant: "ghost" })}>
                Ver planos de assinatura
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-neutral-900">Categorias</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((category) => {
            const Icon =
              (LucideIcons as unknown as Record<string, LucideIcons.LucideIcon>)[
                toPascalCase(category.icon ?? "cog")
              ] ?? LucideIcons.Cog;
            return (
              <Link
                key={category.id}
                href={`/anuncios?categoria=${category.slug}`}
                className="flex flex-col items-center gap-2 rounded-lg border border-neutral-200 bg-white p-4 text-center transition-colors hover:border-green-600 hover:bg-green-50"
              >
                <Icon className="h-6 w-6 text-green-700" />
                <span className="text-sm font-medium text-neutral-800">{category.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="bg-neutral-50 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900">Anúncios recentes</h2>
              <Link href="/anuncios" className="text-sm font-medium text-green-700 hover:underline">
                Ver todos
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <ShieldCheck className="h-9 w-9 text-green-700" />
            <h3 className="mt-3 font-semibold">Anunciantes verificados</h3>
            <p className="mt-1 text-sm text-neutral-600">
              Cadastro validado e anúncios moderados antes de irem ao ar.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Users className="h-9 w-9 text-green-700" />
            <h3 className="mt-3 font-semibold">Contato direto</h3>
            <p className="mt-1 text-sm text-neutral-600">
              Fale direto com o vendedor pelo WhatsApp, sem intermediários na negociação.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <TrendingUp className="h-9 w-9 text-green-700" />
            <h3 className="mt-3 font-semibold">Mais visibilidade</h3>
            <p className="mt-1 text-sm text-neutral-600">
              Planos de assinatura para revendedores alcançarem mais compradores.
            </p>
          </div>
        </div>
      </section>

      <section className={cn("bg-green-700 py-14 text-white")}>
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold">Tem máquinas ou veículos para vender?</h2>
          <p className="max-w-xl text-green-50">
            Assine um dos nossos planos e comece a anunciar hoje mesmo para milhares de
            compradores do agronegócio.
          </p>
          <Link href="/planos" className={buttonVariants({ variant: "secondary", size: "lg" })}>
            Conhecer planos
          </Link>
        </div>
      </section>
    </div>
  );
}

function toPascalCase(kebab: string) {
  return kebab
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}
