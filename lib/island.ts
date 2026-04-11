import type { ComponentType } from "preact";

const ISLAND_PATH = Symbol("island-path");

export type IslandComponent<P = {}> = ComponentType<P> & {
  [ISLAND_PATH]?: string;
};

/**
 * Defines an island component with its module path for server-side rendering.
 * 
 * @template T - The props type for the component
 * @param component - The Preact component to define as an island
 * @param modulePath - The module path to the component for SSR hydration
 * @returns The component with island metadata attached
 */
export function defineIsland<T>(
  component: ComponentType<T>,
  modulePath: string,
): IslandComponent<T> {
  Object.defineProperty(component, ISLAND_PATH, {
    value: modulePath,
    enumerable: false,
    configurable: false,
    writable: false,
  });

  return component;
}

export function getIslandPath<P>(island: IslandComponent<P>): string {
  return island[ISLAND_PATH]!;
}
