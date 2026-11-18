import { FactoryList } from "@/components/factory-list";
import { ListingControls } from "@/components/listing-controls";
import { getListingStats, listFactories, parseFilters } from "@/lib/factories";

// Read D1 on every request so admin edits show up without a rebuild.
export const dynamic = "force-dynamic";

function formatMonth(iso: string | null): string {
  const d = iso ? new Date(iso) : new Date();
  return d.toLocaleString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}

export default async function Home({ searchParams }: PageProps<"/">) {
  const filters = parseFilters(await searchParams);
  const [rows, stats] = await Promise.all([listFactories(filters), getListingStats()]);

  return (
    <main>
      <section className="px-5 pt-12 pb-9 sm:px-14 sm:pt-16">
        <p className="mb-4 font-mono text-[13px] text-neon" data-testid="hero-kicker">
          {`// ${stats.count} ${stats.count === 1 ? "factory" : "factories"} reviewed · updated ${formatMonth(stats.updatedAt)}`}
        </p>
        <h1 className="max-w-[820px] text-[38px] leading-[1.05] font-bold tracking-[-0.035em] sm:text-[54px]">
          Independent reviews of every <em className="text-gradient not-italic">AI software factory</em> on the
          internet.
        </h1>
        <p className="mt-[18px] max-w-[640px] text-base text-mute sm:text-lg">
          Hands-on scores for the agents and platforms that turn tickets into shipped code — autonomy, code
          quality, speed and price.
        </p>
        <ListingControls key={`${filters.category}|${filters.sort}`} filters={filters} />
      </section>
      <section className="px-5 pb-14 sm:px-14">
        <FactoryList rows={rows} />
      </section>
    </main>
  );
}
