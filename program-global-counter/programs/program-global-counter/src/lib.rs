use anchor_lang::prelude::*;

declare_id!("38iBYy8JAKBtjce1RAF2VpoRksUiFLghNDkmgDwJGMR6");

#[program]
pub mod program_global_counter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
