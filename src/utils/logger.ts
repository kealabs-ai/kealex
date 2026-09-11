const sanitize = (v: unknown): string =>
  String(v).replace(/[\r\n\t]/g, ' ').slice(0, 500)

export const logger = {
  info: (...args: unknown[]) => console.log(...args.map(sanitize)),
  warn: (...args: unknown[]) => console.warn(...args.map(sanitize)),
  error: (msg: string, err?: unknown) => {
    if (err instanceof Error) {
      console.error(sanitize(msg), sanitize(err.message))
    } else {
      console.error(sanitize(msg))
    }
  },
}
