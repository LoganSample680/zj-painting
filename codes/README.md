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

## Typing the values in

`tools/code-entry.html` is the only thing that should ever write these files.
Open it in a browser (no server, no build), drop in the dataset, and it walks
every value the file still needs, one at a time, showing the citation the file's
own `todo` list names for that value. It never fetches anything and it never
suggests a number.

Fill what you need and leave the rest. Both rule modules refuse per value
(`missing-data` in NEC, `missing-value` in IPC and UPC) and name the value they
wanted, so a partly filled dataset answers the questions it can and stays quiet
on the ones it cannot. That means you can sign the parts you checked without
waiting to finish the book.

A table that ships as an empty array (Table 220.55, the 310.15 correction and
adjustment tables, the drain and vent sizing tables) grows a row at a time, and
the row's fields come from the `todo` line that describes it, or from `shapes`
when the file ships one. Where the file declares neither, the tool asks for the
field names rather than inventing them.

`tests/e2e-code-entry.spec.js` guards the tool. The case it exists for: box
sizes are keyed `device-3x2x2.25`, and an earlier build split paths on the dot,
so it invented thirteen new keys instead of filling the thirteen real ones and
reported them as done.
