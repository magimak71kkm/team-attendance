# 팀 출퇴근·휴가 (team-attendance)

Next.js 15, Prisma 7(PostgreSQL + `pg` 어댑터), Auth.js(이메일·비밀번호, JWT 세션) 기반 웹 앱입니다.

## 준비물

- Node.js 20+
- PostgreSQL 하나:
  - **Docker**: 저장소 루트에서 `docker compose up -d` 후 `.env`의 `DATABASE_URL`을 `docker-compose.yml`과 맞춤
  - **Docker 없음**: Prisma 로컬 Postgres — `npx prisma dev start default --detach` 실행 후, 터미널에 출력된 **`postgresql://postgres:postgres@127.0.0.1:포트/template1?...`** 를 `.env`의 `DATABASE_URL`에 넣기 (포트는 실행마다 다를 수 있음)
  - **직접 설치**: [PostgreSQL Windows 설치](https://www.postgresql.org/download/windows/) 후 사용자·DB 생성

## 설정

1. `.env`에 `DATABASE_URL`, `AUTH_SECRET` 설정 (`.env.example` 참고)
2. DB 기동 후 스키마·시드:

```bash
npx prisma db push
npx tsx prisma/seed.ts
```

3. 개발 서버:

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) → 로그인 화면.

## 시드 계정

| 이메일 | 비밀번호 | 역할 |
|--------|----------|------|
| admin@example.com | admin123 | 관리자 |
| kim@example.com | user123 | 직원 |

## 주요 경로

- `/dashboard` — 출근/퇴근, 오늘 휴가 안내
- `/attendance/history` — 본인 출퇴근 이력
- `/leave`, `/leave/new` — 휴가 신청
- `/admin` — 휴가 승인·반려, 최근 출퇴근, CSV보내기

근무일·출퇴근 판정은 **Asia/Seoul** 기준입니다.

## 빌드

```bash
npm run build
```

`postinstall`에서 `prisma generate`가 실행되어 `src/generated/prisma`가 생성됩니다.

## Vercel 배포

1. [Vercel](https://vercel.com)에 GitHub 저장소를 연결하거나, 로컬에서 `npx vercel` 로 프로젝트를 연다.
2. **호스티드 PostgreSQL**을 준비한다 ([Neon](https://neon.tech), [Supabase](https://supabase.com), [Vercel Postgres](https://vercel.com/storage/postgres) 등). 서버리스에서는 **연결 풀링 URL**(Neon의 `-pooler` / `pgbouncer` 등)을 쓰는 것이 안전하다.
3. Vercel 프로젝트 **Environment Variables**에 다음을 설정한다:
   - `DATABASE_URL` — 위 DB의 연결 문자열
   - `AUTH_SECRET` — 32바이트 이상 난수 문자열
   - `AUTH_TRUST_HOST` — `true`
   - `AUTH_URL` — 배포 후 실제 URL (예: `https://team-attendance-xxx.vercel.app`)
4. 첫 배포 후 DB에 스키마·시드를 넣는다 (로컬에서 프로덕션 `DATABASE_URL`로):
   - `npx prisma db push`
   - `npx tsx prisma/seed.ts`
5. **Redeploy** 후 `admin@example.com` / `admin123` 로 로그인해 확인한다.

CLI만 쓸 때: `npx vercel login` 후 저장소 루트에서 `npx vercel --prod`.
