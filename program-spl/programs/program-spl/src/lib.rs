use anchor_lang::prelude::*;

declare_id!("8yYTuH1jM6dJhUt2UrYkiiAn5XpZ7op9x2oZD3zXSBGm");

#[program]
pub mod program_spl {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
