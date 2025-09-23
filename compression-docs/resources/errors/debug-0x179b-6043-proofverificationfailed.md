---
hidden: true
---

# Debug 0x179b / 6043 / proofVerificationFailed

"thanks Jon & hi guys! good to be connected\
0x179b / 6043 is proofVerificationFailed, aka you’re passing an invalid proof\
one likely cause is often that the address seeds in the client don’t match the seeds used to derive the address onchain\
to help debug this, do you have a reproducer/gh/gist you can share? if it’s in a private github my handle is @ swenschaeferjohann

swen\
Today at 7:43 AM\
also, ICYI, this program example shows client+onchain flows for create + update pretty well and should help clarify https://github.com/Lightprotocol/program-examples/blob/main/counter/anchor/programs/counter/src/lib.rs#L26

"



could add "how to debug"\
println!() rust / console.log() in TS -- client seeds/address that is used to request the proof\
msg!() log onchain seeds/address\
\=> check that same
