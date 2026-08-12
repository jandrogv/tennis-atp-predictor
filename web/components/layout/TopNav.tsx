"use client";

import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { siteConfig } from "@/lib/site";
import { cn } from "@/components/ui/utils";

type NavItem = {
  title: string;
  href: string;
  description: string;
};

type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    id: "product",
    label: "Product",
    items: [
      {
        title: "Predictions",
        href: "/predictions",
        description: "Upcoming ATP match probabilities with model signals and confidence context."
      },
      {
        title: "Compare",
        href: "/compare",
        description: "Compare two players across ranking, Elo and recent performance context."
      },
      {
        title: "Players",
        href: "/players",
        description: "Browse player profiles, surface strengths and recent competitive form."
      },
      {
        title: "Tournaments",
        href: "/tournaments",
        description: "Explore tournament context, rounds and available match information."
      }
    ]
  },
  {
    id: "rankings",
    label: "Rankings",
    items: [
      {
        title: "Elo Rankings",
        href: "/rankings/elo",
        description: "Surface-aware Elo rankings generated from real match results."
      },
      {
        title: "ATP Rankings",
        href: "/rankings/atp",
        description: "Official ATP ranking views with country and position context."
      }
    ]
  },
  {
    id: "model",
    label: "Model",
    items: [
      {
        title: "Model Performance",
        href: "/model",
        description: "Review validation metrics, calibration and model evaluation outputs."
      },
      {
        title: "Feature Importance",
        href: "/feature-importance",
        description: "Inspect which signals contribute most to prediction behavior."
      }
    ]
  }
];

const productColumns = [
  ["/predictions"],
  ["/compare", "/players"],
  ["/tournaments"]
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isGroupActive(pathname: string, group: NavGroup) {
  return group.items.some((item) => isActivePath(pathname, item.href));
}

function MobileDisclosureMark({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative h-4 w-4 text-slate-400 transition duration-150",
        open && "text-lime-700"
      )}
    >
      <span className="absolute left-1/2 top-1/2 h-px w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current" />
      <span
        className={cn(
          "absolute left-1/2 top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 rounded-full bg-current transition-transform duration-150",
          open && "rotate-90"
        )}
      />
    </span>
  );
}

function DropdownItem({
  item,
  active,
  closeDesktopMenu
}: {
  item: NavItem;
  active: boolean;
  closeDesktopMenu: () => void;
}) {
  return (
    <NavigationMenu.Link asChild>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        onClick={closeDesktopMenu}
        className="group/item relative block rounded-lg border border-transparent px-3 py-3 pl-4 text-left transition-[background-color,border-color,color,box-shadow] duration-150 ease-out hover:border-lime-600/[0.10] hover:bg-lime-200/[0.16] hover:shadow-[0_8px_22px_rgba(15,23,42,0.04)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-400/50"
      >
        {active ? <span className="absolute left-1.5 top-4 h-1.5 w-1.5 rounded-full bg-lime-500/80" /> : null}
        <span className={cn("block text-sm font-semibold text-slate-900", active && "text-slate-950")}>
          {item.title}
        </span>
        <span className="mt-1 block text-xs leading-5 text-slate-600 transition group-hover/item:text-slate-700">
          {item.description}
        </span>
      </Link>
    </NavigationMenu.Link>
  );
}

export function TopNav() {
  const pathname = usePathname();
  const [desktopValue, setDesktopValue] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpandedGroup, setMobileExpandedGroup] = useState<string | null>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);

  const itemsByHref = useMemo(() => {
    return new Map(navGroups.flatMap((group) => group.items.map((item) => [item.href, item] as const)));
  }, []);

  useEffect(() => {
    const activeGroup = navGroups.find((group) => isGroupActive(pathname, group));
    setDesktopValue("");
    setMobileOpen(false);
    if (activeGroup) {
      setMobileExpandedGroup(activeGroup.id);
    }
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
        mobileTriggerRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [mobileOpen]);

  function closeDesktopMenu() {
    setDesktopValue("");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-950/[0.035] bg-[rgba(248,250,245,0.58)] backdrop-blur-[16px]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="ATP Insight - Home"
          className="relative inline-flex h-11 w-[120px] shrink-0 items-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime-400/50"
        >
          <img
            src="/brand/atp-insight-wordmark-nav-2x.png"
            alt=""
            aria-hidden="true"
            width="239"
            height="60"
            className="h-[30px] w-auto object-contain"
          />
          <span className="sr-only">{siteConfig.name}</span>
        </Link>

        <NavigationMenu.Root
          aria-label="Primary navigation"
          value={desktopValue}
          onValueChange={setDesktopValue}
          delayDuration={90}
          skipDelayDuration={120}
          className="relative z-50 hidden lg:block"
        >
          <NavigationMenu.List className="flex items-center gap-1.5">
            {navGroups.map((group) => {
              const active = isGroupActive(pathname, group);

              return (
                <NavigationMenu.Item key={group.id} value={group.id}>
                  <NavigationMenu.Trigger
                    data-active={active ? "" : undefined}
                    className={cn(
                      "atp-nav-trigger rounded-full border border-transparent px-3.5 py-1.5 text-sm font-medium text-slate-600 transition-[background-color,border-color,color,box-shadow] duration-[120ms] ease-out hover:border-lime-500/[0.14] hover:bg-lime-300/[0.10] hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-400/50 max-xl:min-h-11",
                      active && "border-lime-400/25 bg-lime-400/[0.10] text-slate-950"
                    )}
                  >
                    {group.label}
                  </NavigationMenu.Trigger>

                  <NavigationMenu.Content
                    className={cn(
                      "atp-nav-content absolute right-0 top-0 p-2.5",
                      group.id === "product" ? "w-[44rem]" : "w-[34rem]"
                    )}
                  >
                    {group.id === "product" ? (
                      <div className="grid grid-cols-[1.05fr_1.28fr_1.05fr] rounded-xl border border-lime-900/[0.055] bg-lime-200/[0.11]">
                        {productColumns.map((column, columnIndex) => (
                          <div
                            key={column.join("-")}
                            className={cn(
                              "grid content-start gap-1.5 p-2.5",
                              columnIndex > 0 && "border-l border-amber-950/[0.075]"
                            )}
                          >
                            {column.map((href) => {
                              const item = itemsByHref.get(href);
                              if (!item) {
                                return null;
                              }

                              return (
                                <DropdownItem
                                  key={item.href}
                                  item={item}
                                  active={isActivePath(pathname, item.href)}
                                  closeDesktopMenu={closeDesktopMenu}
                                />
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 rounded-xl border border-lime-900/[0.055] bg-lime-200/[0.11] p-2.5">
                        {group.items.map((item, itemIndex) => (
                          <div
                            key={item.href}
                            className={cn(itemIndex > 0 && "border-l border-amber-950/[0.065] pl-2")}
                          >
                            <DropdownItem
                              item={item}
                              active={isActivePath(pathname, item.href)}
                              closeDesktopMenu={closeDesktopMenu}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
              );
            })}

            <NavigationMenu.Item>
              <NavigationMenu.Link asChild>
                <Link
                  href="/about-project"
                  aria-current={isActivePath(pathname, "/about-project") ? "page" : undefined}
                  onClick={closeDesktopMenu}
                  className={cn(
                    "rounded-full border border-transparent px-3.5 py-1.5 text-sm font-medium text-slate-600 transition-[background-color,border-color,color,box-shadow] duration-[120ms] ease-out hover:border-lime-500/[0.14] hover:bg-lime-300/[0.10] hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-400/50 max-xl:min-h-11",
                    isActivePath(pathname, "/about-project") &&
                      "border-lime-400/30 bg-lime-400/15 text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_1px_8px_rgba(132,204,22,0.10)]"
                  )}
                >
                  About Project
                </Link>
              </NavigationMenu.Link>
            </NavigationMenu.Item>
          </NavigationMenu.List>

          <div className="pointer-events-none absolute right-0 top-full flex justify-end pt-3 [perspective:1200px]">
            <NavigationMenu.Viewport className="atp-nav-viewport pointer-events-auto relative overflow-hidden rounded-2xl border border-slate-950/[0.07] bg-[rgba(248,250,245,0.95)] shadow-[0_22px_70px_rgba(15,23,42,0.11)] backdrop-blur-xl" />
          </div>
        </NavigationMenu.Root>

        <button
          ref={mobileTriggerRef}
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="mobile-primary-navigation"
          aria-label="Toggle navigation"
          onClick={() => setMobileOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-950/[0.08] bg-white/[0.58] text-slate-800 shadow-[0_8px_22px_rgba(15,23,42,0.06)] transition hover:border-lime-400/25 hover:bg-lime-400/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-400/50 lg:hidden"
        >
          <span className="sr-only">Open navigation</span>
          <span className="flex flex-col gap-1.5" aria-hidden="true">
            <span className={cn("h-px w-4 rounded-full bg-current transition", mobileOpen && "translate-y-[3px] rotate-45")} />
            <span className={cn("h-px w-4 rounded-full bg-current transition", mobileOpen && "-translate-y-[3px] -rotate-45")} />
          </span>
        </button>
      </div>

      <div
        id="mobile-primary-navigation"
        aria-hidden={!mobileOpen}
        className={cn(
          "atp-mobile-nav-shell grid border-t border-slate-950/[0.04] transition-[grid-template-rows,opacity] duration-150 ease-out lg:hidden",
          mobileOpen ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="max-h-[calc(100dvh-4rem)] overflow-y-auto px-4 pb-4 sm:px-6">
            <nav aria-label="Mobile primary navigation" className="mx-auto max-w-7xl rounded-2xl border border-slate-950/[0.07] bg-[rgba(248,250,245,0.92)] p-2 shadow-[0_18px_45px_rgba(15,23,42,0.10)] backdrop-blur-xl">
              {navGroups.map((group) => {
                const active = isGroupActive(pathname, group);
                const expanded = mobileExpandedGroup === group.id;
                const menuId = `mobile-${group.id}-menu`;

                return (
                  <div key={group.id} className="border-b border-slate-950/[0.05] last:border-b-0">
                    <button
                      type="button"
                      tabIndex={mobileOpen ? 0 : -1}
                      aria-expanded={expanded}
                      aria-controls={menuId}
                      onClick={() => setMobileExpandedGroup(expanded ? null : group.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-lime-400/10 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-400/50",
                        active && "text-slate-950"
                      )}
                    >
                      {group.label}
                      <MobileDisclosureMark open={expanded} />
                    </button>

                    <div
                      id={menuId}
                      aria-hidden={!expanded}
                      className={cn(
                        "atp-mobile-nav-content grid transition-[grid-template-rows,opacity] duration-150 ease-out",
                        expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      )}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <div className="grid gap-1 px-1 pb-2">
                          {group.items.map((item) => {
                            const itemActive = isActivePath(pathname, item.href);
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                tabIndex={mobileOpen && expanded ? 0 : -1}
                                aria-current={itemActive ? "page" : undefined}
                                onClick={() => setMobileOpen(false)}
                                className="relative rounded-xl border border-transparent px-3 py-2.5 pl-4 transition hover:border-lime-400/[0.14] hover:bg-lime-200/[0.14] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-400/50"
                              >
                                {itemActive ? <span className="absolute left-1.5 top-3.5 h-1.5 w-1.5 rounded-full bg-lime-500/80" /> : null}
                                <span className="block text-sm font-semibold text-slate-950">{item.title}</span>
                                <span className="mt-0.5 block text-xs leading-5 text-slate-600">{item.description}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <Link
                href="/about-project"
                tabIndex={mobileOpen ? 0 : -1}
                aria-current={isActivePath(pathname, "/about-project") ? "page" : undefined}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "mt-1 flex rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-lime-400/10 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-400/50",
                  isActivePath(pathname, "/about-project") && "bg-lime-400/[0.12] text-slate-950"
                )}
              >
                About Project
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}