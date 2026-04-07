/** 단일 타임존: Asia/Seoul (research 기준). */
export function todayYmdInOrg(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function orgDayBoundsUtc(ymd: string): { start: Date; end: Date } {
  return {
    start: new Date(`${ymd}T00:00:00+09:00`),
    end: new Date(`${ymd}T23:59:59.999+09:00`),
  };
}
