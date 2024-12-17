use anchor_lang::prelude::*;

declare_id!("DqQyM9cNFC48XKtkGHvAV5VAWCPLqrM2ZDukGn8RedhX");

#[program]
pub mod program_spl_2 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
