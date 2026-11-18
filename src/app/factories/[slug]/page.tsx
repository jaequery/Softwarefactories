import { notFound } from "next/navigation";
import { Placeholder } from "@/components/placeholder";
import { getFactoryName } from "@/lib/factories";

export const dynamic = "force-dynamic";

// Placeholder: the full review page is built in a later ticket.
export default async function FactoryPage({ params }: PageProps<"/factories/[slug]">) {
  const { slug } = await params;
  const name = await getFactoryName(slug);
  if (!name) notFound();
  return (
    <Placeholder kicker={`// factories/${slug}`} title={name}>
      <p>The full review for {name} is coming soon.</p>
    </Placeholder>
  );
}
