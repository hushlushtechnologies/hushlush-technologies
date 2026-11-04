import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import ServiceHero from "@/components/services/ServiceHero";
import ServiceStatement from "@/components/services/ServiceStatement";
import ServiceTree from "@/components/services/ServiceTree";
import Offer from "@/components/sections/Offer";
import ServiceOfferings from "@/components/services/ServiceOfferings";
import ServiceProcess from "@/components/services/ServiceProcess";
import ServiceFaq from "@/components/services/ServiceFaq";
import ServiceDetails from "@/components/services/ServiceDetails";
import ServiceListings from "@/components/services/ServiceListings";
import ServiceInsights from "@/components/services/ServiceInsights";
import LetsBuild from "@/components/sections/LetsBuild";
import { serviceCategories } from "@/lib/navigation";
import { SERVICE_PAGES, getServicePage } from "@/lib/services";

type Params = { params: Promise<{ category: string }> };

// Categories with a finished design are pre-rendered; unknown slugs show the 404 page.
export function generateStaticParams() {
  return SERVICE_PAGES.map((p) => ({ category: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const page = getServicePage((await params).category);
  if (!page) return {};
  return {
    title: page.category,
    description: page.metaDescription,
    alternates: { canonical: `/services/${page.slug}` },
    openGraph: { url: `/services/${page.slug}` },
  };
}

export default async function ServiceCategoryPage({ params }: Params) {
  const page = getServicePage((await params).category);
  if (!page) notFound();
  return (
    <>
      <Navbar />
      <main>
        <ServiceHero data={page.hero} />
        <ServiceStatement data={page.statement} />
        <Offer />
        <ServiceTree category={page.category} items={page.treeItems ?? serviceCategories.find((c) => c.title === page.category)?.items ?? []} />
        {page.listings && <ServiceListings data={page.listings} />}
        {page.insights && <ServiceInsights data={page.insights} />}
        {page.details && <ServiceDetails data={page.details} />}
        {page.offerings && <ServiceOfferings data={page.offerings} />}
        {page.process && <ServiceProcess data={page.process} />}
        {page.faq && <ServiceFaq items={page.faq} />}
        <LetsBuild
          id="ready-to-build"
          lines={["Ready To Build"]}
          paragraph="Whether There's An Open Role That Fits You Or An Idea You Want To Bring To The Table, We'd Love To Hear From You."
          cta={{ label: "View Open Position", href: "/careers#openings" }}
        />
      </main>
    </>
  );
}
