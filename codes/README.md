# Code datasets

Facts and procedures, never documents.

## The rule this directory exists to enforce

Copyright does not reach "any idea, procedure, process, system, method of
operation, concept, principle, or discovery" (17 USC 102(b)), and it does not
reach facts (Feist v. Rural Telephone, 1991). It DOES reach the text, the
layout, the commentary and the editorial arrangement of a published code book.

So:

| | Allowed here |
|---|---|
| A numeric value read out of a code table (an ampacity, a fixture unit, a demand factor) | Yes. It is a fact. |
| The procedure a code section describes, expressed as our own code | Yes. 102(b). |
| A citation naming where a value came from ("NEC 2023 T310.16") | Yes. A reference is not a reproduction. |
| The table's own row order, headings, formatting or surrounding text | **No.** |
| Code text, commentary, figures, or a scan of a page | **No. Not one line.** |

Our schema, our field names, our ordering, sorted the way a computer wants it
rather than the way the book prints it. Somebody bought the book, read it, and
typed the values into this shape. That is the whole permitted workflow.

## Every dataset is unverified until a human says otherwise

An LLM cannot author these values. It will produce numbers that look right and
are not, and a wrong ampacity in a permit calculation is the worst thing this
product could ever ship. So every file carries:

```json
{ "verified": false, "verifiedBy": "", "verifiedAt": "" }
```

`codeEval` REFUSES to return a result from an unverified dataset. It returns
`{ok:false, reason:'unverified'}` and the UI shows nothing. Flipping that flag
is a deliberate human act by someone holding the purchased edition, recorded
with their name and the date, and it is the only thing standing between a
plausible number and a permit.

## Editions never change, they accumulate

`nec-2023.json` is frozen the day it ships. NEC 2026 is a new file, not an edit.
Right now US jurisdictions sit on five different NEC editions at once and a
sixth arrives every three years, so "current" is not a state this directory can
ever be in. Every edition stays live and selectable forever.

## Filenames

`<family>-<edition>.json`, lowercase: `nec-2023.json`, `ipc-2021.json`,
`upc-2024.json`.
