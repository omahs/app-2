export function classNames(...classes: unknown[]): string {
  return classes.filter(Boolean).join(' ');
}

export function throwIfNotBrowser() {
  if (typeof window === 'undefined') {
    throw new Error(
      'The storage component should only be used on the web browser side'
    );
  }
}
