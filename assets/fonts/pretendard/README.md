# Pretendard Variable 1.3.9

Unmodified font from https://github.com/orioncactus/pretendard/tree/v1.3.9.

- Font: `packages/pretendard/dist/web/variable/woff2/PretendardVariable.woff2`
- Copyright (c) 2021 Kil Hyung-jin, with Reserved Font Name Pretendard.
- License: SIL Open Font License 1.1; see the bundled `LICENSE`.

The Korean pages use this self-hosted font for consistent modern typography.
The OFL permits web embedding and commercial use under its license terms.

## Navigation subsets

`PretendardVariable.subset.89.woff2` and `PretendardVariable.subset.90.woff2`
are unmodified upstream dynamic subsets from the same 1.3.9 release:

- https://github.com/orioncactus/pretendard/tree/v1.3.9/packages/pretendard/dist/web/variable/woff2-dynamic-subset
- Subset 89 supplies 국 (`U+AD6D`). Subset 90 supplies 한 and 어
  (`U+D55C`, `U+C5B4`).

They total 42,716 bytes and render the 한국어 language link on English pages.
`assets/main.scss` registers them under the CSS family alias
`Pretendard Navigation`, limited to those three code points. Korean pages use
the already-loaded full font for the link. The same bundled OFL license applies.
