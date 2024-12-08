use anchor_lang::prelude::*;

declare_id!("ATijzw93r4TXUbRjoA1Yu2zjr1AFJwRagUKprthvsnhM");

#[program]
pub mod program_counter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
