# Contributing to itsfree.dev

Thanks for helping keep the directory accurate and useful. Contributions can add a resource, correct an existing free tier, improve translations, fix accessibility issues, or refine the site itself.

itsfree.dev is a curated list, not an exhaustive directory. The goal is not to include every product with a free tier, but to ensure that every listed resource is genuinely useful and worth recommending. Opening a pull request does not guarantee that a resource will be added; submissions are reviewed against the editorial criteria below and may be declined even when they technically offer a free plan.

## Before contributing

Please search existing issues and pull requests first. For larger interface or architecture changes, open an issue before investing significant work so the direction can be discussed.

Every listed product should:

- Offer a useful, ongoing free tier rather than only a time-limited trial.
- Be relevant to developers, makers, or small technical teams.
- Have official documentation for its free allowance and restrictions.
- Have a direct, current pricing or limits URL.
- Avoid misleading claims such as “unlimited” when fair-use or rate limits apply.

## Local setup

Use Node.js 22 or newer and pnpm.

```bash
pnpm install
pnpm dev
```

Before submitting a pull request, run:

```bash
pnpm check
pnpm build
```

Both commands must complete without errors.

## Adding or updating a resource

1. Add or edit the catalog entry in `src/data/resources.ts`.
2. Use the provider's official homepage as `url`.
3. Add the most direct official pricing or limits page to `pricingUrls`.
4. Write concise descriptions in both English and Spanish.
5. Add the verified free allowance to `src/data/free-tiers.ts` in both languages.
6. Set the correct access requirement: no card, no sign-up, card for full limits, or trial only.
7. Add a clean favicon to `public/favicons/` only when the automatic domain favicon is unsuitable.
8. Update `sourceReviewedAt` to the date on which the information was checked.

Do not mark a resource as `featured` without explaining why in the pull request. Featured entries are intentionally curated rather than automatically assigned.

## Content guidelines

- Prefer exact, verifiable limits over promotional language.
- Keep English and Spanish versions equivalent in meaning.
- Use the product's official capitalization.
- Mention meaningful restrictions such as credit cards, rate limits, storage caps, or trial duration.
- Do not copy long passages from provider websites; summarize them.

## Code style

- Follow the formatting already used in the surrounding file.
- Keep components focused and avoid adding dependencies for small features.
- Preserve the lightweight, accessible, and progressively enhanced interface.
- Use semantic HTML and ensure interactive controls remain keyboard accessible.

## Commit messages

Use short semantic commit messages where practical:

- `feat: add a new resource`
- `fix: correct a free tier limit`
- `docs: clarify contribution steps`
- `style: improve mobile category filters`
- `chore: update project tooling`

## Pull requests

In the pull request description, explain:

- What changed and why.
- The official source used to verify pricing or free-tier claims.
- Any visual or accessibility impact.
- Which checks you ran.

Keep each pull request focused. Unrelated resource additions or design changes should be submitted separately whenever possible.
