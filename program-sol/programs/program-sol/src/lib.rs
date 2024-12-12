use anchor_lang::prelude::*;

declare_id!("3FbrHy2HRjGVCDgQbzpoRaHAZUqyGLL3UVrhuX9U75tX");

#[program]
pub mod program_sol {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
