import type { Metadata } from "next";

import { siteConfig } from "./site";

export type PageSeoDefinition = {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
};

export const staticPageSeo: Record<string, PageSeoDefinition> = {
  "/": {
    title: siteConfig.defaultTitle,
    description: siteConfig.description,
    path: "/",
    absoluteTitle: true
  },
  "/predictions": {
    title: "ATP Match Predictions",
    description:
      "Explore upcoming ATP matches with calibrated win probabilities, player comparisons, confidence checks and pre-match model context.",
    path: "/predictions"
  },
  "/players": {
    title: "ATP Players, Rankings & Elo",
    description:
      "Explore ATP player profiles, official rankings, Elo evolution, surface performance and recent match form.",
    path: "/players"
  },
  "/compare": {
    title: "Compare ATP Players",
    description:
      "Compare active ATP players across official rankings, overall and surface Elo ratings, recent form and rating history.",
    path: "/compare"
  },
  "/rankings/atp": {
    title: "ATP Rankings",
    description:
      "Browse the latest official ATP ranking snapshot, player points and ranking movement with historical dates available on demand.",
    path: "/rankings/atp"
  },
  "/rankings/elo": {
    title: "Tennis Elo Rankings",
    description:
      "Explore ATP player strength through overall and surface-specific Elo rankings, recent rating changes and ranking movement.",
    path: "/rankings/elo"
  },
  "/tournaments": {
    title: "ATP Tournaments",
    description:
      "Browse the current ATP tournament calendar, surfaces, draws, results, winners and available match coverage.",
    path: "/tournaments"
  },
  "/model": {
    title: "Machine Learning Model",
    description:
      "Learn how ATP Insight evaluates its current match prediction model through temporal metrics, baselines, calibration and errors.",
    path: "/model"
  },
  "/feature-importance": {
    title: "Feature Importance",
    description:
      "Explore the global ranking of pre-match signals used by the current ATP Insight model, grouped by tennis feature family.",
    path: "/feature-importance"
  },
  "/about-project": {
    title: "About the Project",
    description:
      "See how ATP Insight turns ATP tennis data into model features, match probabilities, diagnostics and an interactive portfolio product.",
    path: "/about-project"
  }
};

export function createPageMetadata(definition: PageSeoDefinition): Metadata {
  const canonical = new URL(definition.path, siteConfig.siteUrl).toString();
  const socialTitle = definition.absoluteTitle
    ? definition.title
    : siteConfig.titleTemplate.replace("%s", definition.title);

  return {
    title: definition.absoluteTitle ? { absolute: definition.title } : definition.title,
    description: definition.description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: siteConfig.siteName,
      locale: siteConfig.locale,
      title: socialTitle,
      description: definition.description,
      url: canonical,
      images: [
        {
          url: siteConfig.socialImage.openGraph,
          width: siteConfig.socialImage.width,
          height: siteConfig.socialImage.height,
          alt: siteConfig.socialImage.alt
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: definition.description,
      images: [
        {
          url: siteConfig.socialImage.twitter,
          alt: siteConfig.socialImage.alt
        }
      ]
    }
  };
}

export function createUnavailableMetadata(): Metadata {
  return {
    robots: {
      index: false,
      follow: false
    }
  };
}
